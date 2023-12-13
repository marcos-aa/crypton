import { HTMLAttributes } from "react";
import InputWarning from "./InputWarning";
import styles from "./styles.module.scss";

export interface InputProps extends HTMLAttributes<HTMLInputElement> {
  name: string;
  value: string;
  autoComplete?: string;
  warning?: string;
  type?: string;
  label?: string;
  required: boolean;
}

export default function InputField({
  onChange,
  name,
  value,
  label,
  warning,
  ...props
}: InputProps) {
  return (
    <>
      <label className={styles.authLabel}>
        {label ?? name}
        <input onChange={onChange} name={name} value={value} {...props} />
      </label>
      {warning && <InputWarning message={warning} />}
    </>
  );
}
