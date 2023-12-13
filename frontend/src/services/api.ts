import axios from "axios";
import { local } from "../utils/helpers";

const api = axios.create({
  baseURL: "http://localhost:3000",
  withCredentials: true,
});

api.interceptors.response.use((res) => {
  if (res.headers.authorization) {
    localStorage.setItem(local.token, res.headers.authorization.split(" ")[1]);
  }

  return res;
});

export default api;
