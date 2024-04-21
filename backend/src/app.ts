import cookieParser from "cookie-parser"
import cors from "cors"
import "dotenv/config"
import express from "express"
import genericError from "./middleware/genericError"
import { router } from "./router"

const app = express()
app.use(
  cors({
    origin: process.env.DOMAIN || "http://localhost:3001",
    credentials: true,
  })
)

app.use(express.json())
app.use(cookieParser())
app.use(router)
app.use(genericError)
app.listen(process.env.PORT || 3000)

export default app
