import { faXmark } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { useCloseModal } from "../../../utils/customHooks"
import styles from "./styles.module.scss"

interface CloseProps {
  predecessor: string
}
export default function CloseModal({ predecessor }: CloseProps) {
  const { closeModal } = useCloseModal(predecessor)

  return (
    <button
      type="button"
      title="Close modal"
      className={styles.actionClose}
      data-cy="closeInnerModal"
    >
      <FontAwesomeIcon icon={faXmark} onClick={closeModal} />
    </button>
  )
}
