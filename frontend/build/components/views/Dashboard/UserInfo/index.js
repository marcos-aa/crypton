import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useQuery } from "@tanstack/react-query";
import { useLoaderData } from "react-router";
import { getUser } from "../../../../utils/datafetching";
import styles from "./styles.module.scss";
export const userQuery = (id) => ({
    queryKey: ["user", id],
    queryFn: async () => {
        const user = await getUser(id);
        return user;
    },
});
export default function UserInfo() {
    const { userData: initialData } = useLoaderData();
    const { data: user } = useQuery({
        ...userQuery(initialData.id),
        initialData,
        refetchOnWindowFocus: false,
    });
    const uDates = {
        createdAt: new Date(`${user?.created_at}`),
        lastSession: new Date(`${user?.last_session}`),
    };
    return (_jsxs("section", { className: `${styles.userData} ${styles.panel}`, children: [_jsx("h2", { role: "listitem", className: `${styles.infoItem} ${styles.name}`, "aria-label": "name", children: user?.name }), _jsxs("div", { className: styles.userInfo, role: "list", children: [_jsxs("p", { "aria-label": "created at", role: "listitem", className: styles.infoItem, children: ["Joined at", _jsxs("span", { children: [uDates.createdAt.getUTCDate(), "/", uDates.createdAt.getUTCMonth() + 1, "/", uDates.createdAt.getUTCFullYear()] })] }), _jsxs("p", { "aria-label": "last session", role: "listitem", className: styles.infoItem, children: ["Last login", _jsxs("span", { children: [uDates.lastSession.getUTCDate(), "/", uDates.lastSession.getUTCMonth() + 1, "/", uDates.lastSession.getUTCFullYear()] })] })] })] }));
}
