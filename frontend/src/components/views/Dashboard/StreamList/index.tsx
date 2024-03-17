import {
  faHourglass,
  faPencil,
  faTrash,
  faUpRightAndDownLeftFromCenter,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { memo, useEffect, useState } from "react";
import { Outlet } from "react-router";
import {
  Link,
  createSearchParams,
  useFetcher,
  useLocation,
} from "react-router-dom";
import useWebSocket from "react-use-websocket";
import { StreamData, Tickers } from "shared/streamtypes";
import { getGuestStreams, getStreams } from "../../../../utils/datafetching";
import { formatSymbols, local, queryTicks } from "../../../../utils/helpers";
import { NotifType } from "../Notification";
import SymbolTicks from "./SymbolTicks";
import styles from "./styles.module.scss";

export const streamQuery = (verified: boolean) => ({
  queryKey: ["streams"],
  queryFn: async () => {
    const streamData = verified ? getStreams() : getGuestStreams();
    return streamData;
  },
});

export const generateURL = (symbols: string[]) => {
  const symurl = symbols.join("@ticker/").toLowerCase();
  return "wss:stream.binance.com:9443/ws/" + symurl + "@ticker";
};

const tformatter = Intl.NumberFormat("en-us", {
  style: "decimal",
  maximumFractionDigits: 2,
});

interface StreamsProps {
  initialData: StreamData;
  verified: boolean;
  notify(message: string, type: NotifType): void;
}

interface WSTIcker {
  s: string;
  p: string;
  w: string;
  P: string;
  c: string;
  q: string;
  v: string;
  n: number;
  O: number;
  C: number;
  result?: string;
}

function StreamList({ initialData, verified, notify }: StreamsProps) {
  const qc = useQueryClient();
  const fetcher = useFetcher();
  const { data } = useQuery({
    ...streamQuery(verified),
    initialData,
    refetchOnWindowFocus: false,
    staleTime: 3600000,
  });
  const [temp, setTemp] = useState<Tickers>({});
  const { pathname } = useLocation();

  const { sendMessage } = useWebSocket(
    generateURL(Object.keys(initialData.symtracker)),
    {
      onMessage: (item) => {
        const ticker: WSTIcker = JSON.parse(item.data);
        if (ticker.result === null) {
          return;
        }

        setTemp((prev) => {
          return {
            ...prev,
            [ticker.s]: {
              average: ticker.w,
              change: ticker.p,
              pchange: ticker.P,
              last: ticker.c,
              volume: Number(ticker.v),
              qvolume: Number(ticker.q),
              trades: ticker.n,
              close: ticker.C,
              open: ticker.O,
            },
          };
        });
      },
    },
  );

  const subscribeTickers = (
    ticks: string[],
    method: "SUBSCRIBE" | "UNSUBSCRIBE",
  ) => {
    sendMessage(JSON.stringify({ method, params: ticks, id: 1 }));
  };

  const syncTickers = () => {
    setTemp((prev) => {
      const store = formatSymbols(prev, tformatter);
      qc.setQueryData<StreamData>(["streams"], (cached) => {
        const tickers = { ...cached.tickers, ...store };

        return {
          ...cached,
          tickers,
        };
      });

      return {};
    });
  };

  useEffect(() => {
    let intervalId;
    if (pathname == "/dashboard") {
      intervalId = setInterval(syncTickers, 3000);
    }

    syncTickers();
    return () => {
      clearInterval(intervalId);
    };
  }, [pathname]);

  useEffect(() => {
    const qparams = createSearchParams(window.location.search);
    const [newticks, delticks] = [
      JSON.parse(qparams.get("newsyms")),
      JSON.parse(qparams.get("delsyms")),
    ];

    if (newticks?.length > 0) {
      qparams.delete("newsyms");
      subscribeTickers(newticks, "SUBSCRIBE");
    }

    if (delticks?.length > 0) {
      qparams.delete("delsyms");
      subscribeTickers(delticks, "UNSUBSCRIBE");
    }

    if (localStorage.getItem(local.expStreams)) {
      notify("Your streams failed to be exported. Please try again", "error");
      localStorage.removeItem(local.expStreams);
    }

    const strparams = qparams.size > 0 ? "?" + qparams.toString() : "";
    const cleanURL = new URL(
      window.location.origin + window.location.pathname + strparams,
    );
    history.replaceState(history.state, "", cleanURL);
  }, [data.streams]);

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

      {data.streams?.map((stream) => {
        return (
          <div className={styles.streamList} key={stream.id}>
            {stream.symbols.map((symbol) => {
              const sym = data.tickers[symbol];
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
              );
            })}

            <div className={styles.streamButtons}>
              <Link
                to={
                  `/dashboard/streams/window?` +
                  queryTicks(stream.symbols, "symbols")
                }
              >
                <FontAwesomeIcon
                  title="Expand stream"
                  icon={faUpRightAndDownLeftFromCenter}
                />
              </Link>
              {stream.user_id === "guest" &&
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
        );
      })}
    </main>
  );
}

export default memo(StreamList);
