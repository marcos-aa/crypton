import { Request, Response } from "express"

import StreamUtils from "."
export default class StreamHandler {
  async readPairs(req: Request, res: Response) {
    const pairs = await new StreamUtils().getPairs()
    return res.json(pairs)
  }

  async readTickers(req: Request, res: Response) {
    const { symbols } = req.query
    const tickers = await new StreamUtils().getTickers(symbols as string[])
    return res.json(tickers)
  }

  async readTickWindow(req: Request, res: Response) {
    const { symbols, winsize } = req.query as {
      symbols: string[]
      winsize: string
    }
    const historyTickers = await new StreamUtils().getWinTickers(
      symbols,
      winsize
    )
    return res.json(historyTickers)
  }
}
