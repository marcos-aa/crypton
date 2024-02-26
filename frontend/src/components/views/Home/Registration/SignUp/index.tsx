import { useState } from "react";
import { useNavigate } from "react-router";
import { Link } from "react-router-dom";
import api from "../../../../../services/api";
import { InputData, local, validateForm } from "../../../../../utils/helpers";
import AuthForm from "../../../../AuthForm";
import AuthButtons from "../../../../AuthForm/AuthButtons";
import CheckboxField from "../../../../AuthForm/CheckboxField";
import { ResMessage } from "shared";
const exfields = ["name", "email"];

interface SignProps {
  isExport: boolean;
}

export default function SignUp({ isExport }: SignProps) {
  const [saveStreams, setSaveStreams] = useState(isExport);
  const navigate = useNavigate();

  const sign_up = async (input: InputData): Promise<void> => {
    if (validateForm(input, "signup")) return;

    await api.post<ResMessage>("/user", {
      name: input.name,
      email: input.email,
      password: input.password,
    });

    if (saveStreams) localStorage.setItem(local.expStreams, "true");
    const destination = `/${isExport ? "dashboard" : "register"}/validate`;

    navigate(destination, {
      state: { newmail: input.email },
    });
  };

  const handleGStreams = () => setSaveStreams(!saveStreams);

  return (
    <AuthForm exfields={exfields} validate={true} submit={sign_up}>
      <AuthButtons action="Create account">
        <CheckboxField
          label="Export guest streams"
          checked={saveStreams}
          handleChange={handleGStreams}
        />
      </AuthButtons>
      {!isExport && (
        <Link to="/register/signin" className="redirLink">
          Already have an acccount?
        </Link>
      )}
    </AuthForm>
  );
}
