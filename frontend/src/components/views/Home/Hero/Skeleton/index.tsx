import cardStyles from "../../../Dashboard/UserInfo/UserSkeleton/SkeletonCard/styles.module.scss"
import styles from "./styles.module.scss"
export default function SkeletonHero() {
  return (
    <>
      <div className={styles.skeleton}>
        <span
          className={`${cardStyles.skeletonCard} ${styles.skeletonTitle}`}
        />
        <span
          className={`${styles.skeletonValue} ${cardStyles.skeletonCard}`}
        />
        <span
          className={`${styles.skeletonValue} ${cardStyles.skeletonCard}`}
        />
        <span
          className={`${styles.skeletonValue} ${cardStyles.skeletonCard}`}
        />
        <span
          className={`${styles.skeletonValue} ${cardStyles.skeletonCard}`}
        />
      </div>
      <div className={styles.skeleton}>
        <span
          className={`${cardStyles.skeletonCard} ${styles.skeletonTitle}`}
        />
        <span
          className={`${styles.skeletonValue} ${cardStyles.skeletonCard}`}
        />
        <span
          className={`${styles.skeletonValue} ${cardStyles.skeletonCard}`}
        />
        <span
          className={`${styles.skeletonValue} ${cardStyles.skeletonCard}`}
        />
        <span
          className={`${styles.skeletonValue} ${cardStyles.skeletonCard}`}
        />
      </div>
    </>
  )
}
