import axios, { AxiosError } from "axios"
import { saveHeader } from "../utils/datafetching"

const baseURL = "https://crypton-olive.vercel.app"
const api = axios.create({
  baseURL,
  withCredentials: true,
})

let refreshing = false
api.interceptors.response.use(null, async (error: AxiosError) => {
  if (error.response.data !== "TokenExpiredError") return Promise.reject(error)

  if (refreshing) {
    return Promise.resolve({ data: null })
  }

  refreshing = true
  const { data } = await api.post("/user/token")
  const config = error.config
  config.headers.authorization = `Bearer ${data.accessToken}`
  saveHeader(data.accessToken)
  refreshing = false
  return axios.request(config)
})

export default api
