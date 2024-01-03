import { faPencil, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router";
import { Link, createSearchParams } from "react-router-dom";
import useWebSocket from "react-use-websocket";
import {
  StreamData,
  Tickers,
  getLocalStreams,
  getStreams,
} from "../../../../utils/datafetching";
import { formatSymbols } from "../../../../utils/helpers";
import { default as ActionAnimation } from "./ActionAnimation";
import SymbolTicks from "./SymbolTicks";
import styles from "./styles.module.scss";
export interface Stream {
  id: string;
  symbols: string[];
}

let tmpTickers: Tickers = {};

const formatValue = Intl.NumberFormat("en-us", {
  style: "decimal",
  maximumFractionDigits: 10,
});

export const streamQuery = (verified: boolean) => ({
  queryKey: ["streams"],
  queryFn: async () => {
    const streamData = verified ? getStreams() : getLocalStreams();
    return streamData;
  },
});

export const generateURL = (symbols: string[]) => {
  const symurl = symbols.join("@ticker/").toLowerCase();
  return "wss:stream.binance.com:9443/ws/" + symurl + "@ticker";
};

interface StreamsProps {
  initialData: StreamData;
  verified: boolean;
}
export default function StreamList({ initialData, verified }: StreamsProps) {
  const { data } = useQuery({
    ...streamQuery(verified),
    initialData,
    refetchOnWindowFocus: false,
  });
  const [tickers, setTickers] = useState<Tickers>(data.tickers);
  const location = useLocation();

  const { sendMessage } = useWebSocket(
    generateURL(Object.keys(initialData.symcount)),
    {
      onMessage: (item) => {
        const trade = JSON.parse(item.data);
        if (trade.result === null) {
          return;
        }

        tmpTickers[trade.s] = {
          average: trade.w,
          change: trade.p,
          pchange: trade.P,
          last: trade.c,
        };
      },
    },
  );

  const subscribeTickers = (
    ticks: string[],
    method: "SUBSCRIBE" | "UNSUBSCRIBE",
  ) => {
    sendMessage(JSON.stringify({ method, params: ticks, id: 1 }));
  };

  const updateValues = () => {
    const store = formatSymbols(tmpTickers, formatValue);
    setTickers((prev) => {
      return { ...prev, ...store };
    });
    tmpTickers = {};
  };

  useEffect(() => {
    let intervalId;
    if (location.pathname == "/dashboard") {
      intervalId = setInterval(updateValues, 1000);
    }

    return () => {
      clearInterval(intervalId);
    };
  }, [location.pathname]);

  useEffect(() => {
    const qparams = createSearchParams(window.location.search);
    const [newticks, delticks] = [
      JSON.parse(qparams.get("newticks")),
      JSON.parse(qparams.get("delticks")),
    ];

    if (newticks?.length > 0) {
      subscribeTickers(newticks, "SUBSCRIBE");
    }

    if (delticks?.length > 0) {
      subscribeTickers(delticks, "UNSUBSCRIBE");
    }

    const cleanURL = new URL(window.location.origin + window.location.pathname);
    history.replaceState(history.state, "", cleanURL);
  }, [data.streams]);

  return (
    <main id={styles.streamPanel}>
      <Outlet />

      <div className={styles.streamSettings}>
        <h1> Your streams </h1>
        <ActionAnimation actpath="/dashboard/streams">
          <Link className="action" to="streams">
            Create
          </Link>
        </ActionAnimation>
      </div>

      {data.streams?.length < 1 ? (
        <div className={styles.streamList} id={styles.streamCta}>
          <h2>Create a new stream to get started</h2>
        </div>
      ) : null}

      {data.streams?.map((stream) => {
        return (
          <div className={styles.streamList} key={stream.id}>
            {stream.symbols.map((symbol) => {
              return (
                <SymbolTicks
                  key={symbol}
                  symbol={symbol}
                  prices={tickers[symbol]}
                />
              );
            })}

            <div className={styles.streamButtons}>
              <ActionAnimation
                small={true}
                actpath={`/dashboard/streams/${stream.id}`}
              >
                <Link
                  replace
                  to={`streams/${stream.id}`}
                  state={{
                    symbols: stream.symbols,
                    verified,
                  }}
                >
                  <FontAwesomeIcon icon={faPencil} />
                </Link>
              </ActionAnimation>

              <Link to={`streams/delete/${stream.id}`}>
                <FontAwesomeIcon icon={faTrash} />
              </Link>
            </div>
          </div>
        );
      })}
    </main>
  );
}
