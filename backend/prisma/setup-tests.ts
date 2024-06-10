import { hashSync } from "bcryptjs"
import dotenv from "dotenv"
import path from "path"
// DOTENV config must be loaded before client, otherwise path will be ignored.
dotenv.config({
  path: path.resolve(__dirname, "../.env.test"),
})

import client from "./client"
async function setupTestUsers() {
  return Promise.all([
    client.user.createMany({
      data: [
        {
          name: "Jane Doe",
          email: process.env.MAIL_VERIFIED as string,
          hashpass: hashSync("Tester00", 8),
          createdAt: "2024-05-26T22:13:37.757Z",
          verified: true,
        },
        {
          name: "John Smith",
          email: process.env.MAIL_UNVERIFIED as string,
          hashpass: hashSync("Tester01", 8),
          createdAt: "2024-05-26T22:13:37.757Z",
        },
      ],
    }),
  ])
}

setupTestUsers().catch((e) => console.log(e))
