import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'

// Load root .env
dotenv.config()

// Determine target environment
const ENV = process.env.HOST_ENV || 'dev'
const envFileMap = {
  'dev': '.env.development.local',
  'development': '.env.development.local',
  'prod': '.env.production.local',
  'production': '.env.production.local',
}
const targetFileName = envFileMap[ENV] || `.env.${ENV}.local`

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load target env file using dotenv
dotenv.config({ path: path.resolve(__dirname, targetFileName) })

const backendUrl = process.env.VITE_API_URL || process.env.BACKEND_BASE_URL || process.env.EXPO_PUBLIC_API_URL || ''
const cdnUrl = process.env.VITE_CDN_BASE_URL || process.env.AWS_S3_CLOUDFRONT_BASE_URL || ''

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    'import.meta.env.VITE_API_URL': JSON.stringify(backendUrl),
    'import.meta.env.BACKEND_BASE_URL': JSON.stringify(backendUrl),
    'import.meta.env.VITE_CDN_BASE_URL': JSON.stringify(cdnUrl),
  },
})
