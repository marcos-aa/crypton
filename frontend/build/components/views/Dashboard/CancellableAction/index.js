import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link } from "react-router-dom";
import styles from "./styles.module.scss";
export default function CancellableAction({ children }) {
    return (_jsxs("div", { id: styles.actions, children: [_jsx(Link, { className: "action", to: "/dashboard", children: "Cancel" }), children] }));
}
