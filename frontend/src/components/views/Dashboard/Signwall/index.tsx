import { Link } from "react-router-dom";
import ModalContainer from "../../../ModalContainer";
import styles from "./styles.module.scss";

export default function Signwall() {
  return (
    <ModalContainer id={styles.signwall} predecessor="/dashboard">
      <h2> This feature is only available for verified users.</h2>
      <Link to="/dashboard/export" className="redirLink">
        Create a free account now
      </Link>
    </ModalContainer>
  );
}
