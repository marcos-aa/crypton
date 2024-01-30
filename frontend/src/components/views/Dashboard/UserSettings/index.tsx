import { QueryClient, useQuery } from "@tanstack/react-query";
import { Outlet, redirect, useActionData } from "react-router";
import type { ActionFunctionArgs } from "react-router-dom";
import { Form, Link } from "react-router-dom";
import api from "../../../../services/api";
import { User } from "../../../../utils/datafetching";
import { local, messages, validateField } from "../../../../utils/helpers";
import InputWarning from "../../../AuthForm/InputField/InputWarning";
import ModalContainer from "../../../ModalContainer";
import ActionAnimation from "../StreamList/ActionAnimation";
import SubmitAction from "../SubmitAction";
import { userQuery } from "../UserInfo";
import styles from "./styles.module.scss";

export interface UserParams extends ActionFunctionArgs {
  params: {
    id: string;
  };
}
export const nameAction =
  (qc: QueryClient) =>
  async ({ request, params }: UserParams) => {
    const formData = await request.formData();
    const name = formData.get("name") as string;

    try {
      validateField("name", { name });
      await api.put("/user/name", {
        name,
      });

      qc.setQueryData(["user", params.id], (cached: User) => {
        const newuser = { ...cached, name };
        return newuser;
      });
    } catch (e) {
      return e;
    }

    return redirect("/dashboard/settings");
  };

export default function UserSettings() {
  const { data: user } = useQuery(userQuery(localStorage.getItem(local.id)));
  const error = useActionData();

  return (
    <ModalContainer predecessor="/dashboard">
      <Outlet />

      <h1 id={styles.settingsTitle} className={styles.title}>
        Settings
      </h1>
      <section className={styles.settingsList}>
        <h2 className={`${styles.minorTitle} ${styles.title}`}>
          Account Settings
        </h2>

        <Form
          id={styles.directUpdate}
          action={`/dashboard/settings/${user.id}`}
          method="put"
        >
          <label htmlFor="name">{user?.name}</label>

          <input type="text" name="name" title="name" />
          <ActionAnimation actpath={`/dashboard/settings/${user.id}`}>
            <SubmitAction title="Update username">Update </SubmitAction>
          </ActionAnimation>

          {error ? <InputWarning message={(error as string) || ""} /> : null}
        </Form>

        <div className={styles.updateField}>
          <p className={styles.credentialField}>
            Email address <span> {user?.email} </span>
          </p>
          <Link
            title="Update user email"
            className="action"
            to="/dashboard/settings/email"
          >
            Change
          </Link>
        </div>

        <div className={styles.updateField}>
          <p className={styles.credentialField}>
            Password <span> {messages.pass} </span>
          </p>
          <Link
            title="Update user email"
            className="action"
            to="/dashboard/settings/password"
          >
            Change
          </Link>
        </div>

        <div id={styles.deleteUser}>
          <Link
            className={styles.deleteAction}
            title="Delete user account"
            to="/dashboard/settings/delete"
          >
            Delete account
          </Link>
        </div>
      </section>
    </ModalContainer>
  );
}
