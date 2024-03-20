import { NextFunction, Request, Response } from "express"
import StreamServices from "../services/StreamServices"

export class StreamController {
  async create(req: Request, res: Response, next: NextFunction) {
    const user_id = req.headers.id as string
    const { symbols } = req.body
    try {
      const result = await new StreamServices().create(user_id, symbols)
      return res.json(result)
    } catch (e) {
      next(e)
    }
  }

  async createMany(req: Request, res: Response, next: NextFunction) {
    const { streams } = req.body
    try {
      const result = await new StreamServices().createMany(streams)
      return res.status(200).json(result)
    } catch (e) {
      next(e)
    }
  }

  async read(req: Request, res: Response) {
    const id = req.headers.id as string
    const result = await new StreamServices().read(id)
    return res.json(result)
  }

  async update(req: Request, res: Response, next: NextFunction) {
    const { id, symbols } = req.body
    try {
      const result = await new StreamServices().update(id, symbols)
      return res.json(result)
    } catch (e) {
      next(e)
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    const { id } = req.body
    try {
      const result = await new StreamServices().delete(id)
      return res.json(result)
    } catch (e) {
      next(e)
    }
  }
}
