import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { faMagnifyingGlass, faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useMemo, useState } from "react";
import { redirect, useLoaderData, useLocation } from "react-router";
import { Form } from "react-router-dom";
import { v4 as uuid } from "uuid";
import api from "../../../../../services/api";
import { getCurrencies, } from "../../../../../utils/datafetching";
import { addTicks, delTicks, filterStreams, local, queryTicks, } from "../../../../../utils/helpers";
import ModalContainer from "../../../../ModalContainer";
import CancellableAction from "../../CancellableAction";
import Signwall from "../../Signwall";
import SubmitAction from "../../SubmitAction";
import ActionAnimation from "../ActionAnimation";
import styles from "./styles.module.scss";
const currenciesQuery = () => ({
    queryKey: ["currencies"],
    queryFn: async () => getCurrencies(),
});
export const currenciesLoader = (qc) => async () => {
    const query = currenciesQuery();
    const currencies = await qc.ensureQueryData(query);
    return currencies;
};
const craLocStream = (symbols) => {
    const streams = JSON.parse(localStorage.getItem(local.streams)) || [];
    const id = uuid().substring(0, 8);
    const newStream = {
        id: `g-streams-${id}`,
        symbols,
    };
    streams.push(newStream);
    localStorage.setItem(local.streams, JSON.stringify(streams));
    return { data: newStream };
};
export const upsertStream = (qc) => async ({ request, params }) => {
    const method = request.method.toLowerCase();
    const formData = await request.formData();
    const userId = localStorage.getItem(local.id);
    const config = {
        symbols: formData.getAll("selected"),
    };
    console.log("upsert");
    if (params.id)
        config.id = params.id;
    const { data: stream } = userId == "guest"
        ? craLocStream(config.symbols)
        : await api[method]("/stream", config);
    let { newticks, delticks } = { newticks: [], delticks: [] };
    qc.setQueryData(["streams"], (cached) => {
        const { streams, oldstream } = filterStreams(config.id, cached.streams);
        const newcount = { ...cached.symcount };
        streams.unshift(stream);
        newticks = addTicks(stream.symbols, newcount);
        if (method === "put") {
            delticks = delTicks(oldstream.symbols, newcount);
        }
        return { symcount: newcount, streams, tickers: cached.tickers };
    });
    const [sub, unsub] = [
        queryTicks(newticks, "newticks"),
        queryTicks(delticks, "delticks"),
    ];
    return redirect(`/dashboard?${sub}&${unsub}`);
};
export default function SymbolList() {
    const currencies = useLoaderData();
    const { state: pagestate, pathname } = useLocation();
    const [selected, setSelected] = useState(pagestate?.symbols || []);
    const [search, setSearch] = useState("");
    const handlePush = (event) => {
        const newsym = event.target.textContent;
        const hasDuplicate = selected.some((symbol) => symbol == newsym);
        if (selected.length < 5 && !hasDuplicate) {
            setSelected((prev) => [...prev, newsym]);
        }
    };
    const handleRemoval = (delsym) => {
        setSelected((prev) => prev.filter((sym) => sym !== delsym));
    };
    const handleSearch = (event) => {
        setSearch(event.target.value);
    };
    const pairs = useMemo(() => {
        try {
            return currencies.filter((symbol) => symbol.includes(search.toLocaleUpperCase()));
        }
        catch (e) {
            throw {
                message: "Something went wrong. Verify your connection and try again.",
            };
        }
    }, [search]);
    return (_jsxs(ModalContainer, { id: styles.symbolModal, predecessor: "/dashboard", children: [!pagestate?.verified && pagestate?.symbols && _jsx(Signwall, {}), _jsxs("header", { id: styles.modalHeader, children: [_jsx("h1", { children: " Select up to 5 currencies " }), _jsxs("label", { id: styles.searchBox, children: [_jsx(FontAwesomeIcon, { icon: faMagnifyingGlass }), _jsx("input", { name: "search", type: "text", placeholder: "Search", value: search, onChange: handleSearch })] })] }), _jsxs(Form, { id: styles.symbolOptions, action: pathname, method: pagestate?.symbols ? "put" : "post", children: [_jsx("div", { id: styles.activeItems, children: selected?.map((symbol) => {
                            return (_jsxs("div", { id: styles.activeItem, onClick: () => handleRemoval(symbol), children: [_jsx("input", { type: "text", value: symbol, readOnly: true, name: "selected", className: styles.selected }), _jsx("button", { type: "button", "aria-label": `Remove ${symbol}`, children: _jsx(FontAwesomeIcon, { icon: faXmark }) })] }, symbol));
                        }) }), _jsx(CancellableAction, { children: _jsx(ActionAnimation, { actpath: pathname, children: _jsx(SubmitAction, { disabled: selected.length < 1, children: pagestate?.symbols ? "Update" : "Create" }) }) })] }), _jsx("ul", { id: styles.symbolList, children: pairs.map((pair) => {
                    return (_jsx("li", { role: "listitem", className: styles.symbol, onClick: handlePush, children: pair }, pair));
                }) })] }));
}
