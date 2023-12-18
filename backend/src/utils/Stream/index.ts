import axios from "axios"
import NodeCache from "node-cache"

interface FMTDTicker {
  change: string
  pchange: string
  average: string
  last: string
}

interface SpotTicker {
  symbol: string
  priceChange: string
  priceChangePercent: string
  weightedAvgPrice: string
  lastPrice: string
}

interface Params {
  symbols?: string
}
export type Tickers = {
  [key: string]: FMTDTicker
}

const formatter = Intl.NumberFormat("en-us", {
  style: "decimal",
  maximumFractionDigits: 2,
})

const cache = new NodeCache({
  stdTTL: 172800,
  checkperiod: 0,
  deleteOnExpire: false,
})

const baseURL = "https://api.binance.com/api/v3"

export default class StreamUtils {
  formatTicker(ticker: SpotTicker): FMTDTicker {
    return {
      change: formatter.format(Number(ticker.priceChange)),
      pchange: formatter.format(Number(ticker.priceChangePercent)),
      average: formatter.format(Number(ticker.weightedAvgPrice)),
      last: formatter.format(Number(ticker.lastPrice)),
    }
  }

  async cacheTickers(params: Params = {}) {
    try {
      const { data }: { data: SpotTicker[] } = await axios.get(
        baseURL + "/ticker/24hr",
        { params }
      )
    } catch (e) {
      console.log(e)
    }

    const tickers = data.map((tick) => {
      return {
        key: tick.symbol,
        val: this.formatTicker(tick),
      }
    })

    cache.mset(tickers)
  }

  async getCurrencies(): Promise<string[]> {
    const prices = cache.keys()
    if (prices.length >= 1000) return prices.sort()

    await this.cacheTickers()
    return cache.keys().sort()
  }

  async getPreview(): Promise<FMTDTicker> {
    const cached = cache.get<FMTDTicker>("BTCUSDT")
    if (cached) return cached

    const { data }: { data: SpotTicker } = await axios.get(
      baseURL + "/ticker/24hr?symbol=BTCUSDT"
    )
    const ticker = this.formatTicker(data)
    cache.set("BTCUSDT", ticker)
    return ticker
  }

  async getTickers(symbols: string[]): Promise<Tickers> {
    const uniques = Array.from(new Set(symbols))
    const cached = cache.mget<FMTDTicker>(uniques)
    const keys = Object.keys(cached)
    if (keys.length === uniques.length) return cached

    const notCached = uniques.filter((u) => !keys.includes(u))
    try {
      await this.cacheTickers({ symbols: JSON.stringify(notCached) })
      const tickers = Object.assign(cached, cache.mget<FMTDTicker>(notCached))
      return tickers
    } catch (e) {
      return {}
    }
  }
}
