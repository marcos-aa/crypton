import { ButtonHTMLAttributes } from "react";

interface SubmitProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  value?: string;
  children: string;
}

export default function SubmitAction(props: SubmitProps) {
  return (
    <button {...props} className="action" type="submit">
      {props.children}
    </button>
  );
}
