import { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router";
import { Link } from "react-router-dom";
import { Tickers } from "../../../utils/datafetching";
import { local } from "../../../utils/helpers";
import Logo from "../../Logo";
import SymbolTicks from "../Dashboard/StreamList/SymbolTicks";
import streamStyles from "../Dashboard/StreamList/styles.module.scss";
import styles from "./styles.module.scss";

export default function Home() {
  const [tickers, setTickers] = useState<Tickers>({});
  const navigate = useNavigate();

  const handleGuest = () => {
    localStorage.setItem(local.id, "guest");
    navigate("/dashboard");
  };

  useEffect(() => {
    const uid = localStorage.getItem(local.id);
    if (uid) return navigate("/dashboard");

    const controller = new AbortController();
    // api
    //   .get<Tickers>("tickers/preview", {
    //     signal: controller.signal,
    //     params: {
    //       symbol: "BTCBUSD",
    //     },
    //   })
    //   .then((res) => {
    //     setTicker(res.data);
    //   });
    setTickers({
      BTCBUSD: {
        last: "30,044.94",
        change: "30,044.94",
        pchange: "30,044.94",
        average: "30,044.94",
      },
    });

    return () => controller.abort();
  }, []);

  return (
    <section className="page">
      <Logo />
      <main className={styles.content}>
        <section id={styles.cta}>
          <h1 id={styles.ctaTitle}>
            Create custom streams from a list of over 2000 assets
          </h1>
          <div id={styles.actions}>
            <button
              className={styles.action}
              type="button"
              onClick={handleGuest}
            >
              Get realtime updates now
            </button>
            <span id={styles.newline}> or </span>
            <Link to="/register/signin" className={styles.action}>
              Join
            </Link>
          </div>
        </section>
        <div id={styles.hero}>
          <div className={`${styles.stream} ${streamStyles.streamList}`}>
            <SymbolTicks symbol="BTCBUSD" prices={tickers.BTCBUSD} />
            <SymbolTicks symbol="ETHBTC" prices={tickers.BTCBUSD} />
            <SymbolTicks symbol="GBPBUSD" prices={tickers.BTCBUSD} />
            <SymbolTicks symbol="GBPBUSD" prices={tickers.BTCBUSD} />
          </div>
          <div className={`${styles.stream} ${streamStyles.streamList}`}>
            <SymbolTicks symbol="BTCBUSD" prices={tickers.BTCBUSD} />
            <SymbolTicks symbol="ETHBTC" prices={tickers.ETHBTC} />
            <SymbolTicks symbol="GBPBUSD" prices={tickers.GBPBUSD} />
            <SymbolTicks symbol="GBPBUSD" prices={tickers.BTCBUSD} />
          </div>
        </div>
      </main>
      <Outlet />
    </section>
  );
}
