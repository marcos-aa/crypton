import { useQuery } from "@tanstack/react-query";
import { memo } from "react";
import { SymNumbers, User, getUser } from "../../../../utils/datafetching";
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
  symData: SymNumbers;
}

function UserInfo({ initialData, symData }: InfoProps) {
  const { data: user } = useQuery({
    ...userQuery(initialData.id),
    initialData,
    refetchOnWindowFocus: false,
  });
  const createdAt = new Date(`${user?.created_at}`);

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
          Total streams: <span> {symData.tstreams} </span>
        </p>
        <p aria-label="created at" role="listitem" className={styles.infoItem}>
          Total symbols: <span> {symData.tsyms} </span>
        </p>
        <p aria-label="created at" role="listitem" className={styles.infoItem}>
          Unique symbols: <span> {symData.usyms} </span>
        </p>
        <p aria-label="created at" role="listitem" className={styles.infoItem}>
          Joined at
          <span>
            {createdAt.getUTCDate()}/{createdAt.getUTCMonth() + 1}/
            {createdAt.getUTCFullYear()}
          </span>
        </p>
      </div>
    </section>
  );
}

export default memo(UserInfo);
