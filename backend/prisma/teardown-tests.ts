import client from "./client"

async function delUnverifiedUser() {
  await Promise.all([
    client.user.delete({
      where: {
        email: "crypton@crypton.icu",
      },
    }),
    client.ucodes.deleteMany({}),
  ])
}

delUnverifiedUser().catch((e) => e)
