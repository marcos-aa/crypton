import { ReactNode } from "react";
import { useNavigation } from "react-router";
import Loading from "../../../../Loading";

interface LoadingProps {
  children: ReactNode;
  small?: boolean;
  actpath: string;
}

export default function ActionAnimation({
  children,
  actpath,
  small,
}: LoadingProps) {
  const navigation = useNavigation();
  return (
    <>
      {navigation.state !== "idle" &&
      navigation.location.pathname === actpath ? (
        <Loading small={small} />
      ) : (
        children
      )}
    </>
  );
}
