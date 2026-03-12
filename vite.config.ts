import { defineConfig } from "vitest/config"
import react from "@vitejs/plugin-react"

export default defineConfig({
  base: "/delegated-mode-demo/",
  plugins: [react()],
  server: {
    port: 3000,
    open: "/delegated-mode-demo/",
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
