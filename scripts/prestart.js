import dotenv from 'dotenv';
import { DopplerSDK } from '@dopplerhq/node-sdk';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');

// Load root .env file containing Doppler access token relative to this file
dotenv.config({ path: path.join(projectRoot, '.env') });

const ENV = process.env.HOST_ENV || 'dev';

const envFileMap = {
  'dev': '.env.development.local',
  'development': '.env.development.local',
  'prod': '.env.production.local',
  'production': '.env.production.local',
};

const targetFileName = envFileMap[ENV] || `.env.${ENV}.local`;
const envPath = path.join(projectRoot, targetFileName);

const dopplerToken = process.env.DOPPLERSDK_ACCESS_TOKEN || process.env.DOPPLER_TOKEN || process.env.DOPPLER_ACCESS_TOKEN;

let detectedConfig = `${ENV}`;
if (dopplerToken && dopplerToken.startsWith('dp.st.')) {
  const parts = dopplerToken.split('.');
  if (parts.length >= 3) {
    detectedConfig = parts[2];
  }
}

const DOPPLER_PROJECT = process.env.DOPPLER_PROJECT || 'nestorooms';
const DOPPLER_CONFIG = process.env.DOPPLER_CONFIG || detectedConfig;

const doppler = new DopplerSDK({
  accessToken: dopplerToken,
});

export async function updateEnvFile() {
  try {
    console.log(`[Prestart] Fetching secrets from Doppler for project: ${DOPPLER_PROJECT}, config: ${DOPPLER_CONFIG}`);

    // Download secrets as JSON
    const envAsJson = await doppler.secrets.download(
      DOPPLER_PROJECT,
      DOPPLER_CONFIG,
      { format: "json" },
    );

    // Apply to current process.env
    for (const [key, value] of Object.entries(envAsJson)) {
      process.env[key] = value;
    }

    // Map backend URL and Cloudfront CDN to VITE_ prefixes for client consumption
    if (envAsJson.BACKEND_BASE_URL) {
      envAsJson.VITE_API_URL = envAsJson.BACKEND_BASE_URL;
    } else if (envAsJson.EXPO_PUBLIC_API_URL) {
      envAsJson.VITE_API_URL = envAsJson.EXPO_PUBLIC_API_URL;
    }

    if (envAsJson.AWS_S3_CLOUDFRONT_BASE_URL) {
      envAsJson.VITE_CDN_BASE_URL = envAsJson.AWS_S3_CLOUDFRONT_BASE_URL;
    }

    const envEntries = Object.entries(envAsJson)
      .map(([key, value]) => `${key.toUpperCase().replace(/\s+/g, "_")}=${value}`)
      .join("\n");

    // Overwrite the file with fresh Doppler secrets
    fs.writeFileSync(envPath, envEntries, "utf8");
    console.log(`[Prestart] Freshly wrote all secrets from Doppler to ${envPath}`);
  } catch (error) {
    console.error(`[Prestart] Error updating the env file:`, error);
    throw error;
  }
}

if (dopplerToken) {
  try { 
    await updateEnvFile();
    console.log("[Prestart] Setup completed successfully!");
  } catch (err) {
    console.warn("[Prestart] Doppler secrets fetch failed. Continuing with existing local env files.", err.message || err);
  }
} else {
  console.warn("[Prestart] Doppler token not found in root .env or process environment. Skipping Doppler secrets fetch.");
}
