import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import InputWarning from "./InputWarning";
import styles from "./styles.module.scss";
export default function InputField({ onChange, name, value, label, warning, ...props }) {
    return (_jsxs(_Fragment, { children: [_jsxs("label", { className: styles.authLabel, children: [label ?? name, _jsx("input", { onChange: onChange, name: name, value: value, ...props })] }), warning && _jsx(InputWarning, { message: warning })] }));
}
