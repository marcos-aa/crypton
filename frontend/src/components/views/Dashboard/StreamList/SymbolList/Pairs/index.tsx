import { MouseEvent, memo } from "react"
import styles from "./styles.module.scss"

interface PairProps {
  search: string
  pairs: string[]
  handlePush(e: MouseEvent<HTMLLIElement>): void
}
function Pairs({ search, pairs, handlePush }: PairProps) {
  const matches = pairs.filter((symbol: string) =>
    symbol.includes(search.trim().toLocaleUpperCase())
  )

  return matches.map((match) => (
    <li className={styles.symbol} onClick={handlePush} key={match}>
      {match}
    </li>
  ))
}

export default memo(Pairs)
