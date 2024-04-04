import { faCoins } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import styles from "./styles.module.scss"

export default function Hero() {
  return (
    <div className={styles.hero}>
      <FontAwesomeIcon icon={faCoins} />
      <div className={styles.features}>
        <h3> Join to earn member privileges </h3>
        <ul>
          <li> Create your own stream lists </li>
          <li> Customize your streams </li>
          <li> Persistent user login </li>
          <li> Personal dashboard </li>
        </ul>
      </div>
    </div>
  )
}
