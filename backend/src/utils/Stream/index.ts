import axios from "axios"
import NodeCache from "node-cache"
import {
  RawTicker,
  Ticker,
  Tickers,
  WindowTicker,
  WindowTickers,
} from "shared/streamtypes"

interface CachedTickers<T> {
  cached: T
  uncsyms?: string[]
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
  formatTicker(ticker: RawTicker, window: string) {
    let fmticker: Ticker | WindowTicker = {
      change: formatter.format(Number(ticker.priceChange)),
      pchange: formatter.format(Number(ticker.priceChangePercent)),
      average: formatter.format(Number(ticker.weightedAvgPrice)),
      last: formatter.format(Number(ticker.lastPrice)),
    }

    if (window) {
      fmticker = Object.assign(fmticker, {
        volume: formatter.format(ticker.volume),
        qvolume: formatter.format(ticker.quoteVolume),
        trades: formatter.format(ticker.volume),
        close: ticker.closeTime,
        open: ticker.openTime,
      })
    }

    return fmticker
  }

  cacheTickers(tickers: RawTicker[], window: string = "") {
    const fmtickers = tickers.map((tick) => {
      return {
        key: tick.symbol + window,
        val: this.formatTicker(tick, window),
      }
    })

    cache.mset(fmtickers)
  }

  getCachedTickers(symbols: string[]): CachedTickers<WindowTickers> {
    const cached = cache.mget<WindowTicker>(symbols)
    const keys = Object.keys(cached)
    if (keys.length == symbols.length) return { cached }

    const notCached = symbols.filter((u) => !keys.includes(u))
    return { cached, uncsyms: notCached }
  }

  genWindowTickers(wintickers: WindowTickers) {
    const tickers = Object.keys(wintickers).reduce<WindowTickers>(
      (store, symbol) => {
        const nowindow = symbol.slice(0, symbol.length - 2)
        store[nowindow] = wintickers[symbol]
        return store
      },
      {}
    )

    return tickers
  }

  async getPairs(): Promise<string[]> {
    const prices = cache.keys()
    if (prices.length >= 1000) return prices.sort()

    const { data } = await axios.get<RawTicker[]>(baseURL + "/ticker/24hr")
    this.cacheTickers(data)
    return cache.keys().sort()
  }

  async getTickers(symbols: string[]): Promise<Tickers> {
    const { cached, uncsyms } = this.getCachedTickers(symbols)
    if (!uncsyms) return cached

    const { data } = await axios.get<RawTicker[]>(baseURL + "/ticker/24hr", {
      params: {
        symbols: JSON.stringify(symbols),
      },
    })
    this.cacheTickers(data)
    const tickers = Object.assign(cached, cache.mget<Ticker>(uncsyms))
    return tickers
  }

  async getWinTickers(
    symbols: string[],
    winsize: string
  ): Promise<WindowTickers> {
    const winsyms = symbols.map((sym) => sym + winsize)
    const { cached, uncsyms } = this.getCachedTickers(winsyms)
    if (!uncsyms) return this.genWindowTickers(cached)

    const { data } = await axios.get<RawTicker[]>(baseURL + "/ticker", {
      params: {
        symbols: JSON.stringify(symbols),
        windowSize: winsize,
      },
    })

    this.cacheTickers(data, winsize)
    const wintickers = Object.assign(cached, cache.mget(winsyms))
    const tickers = this.genWindowTickers(wintickers)
    return tickers
  }
}
