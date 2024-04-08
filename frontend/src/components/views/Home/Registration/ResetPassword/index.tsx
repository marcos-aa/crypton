import { faArrowLeft } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { useNavigate } from "react-router"
import { Link } from "react-router-dom"
import { ResMessage } from "shared"
import api from "../../../../../services/api"
import { saveHeader } from "../../../../../utils/datafetching"
import { InputData } from "../../../../../utils/helpers"
import AuthForm from "../../../../AuthForm"

export default function ResetPassword() {
  const navigate = useNavigate()

  const resetPassword = async (
    input: InputData
  ): Promise<ResMessage | void> => {
    const { data } = await api.put<ResMessage>("/user/password", {
      email: input.email,
      password: input.password,
    })

    saveHeader(data.message)
    navigate("/register/validate", {
      state: {
        email: input.email,
        type: "password",
      },
    })
  }

  return (
    <AuthForm action="Reset password" submit={resetPassword}>
      <Link to="/register/signin" title="Return to sign in">
        <FontAwesomeIcon icon={faArrowLeft} />
      </Link>
    </AuthForm>
  )
}
