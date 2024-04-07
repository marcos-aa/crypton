import {
  faCloud,
  faCog,
  faSignOut,
  faUpload,
  faUserCircle,
} from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { QueryClient, useQueryClient } from "@tanstack/react-query"
import { Link, redirect, useLoaderData } from "react-router-dom"
import { StreamData } from "shared/streamtypes"
import { UIUser } from "shared/usertypes"
import { useLogout, useNotification } from "../../../utils/customHooks"
import { saveHeader } from "../../../utils/datafetching"
import { importGStreams, local } from "../../../utils/helpers"
import Logo from "../../Logo"
import Notification from "./Notification"
import StreamList, { streamQuery } from "./StreamList"
import UserInfo, { userQuery } from "./UserInfo"
import styles from "./styles.module.scss"

export interface DashLoader {
  streamData: StreamData
  user: UIUser
}

export const dashLoader =
  (qc: QueryClient) => async (): Promise<DashLoader | Response> => {
    const token = localStorage.getItem(local.token)
    if (!token) return redirect("/home/register/signin")

    const verified = token !== "guest"
    if (verified) saveHeader(token)

    const userConfig = userQuery(verified)
    const streamConfig = streamQuery(verified)
    let res: DashLoader = {
      user: null,
      streamData: null,
    }

    const data = await Promise.all([
      qc.ensureQueryData(userConfig),
      qc.ensureQueryData(streamConfig),
    ])

    res.user = data[0]
    res.streamData = data[1]

    if (!res.user || !res.streamData) {
      const keyName = res.user ? "streamData" : "user"
      const data = await qc.ensureQueryData<UIUser | StreamData>(
        res.user ? streamConfig : userConfig
      )
      res = Object.assign(res, { [keyName]: data })
    }
    return res
  }

export default function Dashboard() {
  const qc = useQueryClient()
  const { user, streamData } = useLoaderData() as DashLoader
  const { notif, updateNotif, clearNotif } = useNotification()
  const logout = useLogout(user.verified)

  const { tsyms, tstreams, usyms } = qc.getQueryData<StreamData>(["streams"])

  const handleLogout = async () => {
    clearNotif()
    await logout()
  }

  const handleImport = () => {
    if (!localStorage.getItem(local.streams))
      return updateNotif("No guest streams found", "loading")

    updateNotif("Your streams are being uploaded to the server", "loading")

    importGStreams(qc, user.id).then((res) =>
      updateNotif(res.message, res.type)
    )
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
              to={user.verified ? "/dashboard/settings" : "/dashboard/export"}
            >
              <FontAwesomeIcon icon={faCog} /> Settings
            </Link>

            {user.verified ? (
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

      <UserInfo
        initialData={user}
        tsyms={tsyms}
        usyms={usyms}
        tstreams={tstreams}
      />

      <StreamList
        initialData={streamData}
        verified={user.verified}
        notify={updateNotif}
      />
    </div>
  )
}
