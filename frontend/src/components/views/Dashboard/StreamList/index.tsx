import {
  faHourglass,
  faPencil,
  faTrash,
  faUpRightAndDownLeftFromCenter,
} from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { memo, useEffect, useState } from "react"
import { Outlet } from "react-router"
import {
  Link,
  createSearchParams,
  useFetcher,
  useLocation,
} from "react-router-dom"
import useWebSocket from "react-use-websocket"
import { StreamData, Tickers } from "shared/streamtypes"
import { getGuestStreams, getStreams } from "../../../../utils/datafetching"
import {
  createTicksParameter,
  formatSymbols,
  local,
} from "../../../../utils/helpers"
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

function StreamList({ initialData, verified, updateTotals }: StreamsProps) {
  const qc = useQueryClient()
  const fetcher = useFetcher()
  const { data } = useQuery({
    ...streamQuery(verified),
    initialData,
    staleTime: 3600000,
    gcTime: 0,
  })
  const [, setTemp] = useState<Tickers>({})
  const { pathname } = useLocation()

  const { sendMessage } = useWebSocket(
    generateURL(Object.keys(initialData.symtracker)),
    {
      onMessage: (item) => {
        const interval = localStorage.getItem(local.window)
        const ticker: WSTIcker = JSON.parse(item.data)
        if (ticker.result === null) return

        setTemp((prev) => {
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

          return {
            ...prev,
            [ticker.s]: newticker,
          }
        })
      },
    }
  )

  const handleTickSub = (
    ticks: string[],
    method: "SUBSCRIBE" | "UNSUBSCRIBE"
  ) => {
    sendMessage(JSON.stringify({ method, params: ticks, id: 1 }))
  }

  const syncTickers = () => {
    setTemp((prev) => {
      const store = formatSymbols(prev, tformatter)
      qc.setQueryData<StreamData>(["streams"], (cached) => {
        const tickers = { ...cached.tickers, ...store }

        return {
          ...cached,
          tickers,
        }
      })

      return {}
    })
  }

  useEffect(() => {
    let intervalId
    if (pathname == "/dashboard" && data.usyms > 0) {
      intervalId = setInterval(syncTickers, 1000)
    }

    syncTickers()
    return () => {
      clearInterval(intervalId)
    }
  }, [pathname, data.usyms])

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
      <Outlet />

      <div className={styles.streamSettings}>
        <h1> Your streams </h1>
        <Link className="action" to="streams">
          Create
        </Link>
      </div>

      {data.tstreams < 1 && (
        <div className={styles.streamList} id={styles.streamCta}>
          <h2>Create a new stream to get started</h2>
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
              <Link
                to={
                  `/dashboard/streams/window?` +
                  createTicksParameter(stream.symbols, "symbols")
                }
              >
                <FontAwesomeIcon
                  title="Expand stream"
                  icon={faUpRightAndDownLeftFromCenter}
                />
              </Link>
              {stream.userId === "guest" &&
              localStorage.getItem(local.expStreams) == "exporting" ? (
                <FontAwesomeIcon
                  title="Please wait until stream is fully imported"
                  icon={faHourglass}
                />
              ) : (
                <>
                  <Link
                    replace
                    to={
                      verified
                        ? `/dashboard/streams/${stream.id}`
                        : "/dashboard/signwall"
                    }
                    state={{
                      symbols: stream.symbols,
                      verified,
                    }}
                  >
                    <FontAwesomeIcon icon={faPencil} />
                  </Link>
                  {localStorage.getItem(local.delPrompt) ? (
                    <fetcher.Form
                      method="delete"
                      action={`/dashboard/streams/delete/${stream.id}`}
                    >
                      <button type="submit">
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </fetcher.Form>
                  ) : (
                    <Link to={`streams/delete/${stream.id}`}>
                      <FontAwesomeIcon icon={faTrash} />
                    </Link>
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
