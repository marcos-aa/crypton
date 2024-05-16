import {
  faHourglassStart,
  faPencil,
  faTrash,
  faUpRightAndDownLeftFromCenter,
} from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { StreamData, Tickers } from "@shared/types"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { memo, useEffect } from "react"
import { Link, createSearchParams, useFetcher } from "react-router-dom"
import useWebSocket from "react-use-websocket"
import { getGuestStreams, getStreams } from "../../../../utils/datafetching"
import {
  createTicksParameter,
  formatSymbols,
  local,
} from "../../../../utils/helpers"
import IconLink from "../IconLink"
import SymbolTicks from "./SymbolTicks"
import styles from "./styles.module.scss"

export const streamQuery = (verified: boolean) => ({
  queryKey: ["streams"],
  queryFn: async () => {
    const streamData = verified ? getStreams() : getGuestStreams()
    return streamData
  },
})

export const generateURL = (symbols: string[]) => {
  const symurl = symbols.join("@ticker/").toLowerCase()
  return "wss:stream.binance.com:9443/ws/" + symurl + "@ticker"
}

const tformatter = Intl.NumberFormat("en-us", {
  style: "decimal",
  maximumFractionDigits: 2,
})

interface StreamsProps {
  initialData: StreamData
  verified: boolean
  isImporting: boolean
  updateTotals(streams: number, syms: number, usyms: number): void
}

interface WSTIcker {
  s: string
  p: string
  w: string
  P: string
  c: string
  q: string
  v: string
  n: number
  O: number
  C: number
  result?: string
}

let store: Tickers = {}

function StreamList({
  initialData,
  verified,
  isImporting,
  updateTotals,
}: StreamsProps) {
  const qc = useQueryClient()
  const fetcher = useFetcher()
  const { data } = useQuery({
    ...streamQuery(verified),
    initialData,
    staleTime: 3600000,
    gcTime: 0,
  })

  const { sendMessage } = useWebSocket(
    generateURL(Object.keys(initialData.symtracker)),
    {
      onMessage: (item) => {
        const interval = localStorage.getItem(local.window)
        const ticker: WSTIcker = JSON.parse(item.data)
        if (ticker.result === null) return

        const newticker = {
          average: ticker.w,
          change: ticker.p,
          pchange: ticker.P,
          last: ticker.c,
          volume: Number(ticker.v),
          qvolume: Number(ticker.q),
          trades: ticker.n,
          close: ticker.C,
          open: ticker.O,
        }

        const windowTicker = data.tickers[ticker.s]?.[interval]
        if (windowTicker) newticker[interval] = windowTicker

        store[ticker.s] = newticker
      },
      filter: () => false,
    }
  )

  const handleTickSub = (
    ticks: string[],
    method: "SUBSCRIBE" | "UNSUBSCRIBE"
  ) => {
    sendMessage(JSON.stringify({ method, params: ticks, id: 1 }))
  }

  const syncTickers = () => {
    const formatted = formatSymbols(store, tformatter)
    qc.setQueryData<StreamData>(["streams"], (cached) => {
      const tickers = { ...cached.tickers, ...formatted }

      return {
        ...cached,
        tickers,
      }
    })
    store = {}
  }

  useEffect(() => {
    let intervalId
    if (window.location.pathname == "/dashboard" && data.usyms > 0) {
      intervalId = setInterval(syncTickers, 1000)
    }

    syncTickers()
    return () => {
      store = {}
      clearInterval(intervalId)
    }
  }, [window.location.pathname, data.usyms])

  useEffect(() => {
    const qparams = createSearchParams(window.location.search)
    const [newticks, delticks] = [
      JSON.parse(qparams.get("newsyms")),
      JSON.parse(qparams.get("delsyms")),
    ]

    if (newticks?.length > 0) {
      qparams.delete("newsyms")
      handleTickSub(newticks, "SUBSCRIBE")
    }

    if (delticks?.length > 0) {
      qparams.delete("delsyms")
      handleTickSub(delticks, "UNSUBSCRIBE")
    }

    const strparams = qparams.size > 0 ? "?" + qparams.toString() : ""
    const cleanURL = new URL(
      window.location.origin + window.location.pathname + strparams
    )
    updateTotals(data.tstreams, data.tsyms, data.usyms)
    history.replaceState(history.state, "", cleanURL)
  }, [data.streams])

  return (
    <main id={styles.streamPanel}>
      <div className={styles.streamSettings}>
        <h1> Your streams </h1>
        <Link className="action" to="streams" data-cy="createStream">
          Create
        </Link>
      </div>

      {data.tstreams < 1 && (
        <div className={styles.streamList} id={styles.streamCta}>
          <h2 data-cy="streamCta">Create a new stream to get started</h2>
        </div>
      )}

      {data.streams.map((stream) => {
        return (
          <div className={styles.streamList} key={stream.id}>
            {stream.symbols.map((symbol) => {
              const sym = data.tickers[symbol]
              return (
                <SymbolTicks
                  key={symbol}
                  symbol={symbol}
                  decreased={sym?.change[0] === "-"}
                  prices={{
                    average: sym.average,
                    last: sym.last,
                    change: sym.change,
                    pchange: sym.pchange,
                  }}
                />
              )
            })}

            <div className={styles.streamButtons}>
              <IconLink
                to={`/dashboard/streams/window?${createTicksParameter(
                  stream.symbols,
                  "symbols"
                )}`}
                icon={faUpRightAndDownLeftFromCenter}
                title="Expand stream"
              />

              {stream.userId === "guest" && isImporting ? (
                <FontAwesomeIcon
                  title="Please wait until stream is fully imported"
                  icon={faHourglassStart}
                  id={styles.waitWarning}
                />
              ) : (
                <>
                  <IconLink
                    to={`/dashboard/${
                      verified ? `streams/${stream.id}` : "export"
                    }`}
                    title="Edit stream"
                    icon={faPencil}
                    state={{
                      symbols: stream.symbols,
                      verified,
                    }}
                  />

                  {localStorage.getItem(local.delPrompt) ? (
                    <fetcher.Form
                      method="delete"
                      action={`/dashboard/streams/delete/${stream.id}`}
                    >
                      <button type="submit" title="Delete stream">
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </fetcher.Form>
                  ) : (
                    <IconLink
                      to={`streams/delete/${stream.id}`}
                      title="Delete stream"
                      icon={faTrash}
                    />
                  )}
                </>
              )}
            </div>
          </div>
        )
      })}
    </main>
  )
}

export default memo(StreamList)
