import { Stream } from "@prisma/client"
import ObjectID from "bson-objectid"
import prisma from "../../prisma/client"
import { Error } from "../controllers/UserController"
import StreamUtils, { Tickers } from "../utils/Stream"
import { streamSchema } from "../utils/schemas"

type RawStream = Omit<Stream, "id"> & {
  _id: {
    $oid: string
  }
}

interface SymCount {
  [symbol: string]: number
}

type WriteErrors = Array<{
  code: number
  keyValue: {
    _id: {
      $oid: string
    }
  }
}>

interface NewIds {
  [id: string]: string
}

type StreamRes = Stream | Error

type StreamData = {
  streams: Stream[]
  symcount: SymCount
  tickers: Tickers
}

export default class StreamServices {
  async create(user_id: string, symbols: string[]): Promise<StreamRes> {
    const { error: e } = streamSchema.validate({ id: user_id, symbols })
    if (e) return { status: 422, message: e.details[0].message }

    const stream = await prisma.stream.create({
      data: {
        user_id,
        symbols,
      },
    })

    return stream
  }

  async createMany(
    allstreams: RawStream[],
    newids: NewIds = {}
  ): Promise<NewIds> {
    const res = await prisma.$runCommandRaw({
      insert: "Stream",
      ordered: false,
      documents: allstreams,
    })

    const werr = res.writeErrors as WriteErrors

    if (werr) {
      const duplicates: RawStream[] = []

      werr.forEach((err) => {
        if (err.code === 11000) {
          const id = err.keyValue._id.$oid
          const stream = allstreams.find(
            (dupstream) => dupstream._id.$oid == id
          ) as RawStream

          newids[id] = ObjectID().toHexString()
          stream._id.$oid = newids[id]
          duplicates.push(stream)
        }
      })

      return this.createMany(duplicates, newids)
    }

    return newids
  }

  async read(user_id: string): Promise<StreamData> {
    const streams = await prisma.stream.findMany({
      where: {
        user_id,
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
    if (e) return { status: 422, message: e.details[0].message }

    const stream = await prisma.stream.update({
      where: {
        id,
      },
      data: {
        symbols,
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
