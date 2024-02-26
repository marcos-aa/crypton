import styles from "./styles.module.scss";

interface LogoProps {
  isError?: boolean;
}

export default function Logo({ isError }: LogoProps) {
  return (
    <h1 className={styles.logo} id={`${isError ? styles.error : ""}`}>
      Crypt<span id={styles.cryptoSign}>₿</span>
      <span>n</span>
    </h1>
  );
}
