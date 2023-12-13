import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useNavigate } from "react-router";
import { Link } from "react-router-dom";
import AuthForm from "../../../../AuthForm";
import api from "../../../../../services/api";
import { saveUser, } from "../../../../../utils/datafetching";
import { validateForm } from "../../../../../utils/helpers";
import AuthButtons from "../../../../AuthForm/AuthButtons";
export default function SignIn() {
    const navigate = useNavigate();
    const sign_in = async (input) => {
        validateForm(input);
        const { data, status } = await api.put("/user", {
            email: input.email,
            password: input.password,
        });
        if (status === 202)
            return navigate("/register/validate", {
                state: {
                    newmail: input.email,
                },
            });
        saveUser(data.user.id, data.access_token);
        navigate("/dashboard");
    };
    return (_jsxs(AuthForm, { validate: false, submit: sign_in, children: [_jsx(AuthButtons, { action: "Sign in", children: _jsx(Link, { to: "/register/reset_password", className: "redirLink", children: "Forgot password?" }) }), _jsx(Link, { to: "/register/signup", className: "redirLink", children: "Dont have an account?" })] }));
}
