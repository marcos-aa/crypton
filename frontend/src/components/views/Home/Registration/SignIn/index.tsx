import { useNavigate } from "react-router"
import { Link } from "react-router-dom"
import AuthForm from "../../../../AuthForm"

import { UIUser, UserData } from "@shared/types"
import { useQueryClient } from "@tanstack/react-query"
import api from "../../../../../services/api"
import { saveHeader } from "../../../../../utils/datafetching"
import { InputData } from "../../../../../utils/helpers"

export default function SignIn() {
  const qc = useQueryClient()
  const navigate = useNavigate()

  const signIn = async (input: InputData) => {
    const { data } = await api.put<UserData | string>("/user", {
      email: input.email,
      password: input.password,
    })

    if (typeof data === "string") {
      return navigate("/register/validate", {
        state: {
          email: input.email,
          id: data,
        },
      })
    }

    saveHeader(data.accessToken)
    qc.setQueryData<UIUser>(["user"], () => data.user)
    navigate("/dashboard")
  }

  return (
    <AuthForm submit={signIn} action="Sign in">
      <Link to="/register/reset_password" className="redirLink">
        Forgot password?
      </Link>
      <Link to="/register/signup" className="redirLink">
        Dont have an account?
      </Link>
    </AuthForm>
  )
}
