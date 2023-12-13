import { QueryClient } from "@tanstack/react-query";
import { ChangeEvent, useState } from "react";
import { useNavigate } from "react-router";
import { InputData, validateField } from "./helpers";

type InputValidation = InputData & { path: string };

const useNotification = () => {
  const [notif, setNotif] = useState<{
    type?: "success" | "error";
    message: string;
  }>({
    type: undefined,
    message: "",
  });

  const updateNotif = (message: string, type?: "error" | "success") => {
    setNotif({ type, message });
  };

  return { notif, updateNotif };
};
const useCloseModal = (predecessor: string) => {
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

  const isLoading = (loading: boolean, message: string = null) => {
    setError({ message, loading });
  };

  return { error, isLoading };
};

const useUserInput = () => {
  const [input, setInput] = useState<InputValidation>({
    name: "",
    email: "",
    password: "",
    path: null,
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
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
  const [warnings, setWarnings] = useState<InputData | null>(null);

  const updateWarnings = (input: InputValidation) => {
    let warning: string;
    try {
      validateField(input.path, input);
    } catch (e) {
      warning = e as string;
    }

    setWarnings((prev) => ({
      ...prev,
      [input.path]: warning,
    }));
  };

  return { warnings, updateWarnings };
};

export {
  useCloseModal,
  useInputErrors,
  useLoadError,
  useLogout,
  useNotification,
  useUserInput,
};
