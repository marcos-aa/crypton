import { jsx as _jsx } from "react/jsx-runtime";
export default function InputWarning({ message }) {
    return (_jsx("span", { "aria-label": "Invalid input", "aria-live": "assertive", className: "warning", children: message }));
}
