import { hashSync } from "bcryptjs"
import client from "./client"

async function createUsers() {
  await client.user.createMany({
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
  })
}

createUsers().catch((e) => e)
