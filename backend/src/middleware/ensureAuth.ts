import { NextFunction, Request, Response } from "express"
import { VerifyErrors, verify } from "jsonwebtoken"
import UserUtils from "../utils/User"
import { messages } from "../utils/schemas"

export default async function isAuthorized(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { JWT_SECRET, MAX_REFRESH, NODE_ENV } = process.env

  const token = req.headers.authorization?.split(" ")[1]
  if (!token) return res.status(403).json({ message: messages.invalidToken })

  try {
    verify(token, JWT_SECRET)
    return next()
  } catch (e) {
    const ename = [(e as VerifyErrors).name, "TokenExpiredError"]
    const refToken = req.cookies?.r_token

    if (ename[0] !== ename[1] || !refToken)
      return res.status(403).send({ message: "Unauthorized request." })

    const r = await new UserUtils().refreshToken(refToken)

    if ("status" in r) return res.status(r.status).json({ message: r.message })

    res
      .set("authorization", `Bearer ${r.access_token as string}`)
      .set("Access-Control-Expose-Headers", "authorization")
      .cookie("r_token", r.refresh_token, {
        httpOnly: true,
        maxAge: Number(MAX_REFRESH),
        secure: NODE_ENV === "production",
      })

    return next()
  }
}
