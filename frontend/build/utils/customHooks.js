import { QueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useNavigate } from "react-router";
import { validateField } from "./helpers";
const useNotification = () => {
    const [notif, setNotif] = useState({
        type: undefined,
        message: "",
    });
    const updateNotif = (message, type) => {
        setNotif({ type, message });
    };
    return { notif, updateNotif };
};
const useCloseModal = (predecessor) => {
    const navigate = useNavigate();
    const closeModal = () => {
        navigate(predecessor);
    };
    return { closeModal };
};
const useLoadError = () => {
    const [error, setError] = useState({
        message: null,
        loading: false,
    });
    const isLoading = (loading, message = null) => {
        setError({ message, loading });
    };
    return { error, isLoading };
};
const useUserInput = () => {
    const [input, setInput] = useState({
        name: "",
        email: "",
        password: "",
        path: null,
    });
    const handleChange = (e) => {
        const { name, value } = e.target;
        setInput((prev) => ({
            ...prev,
            [name]: value,
            path: name,
        }));
    };
    return { input, handleChange };
};
const useLogout = () => {
    const qc = new QueryClient();
    const navigate = useNavigate();
    const handleLogout = () => {
        qc.invalidateQueries(["streams", "user"]);
        localStorage.clear();
        navigate("/");
    };
    return handleLogout;
};
const useInputErrors = () => {
    const [warnings, setWarnings] = useState(null);
    const updateWarnings = (input) => {
        let warning;
        try {
            validateField(input.path, input);
        }
        catch (e) {
            warning = e;
        }
        setWarnings((prev) => ({
            ...prev,
            [input.path]: warning,
        }));
    };
    return { warnings, updateWarnings };
};
export { useCloseModal, useInputErrors, useLoadError, useLogout, useNotification, useUserInput, };
