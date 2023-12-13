import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { useInputErrors, useLoadError, useUserInput, } from "../../utils/customHooks";
import LoadingError from "../LoadingError";
import CheckboxField from "./CheckboxField";
import InputField from "./InputField";
import styles from "./styles.module.scss";
export default function AuthForm({ children, exfields = ["email"], submit, }) {
    const { input, handleChange } = useUserInput();
    const { warnings, updateWarnings } = useInputErrors();
    const { error, isLoading } = useLoadError();
    const [reveal, setReveal] = useState("password");
    const toggle_pass = () => {
        setReveal((prev) => (prev === "text" ? "password" : "text"));
    };
    const handle_submit = async (e) => {
        e.preventDefault();
        isLoading(true);
        try {
            await submit(input);
        }
        catch (e) {
            const message = e.response?.data?.message || e.message;
            isLoading(false, message);
        }
    };
    useEffect(() => {
        if (!input.path)
            return;
        const timeoutID = setTimeout(() => {
            updateWarnings(input);
        }, 500);
        return () => {
            clearTimeout(timeoutID);
        };
    }, [input]);
    return (_jsxs("form", { onSubmit: handle_submit, id: styles.authForm, children: [exfields.map((field) => {
                return (_jsx(InputField, { autoComplete: field, onChange: handleChange, name: field, value: input[field], type: field, warning: warnings?.[field], required: true }, field));
            }), _jsx(InputField, { autoComplete: "new-password", onChange: handleChange, name: "password", value: input.password, type: reveal, warning: warnings?.password, required: true }), _jsx(CheckboxField, { label: "Show password", handleChange: toggle_pass }), _jsx(LoadingError, { loading: error.loading, message: error.message }), children] }));
}
