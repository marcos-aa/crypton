import { jsx as _jsx } from "react/jsx-runtime";
export default function SubmitAction(props) {
    return (_jsx("button", { ...props, className: "action", type: "submit", children: props.children }));
}
