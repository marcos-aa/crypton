import { Form, useLocation } from "react-router-dom";
import ModalContainer from "../../../../ModalContainer";
import CancellableAction from "../../CancellableAction";
import SubmitAction from "../../SubmitAction";
import styles from "./styles.module.scss";

interface PromptProps {
  question: string;
  actionName: string;
}

export default function ConfirmPrompt({ question, actionName }: PromptProps) {
  const { pathname } = useLocation();

  return (
    <ModalContainer predecessor="/dashboard">
      <Form id={styles.deletionForm} method="delete" action={pathname}>
        <h1> {question} </h1>
        <label>
          <input title="Hide prompt" type="checkbox" name="remember" /> Do not
          ask again
        </label>

        <CancellableAction>
          <SubmitAction>{actionName}</SubmitAction>
        </CancellableAction>
      </Form>
    </ModalContainer>
  );
}
