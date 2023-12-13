import { jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
import { useNavigation } from "react-router";
import Loading from "../../../../Loading";
export default function ActionAnimation({ children, actpath, small, }) {
    const navigation = useNavigation();
    return (_jsx(_Fragment, { children: navigation.state !== "idle" &&
            navigation.location.pathname === actpath ? (_jsx(Loading, { small: small })) : (children) }));
}
