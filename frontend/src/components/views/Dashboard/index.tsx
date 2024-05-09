import {
  faCloud,
  faCog,
  faSignOut,
  faUpload,
  faUserCircle,
} from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { QueryClient, useQueryClient } from "@tanstack/react-query"
import { Suspense, useCallback, useState } from "react"
import { Await, Link, defer, redirect, useLoaderData } from "react-router-dom"
import { StreamData } from "shared/streamtypes"
import { UIUser } from "shared/usertypes"
import { useLogout, useNotification } from "../../../utils/customHooks"
import { saveHeader } from "../../../utils/datafetching"
import { impGuestStreams, local } from "../../../utils/helpers"
import Logo from "../../Logo"
import Notification from "./Notification"
import StreamList, { streamQuery } from "./StreamList"
import PanelSkeleton from "./StreamList/PanelSkeleton"
import UserInfo, { userQuery } from "./UserInfo"
import UserSkeleton from "./UserInfo/UserSkeleton"
import styles from "./styles.module.scss"

export interface DashLoader {
  streamPromise: Promise<StreamData>
  userPromise: Promise<UIUser>
}

interface DashData {
  streamData: StreamData
  userPromise: Promise<UIUser>
}

interface StreamTotals {
  streams: number
  syms: number
  usyms: number
}

export const dashLoader = (qc: QueryClient) => () => {
  const token = localStorage.getItem(local.token)
  if (!token) return redirect("/register/signin")

  const verified = token !== "guest"
  if (verified) saveHeader(token)

  const userConfig = userQuery(verified)
  const streamConfig = streamQuery(verified)

  const streamPromise = qc
    .ensureQueryData(streamConfig)
    .then((streamData: StreamData) => {
      return { streamData, userPromise: qc.ensureQueryData(userConfig) }
    })

  const userPromise = streamPromise.then((data) => data.userPromise)
  return defer({
    streamPromise,
    userPromise,
  })
}

export default function Dashboard() {
  const qc = useQueryClient()
  const { streamPromise, userPromise } = useLoaderData() as DashLoader
  const { notif, updateNotif, clearNotif } = useNotification()
  const [totals, setTotals] = useState<StreamTotals>({
    streams: 0,
    syms: 0,
    usyms: 0,
  })
  const verified = localStorage.getItem(local.token) != "guest"
  const logout = useLogout(verified)

  const updateTotals = useCallback(
    (streams: number, syms: number, usyms: number) => {
      setTotals({ streams, syms, usyms })
    },
    [streamPromise]
  )

  const handleLogout = async () => {
    clearNotif()
    await logout()
  }

  const handleImport = () => {
    if (!localStorage.getItem(local.streams))
      return updateNotif("No guest streams found", "loading")

    updateNotif("Your streams are being uploaded to the server", "loading")
    const uid = qc.getQueryData<UIUser>(["user"]).id
    impGuestStreams(qc, uid).then((res) => updateNotif(res.message, res.type))
  }

  return (
    <div className="page" id={styles.dashboard}>
      <header>
        <Logo />
        <div id={styles.dropSettings}>
          <button id={styles.dropCta} title="Settings">
            <FontAwesomeIcon icon={faUserCircle} />
          </button>

          <div id={styles.dropList}>
            <Link
              className={styles.dropAction}
              to={verified ? "/dashboard/settings" : "/dashboard/export"}
            >
              <FontAwesomeIcon icon={faCog} /> Settings
            </Link>

            {verified ? (
              <button
                type="button"
                className={styles.dropAction}
                onClick={handleImport}
                disabled={notif.type == "loading"}
              >
                <FontAwesomeIcon icon={faUpload} /> Import local streams
              </button>
            ) : (
              <Link className={styles.dropAction} to="/dashboard/export">
                <FontAwesomeIcon icon={faCloud} /> Export data to cloud
              </Link>
            )}
            <button
              type="button"
              className={styles.dropAction}
              onClick={handleLogout}
            >
              <FontAwesomeIcon icon={faSignOut} /> Logout
            </button>
          </div>
        </div>

        {notif.message && (
          <Notification
            message={notif.message}
            type={notif.type}
            dismiss={clearNotif}
          />
        )}
      </header>

      <Suspense fallback={<UserSkeleton />}>
        <Await resolve={userPromise}>
          {(user: UIUser) => {
            return (
              <UserInfo
                initialUser={user}
                tstreams={totals.streams}
                tsyms={totals.syms}
                usyms={totals.usyms}
              />
            )
          }}
        </Await>
      </Suspense>

      <Suspense fallback={<PanelSkeleton />}>
        <Await resolve={streamPromise}>
          {(data: DashData) => (
            <StreamList
              initialData={data.streamData}
              verified={verified}
              updateTotals={updateTotals}
            />
          )}
        </Await>
      </Suspense>
    </div>
  )
}
