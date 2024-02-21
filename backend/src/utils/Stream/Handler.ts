import { Request, Response } from "express"

import StreamUtils from "."
export default class StreamHandler {
  async readPairs(req: Request, res: Response) {
    const result = await new StreamUtils().getPairs()
    return res.json(result)
  }

  async readTickers(req: Request, res: Response) {
    const { symbols } = req.query
    const result = await new StreamUtils().getTickers(symbols as string[])
    return res.json(result)
  }

  async readWeekly(req: Request, res: Response) {
    const { symbols, winsize } = req.query as {
      symbols: string[]
      winsize: string
    }
    const result = await new StreamUtils().getWindowTickers(symbols, winsize)
    return res.json(result)
  }
}
