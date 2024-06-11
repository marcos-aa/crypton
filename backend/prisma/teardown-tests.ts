import dotenv from "dotenv"
import path from "node:path"
// DOTENV config must be loaded before client, otherwise path will be ignored.
dotenv.config({
  path: path.resolve(__dirname, "../.env.test"),
})

import client from "./client"

async function delUnverifiedUsers() {
  await Promise.all([
    client.user.deleteMany({}),
    client.ucodes.deleteMany({}),
    client.stream.deleteMany({}),
  ])
}

delUnverifiedUsers().catch((e) => e)
