import { jsxs as _jsxs } from "react/jsx-runtime";
import styles from "./styles.module.scss";
export default function SymbolTicks({ symbol, prices }) {
    return (_jsxs("article", { className: styles.streamItem, children: [_jsxs("h2", { children: [" ", symbol, " "] }), _jsxs("p", { children: [" Price: ", prices?.last] }), _jsxs("p", { children: [" Change: ", prices?.change] }), _jsxs("p", { children: [" Change %: ", prices?.pchange] }), _jsxs("p", { children: [" Average: ", prices?.average] })] }));
}
