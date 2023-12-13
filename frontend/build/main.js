import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { createRoot } from "react-dom/client";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import ErrorBoundary from "./components/ErrorPage";
import ValidateUser from "./components/ValidateUser";
import ModalContainer from "./components/ModalContainer";
import Dashboard, { dashLoader } from "./components/views/Dashboard";
import DeleteStream, { deleteStream, } from "./components/views/Dashboard/StreamList/DeleteStream";
import SymbolList, { currenciesLoader, upsertStream, } from "./components/views/Dashboard/StreamList/SymbolList";
import UserSettings, { nameAction, } from "./components/views/Dashboard/UserSettings";
import UpdateCredentials from "./components/views/Dashboard/UserSettings/UpdateCredentials";
import Home from "./components/views/Home";
import Registration from "./components/views/Home/Registration";
import ResetPassword from "./components/views/Home/Registration/ResetPassword";
import SignIn from "./components/views/Home/Registration/SignIn";
import SignUp from "./components/views/Home/Registration/SignUp";
import "./styles/global.css";
const container = document.getElementById("root");
const root = createRoot(container);
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false,
        },
    },
});
const router = createBrowserRouter([
    {
        path: "*",
        element: _jsx(ErrorBoundary, {}),
    },
    {
        path: "/",
        element: _jsx(Home, {}),
        errorElement: _jsx(ErrorBoundary, {}),
        children: [
            {
                path: "register",
                element: _jsx(Registration, {}),
                children: [
                    {
                        path: "signin",
                        element: _jsx(SignIn, {}),
                    },
                    {
                        path: "signup",
                        element: _jsx(SignUp, {}),
                    },
                    {
                        path: "validate",
                        element: _jsx(ValidateUser, { style: "registration" }),
                    },
                    { path: "reset_password", element: _jsx(ResetPassword, {}) },
                ],
            },
        ],
    },
    {
        path: "/dashboard",
        element: _jsx(Dashboard, {}),
        id: "dash",
        errorElement: _jsx(ErrorBoundary, {}),
        loader: dashLoader(queryClient),
        shouldRevalidate: () => false,
        children: [
            {
                path: "stream/:id?",
                element: _jsx(SymbolList, {}),
                loader: currenciesLoader(queryClient),
                action: upsertStream(queryClient),
            },
            {
                path: "stream/delete/:id",
                element: _jsx(DeleteStream, {}),
                action: deleteStream(queryClient),
            },
            {
                path: "settings/:id?",
                element: _jsx(UserSettings, {}),
                action: nameAction(queryClient),
                children: [
                    {
                        path: "password",
                        element: _jsx(UpdateCredentials, { type: "password" }),
                    },
                    {
                        path: "email",
                        element: _jsx(UpdateCredentials, { type: "email" }),
                    },
                    {
                        path: "delete",
                        element: _jsx(UpdateCredentials, { type: "delete" }),
                    },
                    {
                        path: "validate",
                        element: (_jsx(ModalContainer, { id: "innerModal", predecessor: "/dashboard/settings", children: _jsx(ValidateUser, {}) })),
                    },
                ],
            },
        ],
    },
]);
root.render(_jsxs(QueryClientProvider, { client: queryClient, children: [_jsx(RouterProvider, { router: router }), _jsx(ReactQueryDevtools, { initialIsOpen: false, position: "left" })] }));
