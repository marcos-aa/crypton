import {
  faCircleCheck,
  faCircleExclamation,
  faCircleInfo,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import styles from "./styles.module.scss";

export type NotifType = "error" | "success" | "loading";

interface NotifProps {
  message: string;
  type: NotifType;
  dismiss(): void;
}

export default function Notification({ message, type, dismiss }: NotifProps) {
  return (
    <aside id="notif" className={styles.notify}>
      <span>
        <FontAwesomeIcon
          icon={
            type === "error"
              ? faCircleExclamation
              : type === "success"
                ? faCircleCheck
                : faCircleInfo
          }
        />
      </span>

      <div id={styles.operationType}>
        <p>{message}</p>
      </div>

      <button>
        <FontAwesomeIcon icon={faXmark} onClick={dismiss} />
      </button>
    </aside>
  );
}
