import { Request, Response } from "express"
import UserUtils from "."

export default class StreamHandler {
  async updatePassword(req: Request, res: Response) {
    const { email, password } = req.body
    const result = await new UserUtils().updatePassword(email, password)
    return res.status(result.status).json(result)
  }

  async updateName(req: Request, res: Response) {
    const id = req.headers.id as string
    const { name } = req.body
    const result = await new UserUtils().updateName(id, name)
    return res.status(result.status).json(result)
  }

  async updateEmail(req: Request, res: Response) {
    const { email, newmail, password } = req.body
    const result = await new UserUtils().updateEmail(email, newmail, password)
    return res.status(result.status).json(result)
  }

  async createSendmail(req: Request, res: Response) {
    const { email } = req.body
    const result = await new UserUtils().sendMail(email)
    return res.status(result.status).json(result)
  }

  async updateValidation(req: Request, res: Response) {
    const { code, newmail } = req.body
    const result = await new UserUtils().validateUser(code, newmail)

    if ("user" in result)
      res.cookie("r_token", result.user.refresh_token, {
        httpOnly: true,
        maxAge: Number(process.env.MAX_REFRESH),
        secure: process.env.NODE_ENV === "production",
      })

    return res.status(result.status).json(result)
  }
}
