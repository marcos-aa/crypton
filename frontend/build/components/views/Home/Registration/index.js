import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { NavLink, Outlet } from "react-router-dom";
import ModalContainer from "../../../ModalContainer";
import CloseModal from "../../../ModalContainer/CloseModal";
import styles from "./styles.module.scss";
export default function Registration() {
    return (_jsx(ModalContainer, { predecessor: "/", children: _jsxs("section", { id: styles.register, children: [_jsx(CloseModal, { predecessor: "/" }), _jsxs("h1", { children: ["Enjoy fully customizable streams with a", _jsx(NavLink, { to: "/register/signin", className: ({ isActive }) => isActive ? `${styles.active} ${styles.navlink}` : styles.navlink, children: "verified account" }), "or", _jsx(NavLink, { to: "/register/signup", className: ({ isActive }) => isActive ? `${styles.active} ${styles.navlink}` : styles.navlink, children: "create a new one" }), "now!"] }), _jsx(Outlet, {})] }) }));
}
