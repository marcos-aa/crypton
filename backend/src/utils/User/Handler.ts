import { Request, Response } from "express"
import UserUtils from "."

export default class StreamHandler {
  async createToken(req: Request, res: Response) {
    const rtoken = req.cookies.r_token
    const { accessToken, refreshToken } = await new UserUtils().refreshToken(
      rtoken
    )
    return res
      .cookie("r_token", refreshToken, {
        httpOnly: true,
        maxAge: Number(process.env.MAX_REFRESH),
        secure: process.env.NODE_ENV === "production",
      })
      .json({ accessToken })
  }

  async updateName(req: Request, res: Response) {
    const { name } = req.body
    const result = await new UserUtils().updateName(req.id, name)
    return res.status(result.status).json(result)
  }

  async updateEmail(req: Request, res: Response) {
    const { newmail, password } = req.body
    const result = await new UserUtils().updateEmail(req.id, newmail, password)
    return res.status(result.status).json(result)
  }

  async updatePassword(req: Request, res: Response) {
    const { email, password } = req.body
    const result = await new UserUtils().updatePassword(email, password)
    return res.status(result.status).json(result)
  }

  async createSendmail(req: Request, res: Response) {
    const { email, type } = req.body
    const result = await new UserUtils().sendMail(req.id, email, type)
    return res.status(result.status).json(result)
  }

  async updateValidation(req: Request, res: Response) {
    const { code, email } = req.body
    const { user, accessToken, refreshToken } =
      await new UserUtils().validateUser(code, email)
    return res
      .cookie("r_token", refreshToken, {
        httpOnly: true,
        maxAge: Number(process.env.MAX_REFRESH),
        secure: process.env.NODE_ENV === "production",
      })
      .json({ user, accessToken })
  }
}
