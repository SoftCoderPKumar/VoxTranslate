import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3001, // Replace with your desired port
    strictPort: true, // Optional: if 3000 is busy, Vite won't automatically try 3001
  }
})
