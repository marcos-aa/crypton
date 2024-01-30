import { SyntheticEvent } from "react";
import styles from "./styles.module.scss";

interface ToggleProps {
  label: string;
  handleChange?(e: SyntheticEvent): void;
  checked?: boolean;
}

export default function CheckboxField({
  handleChange,
  label,
  checked,
}: ToggleProps) {
  return (
    <label className={styles.toggleField}>
      <input
        name="prompt"
        type="checkbox"
        onChange={handleChange}
        checked={checked}
      />
      <span>{label}</span>
    </label>
  );
}
