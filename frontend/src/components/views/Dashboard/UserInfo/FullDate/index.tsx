interface DateProps {
  date: Date;
  title: string;
  style?: string;
  hour: boolean;
}

export default function FullDate({ date, style, title, hour }: DateProps) {
  return (
    <p aria-label="created at" role="listitem" className={style}>
      {title}
      <span>
        {hour && `${date.getHours()}:${date.getUTCMinutes()} -`}{" "}
        {date.getUTCDate()}/{date.getUTCMonth() + 1}/{date.getUTCFullYear()}
      </span>
    </p>
  );
}
