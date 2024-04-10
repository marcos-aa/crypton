import { compareSync, hashSync } from "bcryptjs"
import Joi from "joi"
import { ResMessage } from "shared"
import { UserData, UserTokens } from "shared/usertypes"
import prisma from "../../prisma/client"
import UserUtils from "../utils/User"
import {
  CredError,
  messages as m,
  oidSchema,
  userSchema,
} from "../utils/schemas"

export default class UserServices {
  async create(name: string, email: string, pass: string): Promise<ResMessage> {
    await userSchema.validateAsync({ name, email, pass })

    const utils = new UserUtils()
    const dup = await utils.isVerified("email", email, {
      id: true,
      verified: true,
    })

    if (dup.user) return { status: dup.status, message: dup.message }

    pass = pass.replace(/\s/g, "")
    const hashpass = hashSync(pass, 8)

    const { id } = await prisma.user.create({
      data: {
        name,
        email,
        hashpass,
        refreshToken: "",
      },
      select: {
        id: true,
      },
    })

    await utils.sendMail(id, email)
    return { status: 202, message: id }
  }

  async read(id: string): Promise<UserData> {
    await oidSchema.validateAsync(id)

    const utils = new UserUtils()
    const res = await utils.isVerified("id", id, {
      id: true,
      name: true,
      email: true,
      verified: true,
      createdAt: true,
    })

    if (!res.user?.verified) throw new CredError(res?.message, res?.status)

    const accessToken = utils.signToken(
      res.user.id,
      process.env.JWT_SECRET,
      process.env.JWT_EXPIRY
    )

    return { user: res.user, accessToken }
  }

  async update(email: string, pass: string): Promise<UserTokens> {
    await Joi.object({
      email: userSchema.extract("email"),
      pass: userSchema.extract("pass").messages({
        "string.empty": "Invalid password",
      }),
    }).validateAsync({ email, pass })

    const utils = new UserUtils()
    const res = await utils.isVerified("email", email, {
      id: true,
      hashpass: true,
      verified: true,
    })
    const uExists = res.user

    if (uExists && !compareSync(pass, uExists.hashpass))
      throw new CredError(m.invalidCredentials, 401)

    if (!uExists?.verified) throw new CredError(res?.message, res?.status)

    const { id, verified } = res.user

    const [accessToken, refreshToken] = await Promise.all([
      utils.signToken(id, process.env.JWT_SECRET, process.env.JWT_EXPIRY),
      utils.signToken(
        id,
        process.env.JWT_SECRET_REF,
        process.env.JWT_EXPIRY_REF
      ),
    ])

    const user = Object.assign(
      { id, verified },
      await prisma.user.update({
        where: { id },
        data: {
          refreshToken,
        },
        select: {
          name: true,
          email: true,
          createdAt: true,
        },
      })
    )

    return {
      user,
      accessToken,
      refreshToken,
    }
  }

  async delete(id: string, pass: string): Promise<ResMessage> {
    const res = await new UserUtils().isVerified("id", id, {
      hashpass: true,
      verified: true,
    })

    if (!res.user?.verified) throw new CredError(res?.message, res?.status)
    if (!compareSync(pass, res.user.hashpass))
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

    return { status: 204, message: m.success }
  }
}
