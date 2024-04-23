import { compareSync } from "bcryptjs"
import { CookieOptions } from "express"
import { sign } from "jsonwebtoken"
import { CredError, messages } from "./schemas"

const checkPassword = (pass: string, hash: string) => {
  if (!compareSync(pass, hash))
    throw new CredError(messages.invalidCredentials, 401)
}

const setProdCookie = () => {
  const isProd = process.env.NODE_ENV === "production"
  const cookieConfig: CookieOptions = {
    httpOnly: true,
    maxAge: Number(process.env.MAX_REFRESH),
    secure: isProd,
    sameSite: "lax",
  }

  if (isProd) cookieConfig.domain = "." + process.env.DOMAIN.substring(8)
  return cookieConfig
}
const signToken = (id: string, secret: string, expiration: string) => {
  const token = sign({ id }, secret, {
    expiresIn: expiration,
  })

  return token
}

export { checkPassword, setProdCookie, signToken }
