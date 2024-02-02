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
import { useLogout, useNotification } from "../../../utils/customHooks";
import {
  ResMessage,
  StreamData,
  User,
  saveUser,
} from "../../../utils/datafetching";
import { importGStreams, local } from "../../../utils/helpers";
import Logo from "../../Logo";
import Notification from "./Notification";
import StreamList, { streamQuery } from "./StreamList";
import UserInfo, { userQuery } from "./UserInfo";
import styles from "./styles.module.scss";

export interface DashLoader {
  streamData: StreamData;
  userData: User;
}

export const dashLoader =
  (qc: QueryClient) => async (): Promise<DashLoader | Response> => {
    const [uid, token] = [
      localStorage.getItem(local.id),
      localStorage.getItem(local.token),
    ];

    if (!uid) return redirect("/register/signin");

    saveUser(uid, token);

    const { queryFn: streamFn, queryKey: streamKey } = streamQuery(
      uid !== "guest",
    );
    const { queryFn: userFn, queryKey: userKey } = userQuery(uid);

    try {
      const [streamData, userData] = await Promise.all([
        qc.ensureQueryData({ queryKey: streamKey, queryFn: streamFn }),
        qc.ensureQueryData({ queryKey: userKey, queryFn: userFn }),
      ]);

      return { streamData, userData };
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
  const { userData, streamData } = useLoaderData() as DashLoader;
  const { notif, updateNotif, clearNotif } = useNotification();
  const logout = useLogout(userData.id);

  const handleLogout = () => {
    clearNotif();
    logout();
  };

  const handleImport = () => {
    updateNotif("Your streams are being uploaded to the server", "loading");

    importGStreams(qc, userData.id).then((res) =>
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
              to={
                userData.verified
                  ? "/dashboard/settings"
                  : "/dashboard/signwall"
              }
            >
              <FontAwesomeIcon icon={faCog} /> Settings
            </Link>

            {userData.verified ? (
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
      </header>

      {notif.message && (
        <Notification message={notif.message} type={notif.type} />
      )}

      <UserInfo initialData={userData} id={userData.id} />
      <StreamList
        initialData={streamData}
        verified={userData.verified}
        notify={updateNotif}
      />
    </div>
  );
}
