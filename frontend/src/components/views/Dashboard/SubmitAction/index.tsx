import { ButtonHTMLAttributes, ReactNode } from "react"

interface SubmitProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  value?: string
  children: ReactNode
}

export default function SubmitAction(props: SubmitProps) {
  return (
    <button {...props} className="action" type="submit" data-cy="submitBtn">
      {props.children}
    </button>
  )
}
