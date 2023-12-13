import { AxiosError } from "axios";
import { useRouteError } from "react-router";
import { Link } from "react-router-dom";
import { ResMessage } from "../../utils/datafetching";
import Logo from "../Logo";
import styles from "./styles.module.scss";

export default function ErrorPage() {
  const error = useRouteError() as AxiosError<ResMessage>;

  return (
    <div className="page">
      <section id={styles.errorPage}>
        <Logo isError={true} />
        <h2>Something went wrong {error?.message} </h2>

        <Link to="/register/signin" className="redirLink">
          Back to signin
        </Link>
      </section>
    </div>
  );
}
