import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { QueryClient } from "@tanstack/react-query";
import { MouseEvent, useState } from "react";
import { useLoaderData } from "react-router-dom";
import api from "../../../../services/api";
import { Prices, StreamData } from "../../../../utils/datafetching";
import ModalContainer from "../../../ModalContainer";
import TimeWindows from "./TimeWindows";
import styles from "./styles.module.scss";

export const ticksLoader = (qc: QueryClient) => async () => {
  const { data } = await api.get("/tickers/window", {
    params: {
      symbols: ["ETHBTC", "BTCBUSD"],
      winsize: "7d",
    },
  });

  const res = {
    "7d": data,
    "1s": qc.getQueryData<StreamData>(["streams"]).tickers,
  };
  return res;
};

interface WindowTickers {
  [key: "7d" | "1s" | string]: {
    [key: string]: Prices;
  };
}
export default function CompareTicks() {
  const data = useLoaderData() as WindowTickers;
  const [values, setValues] = useState(data);
  const [windows, setWindows] = useState(["1s", "7d"]);
  const [edit, setEdit] = useState(false);

  const editWindows = () => setEdit((prev) => !prev);

  const addWindow = (e: MouseEvent<HTMLLIElement>) => {
    const vtext = e.currentTarget.innerHTML;
    const lastInd = vtext.length - 1;
    const cUnit = vtext[lastInd];
    const multip = {
      m: 1,
      h: 60,
      d: 1440,
    };
    const value = Number(vtext.slice(0, lastInd)) * multip[cUnit];

    let start = 1,
      end = windows.length - 1;

    setWindows((curr) => {
      const wins = [...curr];
      let mid = end;

      while (start < end) {
        mid = Math.floor((start + end) / 2);
        const midtx = wins[mid];

        if (midtx == vtext) {
          end = 0;
          break;
        }

        const midValue = midtx.slice(0, midtx.length - 1);
        const midMult = Number(midValue) * multip[midtx[midtx.length - 1]];

        if (value > midMult) start = mid + 1;
        else end = mid;
      }

      if (end != 0) wins.splice(start, 0, vtext);
      return wins;
    });
  };
  return (
    <ModalContainer predecessor="/dashboard">
      <div id={styles.compareTicks}>
        <div className={styles.timeOptions}>
          <h2 className={styles.rowTitle}> Symbols </h2>
          {windows.map((frame) => {
            return (
              <h2 className={styles.colTitle} key={frame}>
                {frame}
              </h2>
            );
          })}

          <button id={styles.addFrame} type="button" onClick={editWindows}>
            <FontAwesomeIcon icon={faPlus} />
          </button>
          {edit && <TimeWindows addWindow={addWindow} />}
        </div>

        {Object.keys(data["1s"]).map((symbol) => {
          return (
            <div key={symbol} className={styles.symRow}>
              <h2 className={styles.rowTitle}> {symbol} </h2>
              {windows.map((frame) => {
                return (
                  <div className={styles.symValues} key={`${frame}${symbol}`}>
                    <span> Price: {values[frame][symbol].last}</span>
                    <span> Average: {values[frame][symbol].average}</span>
                    <span> Change: {values[frame][symbol].change}</span>
                    <span> Change %: {values[frame][symbol].pchange}</span>
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
