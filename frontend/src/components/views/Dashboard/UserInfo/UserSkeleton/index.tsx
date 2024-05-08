import SkeletonCard from "./SkeletonCard"
import styles from "./styles.module.scss"

export default function UserSkeleton() {
  return (
    <div className={styles.userSkeleton}>
      <SkeletonCard />
      <SkeletonCard />
    </div>
  )
}
