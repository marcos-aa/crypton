import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { faCoins } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import styles from "./styles.module.scss";
export default function Hero() {
    return (_jsxs("div", { className: styles.hero, children: [_jsx(FontAwesomeIcon, { icon: faCoins }), _jsxs("div", { className: styles.features, children: [_jsx("h3", { children: " Join to earn member privileges " }), _jsxs("ul", { children: [_jsx("li", { children: " Create your own stream lists " }), _jsx("li", { children: " Customize your streams " }), _jsx("li", { children: " Persistent user login " }), _jsx("li", { children: " Personal dashboard " })] })] })] }));
}
