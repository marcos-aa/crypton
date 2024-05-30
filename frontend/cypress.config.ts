import { exec } from "child_process"
import { defineConfig } from "cypress"

export default defineConfig({
  chromeWebSecurity: false,
  e2e: {
    setupNodeEvents(on) {
      on("before:run", async () => {
        try {
          exec("npx dotenv -e .env.test -- ts-node ./prisma/setup-tests.ts", {
            cwd: "../backend",
          })
        } catch (e) {
          throw new Error(e)
        }
      }),
        on("task", {
          "clear:unverified": async () => {
            try {
              exec(
                "npx dotenv -e .env.test -- ts-node ./prisma/teardown-tests.ts",
                {
                  cwd: "../backend",
                }
              )
              return "completed"
            } catch (e) {
              throw new Error(e)
            }
          },
        })
    },
    baseUrl: "http://localhost:3001",
    experimentalInteractiveRunEvents: true,
    testIsolation: false,
    specPattern: "__tests__/cypress/e2e/*.cy.ts",
    supportFile: "__tests__/cypress/support/e2e.ts",
  },
})
