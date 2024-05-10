import { Request, Response } from "express"
import { genCookie } from "../utils/helpers"

export class SessionController {
  async delete(req: Request, res: Response) {
    const cookieConfig = genCookie()
    cookieConfig.maxAge = 0
    return res.clearCookie("r_token", cookieConfig).sendStatus(200)
  }
}
