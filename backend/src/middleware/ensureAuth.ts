import { NextFunction, Request, Response } from "express"
import { JwtPayload, VerifyErrors, verify } from "jsonwebtoken"
import { messages } from "../utils/schemas"

export default async function isAuthorized(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const token = req.headers.authorization?.split(" ")[1]
  if (!token) return res.status(403).json({ message: messages.invalidToken })

  try {
    const { id } = verify(token, process.env.JWT_SECRET) as JwtPayload
    req.id = id
    return next()
  } catch (e) {
    const expMessage = "TokenExpiredError"
    if ((e as VerifyErrors).name === expMessage)
      return res.status(403).send(expMessage)

    return res.status(500).send("Something wrong happened")
  }
}
