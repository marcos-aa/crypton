import styles from "./styles.module.scss";
export default function Loading({ small }: { small?: boolean }) {
  return <span className={`${styles.load} ${small ? styles.small : ""}`} />;
}
