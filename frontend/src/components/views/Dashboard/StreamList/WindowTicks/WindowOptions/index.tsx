import { ChangeEvent, MouseEvent, useState } from "react";
import styles from "./styles.module.scss";

interface TimeProps {
  addWindow(e: MouseEvent<HTMLLIElement> | string): void;
}

const maxUnits = {
  m: 59,
  h: 24,
  d: 7,
};

export default function WindowOptions({ addWindow }: TimeProps) {
  const [cwindow, setCwindow] = useState({ value: "1", unit: "m" });

  const changeOption = (e: ChangeEvent<HTMLSelectElement>) => {
    const newUnit = e.currentTarget.value;
    setCwindow((prev) => {
      return {
        ...prev,
        unit: newUnit,
      };
    });
  };

  return (
    <div id={styles.timeWindow}>
      <span> Add a window to table of values </span>
      <div id={styles.commonWindows}>
        <li onClick={addWindow} className={styles.prewindow}>
          1m
        </li>
        <li onClick={addWindow} className={styles.prewindow}>
          30m
        </li>
        <li onClick={addWindow} className={styles.prewindow}>
          1h
        </li>
        <li onClick={addWindow} className={styles.prewindow}>
          6h
        </li>
        <li onClick={addWindow} className={styles.prewindow}>
          12h
        </li>
        <li onClick={addWindow} className={styles.prewindow}>
          1d
        </li>
        <li onClick={addWindow} className={styles.prewindow}>
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

        <button type="button" className="action fullwd">
          Add window
        </button>
      </div>
    </div>
  );
}
