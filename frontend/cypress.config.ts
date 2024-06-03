import axios from "axios"
import { exec } from "child_process"
import { defineConfig } from "cypress"
import util from "node:util"
const asyncExec = util.promisify(exec)

export default defineConfig({
  chromeWebSecurity: false,
  e2e: {
    async setupNodeEvents(on, config) {
      const { data } = await axios.post("https://api.nodemailer.com/user", {
        requestor: "crypton",
        version: "1.0",
      })
      on("task", {
        getUserCreds() {
          return { email: data.user, pass: data.pass }
        },
      }),
        on("before:run", async () => {
          try {
            await asyncExec(
              "npx dotenv -e .env.test -- ts-node ./prisma/setup-tests.ts",
              { cwd: "../backend" }
            )
            return
          } catch (e) {
            throw new Error(e)
          }
        }),
        on("after:run", async () => {
          try {
            await asyncExec(
              "npx dotenv -e .env.test -- ts-node ./prisma/teardown-tests.ts",
              { cwd: "../backend" }
            )
          } catch (e) {
            throw new Error(e)
          }
        })

      return config
    },
    baseUrl: "http://localhost:3001",
    experimentalInteractiveRunEvents: true,
    testIsolation: false,
    specPattern: "__tests__/e2e/*.cy.ts",
    supportFile: "__tests__/support/e2e.ts",
    screenshotsFolder: "__tests__/screenshots",
    fixturesFolder: "__tests__/fixtures",
  },
})
