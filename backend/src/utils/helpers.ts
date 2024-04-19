import { compareSync } from "bcryptjs"
import { sign } from "jsonwebtoken"
import { CredError, messages } from "./schemas"

const checkPassword = (pass: string, hash: string) => {
  if (!compareSync(pass, hash))
    throw new CredError(messages.invalidCredentials, 401)
}

const signToken = (id: string, secret: string, expiration: string) => {
  const token = sign({ id }, secret, {
    expiresIn: expiration,
  })

  return token
}

export { checkPassword, signToken }
