import axios from "axios"
import { exec } from "child_process"
import { defineConfig } from "cypress"
import util from "node:util"
const asyncExec = util.promisify(exec)

interface MailMessage {
  _id: string
}

export default defineConfig({
  e2e: {
    async setupNodeEvents(on, config) {
      on("task", {
        async getUserMail() {
          const baseMailURL = "https://mailsac.com/api"
          const address = config.env.MAILSAC_MAIL
          const headers = {
            "Mailsac-Key": config.env.MAILSAC_KEY,
          }
          try {
            const { data } = await axios.get<MailMessage[]>(
              `${baseMailURL}/addresses/${address}/messages`,
              { headers }
            )

            const { data: mailHtml } = await axios.get<string>(
              `${baseMailURL}/dirty/${address}/${data[0]._id}`,
              { headers }
            )

            return mailHtml
          } catch (e) {
            return `error, ${e}`
          }
        },
      }),
        on("before:run", async () => {
          try {
            await asyncExec("npx ts-node ./prisma/setup-tests.ts", {
              cwd: "../backend",
            })
            return
          } catch (e) {
            throw new Error(e)
          }
        }),
        on("after:run", async () => {
          try {
            await asyncExec("npx ts-node ./prisma/teardown-tests.ts", {
              cwd: "../backend",
            })
          } catch (e) {
            throw new Error(e)
          }
        })

      return config
    },
    baseUrl: "http://localhost:3001",
    experimentalInteractiveRunEvents: true,
    specPattern: "__tests__/e2e/*.cy.ts",
    supportFile: "__tests__/support/e2e.ts",
    screenshotsFolder: "__tests__/screenshots",
    fixturesFolder: "__tests__/fixtures",
  },
})
