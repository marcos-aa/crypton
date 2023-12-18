import { Router } from "express"

import { SessionController } from "./controllers/SessionController"
import { StreamController } from "./controllers/StreamController"
import { UserController } from "./controllers/UserController"

// Utils controller
import StreamHandler from "./utils/Stream/Handler"
import UserHandler from "./utils/User/Handler"

import isAuthorized from "./middleware/ensureAuth"
const router = Router()

// Main routes
router.post("/user", new UserController().create)
router.put("/user", new UserController().update)
router.get("/user", isAuthorized, new UserController().read)
router.delete("/user", isAuthorized, new UserController().delete)

router.delete("/session", new SessionController().delete)

router.post("/stream", isAuthorized, new StreamController().create)
router.post("/stream/import", isAuthorized, new StreamController().createMany)
router.get("/stream", isAuthorized, new StreamController().read)
router.put("/stream", isAuthorized, new StreamController().update)
router.delete("/stream", isAuthorized, new StreamController().delete)

//Utils microservices
router.put("/user/name", isAuthorized, new UserHandler().updateName)
router.put("/user/email", isAuthorized, new UserHandler().updateEmail)
router.put("/user/password", new UserHandler().updatePassword)
router.post("/user/code", new UserHandler().createSendmail)
router.put("/user/validate", new UserHandler().updateValidation)
router.get("/currencies", new StreamHandler().readCurrencies)
router.get("/tickers", new StreamHandler().readTickers)
router.get("/tickers/preview", new StreamHandler().readPreview)

export { router }
