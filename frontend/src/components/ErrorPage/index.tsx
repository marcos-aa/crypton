import { AxiosError } from "axios"
import { useRouteError } from "react-router"
import { useLogout } from "../../utils/customHooks"
import { local } from "../../utils/helpers"
import Logo from "../Logo"
import styles from "./styles.module.scss"

export default function ErrorPage() {
  const verified = localStorage.getItem(local.token) !== "guest"
  const logout = useLogout(verified)
  const error = useRouteError() as AxiosError<string>

  return (
    <div className="page">
      <section id={styles.errorPage}>
        <Logo isError={true} />
        <h2>OOPS! Something went wrong.</h2>

        <p>{error?.response?.data}</p>

        <div id={styles.errActions}>
          <button
            className={styles.errOption}
            onClick={() => window.location.reload()}
          >
            Refresh page
          </button>

          <button onClick={logout} className={styles.errOption}>
            Logout
          </button>
        </div>
      </section>
    </div>
  )
}
