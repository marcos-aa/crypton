import { QueryClient } from "@tanstack/react-query";
import { MouseEvent, Suspense, useState } from "react";
import { Await, defer, useLoaderData } from "react-router-dom";
import { StreamData, Ticker } from "shared/streamtypes";
import { getWindowTicks } from "../../../../../utils/datafetching";
import { local } from "../../../../../utils/helpers";
import ModalContainer from "../../../../ModalContainer";
import CloseModal from "../../../../ModalContainer/CloseModal";
import SkeletonSyms from "./SkeletonSyms";
import SymValues from "./SymValues";
import styles from "./styles.module.scss";

interface WindowReq {
  request: Request;
}

type Tickers = {
  [ticker: string]: Ticker;
};

export interface WindowData {
  "1s": Tickers;
  [window: string]: Tickers;
}

interface WindowResponse {
  deferred: {
    data: {
      result: WindowData;
    };
  };
  symbols: string[];
  interval: string;
}

export const saveWindow = async (
  qc: QueryClient,
  symbols: string[],
  interval: string,
  includeBase: boolean = false,
): Promise<WindowData> => {
  let uncached: string[] = [];
  let tickers = {
    ...qc.getQueryData<StreamData>(["streams"]).tickers,
  };

  const data = symbols.reduce(
    (store: WindowData, sym: string) => {
      const itvTicker = tickers[sym][interval];
      if (!itvTicker) uncached.push(sym);
      store[interval][sym] = itvTicker;
      if (includeBase) {
        const ticker = tickers[sym];
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
        };
      }

      return store;
    },
    {
      "1s": includeBase ? {} : null,
      [interval]: {},
    },
  );

  if (uncached.length > 0) {
    const toCache = await getWindowTicks(uncached, interval);
    qc.setQueryData<StreamData>(["streams"], (cached) => {
      uncached.forEach((sym) => {
        tickers[sym][interval] = toCache[sym];
        data[interval][sym] = toCache[sym];
      });

      return { ...cached, tickers };
    });
  }

  return data;
};

export const windowLoader =
  (qc: QueryClient) =>
  ({ request }: WindowReq) => {
    const { searchParams } = new URL(request.url);
    const symbols: string[] = JSON.parse(searchParams.get("symbols")),
      interval = localStorage.getItem(local.window) || "7d";

    return {
      deferred: defer({
        result: saveWindow(qc, symbols, interval, true),
      }),
      symbols,
      interval,
    };
  };

export default function WindowTicks() {
  const {
    deferred,
    symbols,
    interval: initInterval,
  } = useLoaderData() as WindowResponse;
  const [interval, updateInterval] = useState(initInterval);
  const [expanded, setExpanded] = useState<string>();

  const expandSymbol = (e: MouseEvent<HTMLHeadingElement>) => {
    const value = e.currentTarget.innerText;
    setExpanded((prev) => {
      return prev === value ? null : value;
    });
  };

  const changeInterval = (newitv: string) => {
    updateInterval(newitv);
  };

  return (
    <ModalContainer predecessor="/dashboard">
      <div id={expanded ? styles.expTick : styles.compareTicks}>
        <div className={styles.timeOptions}>
          <h2 className={styles.rowTitle}> Symbols </h2>
          <h2 className={styles.colTitle}> 1s </h2>
          <h2 className={styles.colTitle}>{interval}</h2>

          <div id={styles.timeActions}>
            <CloseModal predecessor="/dashboard" />
          </div>
        </div>

        <Suspense fallback={<SkeletonSyms symbols={symbols} />}>
          <Await resolve={deferred.data.result} errorElement={<p>Error!</p>}>
            {(data: WindowData) => {
              return (
                <SymValues
                  symbols={symbols}
                  initialData={data}
                  interval={interval}
                  expanded={expanded}
                  expandSymbol={expandSymbol}
                  changeInterval={changeInterval}
                />
              );
            }}
          </Await>
        </Suspense>
      </div>
    </ModalContainer>
  );
}
