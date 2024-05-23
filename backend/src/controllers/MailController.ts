import { Request, Response } from "express"
import EmailServices from "../services/MailServices"
import { genCookie } from "../utils/helpers"

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

export default class MailController {
  async createBounce(req: Request, res: Response) {
    const { Message } = req.body
    const { bounce }: BounceMessage = JSON.parse(Message)
    await new EmailServices().blacklistEmail(
      bounce.bouncedRecipients[0].emailAddress,
      bounce.bounceType
    )
    return res.sendStatus(200)
  }

  async createComplaint(req: Request, res: Response) {
    const { Message } = req.body
    const { complaint }: ComplaintMessage = JSON.parse(Message)
    await new EmailServices().blacklistEmail(
      complaint.complainedRecipients[0].emailAddress,
      "Permanent"
    )
    return res.sendStatus(200)
  }

  async createMail(req: Request, res: Response) {
    const { email, id, type } = req.body
    const message = await new EmailServices().sendMail(id, email, type)
    return res.send(message)
  }

  async updateEmail(req: Request, res: Response) {
    const { newmail, password } = req.body
    await new EmailServices().updateEmail(req.id, newmail, password)
    return res.sendStatus(202)
  }

  async updatePassword(req: Request, res: Response) {
    const { email, password } = req.body
    const id = await new EmailServices().updatePassword(email, password)
    return res.send(id)
  }

  async updateValidation(req: Request, res: Response) {
    const { code, email } = req.body
    const { user, accessToken, refreshToken } =
      await new EmailServices().validateUser(code, email)

    const cookieConfig = genCookie()
    return res
      .cookie("r_token", refreshToken, cookieConfig)
      .json({ user, accessToken })
  }
}
