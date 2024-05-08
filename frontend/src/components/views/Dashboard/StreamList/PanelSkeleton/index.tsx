import SkeletonHero from "../../../Home/Hero/Skeleton"
import SkeletonCard from "../../UserInfo/UserSkeleton/SkeletonCard"
import styles from "./styles.module.scss"
export default function PanelSkeleton() {
  return (
    <div id={styles.panelSkeleton}>
      <div id={styles.skeletonSettings}>
        <h1> Your streams </h1>
        <SkeletonCard />
      </div>
      <div className={styles.skeletonStreams}>
        <SkeletonHero />
      </div>
    </div>
  )
}
