import react from "@vitejs/plugin-react"
import removeCyDataAttributes from "rollup-plugin-jsx-remove-attributes"
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [
    react(),
    removeCyDataAttributes({
      attributes: ["data-cy"],
      usage: "vite",
    }),
  ],
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
