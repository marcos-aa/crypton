import axios from "axios"
import NodeCache from "node-cache"
import {
  RawTicker,
  RawWindowTicker,
  Ticker,
  Tickers,
  WindowTickers,
} from "shared/streamtypes"

interface Params {
  symbols?: string
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
  formatTicker(ticker: RawTicker): Ticker {
    return {
      change: formatter.format(Number(ticker.priceChange)),
      pchange: formatter.format(Number(ticker.priceChangePercent)),
      average: formatter.format(Number(ticker.weightedAvgPrice)),
      last: formatter.format(Number(ticker.lastPrice)),
    }
  }

  async getPairs(): Promise<string[]> {
    const prices = cache.keys()
    if (prices.length >= 1000) return prices.sort()

    await this.cacheTickers()
    return cache.keys().sort()
  }

  async cacheTickers(params: Params = {}) {
    const { data }: { data: RawTicker[] } = await axios.get(
      baseURL + "/ticker/24hr",
      { params }
    )
    const tickers = data.map((tick) => {
      return {
        key: tick.symbol,
        val: this.formatTicker(tick),
      }
    })

    cache.mset(tickers)
  }

  async getTickers(symbols: string[]): Promise<Tickers> {
    const cached = cache.mget<Ticker>(symbols)
    const keys = Object.keys(cached)
    if (keys.length === symbols.length) return cached

    const notCached = symbols.filter((u) => !keys.includes(u))

    await this.cacheTickers({ symbols: JSON.stringify(notCached) })
    const tickers = Object.assign(cached, cache.mget<Ticker>(notCached))
    return tickers
  }

  async getWinTickers(
    symbols: string[],
    winsize: string
  ): Promise<WindowTickers> {
    const { data } = await axios.get(baseURL + "/ticker", {
      params: {
        symbols: JSON.stringify(symbols),
        windowSize: winsize,
      },
    })
    const result: WindowTickers = {}
    data.forEach((tick: RawWindowTicker) => {
      result[tick.symbol] = {
        last: tick.lastPrice,
        average: tick.weightedAvgPrice,
        pchange: tick.priceChangePercent,
        change: tick.priceChange,
        qvolume: tick.quoteVolume,
        volume: tick.volume,
        trades: tick.count,
        close: tick.closeTime,
        open: tick.openTime,
      }
    })

    return result
  }
}
