import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useNavigate } from "react-router";
import { Link } from "react-router-dom";
import api from "../../../../../services/api";
import { ResMessage } from "../../../../../utils/datafetching";
import { InputData, validateForm } from "../../../../../utils/helpers";
import AuthForm from "../../../../AuthForm";
import AuthButtons from "../../../../AuthForm/AuthButtons";

export default function ResetPassword() {
  const navigate = useNavigate();

  const reset_password = async (
    input: InputData,
  ): Promise<ResMessage | void> => {
    validateForm(input);
    await api.put<ResMessage>("/user/password", {
      email: input.email,
      password: input.password,
    });

    navigate("/register/validate", {
      state: {
        newmail: input.email,
      },
    });
  };

  return (
    <AuthForm validate={true} submit={reset_password}>
      <AuthButtons action="Reset password" />
      <Link to="/register/signin" title="Return to sign in">
        <FontAwesomeIcon icon={faArrowLeft} />
      </Link>
    </AuthForm>
  );
}
