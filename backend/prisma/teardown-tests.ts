import client from "./client"

async function delUnverifiedUsers() {
  await Promise.all([client.user.deleteMany({}), client.ucodes.deleteMany({})])
}

delUnverifiedUsers().catch((e) => e)
