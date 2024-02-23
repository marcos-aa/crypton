import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { QueryClient } from "@tanstack/react-query";
import { useState } from "react";
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
    current: qc.getQueryData<StreamData>(["streams"]).tickers,
  };
  return res;
};

interface WindowTickers {
  [key: "7d" | "current" | string]: {
    [key: string]: Prices;
  };
}
export default function CompareTicks() {
  const data = useLoaderData() as WindowTickers;
  const [values, setValues] = useState(data);
  const [windows, setWindows] = useState(["7d", "current"]);
  const [edit, setEdit] = useState(false);

  const editWindows = () => setEdit((prev) => !prev);

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
          {edit && <TimeWindows />}
        </div>

        {Object.keys(data["current"]).map((symbol) => {
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
