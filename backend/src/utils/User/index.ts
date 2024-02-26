import { Prisma, User, User as UserModel } from "@prisma/client"
import { compareSync, hashSync } from "bcryptjs"
import { google } from "googleapis"
import Joi from "joi"
import { JwtPayload, sign, verify } from "jsonwebtoken"
import crypto from "node:crypto"
import nodemailer from "nodemailer"
import prisma from "../../../prisma/client"
import { messages as m, messages, userSchema } from "../../utils/schemas"
import { ResMessage } from "shared"
import { UserData } from "shared/usertypes"

type Tokens = Pick<UserData, "access_token"> &
  Pick<UserData["user"], "refresh_token">

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
      : {
          status: 202,
          message: m.validate,
        }
    return { status, message, user }
  }

  async sendMail(
    email: string,
    newmail: string | undefined = undefined,
    hash: string | undefined = undefined,
    type = "email"
  ) {
    const subschema = userSchema.extract("email")
    const { error: e } = Joi.object({
      email: subschema,
      newmail: subschema.optional(),
    }).validate({
      email,
      newmail,
    })
    if (e) return { status: 422, message: e.details[0].message }

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
    const expires_at = new Date().getTime() + 60 * 60 * 1000

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: OAUTH_MAIL,
        pass: OAUTH_PASSWORD,
        clientId: OAUTH_CLIENTID,
        clientSecret: OAUTH_CLIENT_SECRET,
        refreshToken: OAUTH_REFRESH,
        accessToken: accessToken as string,
      },
      tls: {
        rejectUnauthorized: false,
      },
    })

    const mailOptions = {
      from: "marcosandrade.it@gmail.com",
      to: newmail ? newmail : email,
      subject: mailTypes[type].subject,
      html: mailTypes[type].html.replace("CODE_VARIABLE", code),
    }

    await prisma.ucodes.upsert({
      where: { email },
      update: {
        code,
        expires_at,
        hash,
      },
      create: {
        email,
        code,
        expires_at,
        hash,
      },
    })

    transporter.sendMail(mailOptions)
    return { status: 200, message: m.codeSent }
  }

  async validateUser(
    code: string,
    newmail: string | undefined = undefined
  ): Promise<UserData | ResMessage> {
    const cleanCode = code.trim()
    const ucode = await prisma.ucodes.findUnique({
      where: {
        code: cleanCode,
      },
    })

    if (!ucode) return { status: 401, message: m.invalidCode }

    if (new Date().getTime() > ucode.expires_at)
      return { status: 403, message: m.expiredCode }

    const tokenMail = newmail || ucode.email
    const [access_token, refresh_token] = await Promise.all([
      this.signToken(tokenMail, JWT_SECRET, JWT_EXPIRY),
      this.signToken(tokenMail, JWT_SECRET_REF, JWT_EXPIRY_REF),
    ])

    try {
      const [user] = await Promise.all([
        prisma.user.update({
          where: { email: ucode.email },
          data: {
            email: tokenMail,
            verified: true,
            refresh_token,
            hashpass: ucode.hash ? ucode.hash : undefined,
          },
        }),
        prisma.ucodes.delete({ where: { code: cleanCode } }),
      ])

      delete (user as Partial<UserModel>).hashpass
      return { status: 200, user, access_token }
    } catch (e) {
      return { status: 403, message: messages.duplicateEmail }
    }
  }

  async updateName(id: string, name: string) {
    const { error: e } = userSchema.extract("name").validate(name)
    if (e) return { status: 422, message: e.details[0].message }

    await prisma.user.update({
      where: { id },
      data: {
        name,
      },
    })

    return { status: 200, message: m.success }
  }

  async updatePassword(email: string, password: string): Promise<ResMessage> {
    const { error: e } = userSchema.extract("pass").validate(password)
    if (e) return { status: 422, message: e.details[0].message }

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        verified: true,
      },
    })

    if (!user?.verified) return { status: 403, message: m.verifyEmail }

    const hashpass = hashSync(password, 8)
    await this.sendMail(email, undefined, hashpass, "password")
    return { status: 202, message: m.codeSent }
  }

  async updateEmail(
    email: string,
    newmail: string,
    password: string
  ): Promise<ResMessage> {
    const { error: e } = userSchema.extract("email").validate(newmail)
    if (e) return { status: 422, message: e.details[0].message }

    const users = await prisma.user.findMany({
      where: {
        OR: [{ email }, { email: newmail }],
      },
      select: {
        email: true,
        hashpass: true,
      },
    })

    const isDuplicate = users.filter((u) => u.email === newmail)[0]
    if (isDuplicate) return { status: 403, message: m.duplicateEmail }

    if (!compareSync(password, users[0]?.hashpass))
      return { status: 401, message: m.invalidCredentials }

    await this.sendMail(email, newmail)

    return { status: 202, message: m.success }
  }

  async signToken(id: string, secret: string, expiration: string) {
    const token = sign({ sub: id }, secret, {
      expiresIn: expiration,
    })

    return token
  }

  async refreshToken(refToken: string): Promise<Tokens | ResMessage> {
    const decoded = verify(refToken, JWT_SECRET_REF) as JwtPayload
    const email = decoded.sub
    if (!email) return { status: 401, message: m.noToken }

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        refresh_token: true,
      },
    })

    if (user?.refresh_token !== refToken) {
      return { status: 403, message: m.invalidToken }
    }

    const [access_token, refresh_token] = await Promise.all([
      this.signToken(user.id, JWT_SECRET, JWT_EXPIRY),
      this.signToken(email, JWT_SECRET_REF, JWT_EXPIRY_REF),
    ])

    await prisma.user.update({
      where: { email },
      data: { refresh_token },
    })

    return { access_token, refresh_token }
  }
}
