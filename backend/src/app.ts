import cookieParser from "cookie-parser"
import cors from "cors"
import "dotenv/config"
import express from "express"
import genericError from "./middleware/genericError"
import { router } from "./router"
const { PORT, TEST_ENV } = process.env

const app = express()
app.use(
  cors({
    origin: "http://localhost:3001",
    credentials: true,
  })
)

app.use(express.json())
app.use(cookieParser())
app.use(router)
app.use(genericError)
if (!TEST_ENV) app.listen(PORT || 3000)

export default app
