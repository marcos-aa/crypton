import { NextFunction, Request, Response } from "express"

export function tryWrapper(
  fn: (req: Request, res: Response) => Promise<Response>
) {
  return async function wrappedFn(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      await fn(req, res)
    } catch (err) {
      next(err)
    }
  }
}
