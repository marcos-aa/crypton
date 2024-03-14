import ModalContainer from "../../../ModalContainer";
import CloseModal from "../../../ModalContainer/CloseModal";
import SignUp from "../../Home/Registration/SignUp";
import styles from "./styles.module.scss";

export default function ExportUser() {
  return (
    <ModalContainer predecessor="/dashboard" id={styles.exportUser}>
      <header>
        <h1> Enjoy crypton to its fullest with a free account </h1>
        <CloseModal predecessor="/dashboard" />
      </header>
      <SignUp isExport={true} />
    </ModalContainer>
  );
}
