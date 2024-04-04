import { ReactNode } from "react"
import { useNavigation } from "react-router"
import Loading from "../../../../Loading"

interface LoadingProps {
  children: ReactNode
  small?: boolean
  actpath: string
}

export default function ActionAnimation({ children, actpath }: LoadingProps) {
  const { state, location } = useNavigation()
  return (
    <>
      {state !== "idle" && location.pathname === actpath ? (
        <Loading />
      ) : (
        children
      )}
    </>
  )
}
