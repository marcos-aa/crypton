import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useNavigate } from "react-router";
import { Link } from "react-router-dom";
import api from "../../../../../services/api";
import { validateForm } from "../../../../../utils/helpers";
import AuthForm from "../../../../AuthForm";
import AuthButtons from "../../../../AuthForm/AuthButtons";
export default function ResetPassword() {
    const navigate = useNavigate();
    const reset_password = async (input) => {
        validateForm(input);
        await api.put("/user/password", {
            email: input.email,
            password: input.password,
        });
        navigate("/register/validate", {
            state: {
                newmail: input.email,
            },
        });
    };
    return (_jsxs(AuthForm, { validate: true, submit: reset_password, children: [_jsx(AuthButtons, { action: "Reset password" }), _jsx(Link, { to: "/register/signin", title: "Return to sign in", children: _jsx(FontAwesomeIcon, { icon: faArrowLeft }) })] }));
}
