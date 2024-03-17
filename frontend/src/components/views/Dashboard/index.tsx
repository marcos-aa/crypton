import {
  faCloud,
  faCog,
  faSignOut,
  faUpload,
  faUserCircle,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { QueryClient, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { Link, redirect, useLoaderData } from "react-router-dom";
import { ResMessage } from "shared";
import { StreamData } from "shared/streamtypes";
import { User } from "shared/usertypes";
import { useLogout, useNotification } from "../../../utils/customHooks";
import { saveUser } from "../../../utils/datafetching";
import { importGStreams, local } from "../../../utils/helpers";
import Logo from "../../Logo";
import Notification from "./Notification";
import StreamList, { streamQuery } from "./StreamList";
import UserInfo, { userQuery } from "./UserInfo";
import styles from "./styles.module.scss";

export interface DashLoader {
  streamData: StreamData;
  user: User;
}

export const dashLoader =
  (qc: QueryClient) => async (): Promise<DashLoader | Response> => {
    const [uid, token] = [
      localStorage.getItem(local.id),
      localStorage.getItem(local.token),
    ];
    if (!uid) return redirect("/register/signin");

    const isVerified = uid !== "guest";
    if (isVerified) saveUser(uid, token);

    const { queryFn: userFn, queryKey: userKey } = userQuery(uid);
    const { queryFn: streamFn, queryKey: streamKey } = streamQuery(isVerified);

    try {
      const [user, streamData] = await Promise.all([
        qc.ensureQueryData({ queryKey: userKey, queryFn: userFn }),
        qc.ensureQueryData({ queryKey: streamKey, queryFn: streamFn }),
      ]);

      return { user, streamData };
    } catch (e) {
      const error = (e as AxiosError<ResMessage>).response;

      if (error.status == 403) {
        localStorage.removeItem(local.id);
        localStorage.removeItem(local.token);
        return redirect("/register/signin");
      }

      throw { message: error.data?.message || "" };
    }
  };

export default function Dashboard() {
  const qc = useQueryClient();
  const { user, streamData } = useLoaderData() as DashLoader;
  const { notif, updateNotif, clearNotif } = useNotification();
  const logout = useLogout(user.id);

  const { tsyms, tstreams, usyms } = qc.getQueryData<StreamData>(["streams"]);

  const handleLogout = () => {
    clearNotif();
    logout();
  };

  const handleImport = () => {
    if (!localStorage.getItem(local.streams))
      return updateNotif("No guest streams found", "loading");

    updateNotif("Your streams are being uploaded to the server", "loading");

    importGStreams(qc, user.id).then((res) =>
      updateNotif(res.message, res.type),
    );
  };

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
              to={user.verified ? "/dashboard/settings" : "/dashboard/signwall"}
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
  );
}
