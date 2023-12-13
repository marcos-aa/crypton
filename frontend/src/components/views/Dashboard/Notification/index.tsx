import styles from "./styles.module.scss";

interface NotifProps {
  message: string;
  type: "error" | "success";
}
export default function Notification({ message, type }: NotifProps) {
  return (
    <div className={`${styles.notify} ${styles[type]}`}>
      <p> {message}</p>
    </div>
  );
}
