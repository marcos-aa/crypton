import { Tickers } from "@shared/types"
import { AxiosResponse } from "axios"
import { Suspense } from "react"
import {
  Await,
  Outlet,
  defer,
  redirect,
  useLoaderData,
  useNavigate,
} from "react-router"
import { Link } from "react-router-dom"
import api from "../../../services/api"
import { local } from "../../../utils/helpers"
import Logo from "../../Logo"
import SymbolTicks from "../Dashboard/StreamList/SymbolTicks"
import streamStyles from "../Dashboard/StreamList/styles.module.scss"
import SkeletonHero from "./Hero/Skeleton"
import styles from "./styles.module.scss"

export const homeLoader = async () => {
  const token = localStorage.getItem(local.token)
  if (token) return redirect("/dashboard")

  const tickersPromise = api.get<Tickers>("/tickers", {
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

  return defer({
    tickersPromise,
  })
}

interface DeferredTickers {
  tickersPromise: Promise<AxiosResponse<Tickers>>
}

export default function Home() {
  const data = useLoaderData() as DeferredTickers
  const navigate = useNavigate()

  const handleGuest = () => {
    localStorage.setItem(local.token, "guest")
    const prevJoin = localStorage.getItem(local.joined)
    if (!prevJoin)
      localStorage.setItem(local.joined, JSON.stringify(new Date()))
    navigate("/dashboard")
  }

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
              data-cy="guestButton"
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
          <Suspense fallback={<SkeletonHero />}>
            {
              <Await resolve={data.tickersPromise}>
                {(res: AxiosResponse<Tickers>) => {
                  const tickers = res.data
                  return (
                    <>
                      <div
                        className={`${styles.stream} ${streamStyles.streamList}`}
                      >
                        <SymbolTicks
                          symbol="BTCBUSD"
                          prices={tickers.BTCBUSD}
                        />
                        <SymbolTicks symbol="ETHBTC" prices={tickers.ETHBTC} />
                        <SymbolTicks symbol="BNBBTC" prices={tickers.BNBBTC} />
                        <SymbolTicks symbol="SOLETH" prices={tickers.SOLETH} />
                      </div>
                      <div
                        className={`${styles.stream} ${streamStyles.streamList}`}
                      >
                        <SymbolTicks
                          symbol="BTCUSDT"
                          prices={tickers.BTCUSDT}
                        />
                        <SymbolTicks
                          symbol="SHIBUSDT"
                          prices={tickers.SHIBUSDT}
                        />
                        <SymbolTicks
                          symbol="ETHBUSD"
                          prices={tickers.ETHBUSD}
                        />
                        <SymbolTicks
                          symbol="BCHUSDT"
                          prices={tickers.BCHUSDT}
                        />
                      </div>
                    </>
                  )
                }}
              </Await>
            }
          </Suspense>
        </div>
      </main>
      <Outlet />
    </section>
  )
}
