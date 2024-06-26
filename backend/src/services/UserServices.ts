import { UserData, UserTokens } from "@shared/types"
import { hashSync } from "bcryptjs"
import Joi from "joi"
import { JwtPayload, verify } from "jsonwebtoken"
import prisma from "../../prisma/client"
import { checkPassword, signToken } from "../utils/helpers"
import {
  CredError,
  credSchema,
  messages as m,
  oidSchema,
  userSchema,
} from "../utils/schemas"
import UserUtils from "./MailServices"

type Tokens = Pick<UserTokens, "accessToken" | "refreshToken">

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

  async createTokens(refToken: string): Promise<Tokens> {
    const { JWT_SECRET, JWT_SECRET_REF, JWT_EXPIRY, JWT_EXPIRY_REF } =
      process.env
    const decoded = verify(refToken, process.env.JWT_SECRET_REF) as JwtPayload
    const id = decoded.id
    if (!id) throw new CredError(m.invalidToken, 401)

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        refreshToken: true,
      },
    })

    if (user?.refreshToken !== refToken)
      throw new CredError(m.invalidToken, 403)
    const [accessToken, refreshToken] = [
      signToken(user.id, JWT_SECRET, JWT_EXPIRY),
      signToken(user.id, JWT_SECRET_REF, JWT_EXPIRY_REF),
    ]

    await prisma.user.update({
      where: { id },
      data: { refreshToken },
    })

    return { accessToken, refreshToken }
  }

  async read(id: string): Promise<UserData> {
    await oidSchema.validateAsync(id)

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

    const accessToken = signToken(
      id,
      process.env.JWT_SECRET,
      process.env.JWT_EXPIRY
    )
    return { user, accessToken }
  }

  async update(email: string, pass: string): Promise<UserTokens> {
    await Joi.object(credSchema).validateAsync({ email, pass })

    const uExists = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        hashpass: true,
        verified: true,
      },
    })

    if (!uExists) throw new CredError(m.noUser, 404)
    checkPassword(pass, uExists.hashpass)
    if (!uExists.verified) throw new CredError(uExists.id, 202)

    const [accessToken, refreshToken] = await Promise.all([
      signToken(uExists.id, process.env.JWT_SECRET, process.env.JWT_EXPIRY),
      signToken(
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

  async updateName(id: string, name: string) {
    await userSchema.extract("name").validateAsync(name)
    await prisma.user.update({
      where: { id },
      data: {
        name,
      },
    })
  }

  async delete(id: string, pass: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: { hashpass: true },
    })

    checkPassword(pass, user?.hashpass || "")

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
