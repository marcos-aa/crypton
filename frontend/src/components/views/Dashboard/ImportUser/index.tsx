import ModalContainer from "../../../ModalContainer";
import SignUp from "../../Home/Registration/SignUp";
import styles from "./styles.module.scss";
export default function ImportUser() {
  return (
    <ModalContainer predecessor="/dashboard" id={styles.importUser}>
      <h1> Enjoy crypton to its fullest with a free account </h1>
      <SignUp isExport={true} />
    </ModalContainer>
  );
}
