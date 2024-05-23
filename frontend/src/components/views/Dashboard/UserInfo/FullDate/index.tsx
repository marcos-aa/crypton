interface DateProps {
  date: Date
  title: string
  style?: string
  hour: boolean
}

export default function FullDate({ date, style, title, hour }: DateProps) {
  const dateObj = new Date(date)
  const DMYFormmated = dateObj.toLocaleDateString("en-UK")

  return (
    <p className={style}>
      {title}
      <span data-cy="joinDate">
        {hour && `${dateObj.getHours()}:${dateObj.getUTCMinutes()} -`}
        {DMYFormmated}
      </span>
    </p>
  )
}
