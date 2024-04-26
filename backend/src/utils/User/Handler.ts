import { Request, Response } from "express"
import UserUtils from "."
import { setProdCookie } from "../helpers"

type SESRecipients = [
  {
    emailAddress: string
  },
]

interface BounceMessage {
  bounce: {
    bounceType: "Permanent" | "Transient"
    bouncedRecipients: SESRecipients
  }
}

interface ComplaintMessage {
  complaint: {
    complainedRecipients: SESRecipients
  }
}

export default class StreamHandler {
  async createToken(req: Request, res: Response) {
    const rtoken = req.cookies.r_token
    const { accessToken, refreshToken } = await new UserUtils().refreshToken(
      rtoken
    )
    const cookieConfig = setProdCookie()
    return res
      .cookie("r_token", refreshToken, cookieConfig)
      .json({ accessToken })
  }

  async updateName(req: Request, res: Response) {
    const { name } = req.body
    await new UserUtils().updateName(req.id, name)
    return res.sendStatus(200)
  }

  async createBounce(req: Request, res: Response) {
    const { Message } = req.body
    const { bounce }: BounceMessage = JSON.parse(Message)
    await new UserUtils().blacklistEmail(
      bounce.bouncedRecipients[0].emailAddress,
      bounce.bounceType
    )
    return res.sendStatus(200)
  }

  async createComplaint(req: Request, res: Response) {
    const { Message } = req.body
    const { complaint }: ComplaintMessage = JSON.parse(Message)
    await new UserUtils().blacklistEmail(
      complaint.complainedRecipients[0].emailAddress,
      "Permanent"
    )
    return res.sendStatus(200)
  }

  async updateEmail(req: Request, res: Response) {
    const { newmail, password } = req.body
    await new UserUtils().updateEmail(req.id, newmail, password)
    return res.sendStatus(202)
  }

  async updatePassword(req: Request, res: Response) {
    const { email, password } = req.body
    const id = await new UserUtils().updatePassword(email, password)
    return res.send(id)
  }

  async createSendmail(req: Request, res: Response) {
    const { email, id, type } = req.body
    const message = await new UserUtils().sendMail(id, email, type)
    return res.send(message)
  }

  async updateValidation(req: Request, res: Response) {
    const { code, email } = req.body
    const { user, accessToken, refreshToken } =
      await new UserUtils().validateUser(code, email)

    const cookieConfig = setProdCookie()
    return res
      .cookie("r_token", refreshToken, cookieConfig)
      .json({ user, accessToken })
  }
}
