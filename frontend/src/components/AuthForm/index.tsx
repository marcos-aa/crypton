import { ReactNode, SyntheticEvent, useEffect, useState } from "react";
import {
  useInputErrors,
  useLoadError,
  useUserInput,
} from "../../utils/customHooks";

import { ResMessage } from "../../utils/datafetching";
import { InputData } from "../../utils/helpers";
import LoadingError from "../LoadingError";
import CheckboxField from "./CheckboxField";
import InputField from "./InputField";
import styles from "./styles.module.scss";

interface FormProps {
  children: ReactNode;
  exfields?: string[];
  validate?: boolean;
  submit(input: InputData): Promise<ResMessage | void>;
}

type PassTypes = "text" | "password";

export default function AuthForm({
  children,
  exfields = ["email"],
  submit,
}: FormProps) {
  const { input, handleChange } = useUserInput();
  const { warnings, updateWarnings } = useInputErrors();
  const { error, isLoading } = useLoadError();
  const [reveal, setReveal] = useState<PassTypes>("password");

  const toggle_pass = () => {
    setReveal((prev) => (prev === "text" ? "password" : "text"));
  };

  const handle_submit = async (e: SyntheticEvent) => {
    e.preventDefault();
    isLoading(true);

    try {
      await submit(input);
    } catch (e) {
      const message: string = e.response?.data?.message || e.message;
      isLoading(false, message);
    }
  };

  useEffect(() => {
    if (!input.path) return;
    const timeoutID = setTimeout(() => {
      updateWarnings(input);
    }, 500);

    return () => {
      clearTimeout(timeoutID);
    };
  }, [input]);

  return (
    <form onSubmit={handle_submit} id={styles.authForm}>
      {exfields.map((field) => {
        return (
          <InputField
            key={field}
            autoComplete={field}
            onChange={handleChange}
            name={field}
            value={input[field]}
            type={field}
            warning={warnings?.[field]}
            required
          />
        );
      })}

      <InputField
        autoComplete={"new-password"}
        onChange={handleChange}
        name="password"
        value={input.password}
        type={reveal}
        warning={warnings?.password}
        required
      />

      <CheckboxField label="Show password" handleChange={toggle_pass} />
      <LoadingError loading={error.loading} message={error.message} />

      {children}
    </form>
  );
}
