import { jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
import InputWarning from "../AuthForm/InputField/InputWarning";
import Loading from "../Loading";
export default function LoadingError({ message, loading }) {
    return _jsx(_Fragment, { children: loading ? _jsx(Loading, {}) : _jsx(InputWarning, { message: message }) });
}
