import { compareSync, hashSync } from "bcryptjs"
import { google } from "googleapis"
import Joi from "joi"
import { JwtPayload, sign, verify } from "jsonwebtoken"
import crypto from "node:crypto"
import nodemailer from "nodemailer"
import { ResMessage } from "shared"
import { UserTokens } from "shared/usertypes"
import prisma from "../../../prisma/client"
import { Prisma } from "../../../prisma/generated/client"
import {
  CredError,
  credSchema,
  messages as m,
  oidSchema,
  userSchema,
} from "../../utils/schemas"

type Tokens = Pick<UserTokens, "accessToken" | "refreshToken">

interface MailMessages {
  [key: string]: {
    subject: string
    html: string
  }
}

let code: string = ""
const OAuth2 = google.auth.OAuth2

const {
  JWT_SECRET,
  JWT_EXPIRY,
  JWT_SECRET_REF,
  JWT_EXPIRY_REF,
  OAUTH_CLIENTID,
  OAUTH_CLIENT_SECRET,
  OAUTH_REFRESH,
  OAUTH_MAIL,
  OAUTH_PASSWORD,
} = process.env

const mailTypes: MailMessages = {
  email: {
    subject: "Email confirmation - CryptON",
    html: `<p> Thank you for subscribing to CryptON!<br>
    To finish your registration and validate your account, please paste or type the following 
    code in the registration page: </p>
    <code> CODE_VARIABLE </code>
    <p> This code expires in one hour. </p>`,
  },
  password: {
    subject: "Password change - Crypto Watcher",
    html: `<p> Use the following code to confirm your password update: </p>
    <code> CODE_VARIABLE </code>
    <p> This code expires in one hour. </p>`,
  },
}

export default class UserUtils {
  async isVerified(
    key: "id" | "email",
    value: string,
    select: Prisma.UserSelect
  ) {
    const user = await prisma.user.findUnique({
      where: { [key]: value } as { email: string; id: string },
      select,
    })

    if (!user) return { status: 404, message: m.noUser }

    const { status, message } = user?.verified
      ? { status: 403, message: m.duplicateEmail }
      : { status: 202, message: user.id }

    return { status, message, user }
  }

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

    const oauth2Client = new OAuth2(
      OAUTH_CLIENTID,
      OAUTH_CLIENT_SECRET,
      "https://developers.google.com/oauthplayground"
    )

    oauth2Client.setCredentials({
      refresh_token: OAUTH_REFRESH,
    })

    const accessToken = await oauth2Client.getAccessToken()
    code = crypto.randomBytes(3).toString("hex")
    let expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + 1)

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: OAUTH_MAIL,
        pass: OAUTH_PASSWORD,
        clientId: OAUTH_CLIENTID,
        clientSecret: OAUTH_CLIENT_SECRET,
        refreshToken: OAUTH_REFRESH,
        accessToken,
      },
      tls: {
        rejectUnauthorized: false,
      },
    })

    const mailOptions = {
      from: OAUTH_MAIL,
      to: email,
      subject: mailTypes[type].subject,
      html: mailTypes[type].html.replace("CODE_VARIABLE", code),
    }

    await prisma.ucodes.upsert({
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
    })

    transporter.sendMail(mailOptions)
    return { status: 200, message: m.codeSent }
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

    const [accessToken, refreshToken] = await Promise.all([
      this.signToken(ucode.userId, JWT_SECRET, JWT_EXPIRY),
      this.signToken(ucode.userId, JWT_SECRET_REF, JWT_EXPIRY_REF),
    ])

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

  async updateName(id: string, name: string) {
    await userSchema.extract("name").validateAsync(name)
    await prisma.user.update({
      where: { id },
      data: {
        name,
      },
    })

    return { status: 200, message: m.success }
  }

  async updatePassword(email: string, pass: string): Promise<ResMessage> {
    await Joi.object(credSchema).validateAsync({ email, pass })

    const userExists = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    })

    if (!userExists) throw new CredError(m.noUser, 404)

    await userSchema.extract("pass").validateAsync(pass)
    const hashpass = hashSync(pass, 8)
    await this.sendMail(userExists.id, email, "password", hashpass)
    return { status: 202, message: userExists.id }
  }

  async updateEmail(
    id: string,
    newmail: string,
    pass: string
  ): Promise<ResMessage> {
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

    if (!compareSync(pass, users[0]?.hashpass))
      throw new CredError(m.invalidCredentials, 401)

    await this.sendMail(id, newmail, "email", null)
    return { status: 202, message: m.validate }
  }

  signToken(id: string, secret: string, expiration: string) {
    const token = sign({ id }, secret, {
      expiresIn: expiration,
    })

    return token
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

    const [accessToken, refreshToken] = await Promise.all([
      this.signToken(user.id, JWT_SECRET, JWT_EXPIRY),
      this.signToken(user.id, JWT_SECRET_REF, JWT_EXPIRY_REF),
    ])

    await prisma.user.update({
      where: { id },
      data: { refreshToken },
    })

    return { accessToken, refreshToken }
  }
}
