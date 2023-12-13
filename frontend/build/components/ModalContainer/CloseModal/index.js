import { jsx as _jsx } from "react/jsx-runtime";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useCloseModal } from "../../../utils/customHooks";
import styles from "./styles.module.scss";
export default function CloseModal({ predecessor }) {
    const { closeModal } = useCloseModal(predecessor);
    return (_jsx("button", { type: "button", title: "Close modal", className: styles.actionClose, children: _jsx(FontAwesomeIcon, { icon: faXmark, onClick: closeModal }) }));
}
