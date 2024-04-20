import { useEffect, useState } from "react"
import { Outlet, useNavigate } from "react-router"
import { Link } from "react-router-dom"
import { Tickers } from "shared/streamtypes"
import api from "../../../services/api"
import { local } from "../../../utils/helpers"
import Logo from "../../Logo"
import SymbolTicks from "../Dashboard/StreamList/SymbolTicks"
import streamStyles from "../Dashboard/StreamList/styles.module.scss"
import styles from "./styles.module.scss"

export default function Home() {
  const [tickers, setTickers] = useState<Tickers>({})
  const navigate = useNavigate()

  const handleGuest = () => {
    localStorage.setItem(local.token, "guest")
    const prevJoin = localStorage.getItem(local.joined)
    if (!prevJoin)
      localStorage.setItem(local.joined, JSON.stringify(new Date()))
    navigate("/dashboard")
  }

  useEffect(() => {
    const token = localStorage.getItem(local.token)
    if (token) return navigate("/dashboard")

    const controller = new AbortController()
    api
      .get<Tickers>("/tickers", {
        signal: controller.signal,
        params: {
          symbols: [
            "BTCBUSD",
            "ETHBTC",
            "BNBBTC",
            "SOLETH",
            "BTCUSDT",
            "ETHBUSD",
            "BCHUSDT",
            "SHIBUSDT",
          ],
        },
      })
      .then((res) => {
        setTickers(res.data)
      })

    return () => controller.abort()
  }, [])

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
            <SymbolTicks symbol="BNBBTC" prices={tickers.BNBBTC} />
            <SymbolTicks symbol="SOLETH" prices={tickers.SOLETH} />
          </div>
          <div className={`${styles.stream} ${streamStyles.streamList}`}>
            <SymbolTicks symbol="BTCUSDT" prices={tickers.BTCUSDT} />
            <SymbolTicks symbol="SHIBUSDT" prices={tickers.SHIBUSDT} />
            <SymbolTicks symbol="ETHBUSD" prices={tickers.ETHBUSD} />
            <SymbolTicks symbol="BCHUSDT" prices={tickers.BCHUSDT} />
          </div>
        </div>
      </main>
      <Outlet />
    </section>
  )
}
