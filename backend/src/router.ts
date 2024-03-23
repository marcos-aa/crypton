import { Router } from "express"

import { SessionController } from "./controllers/SessionController"
import { StreamController } from "./controllers/StreamController"
import { UserController } from "./controllers/UserController"

// Utils controller
import StreamHandler from "./utils/Stream/Handler"
import UserHandler from "./utils/User/Handler"

import isAuthorized from "./middleware/ensureAuth"
import { tryWrapper } from "./middleware/tryWrapper"
const router = Router()

router.post("/user", tryWrapper(new UserController().create))
router.put("/user", tryWrapper(new UserController().update))
router.get("/user", isAuthorized, tryWrapper(new UserController().read))
router.delete("/user", isAuthorized, tryWrapper(new UserController().delete))
router.delete("/session", new SessionController().delete)

router.post("/streams", isAuthorized, tryWrapper(new StreamController().create))
router.post(
  "/streams/import",
  isAuthorized,
  tryWrapper(new StreamController().createMany)
)
router.get("/streams", isAuthorized, new StreamController().read)
router.put("/streams", isAuthorized, tryWrapper(new StreamController().update))
router.delete(
  "/streams",
  isAuthorized,
  tryWrapper(new StreamController().delete)
)

router.put("/user/name", isAuthorized, tryWrapper(new UserHandler().updateName))
router.put(
  "/user/email",
  isAuthorized,
  tryWrapper(new UserHandler().updateEmail)
)
router.put("/user/password", tryWrapper(new UserHandler().updatePassword))
router.post("/user/code", tryWrapper(new UserHandler().createSendmail))
router.put("/user/validate", tryWrapper(new UserHandler().updateValidation))

router.get("/pairs", new StreamHandler().readPairs)
router.get("/tickers", new StreamHandler().readTickers)
router.get("/tickers/window", new StreamHandler().readTickWindow)

export { router }
