import { NextFunction, Request, Response } from "express"
import { ValidationError } from "joi"

export default function validateInput(
  error: ValidationError,
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (error.isJoi) return res.status(422).json({ message: error.message })
  return res.status(500).json({ message: "Something went wrong" })
}
