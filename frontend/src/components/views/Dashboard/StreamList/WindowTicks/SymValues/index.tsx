import { Ticker } from "shared/streamtypes";
import FullDate from "../../../UserInfo/FullDate";
import styles from "../styles.module.scss";

interface ValueProps {
  value: Ticker;
  decreased: boolean;
}

export default function SymValues({ value, decreased }: ValueProps) {
  return (
    <div className={styles.symValues}>
      <span> Last price: {value.last}</span>
      <span> Weighted average: {value.average}</span>
      <span className={decreased ? "priceFall" : "priceRaise"}>
        Price change: {value.change}
      </span>
      <span className={decreased ? "priceFall" : "priceRaise"}>
        Price change %: {value.pchange}
      </span>

      <div className={styles.extraValues}>
        <span>Quote volume: {value.qvolume}</span>
        <span> Asset volume: {value.volume}</span>
        <span> Total trades: {value.trades}</span>
        <FullDate
          style={styles.windowTime}
          hour={true}
          date={new Date(value?.open)}
          title="Open date:"
        />
        <FullDate
          style={styles.windowTime}
          hour={true}
          date={new Date(value?.close)}
          title="Close date:"
        />
      </div>
    </div>
  );
}
