import InputWarning from "../AuthForm/InputField/InputWarning"
import Loading from "../Loading"

interface EProps {
  message: string
  loading?: boolean
}

export default function LoadingError({ message, loading }: EProps) {
  return <>{loading ? <Loading /> : <InputWarning message={message} />}</>
}
