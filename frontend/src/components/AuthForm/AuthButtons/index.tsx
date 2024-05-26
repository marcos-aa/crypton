import { ReactNode } from "react"

interface ActionProps {
  children?: ReactNode
  action: string
  invalid: boolean
}

export default function AuthButtons({
  children,
  action,
  invalid,
}: ActionProps) {
  return (
    <div id="actions">
      {children?.[0]}
      <button
        disabled={invalid}
        type="submit"
        data-cy="submitForm"
        className="action fullwd"
      >
        {action}
      </button>
      {!children?.[0] ? children : children?.[1]}
    </div>
  )
}
