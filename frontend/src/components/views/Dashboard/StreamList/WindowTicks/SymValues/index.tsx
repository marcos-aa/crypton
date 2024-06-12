import { CSSProperties, MouseEvent, memo } from "react"
import { WindowData } from ".."
import FullDate from "../../../UserInfo/FullDate"
import styles from "../styles.module.scss"
export interface ValueProps {
  symbols: string[]
  data: WindowData
  expanded: string
  interval: string
  expandSymbol(e: MouseEvent<HTMLHeadingElement>): void
}

function SymValues({
  symbols,
  data,
  expanded,
  interval,
  expandSymbol,
}: ValueProps) {
  return symbols.map((symbol, i) => {
    const value = data["1s"][symbol]
    const valDecrease = value.change[0] === "-"
    const comparedValue = data[interval][symbol]
    const comparedDecrease = comparedValue.change[0] === "-"

    const rowIndex = {
      "--elindex": i,
    } as CSSProperties

    return (
      <div
        style={rowIndex}
        key={symbol}
        className={`${styles.symRow} ${expanded == symbol ? styles.fullSym : ""}`}
      >
        <h2
          className={styles.rowTitle}
          onClick={expandSymbol}
          data-cy="historicalAsset"
        >
          {symbol}
        </h2>

        <div className={styles.symValues}>
          <span> Last price: {value.last}</span>
          <span> Weighted average: {value.average}</span>
          <span className={valDecrease ? "priceFall" : "priceRaise"}>
            Price change: {value.change}
          </span>
          <span className={valDecrease ? "priceFall" : "priceRaise"}>
            Price change %: {value.pchange}
          </span>

          <div className={styles.extraValues}>
            <span>Quote volume: {value.qvolume}</span>
            <span> Asset volume: {value.volume}</span>
            <span> Total trades: {value.trades}</span>
            <FullDate
              style={styles.windowTime}
              hour={true}
              date={new Date(value.open)}
              title="Open date:"
            />
            <FullDate
              style={styles.windowTime}
              hour={true}
              date={new Date(value.close)}
              title="Close date:"
            />
          </div>
        </div>

        <div className={styles.symValues} data-cy="historicalData">
          <span> Last price: {comparedValue.last}</span>
          <span> Weighted average: {comparedValue.average}</span>
          <span className={comparedDecrease ? "priceFall" : "priceRaise"}>
            Price change: {comparedValue.change}
          </span>
          <span className={comparedDecrease ? "priceFall" : "priceRaise"}>
            Price change %: {comparedValue.pchange}
          </span>

          <div className={styles.extraValues}>
            <span>Quote volume: {comparedValue.qvolume}</span>
            <span> Asset volume: {comparedValue.volume}</span>
            <span> Total trades: {comparedValue.trades}</span>
            <FullDate
              style={styles.windowTime}
              hour={true}
              date={new Date(comparedValue.open)}
              title="Open date:"
            />
            <FullDate
              style={styles.windowTime}
              hour={true}
              date={new Date(comparedValue.close)}
              title="Close date:"
            />
          </div>
        </div>
      </div>
    )
  })
}

export default memo(SymValues)
