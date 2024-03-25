import { useNavigate } from "react-router";
import { Link } from "react-router-dom";
import AuthForm from "../../../../AuthForm";

import { UserData } from "shared/usertypes";
import api from "../../../../../services/api";
import { saveHeader } from "../../../../../utils/datafetching";
import { InputData } from "../../../../../utils/helpers";

export default function SignIn() {
  const navigate = useNavigate();

  const signIn = async (input: InputData) => {
    const { data, status } = await api.put<UserData>("/user", {
      email: input.email,
      password: input.password,
    });

    saveHeader(data.accessToken);

    if (status == 202)
      return navigate("/register/validate", {
        state: {
          email: input.email,
        },
      });

    navigate("/dashboard");
  };

  return (
    <AuthForm submit={signIn} action="Sign in">
      <Link to="/register/reset_password" className="redirLink">
        Forgot password?
      </Link>
      <Link to="/register/signup" className="redirLink">
        Dont have an account?
      </Link>
    </AuthForm>
  );
}
