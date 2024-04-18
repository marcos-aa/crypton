import { MouseEvent, memo, useEffect, useState } from "react"
import styles from "./styles.module.scss"

interface PairProps {
  search: string
  pairs: string[]
  handlePush(e: MouseEvent<HTMLLIElement>): void
}

function Pairs({ search, pairs, handlePush }: PairProps) {
  const [matches, setMatches] = useState(pairs)

  useEffect(() => {
    const id = setTimeout(() => {
      const matched = pairs.filter((symbol: string) =>
        symbol.includes(search.trim().toLocaleUpperCase())
      )
      setMatches(matched)
    }, 350)

    return () => {
      clearTimeout(id)
    }
  }, [search])

  return matches.map((match) => (
    <li className={styles.symbol} onClick={handlePush} key={match}>
      {match}
    </li>
  ))
}

export default memo(Pairs)
