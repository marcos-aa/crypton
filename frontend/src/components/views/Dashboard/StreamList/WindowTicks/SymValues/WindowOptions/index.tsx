import { ChangeEvent, MouseEvent, useState } from "react"
import styles from "./styles.module.scss"

interface TimeProps {
  updateWindow(interval: string): void
}

const maxUnits = {
  m: 59,
  h: 23,
  d: 7,
} as const

export default function WindowOptions({ updateWindow }: TimeProps) {
  const [cwindow, setCwindow] = useState({ value: "1", unit: "m" })

  const changeTime = (e: ChangeEvent<HTMLInputElement>) => {
    const newtime = e.currentTarget.value
    let value = newtime,
      unit = cwindow.unit

    if (newtime > maxUnits[cwindow.unit]) {
      value = "1"
      unit = unit === "m" ? "h" : "d"
    }

    setCwindow({ value, unit })
  }

  const changeOption = (e: ChangeEvent<HTMLSelectElement>) => {
    const newUnit = e.currentTarget.value
    setCwindow({
      value: "1",
      unit: newUnit,
    })
  }

  const addFromEvent = (e: MouseEvent<HTMLLIElement | HTMLButtonElement>) => {
    const interval = e.currentTarget.type
      ? cwindow.value.concat(cwindow.unit)
      : e.currentTarget.innerHTML
    updateWindow(interval)
  }

  return (
    <div id={styles.timeWindow}>
      <p> Select active window </p>
      <div id={styles.commonWindows}>
        <li onClick={addFromEvent} className={styles.prewindow}>
          1m
        </li>
        <li onClick={addFromEvent} className={styles.prewindow}>
          30m
        </li>
        <li onClick={addFromEvent} className={styles.prewindow}>
          1h
        </li>
        <li onClick={addFromEvent} className={styles.prewindow}>
          6h
        </li>
        <li onClick={addFromEvent} className={styles.prewindow}>
          12h
        </li>
        <li onClick={addFromEvent} className={styles.prewindow}>
          1d
        </li>
        <li onClick={addFromEvent} className={styles.prewindow}>
          3d
        </li>
      </div>

      <div id={styles.customWindow}>
        <label htmlFor="window"> Select a custom window </label>
        <input
          name="window"
          type="number"
          max={maxUnits[cwindow.unit]}
          value={cwindow.value}
          onChange={changeTime}
        />
        <select
          value={cwindow.unit}
          name="unit"
          id={styles.timeUnit}
          onChange={changeOption}
        >
          <option value="m"> Minutes </option>
          <option value="h"> Hours </option>
          <option value="d"> Days </option>
        </select>

        <button type="button" className="action fullwd" onClick={addFromEvent}>
          Select window
        </button>
      </div>
    </div>
  )
}
