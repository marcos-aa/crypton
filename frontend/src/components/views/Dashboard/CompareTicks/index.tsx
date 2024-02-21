import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { QueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useLoaderData } from "react-router-dom";
import api from "../../../../services/api";
import { Prices, StreamData } from "../../../../utils/datafetching";
import ModalContainer from "../../../ModalContainer";
import styles from "./styles.module.scss";

export const ticksLoader = (qc: QueryClient) => async () => {
  const { data } = await api.get("/tickers/weekly", {
    params: {
      symbols: ["ETHBTC", "BTCBUSD"],
    },
  });

  const res = {
    "7D": data,
    current: qc.getQueryData<StreamData>(["streams"]).tickers,
  };
  return res;
};

interface WindowTickers {
  [key: "7D" | "current" | string]: {
    [key: string]: Prices;
  };
}
export default function CompareTicks() {
  const data = useLoaderData() as WindowTickers;
  const [values, setValues] = useState(data);
  const [timeframes, setTimeframes] = useState(["7D", "current"]);

  return (
    <ModalContainer predecessor="/dashboard">
      <div id={styles.compareTicks}>
        <div className={styles.timeOptions}>
          <h2 className={styles.rowTitle}> Symbols </h2>
          {timeframes.map((frame) => {
            return (
              <h2 className={styles.colTitle} key={frame}>
                {frame}
              </h2>
            );
          })}
          <button id={styles.addFrame} type="button">
            <FontAwesomeIcon icon={faPlus} />
          </button>
        </div>

        {Object.keys(data["current"]).map((symbol) => {
          return (
            <div key={symbol} className={styles.symRow}>
              <h2 className={styles.rowTitle}> {symbol} </h2>
              {timeframes.map((frame) => {
                return (
                  <div className={styles.symValues} key={`${frame}${symbol}`}>
                    <span> Price: {values[frame][symbol].last}</span>
                    <span> Average: {values[frame][symbol].average}</span>
                    <span> Change: {values[frame][symbol].change}</span>
                    <span> Price: {values[frame][symbol].pchange}</span>
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
