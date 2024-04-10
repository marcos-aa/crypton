import { compareSync, hashSync } from "bcryptjs"
import Joi from "joi"
import { UserData, UserTokens } from "shared/usertypes"
import prisma from "../../prisma/client"
import UserUtils from "../utils/User"
import {
  CredError,
  credSchema,
  messages as m,
  oidSchema,
  userSchema,
} from "../utils/schemas"

export default class UserServices {
  async create(name: string, email: string, pass: string) {
    await userSchema.validateAsync({ name, email, pass })

    const utils = new UserUtils()
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        verified: true,
      },
    })

    if (user?.verified) throw new CredError(m.duplicateEmail, 403)
    if (user && !user.verified) return user.id

    pass = pass.replace(/\s/g, "")
    const hashpass = hashSync(pass, 8)

    const { id } = await prisma.user.create({
      data: {
        name,
        email,
        hashpass,
      },
      select: {
        id: true,
      },
    })

    await utils.sendMail(id, email)
    return id
  }

  async read(id: string): Promise<UserData> {
    await oidSchema.validateAsync(id)

    const utils = new UserUtils()
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        verified: true,
        createdAt: true,
      },
    })

    if (!user?.verified) throw new CredError(m.invalidCredentials, 403)

    const accessToken = utils.signToken(
      id,
      process.env.JWT_SECRET,
      process.env.JWT_EXPIRY
    )
    return { user, accessToken }
  }

  async update(email: string, pass: string): Promise<UserTokens> {
    await Joi.object(credSchema).validateAsync({ email, pass })

    const utils = new UserUtils()
    const uExists = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        hashpass: true,
        verified: true,
      },
    })

    if (!uExists) throw new CredError(m.noUser, 404)
    if (!compareSync(pass, uExists.hashpass))
      throw new CredError(m.invalidCredentials, 401)
    if (!uExists.verified) throw new CredError(m.validate, 202)

    const [accessToken, refreshToken] = await Promise.all([
      utils.signToken(
        uExists.id,
        process.env.JWT_SECRET,
        process.env.JWT_EXPIRY
      ),
      utils.signToken(
        uExists.id,
        process.env.JWT_SECRET_REF,
        process.env.JWT_EXPIRY_REF
      ),
    ])

    const user = await prisma.user.update({
      where: { id: uExists.id },
      data: {
        refreshToken,
      },
      select: {
        id: true,
        verified: true,
        name: true,
        email: true,
        createdAt: true,
      },
    })

    return {
      user,
      accessToken,
      refreshToken,
    }
  }

  async delete(id: string, pass: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: { hashpass: true },
    })

    if (!compareSync(pass, user?.hashpass || ""))
      throw new CredError(m.invalidCredentials, 401)

    await Promise.all([
      prisma.user.delete({
        where: {
          id,
        },
      }),
      prisma.stream.deleteMany({
        where: {
          userId: id,
        },
      }),
    ])

    return null
  }
}
