import { useQuery } from "@tanstack/react-query";
import { memo } from "react";
import { StreamData } from "shared/streamtypes";
import { UIUser } from "shared/usertypes";
import { getUser } from "../../../../utils/datafetching";
import { local } from "../../../../utils/helpers";
import FullDate from "./FullDate";
import styles from "./styles.module.scss";

export const userQuery = (token: string) => ({
  queryKey: ["user", token],
  queryFn: async () => {
    const user = getUser(token);
    return user;
  },
});

interface InfoProps extends Pick<StreamData, "tstreams" | "tsyms" | "usyms"> {
  initialData: UIUser;
}

function UserInfo({ initialData, tsyms, tstreams, usyms }: InfoProps) {
  const { data: user } = useQuery({
    ...userQuery(localStorage.getItem(local.token)),
    initialData,
    refetchOnWindowFocus: false,
    staleTime: 3600000,
  });

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
        <FullDate
          hour={false}
          title="Joined at"
          style={styles.infoItem}
          date={user.createdAt}
        />

        <p role="listitem" className={styles.infoItem}>
          Total streams: <span> {tstreams} </span>
        </p>
        <p role="listitem" className={styles.infoItem}>
          Total symbols: <span> {tsyms} </span>
        </p>
        <p role="listitem" className={styles.infoItem}>
          Unique symbols: <span> {usyms} </span>
        </p>
      </div>
    </section>
  );
}

export default memo(UserInfo);
