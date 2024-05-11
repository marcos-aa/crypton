import { IconDefinition } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Link, LinkProps } from "react-router-dom"

interface IconLink extends LinkProps {
  title: string
  icon: IconDefinition
}
export default function IconLink({ to, title, icon, ...props }: IconLink) {
  return (
    <Link replace title={title} to={to} {...props}>
      <FontAwesomeIcon icon={icon} />
    </Link>
  )
}
