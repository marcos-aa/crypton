import { Request, Response } from "express"
import UserServices from "../services/UserServices"

export class UserController {
  async create(req: Request, res: Response) {
    const { name, email, password } = req.body
    const result = await new UserServices().create(name, email, password)
    return res.status(result.status).json(result)
  }

  async read(req: Request, res: Response) {
    const id = req.headers.id as string
    const result = await new UserServices().read(id)

    if ("user" in result)
      return res
        .cookie("r_token", result.user?.refresh_token, {
          httpOnly: true,
          maxAge: Number(process.env.MAX_REFRESH),
          secure: process.env.NODE_ENV === "production",
        })
        .json(result)

    return res.status(result.status).json(result)
  }

  async update(req: Request, res: Response) {
    const { email, password } = req.body

    const result = await new UserServices().update(email, password)
    if ("user" in result)
      return res
        .cookie("r_token", result.user?.refresh_token, {
          httpOnly: true,
          maxAge: Number(process.env.MAX_REFRESH),
          secure: process.env.NODE_ENV === "production",
        })
        .json(result)

    return res.status(result.status).json(result)
  }

  async delete(req: Request, res: Response) {
    const id = req.headers.id as string
    const { password } = req.body
    const result = await new UserServices().delete(id, password)
    return res
      .clearCookie("access_token")
      .clearCookie("r_token")
      .status(result.status)
      .json(result)
  }
}
