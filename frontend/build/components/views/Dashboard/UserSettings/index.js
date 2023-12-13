import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useQuery } from "@tanstack/react-query";
import { Outlet, redirect, useActionData } from "react-router";
import { Form, Link } from "react-router-dom";
import api from "../../../../services/api";
import { local, messages, validateField } from "../../../../utils/helpers";
import InputWarning from "../../../AuthForm/InputField/InputWarning";
import ModalContainer from "../../../ModalContainer";
import Signwall from "../Signwall";
import ActionAnimation from "../StreamList/ActionAnimation";
import SubmitAction from "../SubmitAction";
import { userQuery } from "../UserInfo";
import styles from "./styles.module.scss";
export const nameAction = (qc) => async ({ request, params }) => {
    const formData = await request.formData();
    const name = formData.get("name");
    try {
        validateField("name", { name });
        await api.put("/user/name", {
            name,
        });
        qc.setQueryData(["user", params.id], (cached) => {
            const newuser = { ...cached, name };
            return newuser;
        });
    }
    catch (e) {
        return e;
    }
    return redirect("/dashboard/settings");
};
export default function UserSettings() {
    const { data: user } = useQuery(userQuery(localStorage.getItem(local.id)));
    const error = useActionData();
    return (_jsxs(ModalContainer, { predecessor: "/dashboard", children: [!user?.verified && _jsx(Signwall, {}), _jsx(Outlet, {}), _jsx("h1", { id: styles.settingsTitle, className: styles.title, children: "Settings" }), _jsxs("section", { className: styles.settingsList, children: [_jsx("h2", { className: `${styles.minorTitle} ${styles.title}`, children: "Account Settings" }), _jsxs(Form, { id: styles.directUpdate, action: `/dashboard/settings/${user.id}`, method: "put", children: [_jsx("label", { htmlFor: "name", children: user?.name }), _jsx("input", { type: "text", name: "name", title: "name" }), _jsx(ActionAnimation, { actpath: `/dashboard/settings/${user.id}`, children: _jsx(SubmitAction, { title: "Update username", children: "Update " }) }), error ? _jsx(InputWarning, { message: error || "" }) : null] }), _jsxs("div", { className: styles.updateField, children: [_jsxs("p", { className: styles.credentialField, children: ["Email address ", _jsxs("span", { children: [" ", user?.email, " "] })] }), _jsx(Link, { title: "Update user email", className: "action", to: "/dashboard/settings/email", children: "Change" })] }), _jsxs("div", { className: styles.updateField, children: [_jsxs("p", { className: styles.credentialField, children: ["Password ", _jsxs("span", { children: [" ", messages.pass, " "] })] }), _jsx(Link, { title: "Update user email", className: "action", to: "/dashboard/settings/password", children: "Change" })] }), _jsx("div", { id: styles.deleteUser, children: _jsx(Link, { className: styles.deleteAction, title: "Delete user account", to: "/dashboard/settings/delete", children: "Delete account" }) })] })] }));
}
