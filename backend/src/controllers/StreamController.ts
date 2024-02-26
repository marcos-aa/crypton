import { Request, Response } from "express"
import StreamServices from "../services/StreamServices"
import { ResMessage } from "shared"

export class StreamController {
  async create(req: Request, res: Response) {
    const user_id = req.headers.id as string
    const { symbols } = req.body
    const result = await new StreamServices().create(user_id, symbols)
    return res.status((result as ResMessage).status || 200).json(result)
  }

  async createMany(req: Request, res: Response) {
    const { streams } = req.body
    const result = await new StreamServices().createMany(streams)
    return res.status(200).json(result)
  }

  async read(req: Request, res: Response) {
    const id = req.headers.id as string
    const result = await new StreamServices().read(id)
    return res.json(result)
  }

  async update(req: Request, res: Response) {
    const { id, symbols } = req.body
    const result = await new StreamServices().update(id, symbols)
    return res.status((result as ResMessage).status || 200).json(result)
  }

  async delete(req: Request, res: Response) {
    const { id } = req.body
    const result = await new StreamServices().delete(id)
    return res.status((result as ResMessage)?.status || 200).json(result)
  }
}
