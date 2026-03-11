import { defineConfig } from "vitest/config"
import react from "@vitejs/plugin-react"

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      "/v1": {
        target: "https://uropenapi.s7.gomantle.org",
        changeOrigin: true,
        secure: true,
      },
    },
  },
  test: {
    globals: true,
    environment: "node",
  },
})
