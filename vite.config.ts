import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, '.', '');

  return {
    plugins: [react()],
    // 'base' is crucial for GitHub Pages. './' ensures relative paths for assets.
    base: './',
    define: {
      // This allows the code to access process.env.API_KEY safely in the browser build
      'process.env.API_KEY': JSON.stringify(env.API_KEY)
    }
  }
})