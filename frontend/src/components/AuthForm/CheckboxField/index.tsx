import { SyntheticEvent } from "react";
import styles from "./styles.module.scss";

interface ToggleProps {
  handleChange(e: SyntheticEvent): void;
  label: string;
  checked?: boolean;
}

export default function CheckboxField({
  handleChange,
  label,
  checked,
}: ToggleProps) {
  return (
    <label className={styles.toggleField}>
      <input type="checkbox" onChange={handleChange} checked={checked} />
      <span>{label}</span>
    </label>
  );
}
