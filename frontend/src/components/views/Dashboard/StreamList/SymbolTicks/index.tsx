import { WindowTicker } from "shared/streamtypes";
import styles from "./styles.module.scss";

export type Prices = Pick<
  WindowTicker,
  "change" | "pchange" | "average" | "last"
>;

interface SymbolProps {
  symbol: string;
  prices: Prices;
  decreased?: boolean;
}

export default function SymbolTicks({
  symbol,
  prices,
  decreased,
}: SymbolProps) {
  return (
    <article className={styles.streamItem}>
      <h2> {symbol} </h2>
      <p> Price: {prices?.last}</p>
      <p className={decreased ? "priceFall" : "priceRaise"}>
        Change: {prices?.change}
      </p>
      <p className={decreased ? "priceFall" : "priceRaise"}>
        Change %: {prices?.pchange}
      </p>
      <p> Average: {prices?.average}</p>
    </article>
  );
}
