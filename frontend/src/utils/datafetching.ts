import { Stream } from "../components/views/Dashboard/StreamList";
import api from "../services/api";
import { TotalCount, genGStreamData, local } from "./helpers";

export const udata = {
  id: "guest",
  name: "Guest",
  email: "No email",
  created_at: new Date(),
  verified: false,
};

export interface Ticker {
  symbol: string;
  change: string;
  pchange: string;
  average: string;
  last: string;
}

export type Prices = Omit<Ticker, "symbol">;

export interface User {
  id: string;
  name: string;
  email: string;
  created_at: Date;
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
  [symbol: string]: Prices;
};

export interface SymTracker {
  [symbol: string]: number;
}

export interface StreamData extends TotalCount {
  streams: Stream[];
  tickers: Tickers;
}

export const saveUser = (id: string, token?: string) => {
  localStorage.setItem(local.id, id);
  localStorage.setItem(local.token, token);
  api.defaults.headers.common.id = id;
  api.defaults.headers.common.authorization = `Bearer ${token}`;
};

const guestData = (): User => {
  const joinDate = new Date(localStorage.getItem(local.joined)) ?? new Date();

  const udata: User = {
    id: "guest",
    name: "Guest",
    email: "No email",
    created_at: joinDate,
    verified: false,
  };

  saveUser(udata.id);
  return udata;
};

const getUser = async (id: string): Promise<User> => {
  if (id === "guest") return guestData();
  const { data } = await api.get<UserData>("/user");
  saveUser(id, data.access_token);
  return data.user;
};

const getStreams = async (): Promise<StreamData> => {
  const { data: streamData } = await api.get<StreamData>("/streams");
  return streamData;
};

const getGuestStreams = async (): Promise<StreamData> => {
  const { data, symbols } = genGStreamData("guest");
  const { data: tickers } = await api.get<Tickers>("/tickers", {
    params: {
      symbols: symbols,
    },
  });
  const streamData = Object.assign(data, { tickers });
  return streamData;
};

const getPairs = async (): Promise<string[] | string> => {
  try {
    const { data: pairs } = await api.get<string[]>("/pairs");
    return pairs;
  } catch (e) {
    return "Something went wrong. Verify your connection and try again.";
  }
};

export { getGuestStreams, getPairs, getStreams, getUser };
