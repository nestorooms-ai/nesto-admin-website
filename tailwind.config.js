/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        admin: {
          bg: '#0b0f19',
          card: '#151c2c',
          border: '#242f47',
          primary: '#6366f1',
          secondary: '#a855f7',
          success: '#10b981',
          warning: '#f59e0b',
          danger: '#ef4444',
          text: '#e5e7eb',
          muted: '#9ca3af'
        }
      }
    },
  },
  plugins: [],
}
