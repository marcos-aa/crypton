import { User } from "@prisma/client"
import { compareSync, hashSync } from "bcryptjs"
import Joi from "joi"
import { ResMessage } from "shared"
import { UserData } from "shared/usertypes"
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
      verified: true,
    })

    if (dup.user) return { status: dup.status, message: dup.message }

    pass = pass.replace(/\s/g, "")
    const hashpass = hashSync(pass, 8)

    const refresh_token = await utils.signToken(
      email,
      process.env.JWT_SECRET_REF,
      process.env.JWT_EXPIRY_REF
    )

    const { email: mail } = await prisma.user.create({
      data: {
        name,
        email,
        hashpass,
        refresh_token,
      },
      select: {
        email: true,
        created_at: true,
      },
    })

    await utils.sendMail(mail)
    return { status: 202, message: m.validate }
  }

  async read(id: string): Promise<UserData> {
    await oidSchema.validateAsync(id)

    const utils = new UserUtils()
    const res = await utils.isVerified("id", id, {
      id: true,
      name: true,
      email: true,
      refresh_token: true,
      verified: true,
      created_at: true,
    })

    if (!res.user?.verified) throw new CredError(res?.message, res?.status)

    const access_token = await utils.signToken(
      res.user.email,
      process.env.JWT_SECRET,
      process.env.JWT_EXPIRY
    )

    return { user: res.user, access_token }
  }

  async update(email: string, pass: string): Promise<UserData> {
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

    if (!res.user?.verified) throw new CredError(res?.message, res?.status)
    if (!compareSync(pass, res.user.hashpass))
      throw new CredError(m.invalidCredentials, 401)

    const [access_token, refresh_token] = await Promise.all([
      utils.signToken(
        res.user.id,
        process.env.JWT_SECRET,
        process.env.JWT_EXPIRY
      ),

      utils.signToken(
        email,
        process.env.JWT_SECRET_REF,
        process.env.JWT_EXPIRY_REF
      ),
    ])

    const user = await prisma.user.update({
      where: { email },
      data: {
        refresh_token,
      },
    })

    delete (user as Partial<User>).hashpass
    return { user, access_token }
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
          user_id: id,
        },
      }),
    ])

    return { status: 204, message: m.success }
  }
}
