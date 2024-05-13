import { faCaretDown } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { StreamData, Ticker } from "@shared/types"
import { QueryClient, useQueryClient } from "@tanstack/react-query"
import { MouseEvent, Suspense, useState } from "react"
import { Await, defer, useLoaderData } from "react-router-dom"
import { getWindowTicks } from "../../../../../utils/datafetching"
import { local } from "../../../../../utils/helpers"
import Loading from "../../../../Loading"
import ModalContainer from "../../../../ModalContainer"
import CloseModal from "../../../../ModalContainer/CloseModal"
import SkeletonSyms from "./SkeletonSyms"
import SymValues from "./SymValues"
import WindowOptions from "./SymValues/WindowOptions"
import styles from "./styles.module.scss"

interface WindowReq {
  request: Request
}

type Tickers = {
  [ticker: string]: Ticker
}

export interface WindowData {
  "1s": Tickers
  [window: string]: Tickers
}

interface WindowResponse {
  deferred: {
    data: {
      result: WindowData
    }
  }
  symbols: string[]
  interval: string
}

export const saveWindow = async (
  qc: QueryClient,
  symbols: string[],
  interval: string
): Promise<WindowData> => {
  let uncached: string[] = []
  let { tickers } = await qc.ensureQueryData<StreamData>({
    queryKey: ["streams"],
  })

  const data = symbols.reduce(
    (store: WindowData, sym: string) => {
      const ticker = tickers[sym]
      const itvTicker = ticker[interval]
      if (!itvTicker) uncached.push(sym)

      store[interval][sym] = itvTicker
      store["1s"][sym] = {
        average: ticker.average,
        last: ticker.last,
        change: ticker.change,
        pchange: ticker.pchange,
        volume: ticker.volume,
        qvolume: ticker.qvolume,
        trades: ticker.trades,
        open: ticker.open,
        close: ticker.close,
      }

      return store
    },
    {
      "1s": {},
      [interval]: {},
    }
  )

  if (uncached.length > 0) {
    const toCache = await getWindowTicks(uncached, interval)
    qc.setQueryData<StreamData>(["streams"], (cached) => {
      uncached.forEach((sym) => {
        tickers[sym][interval] = toCache[sym]
        data[interval][sym] = toCache[sym]
      })

      return { ...cached, tickers }
    })
  }

  return data
}

export const windowLoader =
  (qc: QueryClient) =>
  ({ request }: WindowReq) => {
    const { searchParams } = new URL(request.url)
    const symbols: string[] = JSON.parse(searchParams.get("symbols")),
      interval = localStorage.getItem(local.window) || "7d"

    return {
      deferred: defer({
        result: saveWindow(qc, symbols, interval),
      }),
      symbols,
      interval,
    }
  }

export default function WindowTicks() {
  const {
    deferred,
    symbols,
    interval: initInterval,
  } = useLoaderData() as WindowResponse
  const qc = useQueryClient()
  const [data, setData] = useState<WindowData>(null)
  const [interval, updateInterval] = useState(initInterval)
  const [expanded, setExpanded] = useState<string>()
  const [editing, setEditing] = useState<boolean | "loading">(false)

  const showWindowOptions = () => setEditing((prev) => !prev)

  const expandSymbol = (e: MouseEvent<HTMLHeadingElement>) => {
    const value = e.currentTarget.innerText
    setExpanded((prev) => {
      return prev === value ? null : value
    })
  }

  const updateWindow = async (newitv: string) => {
    setEditing("loading")
    const data = await saveWindow(qc, symbols, newitv)
    localStorage.setItem(local.window, newitv)
    updateInterval(newitv)
    setEditing(false)
    setData(data)
  }

  return (
    <ModalContainer predecessor="/dashboard">
      <div id={expanded ? styles.expTick : styles.compareTicks}>
        <div className={styles.timeOptions}>
          <h2 className={styles.rowTitle}> Symbols </h2>
          <h2 className={styles.colTitle}> 1s </h2>
          <h2 className={styles.colTitle} id={styles.intervalTooltip}>
            {editing === "loading" ? (
              <Loading />
            ) : (
              <>
                {interval}
                <button
                  type="button"
                  title="Show window options"
                  onClick={showWindowOptions}
                >
                  <FontAwesomeIcon
                    style={{
                      rotate: editing ? "180deg" : "0deg",
                    }}
                    icon={faCaretDown}
                  />
                </button>
                {editing && <WindowOptions updateWindow={updateWindow} />}
              </>
            )}
          </h2>

          <div id={styles.timeActions}>
            <CloseModal predecessor="/dashboard" />
          </div>
        </div>

        <Suspense fallback={<SkeletonSyms symbols={symbols} />}>
          <Await resolve={deferred.data.result} errorElement={<p>Error!</p>}>
            {(windata: WindowData) => {
              windata = data ?? windata
              return (
                <SymValues
                  symbols={symbols}
                  data={windata}
                  interval={interval}
                  expanded={expanded}
                  expandSymbol={expandSymbol}
                />
              )
            }}
          </Await>
        </Suspense>
      </div>
    </ModalContainer>
  )
}
