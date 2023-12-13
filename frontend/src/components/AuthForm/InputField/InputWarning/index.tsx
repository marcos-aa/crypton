interface Props {
  message: string;
}

export default function InputWarning({ message }: Props) {
  return (
    <span aria-label="Invalid input" aria-live="assertive" className="warning">
      {message}
    </span>
  );
}
