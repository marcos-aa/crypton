import { Ticker } from "../../../../../utils/datafetching";
import styles from "./styles.module.scss";

type SymbolProps = {
  symbol: string;
  prices: Omit<Ticker, "symbol">;
};

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
