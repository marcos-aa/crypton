import { Request, Response } from "express"

import StreamUtils from "."
export default class StreamHandler {
  async readCurrencies(req: Request, res: Response) {
    const result = await new StreamUtils().getCurrencies()
    return res.json(result)
  }

  async readTickers(req: Request, res: Response) {
    const { symbols } = req.query
    const result = await new StreamUtils().getTickers(symbols as string[])
    return res.json(result)
  }

  async readPreview(req: Request, res: Response) {
    const result = await new StreamUtils().getPreview()
    return res.json(result)
  }
}
