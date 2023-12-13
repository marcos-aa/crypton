import { NavLink, Outlet } from "react-router-dom";
import ModalContainer from "../../../ModalContainer";
import CloseModal from "../../../ModalContainer/CloseModal";
import styles from "./styles.module.scss";

export default function Registration() {
  return (
    <ModalContainer predecessor="/">
      <section id={styles.register}>
        <CloseModal predecessor="/" />
        <h1>
          Enjoy fully customizable streams with a
          <NavLink
            to="/register/signin"
            className={({ isActive }) =>
              isActive ? `${styles.active} ${styles.navlink}` : styles.navlink
            }
          >
            verified account
          </NavLink>
          or
          <NavLink
            to="/register/signup"
            className={({ isActive }) =>
              isActive ? `${styles.active} ${styles.navlink}` : styles.navlink
            }
          >
            create a new one
          </NavLink>
          now!
        </h1>
        <Outlet />
      </section>
    </ModalContainer>
  );
}
