import SkeletonHero from "../../../Home/Hero/Skeleton"
import styles from "./styles.module.scss"
export default function PanelSkeleton() {
  return (
    <div id={styles.panelSkeleton}>
      <SkeletonHero />
    </div>
  )
}
