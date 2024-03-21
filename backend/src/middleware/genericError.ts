import { NextFunction, Request, Response } from "express"
import { ValidationError } from "joi"
import { CredError } from "../utils/schemas"

export default function genericError(
  e: ValidationError | CredError,
  req: Request,
  res: Response,
  next: NextFunction
) {
  const status = (e as CredError).status
  if (e instanceof ValidationError)
    return res.status(422).json({ message: e.message })

  if (status) return res.status(status).json({ message: e.message })

  return res.status(500).json({ message: "Something went wrong" })
}
