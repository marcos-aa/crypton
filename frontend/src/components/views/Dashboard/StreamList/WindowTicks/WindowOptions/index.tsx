import { MouseEvent } from "react";
import styles from "./styles.module.scss";

interface TimeProps {
  addWindow(e: MouseEvent<HTMLLIElement>): void;
}

export default function WindowOptions({ addWindow }: TimeProps) {
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
        <input name="window" type="number" />
        <select name="unit" id={styles.timeUnit}>
          <option value="m"> Minutes </option>
          <option value="h"> Hours </option>
          <option value="d"> Days </option>
        </select>
      </div>
    </div>
  );
}
