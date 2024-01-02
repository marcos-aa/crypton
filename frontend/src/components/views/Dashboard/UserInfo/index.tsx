import { useQuery } from "@tanstack/react-query";
import { User, getUser } from "../../../../utils/datafetching";
import styles from "./styles.module.scss";

export const userQuery = (id: string) => ({
  queryKey: ["user", id],
  queryFn: async () => {
    const user = getUser(id);
    return user;
  },
});

interface InfoProps {
  initialData: User;
  id: string;
}

export default function UserInfo({ initialData, id }: InfoProps) {
  const { data: user } = useQuery({
    ...userQuery(id),
    initialData,
    refetchOnWindowFocus: false,
  });
  const uDates = {
    createdAt: new Date(`${user?.created_at}`),
    lastSession: new Date(`${user?.last_session}`),
  };

  return (
    <section className={`${styles.userData} ${styles.panel}`}>
      <h2
        role="listitem"
        className={`${styles.infoItem} ${styles.name}`}
        aria-label="name"
      >
        {user?.name}
      </h2>

      <div className={styles.userInfo} role="list">
        <p aria-label="created at" role="listitem" className={styles.infoItem}>
          Joined at
          <span>
            {uDates.createdAt.getUTCDate()}/{uDates.createdAt.getUTCMonth() + 1}
            /{uDates.createdAt.getUTCFullYear()}
          </span>
        </p>
        <p
          aria-label="last session"
          role="listitem"
          className={styles.infoItem}
        >
          Last login
          <span>
            {uDates.lastSession.getUTCDate()}/
            {uDates.lastSession.getUTCMonth() + 1}/
            {uDates.lastSession.getUTCFullYear()}
          </span>
        </p>
      </div>
    </section>
  );
}
