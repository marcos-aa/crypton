import api from "../services/api";
import { countSymbols, local } from "./helpers";
export const udata = {
    id: "guest",
    name: "Guest",
    email: "No email",
    created_at: new Date(),
    last_session: new Date(),
    verified: false,
};
export const saveUser = (id, token) => {
    localStorage.setItem(local.id, id);
    localStorage.setItem(local.token, token);
    api.defaults.headers.common.id = id;
    api.defaults.headers.common.authorization = `Bearer ${token}`;
};
const guestData = () => {
    const joinDate = new Date(localStorage.getItem(local.joined)) ?? new Date();
    const udata = {
        id: "guest",
        name: "Guest",
        email: "No email",
        created_at: joinDate,
        last_session: new Date(),
        verified: false,
    };
    saveUser(udata.id);
    return udata;
};
const getUser = async (id) => {
    if (id === "guest")
        return guestData();
    const { data } = await api.get("/user");
    saveUser(id, data.access_token);
    return data.user;
};
const getStreams = async () => {
    try {
        const { data } = await api.get("/stream");
        return {
            streams: data.streams,
            symcount: data.symcount,
            tickers: data.tickers,
        };
    }
    catch (e) {
        return { streams: [], symcount: {}, tickers: {} };
    }
};
const getLocalStreams = async () => {
    const streams = JSON.parse(localStorage.getItem(local.streams)) || [];
    const { symbols, symcount } = countSymbols(streams);
    try {
        const { data } = await api.get("/tickers", {
            params: {
                symbols,
            },
        });
        return { streams, symcount, tickers: data };
    }
    catch (e) {
        return { streams, symcount, tickers: {} };
    }
};
const getCurrencies = async () => {
    try {
        const { data: currencies } = await api.get("/currencies");
        return currencies;
    }
    catch (e) {
        return "Something went wrong. Verify your connection and try again.";
    }
};
export { getCurrencies, getLocalStreams, getStreams, getUser };
