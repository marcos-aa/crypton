/* eslint-disable @typescript-eslint/ban-ts-comment */
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useQueryClient } from "@tanstack/react-query";
import { SyntheticEvent, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { Link } from "react-router-dom";
import { ResMessage } from "shared";
import { UIUser, UserData } from "shared/usertypes";
import api from "../../services/api";
import { useLoadError } from "../../utils/customHooks";
import { saveHeader } from "../../utils/datafetching";
import { importGStreams, local, stopPropagation } from "../../utils/helpers";
import AuthButtons from "../AuthForm/AuthButtons";
import ErrorResponse from "../LoadingError";
import styles from "./styles.module.scss";

interface ValidationState {
  email: string;
}

interface ValidationProps {
  style?: string;
}

export default function ValidateUser({ style }: ValidationProps) {
  const qc = useQueryClient();
  const { state }: { state: ValidationState } = useLocation();
  const [code, setCode] = useState("");
  const { error, isLoading } = useLoadError();
  const navigate = useNavigate();

  const handleResend = async () => {
    isLoading(true);

    try {
      const { data } = await api.post<ResMessage>("/user/code", {
        email: state.email,
      });
      isLoading(false, data.message);
    } catch (e) {
      const message: string = e.response.data.message;
      isLoading(false, message);
    }
  };

  const handleValidation = async (e: SyntheticEvent) => {
    e.preventDefault();
    isLoading(false);

    try {
      const { data } = await api.put<UserData>("/user/validate", {
        code,
        email: state.email,
      });

      saveHeader(data.accessToken);
      qc.setQueryData<UIUser>(["user"], () => data.user);

      if (localStorage.getItem(local.expStreams))
        importGStreams(qc, data.user.id);

      navigate("/dashboard");
    } catch (e) {
      const message: string = e.response.data.message;
      isLoading(false, message);
    }
  };

  return (
    <form
      id={styles[style] || "credModalForm"}
      className={styles.validationData}
      onSubmit={handleValidation}
      onClick={stopPropagation}
    >
      <h3> Place the verification code sent to your email below. </h3>
      <input
        type="text"
        name="code"
        placeholder="Email verification code"
        onChange={(event) => setCode(event.target.value)}
      />
      <ErrorResponse loading={error.loading} message={error.message} />
      <AuthButtons action="Validate" invalid={code.length < 4}>
        <button className="redirLink" type="button" onClick={handleResend}>
          Resend code
        </button>
      </AuthButtons>

      {/* @ts-ignore */}
      <Link to={-1} title="Cancel" id={styles.exitButton}>
        <FontAwesomeIcon icon={faArrowLeft} />
      </Link>
    </form>
  );
}
