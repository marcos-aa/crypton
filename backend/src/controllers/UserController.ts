import { Request, Response } from "express"
import UserServices from "../services/UserServices"
import { genCookie } from "../utils/helpers"

export class UserController {
  async create(req: Request, res: Response) {
    const { name, email, password } = req.body
    const id = await new UserServices().create(name, email, password)
    return res.status(202).send(id)
  }

  async read(req: Request, res: Response) {
    const result = await new UserServices().read(req.id)
    return res.json(result)
  }

  async update(req: Request, res: Response) {
    const { email, password } = req.body

    const { user, accessToken, refreshToken } = await new UserServices().update(
      email,
      password
    )

    const cookieConfig = genCookie()

    return res
      .cookie("r_token", refreshToken, cookieConfig)
      .json({ user, accessToken })
  }

  async delete(req: Request, res: Response) {
    const { password } = req.body
    const result = await new UserServices().delete(req.id, password)
    return res.clearCookie("r_token").send(result)
  }
}
