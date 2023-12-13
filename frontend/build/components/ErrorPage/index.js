import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useRouteError } from "react-router";
import { Link } from "react-router-dom";
import Logo from "../Logo";
import styles from "./styles.module.scss";
export default function ErrorPage() {
    const error = useRouteError();
    return (_jsx("div", { className: "page", children: _jsxs("section", { id: styles.errorPage, children: [_jsx(Logo, { isError: true }), _jsxs("h2", { children: ["Something went wrong ", error?.message, " "] }), _jsx(Link, { to: "/register/signin", className: "redirLink", children: "Back to signin" })] }) }));
}
