import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses"
import { UserTokens } from "@shared/types"
import { hashSync } from "bcryptjs"
import Joi from "joi"
import crypto from "node:crypto"
import prisma from "../../prisma/client"
import { checkPassword, genMailHtml, signToken } from "../utils/helpers"
import {
  CredError,
  credSchema,
  messages as m,
  oidSchema,
  userSchema,
} from "../utils/schemas"

type Tokens = Pick<UserTokens, "accessToken" | "refreshToken">

interface MailSubjects {
  email: string
  password: string
}

let code: string = ""

const { JWT_SECRET, JWT_EXPIRY, JWT_SECRET_REF, JWT_EXPIRY_REF } = process.env

const mailSubjects: MailSubjects = {
  email: "Verify your email address",
  password: "Reset your password",
}

export default class EmailServices {
  async sendMail(
    userId: string,
    email: string,
    type: "email" | "password" = "email",
    hash: string | null | undefined = undefined
  ) {
    const subschema = userSchema.extract("email")
    await Joi.object({
      userId: oidSchema,
      email: subschema,
    }).validateAsync({
      userId,
      email,
    })

    code = crypto.randomBytes(3).toString("hex")
    let expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + 1)

    const bounced = await prisma.blacklist.findUnique({
      where: { email },
      select: {
        count: true,
      },
    })

    const bounceCount = bounced?.count
    if (bounceCount && bounceCount > 4)
      throw new CredError("Too many failed attempts to send email", 403)

    const ses = new SESClient({
      region: process.env.SES_REGION,
      credentials: {
        accessKeyId: process.env.SES_ACCESS,
        secretAccessKey: process.env.SES_SECRET,
      },
    })
    const params = {
      Source: process.env.APP_MAIL,
      Destination: {
        ToAddresses: [email],
      },
      ReplyToAddresses: [],
      Message: {
        Body: {
          Html: {
            Data: genMailHtml(mailSubjects[type], code),
          },
        },
        Subject: {
          Data: mailSubjects[type],
        },
      },
    }

    const mailConfig = new SendEmailCommand(params)
    try {
      await Promise.all([
        prisma.ucodes.upsert({
          where: { userId },
          update: {
            code,
            expiresAt,
            hash,
          },
          create: {
            userId,
            code,
            expiresAt,
            hash,
          },
        }),
        ses.send(mailConfig),
      ])
    } catch (e) {
      throw new CredError(
        "We couldn't send you an email. Please verify your email address and try again",
        403
      )
    }

    return "We sent a verification code to your email address"
  }

  async updatePassword(email: string, pass: string) {
    await Joi.object(credSchema).validateAsync({ email, pass })

    const userExists = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    })

    if (!userExists) throw new CredError(m.noUser, 404)

    const hashpass = hashSync(pass, 8)
    await this.sendMail(userExists.id, email, "password", hashpass)
    return userExists.id
  }

  async updateEmail(id: string, newmail: string, pass: string) {
    await Joi.object(credSchema).validateAsync({ email: newmail, pass })

    const users = await prisma.user.findMany({
      where: {
        OR: [{ id }, { email: newmail }],
      },
      select: {
        id: true,
        email: true,
        hashpass: true,
      },
    })

    const isDuplicate = users.filter((u) => u.email === newmail)[0]
    if (isDuplicate) throw new CredError(m.duplicateEmail, 403)
    checkPassword(pass, users[0].hashpass)
    await this.sendMail(id, newmail, "email", null)
  }

  async validateUser(code: string, email: string): Promise<UserTokens> {
    const cleanCode = code.trim()
    const ucode = await prisma.ucodes.findUnique({
      where: {
        code: cleanCode,
      },
    })

    if (!ucode) throw new CredError(m.invalidCode, 401)
    if (new Date().getTime() > ucode.expiresAt.getTime())
      throw new CredError(m.expiredCode, 403)

    const [accessToken, refreshToken] = [
      signToken(ucode.userId, JWT_SECRET, JWT_EXPIRY),
      signToken(ucode.userId, JWT_SECRET_REF, JWT_EXPIRY_REF),
    ]

    const [user] = await Promise.all([
      prisma.user.update({
        where: { id: ucode.userId },
        data: {
          email,
          verified: true,
          refreshToken,
          hashpass: ucode.hash ? ucode.hash : undefined,
        },
        select: {
          id: true,
          email: true,
          name: true,
          createdAt: true,
          verified: true,
        },
      }),
      prisma.ucodes.delete({ where: { code: cleanCode } }),
    ])

    return { user, accessToken, refreshToken }
  }

  async blacklistEmail(email: string, type: "Transient" | "Permanent") {
    const newcount = type === "Permanent" ? 5 : 1
    await prisma.blacklist.upsert({
      where: {
        email,
      },
      create: {
        email,
        count: newcount,
      },
      update: {
        count: {
          increment: newcount,
        },
      },
    })
  }
}
