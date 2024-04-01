import styles from "../styles.module.scss";

export default function SkeletonSyms({ symbols }: { symbols: string[] }) {
  return symbols.map((symbol) => {
    return (
      <div className={styles.symRow} key={symbol}>
        <h2 className={styles.rowTitle}>{symbol}</h2>
        <div className={`${styles.symValues} ${styles.skeleton}`}></div>
        <div className={`${styles.symValues} ${styles.skeleton}`}></div>
      </div>
    );
  });
}
