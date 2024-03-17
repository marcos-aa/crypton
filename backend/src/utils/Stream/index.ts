import axios from "axios"
import NodeCache from "node-cache"
import { RawTicker, Tickers, WindowTicker } from "shared/streamtypes"

interface CachedTickers {
  cached: Tickers
  uncsyms?: string[]
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
  cacheTickers(tickers: RawTicker[], window: string = "") {
    const fmtickers = tickers.map((tick) => {
      return {
        key: tick.symbol + window,
        val: {
          change: tformatter.format(Number(tick.priceChange)),
          pchange: tformatter.format(Number(tick.priceChangePercent)),
          average: tformatter.format(Number(tick.weightedAvgPrice)),
          last: tformatter.format(Number(tick.lastPrice)),
          volume: tick.volume,
          qvolume: tick.quoteVolume,
          trades: tick.count,
          close: tick.closeTime,
          open: tick.openTime,
        },
      }
    })

    console.log(fmtickers)
    cache.mset(fmtickers)
  }

  getCachedTickers(symbols: string[]): CachedTickers {
    const cached = cache.mget<WindowTicker>(symbols)
    const keys = Object.keys(cached)
    if (keys.length == symbols.length) return { cached }

    const notCached = symbols.filter((u) => !keys.includes(u))
    return { cached, uncsyms: notCached }
  }

  remTickerWindow(wtickers: Tickers) {
    const symbols = Object.keys(wtickers)
    const tickers = symbols.reduce<Tickers>((store, symbol) => {
      const sym = symbol.slice(0, symbol.length - 3)
      store[sym] = wtickers[symbol]
      return store
    }, {})

    return tickers
  }

  async getPairs(): Promise<string[]> {
    const keys = cache.keys()
    let prices: string[] = []
    for (let i = 0; i < keys.length; i++) {
      const sym = keys[i]
      if (sym.charCodeAt(sym.length - 1) < 97) prices.push(sym)
    }
    if (prices.length >= 2000) return prices.sort()

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
    const tickers = Object.assign(cached, cache.mget<WindowTicker>(uncsyms))
    return tickers
  }

  async getWinTickers(symbols: string[], winsize: string): Promise<Tickers> {
    let winnumber = Number(winsize.slice(0, winsize.length - 1))
    if (winnumber < 10) winsize = "0" + winsize // Ensure winsize has at least 3 digits

    const winsyms = symbols.map((sym) => sym + winsize)
    const { cached, uncsyms } = this.getCachedTickers(winsyms)
    if (!uncsyms) return this.remTickerWindow(cached)

    const { data } = await axios.get<RawTicker[]>(baseURL + "/ticker", {
      params: {
        symbols: JSON.stringify(symbols),
        windowSize: winsize,
      },
    })

    this.cacheTickers(data, winsize)
    const wintickers = Object.assign(cached, cache.mget(winsyms))
    const tickers = this.remTickerWindow(wintickers)
    return tickers
  }
}
