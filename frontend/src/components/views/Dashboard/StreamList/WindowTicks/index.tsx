import { faCaretDown } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { QueryClient, useQueryClient } from "@tanstack/react-query";
import { CSSProperties, MouseEvent, memo, useState } from "react";
import { useLoaderData } from "react-router-dom";
import { StreamData, Ticker } from "shared/streamtypes";
import { getWindowTicks } from "../../../../../utils/datafetching";
import { local } from "../../../../../utils/helpers";
import ModalContainer from "../../../../ModalContainer";
import CloseModal from "../../../../ModalContainer/CloseModal";
import SymValues from "./SymValues";
import TimeWindows from "./WindowOptions";
import styles from "./styles.module.scss";

interface WindowReq {
  request: Request;
}

type Tickers = {
  [ticker: string]: Ticker;
};

interface WindowTickers {
  windowTickers: Tickers;
  tickers: Tickers;
}

interface WindowData {
  "1s": Tickers;
  [window: string]: Tickers;
}
interface WindowResponse {
  data: WindowData;
  symbols: string[];
  interval: string;
}

interface WindowState {
  interval: string;
  data: WindowData;
}

const saveWindow = async (
  qc: QueryClient,
  symbols: string[],
  interval: string,
): Promise<WindowTickers> => {
  let uncached: string[] = [];
  let tickers = {
      ...qc.getQueryData<StreamData>(["streams"]).tickers,
    },
    windowTickers: Tickers = {};

  symbols.forEach((sym) => {
    const ticker = tickers[sym][interval];
    if (!ticker) uncached.push(sym);
    windowTickers[sym] = ticker;
  });

  if (uncached.length > 0) {
    const toCache = await getWindowTicks(uncached, interval);
    qc.setQueryData<StreamData>(["streams"], (cached) => {
      uncached.forEach((sym) => {
        tickers[sym][interval] = toCache[sym];
        windowTickers[sym] = toCache[sym];
      });

      return { ...cached, tickers };
    });
  }

  return { windowTickers, tickers };
};

export const windowLoader =
  (qc: QueryClient) =>
  async ({ request }: WindowReq): Promise<WindowResponse> => {
    const { searchParams } = new URL(request.url);
    const symbols: string[] = JSON.parse(searchParams.get("symbols")),
      interval = localStorage.getItem(local.window) || "7d";

    const { windowTickers, tickers } = await saveWindow(qc, symbols, interval);
    let latest: Tickers = {};
    symbols.forEach((sym) => {
      const ticker = tickers[sym];
      latest[sym] = {
        last: ticker.last,
        average: ticker.average,
        change: ticker.change,
        pchange: ticker.pchange,
        volume: ticker.volume,
        qvolume: ticker.qvolume,
        trades: ticker.trades,
        open: ticker.open,
        close: ticker.close,
      };
    });

    const res = {
      "7d": windowTickers,
      "1s": latest,
    };

    return { data: res, symbols, interval };
  };

export default memo(function WindowTicks() {
  const qc = useQueryClient();
  const { data, symbols, interval } = useLoaderData() as WindowResponse;
  const [windows, setWindows] = useState<WindowState>({
    interval,
    data,
  });
  const [edit, setEdit] = useState(false);
  const [expanded, setExpanded] = useState<string>();

  const expandSymbol = (e: MouseEvent<HTMLHeadingElement>) => {
    const value = e.currentTarget.innerText;
    setExpanded((prev) => {
      return prev === value ? null : value;
    });
  };

  const editWindows = () => setEdit((prev) => !prev);

  const addWindow = async (newitv: string) => {
    const { windowTickers } = await saveWindow(qc, symbols, newitv);
    localStorage.setItemk(local.window, newitv);

    setEdit(false);
    setWindows((prev) => ({
      interval: newitv,
      data: { ...prev.data, [newitv]: windowTickers },
    }));
  };

  return (
    <ModalContainer predecessor="/dashboard">
      <div id={expanded ? styles.expTick : styles.compareTicks}>
        <div className={styles.timeOptions}>
          <h2 className={styles.rowTitle}> Symbols </h2>
          <h2 className={styles.colTitle}> 1s </h2>
          <h2 className={styles.colTitle} onClick={editWindows}>
            {windows.interval}
            <span>
              <FontAwesomeIcon icon={faCaretDown} />
            </span>
            {edit && <TimeWindows addWindow={addWindow} />}
          </h2>

          <div id={styles.timeActions}>
            <CloseModal predecessor="/dashboard" />
          </div>
        </div>

        {symbols.map((symbol, i) => {
          const rowIndex = {
            "--elindex": i,
          } as CSSProperties;

          return (
            <div
              style={rowIndex}
              key={symbol}
              className={`${styles.symRow} ${expanded == symbol ? styles.fullSym : ""}`}
            >
              <h2 className={styles.rowTitle} onClick={expandSymbol}>
                {symbol}
              </h2>

              <SymValues
                decreased={windows.data["1s"][symbol].change[0] === "-"}
                value={windows.data["1s"][symbol]}
              />
              <SymValues
                decreased={
                  windows.data[windows.interval][symbol].change[0] === "-"
                }
                value={windows.data[windows.interval][symbol]}
              />
            </div>
          );
        })}
      </div>
    </ModalContainer>
  );
});
