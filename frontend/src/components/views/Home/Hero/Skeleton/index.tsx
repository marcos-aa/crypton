import styles from "./styles.module.scss"
export default function SkeletonHero() {
  return (
    <>
      <div className={styles.skeleton}>
        <span id={styles.skeletonTitle} />
        <span className={styles.skeletonValue} />
        <span className={styles.skeletonValue} />
        <span className={styles.skeletonValue} />
        <span className={styles.skeletonValue} />
      </div>
      <div className={styles.skeleton}>
        <span id={styles.skeletonTitle} />
        <span className={styles.skeletonValue} />
        <span className={styles.skeletonValue} />
        <span className={styles.skeletonValue} />
        <span className={styles.skeletonValue} />
      </div>
    </>
  )
}
