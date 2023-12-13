import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import styles from "./styles.module.scss";
export default function CheckboxField({ handleChange, label, checked, }) {
    return (_jsxs("label", { className: styles.toggleField, children: [_jsx("input", { type: "checkbox", onChange: handleChange, checked: checked }), _jsx("span", { children: label })] }));
}
