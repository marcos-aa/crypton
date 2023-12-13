import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router";
import { Link } from "react-router-dom";
import { local } from "../../../utils/helpers";
import Logo from "../../Logo";
import SymbolTicks from "../Dashboard/StreamList/SymbolTicks";
import streamStyles from "../Dashboard/StreamList/styles.module.scss";
import styles from "./styles.module.scss";
export default function Home() {
    const [tickers, setTickers] = useState({});
    const navigate = useNavigate();
    const handleGuest = () => {
        localStorage.setItem(local.id, "guest");
        navigate("/dashboard");
    };
    useEffect(() => {
        const uid = localStorage.getItem(local.id);
        if (uid)
            return navigate("/dashboard");
        const controller = new AbortController();
        // api
        //   .get<Tickers>("tickers/preview", {
        //     signal: controller.signal,
        //     params: {
        //       symbol: "BTCBUSD",
        //     },
        //   })
        //   .then((res) => {
        //     setTicker(res.data);
        //   });
        setTickers({
            BTCBUSD: {
                last: "30,044.94",
                change: "30,044.94",
                pchange: "30,044.94",
                average: "30,044.94",
            },
        });
        return () => controller.abort();
    }, []);
    return (_jsxs("section", { className: "page", children: [_jsx(Logo, {}), _jsxs("main", { className: styles.content, children: [_jsxs("section", { id: styles.cta, children: [_jsx("h1", { id: styles.ctaTitle, children: "Create custom streams from a list of over 2000 assets" }), _jsxs("div", { id: styles.actions, children: [_jsx("button", { className: styles.action, type: "button", onClick: handleGuest, children: "Get realtime updates now" }), _jsx("span", { id: styles.newline, children: " or " }), _jsx(Link, { to: "/register/signin", className: styles.action, children: "Join" })] })] }), _jsxs("div", { id: styles.hero, children: [_jsxs("div", { className: `${styles.stream} ${streamStyles.streamList}`, children: [_jsx(SymbolTicks, { symbol: "BTCBUSD", prices: tickers.BTCBUSD }), _jsx(SymbolTicks, { symbol: "ETHBTC", prices: tickers.BTCBUSD }), _jsx(SymbolTicks, { symbol: "GBPBUSD", prices: tickers.BTCBUSD }), _jsx(SymbolTicks, { symbol: "GBPBUSD", prices: tickers.BTCBUSD })] }), _jsxs("div", { className: `${styles.stream} ${streamStyles.streamList}`, children: [_jsx(SymbolTicks, { symbol: "BTCBUSD", prices: tickers.BTCBUSD }), _jsx(SymbolTicks, { symbol: "ETHBTC", prices: tickers.ETHBTC }), _jsx(SymbolTicks, { symbol: "GBPBUSD", prices: tickers.GBPBUSD }), _jsx(SymbolTicks, { symbol: "GBPBUSD", prices: tickers.BTCBUSD })] })] })] }), _jsx(Outlet, {})] }));
}
