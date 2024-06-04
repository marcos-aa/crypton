import { faArrowLeft } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { UIUser, UserData } from "@shared/types"
import { useQueryClient } from "@tanstack/react-query"
import { SyntheticEvent, useState } from "react"
import { useLocation, useNavigate } from "react-router"
import { Link } from "react-router-dom"
import api from "../../services/api"
import { useLoadError } from "../../utils/customHooks"
import { saveHeader } from "../../utils/datafetching"
import { impGuestStreams, local, stopPropagation } from "../../utils/helpers"
import AuthButtons from "../AuthForm/AuthButtons"
import ErrorResponse from "../LoadingError"
import styles from "./styles.module.scss"

interface ValidationState {
  email: string
  id: string
  type?: "email" | "password"
}

interface ValidationProps {
  style?: string
}

export default function ValidateUser({ style }: ValidationProps) {
  const qc = useQueryClient()
  const { state }: { state: ValidationState } = useLocation()
  const [code, setCode] = useState("")
  const { error, isLoading } = useLoadError()
  const navigate = useNavigate()

  const handleResend = async () => {
    isLoading(true)

    try {
      const { data } = await api.post<string>("/user/code", state)
      isLoading(false, data)
    } catch (e) {
      const message: string = e.response.data
      isLoading(false, message)
    }
  }

  const handleValidation = async (e: SyntheticEvent) => {
    e.preventDefault()
    isLoading(true)

    try {
      const { data } = await api.put<UserData>("/user/validate", {
        code,
        email: state.email,
      })

      saveHeader(data.accessToken)
      qc.setQueryData<UIUser>(["user"], () => data.user)

      if (localStorage.getItem(local.expStreams))
        impGuestStreams(qc, data.user.id)

      navigate("/dashboard")
    } catch (e) {
      const message: string = e.response.data
      isLoading(false, message)
    }
  }

  const goBack = () => navigate(-1)

  return (
    <form
      id={styles[style] || "credModalForm"}
      className={styles.validationData}
      onSubmit={handleValidation}
      onClick={stopPropagation}
    >
      <h3> Type or paste the verification code sent to your email here </h3>
      <input
        type="text"
        name="code"
        placeholder="Email verification code"
        onChange={(event) => setCode(event.target.value)}
        data-cy="emailCode"
      />

      <ErrorResponse loading={error.loading} message={error.message} />
      <AuthButtons action="Validate" invalid={code.length < 4}>
        <button
          className="redirLink"
          type="button"
          onClick={handleResend}
          data-cy="resendCode"
        >
          Resend code
        </button>
      </AuthButtons>

      <button
        title="Cancel"
        id={styles.exitButton}
        type="button"
        onClick={goBack}
      >
        <FontAwesomeIcon icon={faArrowLeft} />
      </button>
    </form>
  )
}
