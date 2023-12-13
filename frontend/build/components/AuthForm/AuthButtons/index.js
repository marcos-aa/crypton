import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export default function AuthButtons({ children, action }) {
    return (_jsxs("div", { id: "actions", children: [children, _jsx("button", { type: "submit", className: "action fullwd", children: action })] }));
}
