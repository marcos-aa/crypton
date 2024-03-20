import { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router";
import { Link } from "react-router-dom";
import { Tickers } from "shared/streamtypes";
import api from "../../../services/api";
import { local } from "../../../utils/helpers";
import Logo from "../../Logo";
import SymbolTicks from "../Dashboard/StreamList/SymbolTicks";
import streamStyles from "../Dashboard/StreamList/styles.module.scss";
import styles from "./styles.module.scss";

export default function Home() {
  const [tickers, setTickers] = useState<Tickers>({});
  const navigate = useNavigate();

  const handleGuest = () => {
    const prevJoin = localStorage.getItem(local.joined);
    localStorage.setItem(local.id, "guest");
    if (!prevJoin)
      localStorage.setItem(local.joined, JSON.stringify(new Date()));
    navigate("/dashboard");
  };

  useEffect(() => {
    const uid = localStorage.getItem(local.id);
    if (uid) return navigate("/dashboard");

    const controller = new AbortController();
    api
      .get<Tickers>("/tickers", {
        signal: controller.signal,
        params: {
          symbols: [
            "BTCBUSD",
            "ETHBTC",
            "SOLETH",
            "DOGEBUSD",
            "SUIUSDT",
            "BTCFDUSD",
            "ETHBUSD",
            "AAVEBNB",
          ],
        },
      })
      .then((res) => {
        setTickers(res.data);
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
            <SymbolTicks symbol="ETHBTC" prices={tickers.ETHBTC} />
            <SymbolTicks symbol="SOLETH" prices={tickers.SOLETH} />
            <SymbolTicks symbol="DOGEBUSD" prices={tickers.DOGEBUSD} />
          </div>
          <div className={`${styles.stream} ${streamStyles.streamList}`}>
            <SymbolTicks symbol="SUIUSDT" prices={tickers.SUIUSDT} />
            <SymbolTicks symbol="BTCFDUSD" prices={tickers.BTCFDUSD} />
            <SymbolTicks symbol="ETHBUSD" prices={tickers.ETHBUSD} />
            <SymbolTicks symbol="AAVEBNB" prices={tickers.AAVEBNB} />
          </div>
        </div>
      </main>
      <Outlet />
    </section>
  );
}
