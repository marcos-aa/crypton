import { hashSync } from "bcryptjs"
import dotenv from "dotenv"
import path from "path"
// DOTENV config must be loaded before client, otherwise path will be ignored.
dotenv.config({
  path: path.resolve(__dirname, "../.env.test"),
})

import client from "./client"

console.log(process.env.DATABASE_URL)
async function setupTestUsers() {
  return Promise.all([
    client.user.createMany({
      data: [
        {
          name: "Tester",
          email: "crypton+verified@crypton.icu",
          hashpass: hashSync("Tester00", 8),
          createdAt: "2024-05-26T22:13:37.757Z",
          verified: true,
        },
        {
          name: "Tester U.",
          email: "crypton@crypton.icu",
          hashpass: hashSync("Tester01", 8),
          createdAt: "2024-05-26T22:13:39.757Z",
        },
      ],
    }),
  ])
}

setupTestUsers().catch((e) => console.log(e))
