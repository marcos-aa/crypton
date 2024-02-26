import { Ticker } from "shared/streamtypes";
import styles from "./styles.module.scss";

export type Prices = Omit<Ticker, "symbol">;

interface SymbolProps {
  symbol: string;
  prices: Prices;
}

export default function SymbolTicks({ symbol, prices }: SymbolProps) {
  return (
    <article className={styles.streamItem}>
      <h2> {symbol} </h2>
      <p> Price: {prices?.last}</p>
      <p> Change: {prices?.change}</p>
      <p> Change %: {prices?.pchange}</p>
      <p> Average: {prices?.average}</p>
    </article>
  );
}
