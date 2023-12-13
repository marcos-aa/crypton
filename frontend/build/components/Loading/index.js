import { jsx as _jsx } from "react/jsx-runtime";
import styles from "./styles.module.scss";
export default function Loading({ small }) {
    return _jsx("span", { className: `${styles.load} ${small ? styles.small : ""}` });
}
