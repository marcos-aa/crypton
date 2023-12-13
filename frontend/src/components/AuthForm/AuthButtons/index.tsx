import { ReactNode } from "react";

interface ActionProps {
  children?: ReactNode;
  action: string;
}

export default function AuthButtons({ children, action }: ActionProps) {
  return (
    <div id="actions">
      {children}
      <button type="submit" className="action fullwd">
        {action}
      </button>
    </div>
  );
}
