import Logo from "../../../Logo";
import ModalContainer from "../../../ModalContainer";
import CloseModal from "../../../ModalContainer/CloseModal";
import SignUp from "../../Home/Registration/SignUp";
import styles from "./styles.module.scss";

export default function Signwall() {
  return (
    <ModalContainer id={styles.signwall} predecessor="/dashboard">
      <header>
        <Logo />
        <CloseModal predecessor="/dashboard" />
      </header>

      <h2> Create a free account to enjoy fully customizable streams! </h2>
      <SignUp isExport={true} />
    </ModalContainer>
  );
}
