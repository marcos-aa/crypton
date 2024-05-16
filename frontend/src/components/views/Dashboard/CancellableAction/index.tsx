import { ReactNode } from "react"
import { Link } from "react-router-dom"
import styles from "./styles.module.scss"

interface CancelProps {
  children: ReactNode
}
export default function CancellableAction({ children }: CancelProps) {
  return (
    <div id={styles.actions}>
      <Link className="action" to="/dashboard" data-cy="formCancel">
        Cancel
      </Link>

      {children}
    </div>
  )
}
