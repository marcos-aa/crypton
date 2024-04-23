import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses"
import { hashSync } from "bcryptjs"
import Joi from "joi"
import { JwtPayload, verify } from "jsonwebtoken"
import crypto from "node:crypto"
import { UserTokens } from "shared/usertypes"
import prisma from "../../../prisma/client"
import {
  CredError,
  credSchema,
  messages as m,
  oidSchema,
  userSchema,
} from "../../utils/schemas"
import { checkPassword, signToken } from "../helpers"

type Tokens = Pick<UserTokens, "accessToken" | "refreshToken">

interface MailMessages {
  [key: string]: {
    subject: string
    html: string
  }
}

let code: string = ""

const { JWT_SECRET, JWT_EXPIRY, JWT_SECRET_REF, JWT_EXPIRY_REF } = process.env

const mailTypes: MailMessages = {
  email: {
    subject: "CryptON - Verify your email address",
    html: `<h1> Thank you for subscribing to CryptON!</h1>
    <p>Enter the following code to verify your account: </p>
    <code><CODE></code>
    <p> This code will expire in one hour. </p>`,
  },
  password: {
    subject: "CryptON - Password update",
    html: `<p> Enter the following code to confirm your password update: </p>
    <code><CODE></code>
    <p> This code will expire in one hour. </p>`,
  },
}

export default class UserUtils {
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

    const blacklistMail = await prisma.blacklist.findUnique({
      where: { email },
      select: {
        count: true,
      },
    })

    const count = blacklistMail?.count
    if (count && count > 4)
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
            Data: mailTypes[type].html.replace("<CODE>", code),
          },
        },
        Subject: {
          Data: mailTypes[type].subject,
        },
      },
    }
    const sendEmail = new SendEmailCommand(params)
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
        ses.send(sendEmail),
      ])
    } catch (e) {
      throw new CredError(
        "We couldn't send you an email. Please verify your email address and try again",
        403
      )
    }

    return "We sent a verification code to your email address"
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

  async updateName(id: string, name: string) {
    await userSchema.extract("name").validateAsync(name)
    await prisma.user.update({
      where: { id },
      data: {
        name,
      },
    })
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

  async refreshToken(refToken: string): Promise<Tokens> {
    const decoded = verify(refToken, JWT_SECRET_REF) as JwtPayload
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
}
