import { Request, Response } from "express"

export class SessionController {
  async delete(req: Request, res: Response) {
    return res.clearCookie("r_token").json({ message: "Success" })
  }
}
