import { useNavigate } from "react-router";
import { Link } from "react-router-dom";
import AuthForm from "../../../../AuthForm";

import { ResMessage } from "shared";
import { UserData } from "shared/usertypes";
import api from "../../../../../services/api";
import { saveUser } from "../../../../../utils/datafetching";
import { InputData } from "../../../../../utils/helpers";

export default function SignIn() {
  const navigate = useNavigate();

  const sign_in = async (input: InputData): Promise<ResMessage | void> => {
    const { data, status } = await api.put<UserData>("/user", {
      email: input.email,
      password: input.password,
    });

    if (status === 202)
      return navigate("/register/validate", {
        state: {
          newmail: input.email,
        },
      });

    saveUser(data.user.id, data.access_token);
    navigate("/dashboard");
  };

  return (
    <AuthForm submit={sign_in} action="Sign in">
      <Link to="/register/reset_password" className="redirLink">
        Forgot password?
      </Link>
      <Link to="/register/signup" className="redirLink">
        Dont have an account?
      </Link>
    </AuthForm>
  );
}
