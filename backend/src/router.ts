import { Router } from "express"

import AssetController from "./controllers/AssetController"
import EmailController from "./controllers/MailController"
import StreamController from "./controllers/StreamController"
import UserController from "./controllers/UserController"

import isAuthorized from "./middleware/ensureAuth"
import { tryWrapper } from "./middleware/tryWrapper"
const router = Router()

router.post("/user", tryWrapper(new UserController().create))
router.post("/user/token", tryWrapper(new UserController().createTokens))
router.put(
  "/user/name",
  isAuthorized,
  tryWrapper(new UserController().updateName)
)
router.get("/user", isAuthorized, tryWrapper(new UserController().read))
router.put("/user", tryWrapper(new UserController().updateToken))
router.delete("/user", isAuthorized, tryWrapper(new UserController().delete))
router.delete("/session", new UserController().deleteSession)

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

router.put(
  "/user/email",
  isAuthorized,
  tryWrapper(new EmailController().updateEmail)
)
router.put("/user/password", tryWrapper(new EmailController().updatePassword))
router.post("/user/code", tryWrapper(new EmailController().createMail))
router.put("/user/validate", tryWrapper(new EmailController().updateValidation))
router.post("/user/validate/bounce", new EmailController().createBounce)
router.post("/user/validate/complaint", new EmailController().createComplaint)
router.get("/assets", new AssetController().readAssets)

router.get("/tickers", new AssetController().readTickers)
router.get("/tickers/preview", new AssetController().readTickersPreview)
router.get("/tickers/window", new AssetController().readTickWindow)

export { router }
