import prisma from "../../prisma/client"
import { Error } from "../controllers/UserController"
import StreamUtils, { Tickers } from "../utils/Stream"
import { streamSchema } from "../utils/schemas"

export interface Stream {
  id: string
  symbols: string[]
}

type StreamBatch = Stream & { user_id: string }

interface SymCount {
  [symbol: string]: number
}

type StreamRes = Stream | Error
type StreamTickers = { streams: Stream[]; symcount: SymCount; tickers: Tickers }

export default class StreamServices {
  async create(user_id: string, symbols: string[]): Promise<StreamRes> {
    const { error: e } = streamSchema.validate({ id: user_id, symbols })
    if (e) return { status: 401, message: e.details[0].message }

    const stream = await prisma.stream.create({
      data: {
        user_id,
        symbols,
      },
      select: {
        id: true,
        symbols: true,
      },
    })

    return stream
  }

  async createMany(allstreams: StreamBatch[]) {
    const streams = await prisma.stream.createMany({
      data: allstreams,
    })
    return streams
  }

  async read(user_id: string): Promise<StreamTickers> {
    const streams = await prisma.stream.findMany({
      where: {
        user_id,
      },
      select: {
        id: true,
        symbols: true,
      },
    })

    if (streams.length < 1) return { streams, symcount: {}, tickers: {} }

    const allsyms = streams.flatMap((stream) => stream.symbols)
    const symcount = allsyms.reduce((store: SymCount, sym: string) => {
      store[sym] = store[sym] + 1 || 1
      return store
    }, {})

    const tickers = await new StreamUtils().getTickers(allsyms)

    return {
      streams,
      symcount,
      tickers,
    }
  }

  async update(id: string, symbols: string[]): Promise<StreamRes> {
    const { error: e } = streamSchema.validate({ id, symbols })
    if (e) return { status: 401, message: e.details[0].message }

    const stream = await prisma.stream.update({
      where: {
        id,
      },
      data: {
        symbols,
      },
      select: {
        id: true,
        symbols: true,
      },
    })

    return stream
  }

  async delete(stream_id: string): Promise<StreamRes> {
    try {
      const stream = await prisma.stream.delete({
        where: {
          id: stream_id,
        },
      })

      return stream
    } catch (e) {
      return { status: 404, message: "Stream does not exist" }
    }
  }
}
