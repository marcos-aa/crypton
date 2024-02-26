import { StreamData, Tickers, WindowTickers } from "shared/streamtypes";
import { User, UserData } from "shared/usertypes";
import api from "../services/api";
import { genGStreamData, local } from "./helpers";

export const udata = {
  id: "guest",
  name: "Guest",
  email: "No email",
  created_at: new Date(),
  verified: false,
};

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
    refresh_token: "",
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

const getWindowTicks = async (symbols: string[], window: string) => {
  const { data } = await api.get<WindowTickers>("/tickers/window", {
    params: {
      symbols,
      winsize: window,
    },
  });
  return data;
};

export { getGuestStreams, getPairs, getStreams, getUser, getWindowTicks };
