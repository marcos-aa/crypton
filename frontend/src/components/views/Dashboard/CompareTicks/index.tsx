import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { QueryClient } from "@tanstack/react-query";
import { MouseEvent, useState } from "react";
import { useLoaderData } from "react-router-dom";
import {
  Prices,
  StreamData,
  Tickers,
  getWindowTicks,
} from "../../../../utils/datafetching";
import ModalContainer from "../../../ModalContainer";
import TimeWindows from "./TimeWindows";
import styles from "./styles.module.scss";

export const ticksLoader = (qc: QueryClient) => async () => {
  const weekTickers = await getWindowTicks(["ETHBTC", "BTCBUSD"], "7d");
  const res = {
    "7d": weekTickers,
    "1s": qc.getQueryData<StreamData>(["streams"]).tickers,
  };
  return res;
};

interface WindowTickers {
  [key: "7d" | "1s" | string]: {
    [key: string]: Prices;
  };
}

interface WindowData {
  intv: string[];
  data: WindowTickers;
}
export default function CompareTicks() {
  const data = useLoaderData() as WindowTickers;
  const [windows, setWindows] = useState<WindowData>({
    intv: ["1s", "7d"],
    data,
  });
  const [edit, setEdit] = useState(false);

  const editWindows = () => setEdit((prev) => !prev);

  const addWindow = async (e: MouseEvent<HTMLLIElement>) => {
    const interval = e.currentTarget.innerHTML;
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

    const wins = [...windows.intv];

    while (start < end) {
      mid = Math.floor((start + end) / 2);
      const midtx = wins[mid];

      if (midtx == interval) {
        end = 0;
        break;
      }

      const midValue = midtx.slice(0, midtx.length - 1);
      const midMult = Number(midValue) * multip[midtx[midtx.length - 1]];

      if (value > midMult) start = mid + 1;
      else end = mid;
    }

    let tickers: Tickers = windows.data[interval];
    if (end !== 0) {
      const symbols = Object.keys(data["1s"]);
      tickers = await getWindowTicks(symbols, interval);
      wins.splice(start, 0, interval);
    }

    setEdit(false);
    setWindows((prev) => ({
      intv: wins,
      data: { ...prev.data, [interval]: tickers },
    }));
  };

  return (
    <ModalContainer predecessor="/dashboard">
      <div id={styles.compareTicks}>
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
            <div key={symbol} className={styles.symRow}>
              <h2 className={styles.rowTitle}> {symbol} </h2>
              {windows.intv.map((frame) => {
                return (
                  <div className={styles.symValues} key={`${frame}${symbol}`}>
                    <span> Price: {windows.data[frame][symbol].last}</span>
                    <span> Average: {windows.data[frame][symbol].average}</span>
                    <span> Change: {windows.data[frame][symbol].change}</span>
                    <span>Change %: {windows.data[frame][symbol].pchange}</span>
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
