import { RawTicker, Ticker, Tickers, WindowedTicker } from "@shared/types"
import axios from "axios"
import NodeCache from "node-cache"

interface CachedTickers {
  cached: Tickers
  uncached?: string[]
}

const cache = new NodeCache({
  stdTTL: 172800,
  checkperiod: 0,
  deleteOnExpire: false,
})

const tformatter = Intl.NumberFormat("en-us", {
  style: "decimal",
  maximumFractionDigits: 2,
})

const baseURL = "https://api.binance.com/api/v3"

export default class StreamUtils {
  formatRawTicker(rawTicker: RawTicker): Ticker {
    return {
      change: tformatter.format(Number(rawTicker.priceChange)),
      pchange: tformatter.format(Number(rawTicker.priceChangePercent)),
      average: tformatter.format(Number(rawTicker.weightedAvgPrice)),
      last: tformatter.format(Number(rawTicker.lastPrice)),
      volume: rawTicker.volume,
      qvolume: rawTicker.quoteVolume,
      trades: rawTicker.count,
      close: rawTicker.closeTime,
      open: rawTicker.openTime,
    }
  }

  cacheTickers(tickers: RawTicker[]) {
    const fmtickers = tickers.map((tick) => {
      return {
        key: tick.symbol,
        val: this.formatRawTicker(tick),
      }
    })

    cache.mset(fmtickers)
  }

  getCachedTickers(symbols: string[]): CachedTickers {
    const cached = cache.mget<WindowedTicker>(symbols)
    const keys = Object.keys(cached)
    if (keys.length == symbols.length) return { cached }

    const notCached = symbols.filter((u) => !keys.includes(u))
    return { cached, uncached: notCached }
  }

  async getPairs(): Promise<string[]> {
    let prices = cache.keys()
    if (prices.length >= 2000) return prices.sort()

    const { data } = await axios.get<RawTicker[]>(baseURL + "/ticker/24hr")
    this.cacheTickers(data)
    return cache.keys().sort()
  }

  async getTickers(symbols: string[]): Promise<Tickers> {
    const { cached, uncached } = this.getCachedTickers(symbols)
    if (!uncached) return cached

    const { data } = await axios.get<RawTicker[]>(baseURL + "/ticker/24hr", {
      params: {
        symbols: JSON.stringify(symbols),
      },
    })
    this.cacheTickers(data)
    const tickers = Object.assign(cached, cache.mget<WindowedTicker>(uncached))
    return tickers
  }

  async getWinTickers(symbols: string[], winsize: string): Promise<Tickers> {
    const { data } = await axios.get<RawTicker[]>(baseURL + "/ticker", {
      params: {
        symbols: JSON.stringify(symbols),
        windowSize: winsize,
      },
    })

    const tickers = symbols.reduce<Tickers>((store, key, i) => {
      const sym = data[i]
      const ticker = this.formatRawTicker(sym)
      store[key] = ticker as WindowedTicker
      return store
    }, {})

    return tickers
  }
}
