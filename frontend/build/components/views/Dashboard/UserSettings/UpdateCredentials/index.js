import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { useNavigate, useRouteLoaderData } from "react-router";
import api from "../../../../../services/api";
import { useLogout } from "../../../../../utils/customHooks";
import { validateForm } from "../../../../../utils/helpers";
import AuthForm from "../../../../AuthForm";
import AuthButtons from "../../../../AuthForm/AuthButtons";
import ModalContainer from "../../../../ModalContainer";
import CloseModal from "../../../../ModalContainer/CloseModal";
import styles from "./styles.module.scss";
const formMessages = {
    email: "A validation code will be sent to your new email address.",
    password: "Type in your new password",
    delete: "This will permanently delete all your data from our servers.",
};
export default function UpdateCredentials({ type }) {
    const { userData: user } = useRouteLoaderData("dash");
    const handleLogout = useLogout();
    const navigate = useNavigate();
    const toValidation = (newmail) => {
        navigate("/dashboard/settings/validate", {
            state: {
                newmail,
            },
        });
    };
    const requests = {
        email: async (input) => {
            validateForm(input);
            await api.put("/user/email", {
                email: user?.email,
                newmail: input.email,
                password: input.password,
            });
            toValidation(input.email);
        },
        password: async (input) => {
            validateForm(input, "password");
            await api.put("/user/password", {
                email: user?.email,
                password: input.password,
            });
            toValidation(input.email);
        },
        delete: async (input) => {
            validateForm(input, "password");
            await api.delete("/user", {
                data: {
                    password: input.password,
                },
            });
            handleLogout();
        },
    };
    return (_jsx(ModalContainer, { id: "innerModal", predecessor: "/dashboard/settings", children: _jsxs("div", { id: "credModalForm", children: [_jsxs("header", { id: styles.credHeader, children: [_jsxs("h3", { id: styles.credTitle, children: [" ", formMessages[type], " "] }), _jsx(CloseModal, { predecessor: `/dashboard/settings/${type}` })] }), _jsx(AuthForm, { exfields: type === "email" ? ["email"] : [], submit: requests[type], children: _jsx(AuthButtons, { action: type === "delete" ? "Delete user" : `Update ${type}` }) })] }) }));
}
