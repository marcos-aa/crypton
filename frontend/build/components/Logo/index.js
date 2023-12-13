import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import styles from "./styles.module.scss";
export default function Logo({ isError }) {
    return (_jsxs("h1", { className: styles.logo, id: `${isError ? styles.error : ""}`, children: ["Crypt", _jsx("span", { id: styles.cryptoSign, children: "\u20BF" }), _jsx("span", { children: "n" })] }));
}
