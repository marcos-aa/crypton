export interface Stream {
  id: string;
  user_id: string;
  symbols: string[];
}

export type RawStream = Omit<Stream, "id"> & RawId;

export type RawId = { _id: { $oid: string } };

export interface NewIds {
  [id: string]: string;
}

export interface SymTracker {
  [symbol: string]: number;
}

export interface StreamData {
  streams: Stream[];
  symtracker: SymTracker;
  tickers: Tickers;
  tstreams: number;
  tsyms: number;
  usyms: number;
}

export interface RawTicker {
  symbol: string;
  priceChange: string;
  priceChangePercent: string;
  weightedAvgPrice: string;
  lastPrice: string;
}

export interface RawWindowTicker extends RawTicker {
  volume: number;
  quoteVolume: number;
  count: number;
}

export interface Ticker {
  change: string;
  pchange: string;
  average: string;
  last: string;
}

export interface Tickers {
  [ticker: string]: Ticker;
}

export interface WindowTicker extends Ticker {
  volume: number;
  qvolume: number;
  trades: number;
}

export interface WindowTickers {
  [ticker: string]: WindowTicker;
}
