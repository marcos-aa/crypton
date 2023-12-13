import { useNavigate } from "react-router";
import { Link } from "react-router-dom";
import AuthForm from "../../../../AuthForm";

import api from "../../../../../services/api";
import {
  ResData,
  ResMessage,
  saveUser,
} from "../../../../../utils/datafetching";
import { InputData, validateForm } from "../../../../../utils/helpers";
import AuthButtons from "../../../../AuthForm/AuthButtons";

export default function SignIn() {
  const navigate = useNavigate();

  const sign_in = async (input: InputData): Promise<ResMessage | void> => {
    validateForm(input);
    const { data, status } = await api.put<ResData>("/user", {
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
    <AuthForm validate={false} submit={sign_in}>
      <AuthButtons action="Sign in">
        <Link to="/register/reset_password" className="redirLink">
          Forgot password?
        </Link>
      </AuthButtons>
      <Link to="/register/signup" className="redirLink">
        Dont have an account?
      </Link>
    </AuthForm>
  );
}
