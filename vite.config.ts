import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Carga las variables de entorno
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react()],
    server: {
      port: Number(env.VITE_APP_PORT) || 3000,
      open: true
    },
    define: {
      'process.env': {}
    }
  }
})
