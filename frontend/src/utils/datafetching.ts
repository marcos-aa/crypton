import { StreamData, Tickers, UIUser, UserData } from "@shared/types"
import api from "../services/api"
import { genGuestStreams, local } from "./helpers"

export const saveHeader = (token: string) => {
  localStorage.setItem(local.token, token)
  api.defaults.headers.common.authorization = `Bearer ${token}`
}

const getAssets = async (): Promise<string[]> => {
  const { data: assets } = await api.get<string[]>("/assets")
  return assets
}

const getUser = async (): Promise<UIUser> => {
  const { data } = await api.get<UserData>("/user")
  return data.user
}

const getGuestUser = (): UIUser => {
  const joinDate = JSON.parse(localStorage.getItem(local.joined))

  const udata: UIUser = {
    id: "guest",
    name: "Guest",
    email: "No email",
    createdAt: joinDate,
    verified: false,
  }

  return udata
}

const getStreams = async (): Promise<StreamData> => {
  const { data: streamData } = await api.get<StreamData>("/streams")
  return streamData
}

const getGuestStreams = async (): Promise<StreamData> => {
  const { queriable, symbols } = genGuestStreams("guest")
  let tickers: Tickers

  if (queriable.streams.length > 0) {
    const { data } = await api.get<Tickers>("/tickers", {
      params: {
        symbols: symbols,
      },
    })
    tickers = data
  }

  return { ...queriable, tickers }
}

const getWindowTicks = async (symbols: string[], window: string) => {
  const { data } = await api.get<Tickers>("/tickers/window", {
    params: {
      symbols,
      winsize: window,
    },
  })
  return data
}

export {
  getAssets,
  getGuestStreams,
  getGuestUser,
  getStreams,
  getUser,
  getWindowTicks,
}
