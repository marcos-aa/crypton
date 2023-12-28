import { Stream } from "../components/views/Dashboard/StreamList";
import api from "../services/api";
import { countSymbols, local } from "./helpers";

export const udata = {
  id: "guest",
  name: "Guest",
  email: "No email",
  created_at: new Date(),
  last_session: new Date(),
  verified: false,
};

export interface Ticker {
  symbol: string;
  change: string;
  pchange: string;
  average: string;
  last: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  created_at: Date;
  last_session: Date;
  verified: boolean;
}

export interface ResMessage {
  message: string;
  status: number;
}

export interface UserData {
  user: User;
  access_token: string;
}

export type Tickers = {
  [symbol: string]: Omit<Ticker, "symbol">;
};

export interface SymCount {
  [symbol: string]: number;
}

export interface StreamData {
  streams: Stream[];
  symcount: SymCount;
  tickers: Tickers;
}

export const saveUser = (id: string, token?: string) => {
  localStorage.setItem(local.id, id);
  localStorage.setItem(local.token, token);
  api.defaults.headers.common.id = id;
  api.defaults.headers.common.authorization = `Bearer ${token}`;
};

const guestData = () => {
  const joinDate = new Date(localStorage.getItem(local.joined)) ?? new Date();

  const udata: User = {
    id: "guest",
    name: "Guest",
    email: "No email",
    created_at: joinDate,
    last_session: new Date(),
    verified: false,
  };

  saveUser(udata.id);
  return udata;
};

const getUser = async (id: string) => {
  if (id === "guest") return guestData();
  const { data } = await api.get<UserData>("/user");
  saveUser(id, data.access_token);
  return data.user;
};

const getStreams = async (): Promise<StreamData> => {
  try {
    const { data } = await api.get<StreamData>("/streams");
    return {
      streams: data.streams,
      symcount: data.symcount,
      tickers: data.tickers,
    };
  } catch (e) {
    return { streams: [], symcount: {}, tickers: {} };
  }
};

const parseLocalStreams = (user_id: string) => {
  const streams: Stream[] =
    JSON.parse(localStorage.getItem(local.streams)) || [];
  const { symbols, symcount } = countSymbols(streams, user_id);

  return { streams, symcount, symbols };
};

const getLocalStreams = async () => {
  const { streams, symbols, symcount } = parseLocalStreams("guest");

  try {
    const { data } = await api.get<Tickers>("/tickers", {
      params: {
        symbols,
      },
    });
    return { streams, symcount, tickers: data };
  } catch (e) {
    return { streams, symcount, tickers: {} };
  }
};

const getCurrencies = async (): Promise<string[] | string> => {
  try {
    const { data: currencies } = await api.get<string[]>("/currencies");
    return currencies;
  } catch (e) {
    return "Something went wrong. Verify your connection and try again.";
  }
};

export {
  getCurrencies,
  getLocalStreams,
  getStreams,
  getUser,
  parseLocalStreams,
};
