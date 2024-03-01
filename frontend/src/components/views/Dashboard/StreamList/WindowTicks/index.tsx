import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { QueryClient } from "@tanstack/react-query";
import { MouseEvent, useState } from "react";
import { useLoaderData } from "react-router-dom";
import { StreamData, WindowData, WindowTickers } from "shared/streamtypes";
import { getWindowTicks } from "../../../../../utils/datafetching";
import ModalContainer from "../../../../ModalContainer";
import FullDate from "../../UserInfo/FullDate";
import TimeWindows from "./WindowOptions";
import styles from "./styles.module.scss";

export const windowLoader = (qc: QueryClient) => async () => {
  const weekTickers = await getWindowTicks(["ETHBTC", "BTCBUSD"], "7d");
  const res = {
    "7d": weekTickers,
    "1s": qc.getQueryData<StreamData>(["streams"]).tickers,
  };
  return res;
};

interface WindowState {
  intv: string[];
  data: WindowData;
}

export default function WindowTicks() {
  const data = useLoaderData() as WindowData;
  const [windows, setWindows] = useState<WindowState>({
    intv: ["1s", "7d"],
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

  const sortWindows = (interval: string) => {
    const lastInd = interval.length - 1;
    const cUnit = interval[lastInd];
    const multip = {
      m: 1,
      h: 60,
      d: 1440,
    };
    const value = Number(interval.slice(0, lastInd)) * multip[cUnit];

    let start = 1,
      end = windows.intv.length - 1,
      mid = start;

    while (start < end) {
      mid = Math.floor((start + end) / 2);
      const midtx = windows.intv[mid];

      if (midtx == interval) {
        end = -1;
        break;
      }

      const midValue = midtx.slice(0, midtx.length - 1);
      const midMult = Number(midValue) * multip[midtx[midtx.length - 1]];

      if (value > midMult) start = mid + 1;
      else end = mid;
    }

    return [start, end];
  };

  const addWindow = async (e: MouseEvent<HTMLLIElement> | string) => {
    const interval = typeof e === "string" ? e : e.currentTarget.innerHTML;
    const [inPos, end] = sortWindows(interval);
    const wins = [...windows.intv];

    let tickers: WindowTickers = windows.data[interval];
    if (end !== -1) {
      const symbols = Object.keys(data["1s"]);
      tickers = await getWindowTicks(symbols, interval);
      wins.splice(inPos, 0, interval);
    }

    setEdit(false);
    setWindows((prev) => ({
      intv: wins,
      data: { ...prev.data, [interval]: tickers },
    }));
  };

  return (
    <ModalContainer predecessor="/dashboard">
      <div id={expanded ? styles.expTick : styles.compareTicks}>
        <div className={styles.timeOptions}>
          <h2 className={styles.rowTitle}> Symbols </h2>
          {windows.intv.map((frame) => {
            return (
              <h2 className={styles.colTitle} key={frame}>
                {frame}
              </h2>
            );
          })}

          <button id={styles.editWindows} type="button" onClick={editWindows}>
            <FontAwesomeIcon icon={faPlus} />
          </button>
          {edit && <TimeWindows addWindow={addWindow} />}
        </div>

        {Object.keys(data["1s"]).map((symbol) => {
          return (
            <div
              key={symbol}
              className={`${styles.symRow} ${expanded == symbol ? styles.fullSym : ""}`}
            >
              <h2 className={styles.rowTitle} onClick={expandSymbol}>
                {symbol}
              </h2>
              {windows.intv.map((frame) => {
                const price = windows.data[frame][symbol];
                const decreased = price.change[0] === "-";
                return (
                  <div className={styles.symValues} key={`${frame}${symbol}`}>
                    <span> Last price: {price.last}</span>
                    <span> Weighted average: {price.average}</span>
                    <span className={decreased ? "priceFall" : "priceRaise"}>
                      Price change: {price.change}
                    </span>
                    <span className={decreased ? "priceFall" : "priceRaise"}>
                      Price change %: {price.pchange}
                    </span>

                    <div className={styles.extraValues}>
                      <span>Quote volume: {price.qvolume}</span>
                      <span> Asset volume: {price.volume}</span>
                      <span> Total trades: {price.trades}</span>
                      <FullDate
                        style={styles.windowTime}
                        hour={true}
                        date={new Date(price?.open) || new Date()}
                        title="Open date:"
                      />
                      <FullDate
                        style={styles.windowTime}
                        hour={true}
                        date={new Date(price?.close) || new Date()}
                        title="Close date:"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </ModalContainer>
  );
}
