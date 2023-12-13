import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import styles from "./styles.module.scss";
export default function Notification({ message, type }) {
    return (_jsx("div", { className: `${styles.notify} ${styles[type]}`, children: _jsxs("p", { children: [" ", message] }) }));
}
