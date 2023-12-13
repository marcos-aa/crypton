import {
  faCog,
  faSignOut,
  faUpload,
  faUserCircle,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { QueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { Link, redirect, useLoaderData } from "react-router-dom";
import { useLogout, useNotification } from "../../../utils/customHooks";
import {
  ResMessage,
  StreamData,
  User,
  saveUser,
} from "../../../utils/datafetching";
import { local } from "../../../utils/helpers";
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
  const { streamData, userData } = useLoaderData() as DashLoader;
  const { notif, updateNotif } = useNotification();
  const handleLogout = useLogout();

  const handleNotif = () => {
    updateNotif("Importing local streams", "success");
  };

  return (
    <div className="page" id={styles.dashboard}>
      <header>
        <Logo />
        <div id={styles.dropSettings}>
          <button
            id={styles.dropBtn}
            className={styles.svgAction}
            title="Settings"
          >
            <FontAwesomeIcon icon={faUserCircle} />
          </button>
          <ul>
            <Link className={styles.svgAction} to="/dashboard/settings">
              <FontAwesomeIcon icon={faCog} /> Settings
            </Link>
            <li className={styles.svgAction} onClick={handleNotif}>
              <FontAwesomeIcon icon={faUpload} /> Import streams
            </li>
            <li className={styles.svgAction} onClick={handleLogout}>
              <FontAwesomeIcon icon={faSignOut} /> Logout
            </li>
          </ul>
        </div>
      </header>

      {notif.message && (
        <Notification type={notif.type} message={notif.message} />
      )}

      <UserInfo />
      <StreamList initialData={streamData} verified={userData.verified} />
    </div>
  );
}
