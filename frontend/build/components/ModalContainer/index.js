import { jsx as _jsx } from "react/jsx-runtime";
import { useCloseModal } from "../../utils/customHooks";
import styles from "./styles.module.scss";
export default function ModalContainer({ id, children, predecessor }) {
    const { closeModal } = useCloseModal(predecessor);
    const handleClose = (e) => {
        if (e.target === e.currentTarget) {
            closeModal();
        }
    };
    return (_jsx("dialog", { role: "dialog", "aria-modal": "true", className: `${styles.modalContainer} page`, onClick: handleClose, id: id, children: children }));
}
