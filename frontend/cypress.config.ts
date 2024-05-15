import { defineConfig } from "cypress"

export default defineConfig({
  chromeWebSecurity: false,
  e2e: {
    baseUrl: "http://localhost:3001",
    testIsolation: false,
    specPattern: "__tests__/cypress/e2e/*.cy.ts",
    supportFile: "__tests__/cypress/support/e2e.ts",
  },
})
