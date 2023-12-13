import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/* eslint-disable @typescript-eslint/ban-ts-comment */
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { Link } from "react-router-dom";
import api from "../../services/api";
import { useLoadError } from "../../utils/customHooks";
import { saveUser } from "../../utils/datafetching";
import { stopPropagation } from "../../utils/helpers";
import AuthButtons from "../AuthForm/AuthButtons";
import ErrorResponse from "../LoadingError";
import styles from "./styles.module.scss";
export default function ValidateUser({ style }) {
    const { state } = useLocation();
    const [code, setCode] = useState("");
    const { error, isLoading } = useLoadError();
    const navigate = useNavigate();
    const handleResend = async () => {
        isLoading(true);
        try {
            const { data } = await api.post("/user/code", {
                email: state.newmail,
            });
            isLoading(false, data.message);
        }
        catch (e) {
            const message = e.response.data.message;
            isLoading(false, message);
        }
    };
    const handleValidation = async (e) => {
        e.preventDefault();
        isLoading(false);
        try {
            const { data } = await api.put("/user/validate", {
                code,
                newmail: state.newmail,
            });
            saveUser(data.user.id, data.access_token);
            navigate("/dashboard");
        }
        catch (e) {
            console.log(e);
            const message = e.response.data.message;
            isLoading(false, message);
        }
    };
    return (_jsxs("form", { id: styles[style] || "credModalForm", className: styles.validationData, onSubmit: handleValidation, onClick: stopPropagation, children: [_jsx("h3", { children: " Place the verification code sent to your email below. " }), _jsx("input", { type: "text", name: "code", placeholder: "Email verification code", onChange: (event) => setCode(event.target.value) }), _jsx(ErrorResponse, { loading: error.loading, message: error.message }), _jsx(AuthButtons, { action: "Validate", children: _jsx("button", { type: "button", onClick: handleResend, children: "Resend code" }) }), _jsx(Link, { to: -1, title: "Cancel", id: styles.exitButton, children: _jsx(FontAwesomeIcon, { icon: faArrowLeft }) })] }));
}
