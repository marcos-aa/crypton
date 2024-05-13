interface Stream {
  id: string
  userId: string
  symbols: string[]
}

type RawId = { _id: { $oid: string } }
type RawStream = Omit<Stream, "id"> & RawId

interface NewIds {
  [id: string]: string
}

interface SymTracker {
  [symbol: string]: number
}

interface StreamData {
  streams: Stream[]
  symtracker: SymTracker
  tickers: Tickers
  tstreams: number
  tsyms: number
  usyms: number
}

interface RawTicker {
  symbol: string
  priceChange: string
  priceChangePercent: string
  weightedAvgPrice: string
  lastPrice: string
  volume: number
  quoteVolume: number
  count: number
  closeTime: number
  openTime: number
}

interface Ticker {
  change: string
  pchange: string
  average: string
  last: string
  volume: number
  qvolume: number
  trades: number
  close: number
  open: number
}

interface WindowedTicker extends Ticker {
  [key: symbol]: Ticker
}

interface Tickers {
  [ticker: string]: WindowedTicker
}

interface UIUser {
  id: string
  email: string
  name: string
  createdAt: Date
  verified: boolean
}

interface UserData {
  user: UIUser
  accessToken: string
}

interface UserTokens extends UserData {
  refreshToken: string
}

export {
  NewIds,
  RawId,
  RawStream,
  RawTicker,
  Stream,
  StreamData,
  SymTracker,
  Ticker,
  Tickers,
  UIUser,
  UserData,
  UserTokens,
  WindowedTicker,
}
