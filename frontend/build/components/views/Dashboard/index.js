import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { faCog, faSignOut, faUpload, faUserCircle, } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link, redirect, useLoaderData } from "react-router-dom";
import { useLogout, useNotification } from "../../../utils/customHooks";
import { saveUser, } from "../../../utils/datafetching";
import { local } from "../../../utils/helpers";
import Logo from "../../Logo";
import Notification from "./Notification";
import StreamList, { streamQuery } from "./StreamList";
import UserInfo, { userQuery } from "./UserInfo";
import styles from "./styles.module.scss";
export const dashLoader = (qc) => async () => {
    const [uid, token] = [
        localStorage.getItem(local.id),
        localStorage.getItem(local.token),
    ];
    if (!uid)
        return redirect("/register/signin");
    saveUser(uid, token);
    const { queryFn: streamFn, queryKey: streamKey } = streamQuery(uid !== "guest");
    const { queryFn: userFn, queryKey: userKey } = userQuery(uid);
    try {
        const [streamData, userData] = await Promise.all([
            qc.ensureQueryData({ queryKey: streamKey, queryFn: streamFn }),
            qc.ensureQueryData({ queryKey: userKey, queryFn: userFn }),
        ]);
        return { streamData, userData };
    }
    catch (e) {
        const error = e.response;
        if (error.status == 403) {
            localStorage.removeItem(local.id);
            localStorage.removeItem(local.token);
            return redirect("/register/signin");
        }
        throw { message: error.data?.message || "" };
    }
};
export default function Dashboard() {
    const { streamData, userData } = useLoaderData();
    const { notif, updateNotif } = useNotification();
    const handleLogout = useLogout();
    const handleNotif = () => {
        updateNotif("Importing local streams", "success");
    };
    return (_jsxs("div", { className: "page", id: styles.dashboard, children: [_jsxs("header", { children: [_jsx(Logo, {}), _jsxs("div", { id: styles.dropSettings, children: [_jsx("button", { id: styles.dropBtn, className: styles.svgAction, title: "Settings", children: _jsx(FontAwesomeIcon, { icon: faUserCircle }) }), _jsxs("ul", { children: [_jsxs(Link, { className: styles.svgAction, to: "/dashboard/settings", children: [_jsx(FontAwesomeIcon, { icon: faCog }), " Settings"] }), _jsxs("li", { className: styles.svgAction, onClick: handleNotif, children: [_jsx(FontAwesomeIcon, { icon: faUpload }), " Import streams"] }), _jsxs("li", { className: styles.svgAction, onClick: handleLogout, children: [_jsx(FontAwesomeIcon, { icon: faSignOut }), " Logout"] })] })] })] }), notif.message && (_jsx(Notification, { type: notif.type, message: notif.message })), _jsx(UserInfo, {}), _jsx(StreamList, { initialData: streamData, verified: userData.verified })] }));
}
