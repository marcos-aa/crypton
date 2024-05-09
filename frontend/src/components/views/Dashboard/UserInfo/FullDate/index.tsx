interface DateProps {
  date: Date
  title: string
  style?: string
  hour: boolean
}

export default function FullDate({ date, style, title, hour }: DateProps) {
  const join = new Date(date)
  return (
    <p className={style}>
      {title}
      <span>
        {hour && `${join.getHours()}:${join.getUTCMinutes()} -`}{" "}
        {join.getUTCDate()}/{join.getUTCMonth() + 1}/{join.getUTCFullYear()}
      </span>
    </p>
  )
}
