import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { faPencil, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router";
import { Link, createSearchParams, useSearchParams } from "react-router-dom";
import useWebSocket from "react-use-websocket";
import { getLocalStreams, getStreams, } from "../../../../utils/datafetching";
import { formatSymbols } from "../../../../utils/helpers";
import { default as ActionAnimation } from "./ActionAnimation";
import SymbolTicks from "./SymbolTicks";
import styles from "./styles.module.scss";
let tmpTickers = {};
const formatValue = Intl.NumberFormat("en-us", {
    style: "decimal",
    maximumFractionDigits: 10,
});
export const streamQuery = (verified) => ({
    queryKey: ["streams"],
    queryFn: async () => {
        const streamData = verified ? getStreams() : getLocalStreams();
        return streamData;
    },
});
export const generateSocket = (symbols) => {
    const socketURL = generateURL(symbols);
    const socket = new WebSocket(socketURL);
    return socket;
};
export const generateURL = (symbols) => {
    const symurl = symbols.join("@ticker/").toLowerCase();
    return "wss:stream.binance.com:9443/ws/" + symurl + "@ticker";
};
export default function StreamList({ initialData, verified }) {
    const { data } = useQuery({
        ...streamQuery(verified),
        initialData,
        refetchOnWindowFocus: false,
    });
    const [tickers, setTickers] = useState(data.tickers);
    const location = useLocation();
    const [, setParams] = useSearchParams();
    const { sendMessage } = useWebSocket(generateURL(Object.keys(initialData.symcount)), {
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
    });
    const subscribeTickers = (ticks, method) => {
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
        setParams({});
    }, [data.streams]);
    return (_jsxs("main", { id: styles.streamPanel, children: [_jsx(Outlet, {}), _jsxs("div", { className: styles.streamSettings, children: [_jsx("h1", { children: " Your streams " }), _jsx(ActionAnimation, { actpath: "/dashboard/stream", children: _jsx(Link, { className: "action", to: "stream", children: "Create" }) })] }), data.streams?.length < 1 ? (_jsx("div", { className: styles.streamList, id: styles.streamCta, children: _jsx("h2", { children: "Create a new stream to get started" }) })) : null, data.streams?.map((stream) => {
                return (_jsxs("div", { className: styles.streamList, children: [stream.symbols.map((symbol) => {
                            return (_jsx(SymbolTicks, { symbol: symbol, prices: tickers[symbol] }, symbol));
                        }), _jsxs("div", { className: styles.streamButtons, children: [_jsx(ActionAnimation, { small: true, actpath: `/dashboard/stream/${stream.id}`, children: _jsx(Link, { state: {
                                            verified: verified,
                                            symbols: stream.symbols,
                                        }, to: `stream/${stream.id}`, children: _jsx(FontAwesomeIcon, { icon: faPencil }) }) }), _jsx(Link, { to: `stream/delete/${stream.id}`, children: _jsx(FontAwesomeIcon, { icon: faTrash }) })] })] }, stream.id));
            })] }));
}
