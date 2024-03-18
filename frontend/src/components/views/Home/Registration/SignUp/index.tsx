import { useState } from "react";
import { useNavigate } from "react-router";
import { Link } from "react-router-dom";
import { ResMessage } from "shared";
import api from "../../../../../services/api";
import { InputData, local } from "../../../../../utils/helpers";
import AuthForm from "../../../../AuthForm";
import CheckboxField from "../../../../AuthForm/CheckboxField";
const exfields = ["name", "email"];

interface SignProps {
  isExport: boolean;
}

export default function SignUp({ isExport }: SignProps) {
  const [saveStreams, setSaveStreams] = useState(isExport);
  const navigate = useNavigate();

  const sign_up = async (input: InputData): Promise<void> => {
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
    <AuthForm action="Sign up" exfields={exfields} submit={sign_up}>
      <CheckboxField
        label="Export guest streams"
        checked={saveStreams}
        handleChange={handleGStreams}
      />
      {!isExport && (
        <Link to="/register/signin" className="redirLink">
          Already have an acccount?
        </Link>
      )}
    </AuthForm>
  );
}
