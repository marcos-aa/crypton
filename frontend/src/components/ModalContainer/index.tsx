import { ReactNode, SyntheticEvent } from "react";
import { useCloseModal } from "../../utils/customHooks";
import styles from "./styles.module.scss";

interface Props {
  children?: ReactNode;
  id?: string;
  predecessor: string;
}

export default function ModalContainer({ id, children, predecessor }: Props) {
  const { closeModal } = useCloseModal(predecessor);

  const handleClose = (e: SyntheticEvent) => {
    if ((e.target as EventTarget) === e.currentTarget) {
      closeModal();
    }
  };

  return (
    <dialog
      role="dialog"
      aria-modal="true"
      className={`${styles.modalContainer} ${id ? styles.innerModal : ""} page`}
      onClick={handleClose}
      id={id}
    >
      {children}
    </dialog>
  );
}
