import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Form as RouterForm, redirect, useLocation } from "react-router-dom";
import api from "../../../../../services/api";
import { delTicks, filterStreams, queryTicks, } from "../../../../../utils/helpers";
import ModalContainer from "../../../../ModalContainer";
import CancellableAction from "../../CancellableAction";
import SubmitAction from "../../SubmitAction";
import styles from "./styles.module.scss";
export const deleteStream = (qc) => async ({ request, params }) => {
    const formData = await request.formData();
    const remember = formData.get("remember");
    if (remember)
        localStorage.setItem("u:prompt_delete", "off");
    const ticks = { newticks: [], delticks: [] };
    qc.setQueryData(["streams"], (cached) => {
        const newcount = { ...cached.symcount };
        const { streams, oldstream } = filterStreams(params.id, cached.streams);
        ticks.delticks = delTicks(oldstream?.symbols, newcount);
        return { ...cached, streams, symcount: newcount };
    });
    setTimeout(() => {
        api
            .delete("/stream", {
            data: {
                id: "asfasfjh3",
            },
        })
            .catch(() => {
            const url = new URL(window.location.origin + window.location.pathname);
            url.searchParams.set("newticks", JSON.stringify(ticks.delticks));
            history.replaceState({}, "", url);
            qc.invalidateQueries(["streams"]);
        });
    }, 5000);
    const delurl = queryTicks(ticks.delticks, "?delticks");
    return redirect(`/dashboard` + delurl);
};
export default function DeleteStream() {
    const { pathname } = useLocation();
    return (_jsx(ModalContainer, { predecessor: "/dashboard", children: _jsxs(RouterForm, { id: styles.deletionForm, method: "delete", action: pathname, children: [_jsx("h1", { children: " Do you wish to delete this stream? " }), _jsxs("label", { children: [_jsx("input", { title: "Hide prompt", type: "checkbox", name: "remember" }), " Do not ask again"] }), _jsx(CancellableAction, { children: _jsx(SubmitAction, { children: "Delete" }) })] }) }));
}
