import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [react()],
  css: {
    modules: {
      scopeBehaviour: "local",
    },
  },
  server: {
    port: Number(process.env.PORT) || 3001,
  },
  preview: {
    port: 3001,
  },
})
