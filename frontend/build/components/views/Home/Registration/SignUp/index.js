import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { useNavigate } from "react-router";
import { Link } from "react-router-dom";
import api from "../../../../../services/api";
import { local, validateForm } from "../../../../../utils/helpers";
import AuthForm from "../../../../AuthForm";
import AuthButtons from "../../../../AuthForm/AuthButtons";
import CheckboxField from "../../../../AuthForm/CheckboxField";
const exfields = ["name", "email"];
export default function SignUp() {
    const [saveStreams, setSaveStreams] = useState(false);
    const navigate = useNavigate();
    const sign_up = async (input) => {
        validateForm(input, "signup");
        await api.post("/user", {
            name: input.name,
            email: input.email,
            password: input.password,
        });
        const streams = JSON.parse(localStorage.getItem(local.streams));
        if (saveStreams && streams.length > 0) {
            api.post("/stream/import", {
                streams,
            });
            localStorage.removeItem(local.streams);
        }
        navigate("/register/validate", {
            state: { newmail: input.email },
        });
    };
    const handle_check = () => setSaveStreams(!saveStreams);
    return (_jsxs(AuthForm, { exfields: exfields, validate: true, submit: sign_up, children: [_jsx(AuthButtons, { action: "Create account", children: _jsx(CheckboxField, { label: "Import local streams", checked: saveStreams, handleChange: handle_check }) }), _jsx(Link, { to: "/register/signin", className: "redirLink", children: "Already have an acccount?" })] }));
}
