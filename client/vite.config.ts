import { defineConfig } from "vite"
import path from "path"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: "0.0.0.0", // Required for Docker to expose Vite to the host machine
    port: 5173,       // Matches Docker exposed port
    strictPort: true  // Ensures Vite doesn't auto-select a new port if 5173 is taken
  },
})
