import http from "http"
import app from "./app"
const httpServer = http.createServer(app)

const { PORT_SOCKET } = process.env

httpServer.listen(PORT_SOCKET || 4000)
export { httpServer }
