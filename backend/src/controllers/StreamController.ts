import { Request, Response } from "express"
import StreamServices from "../services/StreamServices"

export class StreamController {
  async create(req: Request, res: Response) {
    const { symbols } = req.body
    const result = await new StreamServices().create(req.id, symbols)
    return res.json(result)
  }

  async createMany(req: Request, res: Response) {
    const { streams } = req.body
    const result = await new StreamServices().createMany(streams)
    return res.json(result)
  }

  async read(req: Request, res: Response) {
    const result = await new StreamServices().read(req.id)
    return res.json(result)
  }

  async update(req: Request, res: Response) {
    const { id, symbols } = req.body
    const result = await new StreamServices().update(id, symbols)
    return res.json(result)
  }

  async delete(req: Request, res: Response) {
    const { id } = req.body
    const result = await new StreamServices().delete(id)
    return res.json(result)
  }
}
