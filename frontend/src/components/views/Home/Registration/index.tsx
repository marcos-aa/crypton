import { NavLink, Outlet } from "react-router-dom"
import ModalContainer from "../../../ModalContainer"
import CloseModal from "../../../ModalContainer/CloseModal"
import styles from "./styles.module.scss"

export default function Registration() {
  return (
    <ModalContainer predecessor="/">
      <section id={styles.register}>
        <CloseModal predecessor="/" />
        <nav>
          <NavLink
            to="/register/signin"
            className={({ isActive }) =>
              isActive ? `${styles.active} ${styles.navlink}` : styles.navlink
            }
          >
            Sign In
          </NavLink>
          <NavLink
            to="/register/signup"
            className={({ isActive }) =>
              isActive ? `${styles.active} ${styles.navlink}` : styles.navlink
            }
          >
            Sign Up
          </NavLink>
        </nav>
        <Outlet />
      </section>
    </ModalContainer>
  )
}
