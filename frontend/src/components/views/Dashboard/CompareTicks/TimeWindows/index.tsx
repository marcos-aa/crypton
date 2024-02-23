import styles from "./styles.module.scss";

export default function TimeWindows() {
  return (
    <div id={styles.timeWindow}>
      <span> Add a window to table of values </span>
      <ul id={styles.commonWindows}>
        <li className={styles.prewindow}> 1M </li>
        <li className={styles.prewindow}> 30M </li>
        <li className={styles.prewindow}> 1H </li>
        <li className={styles.prewindow}> 6H </li>
        <li className={styles.prewindow}> 12H </li>
        <li className={styles.prewindow}> 1D </li>
        <li className={styles.prewindow}> 3D </li>
      </ul>

      <div id={styles.customWindow}>
        <label htmlFor="window"> Select a custom window </label>
        <input name="window" type="number" />
        <select name="unit" id={styles.timeUnit}>
          <option value="M"> Minutes </option>
          <option value="H"> Hours </option>
          <option value="D"> Days </option>
        </select>
      </div>
    </div>
  );
}
