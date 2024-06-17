import { Request, Response } from "express"

import AssetServices from "../services/AssetServices"

export default class AssetController {
  async readAssets(req: Request, res: Response) {
    const pairs = await new AssetServices().getAssets()
    return res.header("Cache-Control", "public, max-age=86400").json(pairs)
  }

  async readTickers(req: Request, res: Response) {
    const { symbols } = req.query
    const tickers = await new AssetServices().getTickers(symbols as string[])
    return res.header("Cache-Control", "public, max-age=3600").json(tickers)
  }

  async readTickWindow(req: Request, res: Response) {
    const { symbols, winsize } = req.query as {
      symbols: string[]
      winsize: string
    }
    const historyTickers = await new AssetServices().getWinTickers(
      symbols,
      winsize
    )
    return res.json(historyTickers)
  }
}
