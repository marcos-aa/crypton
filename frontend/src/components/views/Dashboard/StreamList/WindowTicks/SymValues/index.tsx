import { faCaretDown } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { useQueryClient } from "@tanstack/react-query"
import { CSSProperties, MouseEvent, memo, useState } from "react"
import { WindowData, saveWindow } from ".."
import { local } from "../../../../../../utils/helpers"
import FullDate from "../../../UserInfo/FullDate"
import styles from "../styles.module.scss"
import WindowOptions from "./WindowOptions"
export interface ValueProps {
  symbols: string[]
  initialData: WindowData
  expanded: string
  interval: string
  expandSymbol(e: MouseEvent<HTMLHeadingElement>): void
  changeInterval(newitv: string): void
}

function SymValues({
  symbols,
  initialData,
  expanded,
  interval,
  expandSymbol,
  changeInterval,
}: ValueProps) {
  const qc = useQueryClient()
  const [tickers, setTickers] = useState<WindowData>(initialData)
  const [edit, setEdit] = useState(false)

  const showWindowOptions = () => setEdit((prev) => !prev)

  const updateWindow = async (newitv: string) => {
    setEdit(false)
    const data = await saveWindow(qc, symbols, newitv)
    localStorage.setItem(local.window, newitv)
    changeInterval(newitv)
    setTickers((prev) => ({ "1s": prev["1s"], [newitv]: data[newitv] }))
  }
  return (
    <>
      {symbols.map((symbol, i) => {
        const data = tickers["1s"] ? tickers : initialData
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
            <h2 className={styles.rowTitle} onClick={expandSymbol}>
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

            <div className={styles.symValues}>
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
      })}
      <button
        type="button"
        title="Show window options"
        style={{
          position: "absolute",
          width: "40px",
          height: "40px",
          top: "0",
          right: "40px",
          fontSize: "25px",
          border: "none",
          paddingBottom: "10px",
        }}
        onClick={showWindowOptions}
      >
        <FontAwesomeIcon
          style={{
            rotate: edit ? "180deg" : "0deg",
          }}
          icon={faCaretDown}
        />
      </button>
      {edit && <WindowOptions updateWindow={updateWindow} />}
    </>
  )
}

export default memo(SymValues)
