export interface Stream {
  id: string;
  user_id: string;
  symbols: string[];
}

export type RawId = { _id: { $oid: string } };
export type RawStream = Omit<Stream, "id"> & RawId;

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
  volume: number;
  quoteVolume: number;
  count: number;
  closeTime: number;
  openTime: number;
}

interface Ticker {
  change: string;
  pchange: string;
  average: string;
  last: string;
  volume: number;
  qvolume: number;
  trades: number;
  close: number;
  open: number;
}

export type WindowTicker = Ticker & {
  [key: symbol]: Ticker;
};

export interface Tickers {
  [ticker: string]: WindowTicker;
}

export type WindowData = {
  [window: string]: {
    [ticker: string]: WindowTicker;
  };
};
