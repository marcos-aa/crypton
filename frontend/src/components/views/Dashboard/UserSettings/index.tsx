import { UIUser } from "@shared/types"
import { QueryClient, useQuery } from "@tanstack/react-query"
import { Outlet, redirect, useActionData } from "react-router"
import type { ActionFunctionArgs } from "react-router-dom"
import { Form, Link } from "react-router-dom"
import api from "../../../../services/api"
import { local, messages, validateField } from "../../../../utils/helpers"
import InputWarning from "../../../AuthForm/InputField/InputWarning"
import ModalContainer from "../../../ModalContainer"
import CloseModal from "../../../ModalContainer/CloseModal"
import ActionAnimation from "../StreamList/ActionAnimation"
import SubmitAction from "../SubmitAction"
import { userQuery } from "../UserInfo"
import styles from "./styles.module.scss"

export interface UserParams extends ActionFunctionArgs {
  params: {
    id: string
  }
}

export const nameAction =
  (qc: QueryClient) =>
  async ({ request }: UserParams) => {
    const formData = await request.formData()
    const name = (formData.get("name") as string).trim()

    try {
      validateField("name", { name })
      await api.put("/user/name", {
        name,
      })

      qc.setQueryData<UIUser>(["user"], (cached) => {
        const newuser = { ...cached, name }
        return newuser
      })
    } catch (e) {
      return e
    }

    return redirect("/dashboard/settings")
  }

export default function UserSettings() {
  const verified = localStorage.getItem(local.token) !== "guest"
  const { data: user } = useQuery(userQuery(verified))
  const error = useActionData()
  const credState = { id: user?.id, email: user?.email, verified }

  return (
    <ModalContainer predecessor="/dashboard">
      <Outlet />
      <header id={styles.settingsHeader}>
        <h1 id={styles.settingsTitle} className={styles.title}>
          Settings
        </h1>
        <CloseModal predecessor="/dashboard" />
      </header>

      <section className={styles.settingsList}>
        <h2 className={`${styles.minorTitle} ${styles.title}`}>
          Account Settings
        </h2>

        <Form
          id={styles.directUpdate}
          action="/dashboard/settings"
          method="put"
        >
          <label htmlFor="name" data-cy="nameLabel">
            {user?.name}
          </label>

          <input type="text" name="name" id="name" autoComplete="name" />
          <ActionAnimation actpath="/dashboard/settings">
            <SubmitAction title="Update username">Update </SubmitAction>
          </ActionAnimation>

          {error ? <InputWarning message={(error as string) || ""} /> : null}
        </Form>

        <div className={styles.updateField}>
          <p className={styles.credentialField}>
            Email address <span> {user?.email} </span>
          </p>
          <Link
            title="Update email"
            className="action"
            to="/dashboard/settings/email"
            state={credState}
            data-cy="changeEmail"
          >
            Change
          </Link>
        </div>

        <div className={styles.updateField}>
          <p className={styles.credentialField}>
            Password <span> {messages.pass} </span>
          </p>
          <Link
            title="Update password"
            className="action"
            to="/dashboard/settings/password"
            state={credState}
            data-cy="changePassword"
          >
            Change
          </Link>
        </div>

        <div id={styles.deleteUser}>
          <Link
            className={styles.deleteAction}
            title="Delete account"
            to="/dashboard/settings/delete"
            data-cy="deleteAccount"
            state={{ verified }}
          >
            Delete account
          </Link>
        </div>
      </section>
    </ModalContainer>
  )
}
