import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { createRoot } from "react-dom/client";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import ErrorBoundary from "./components/ErrorPage";
import ValidateUser from "./components/ValidateUser";

import Dashboard, { dashLoader } from "./components/views/Dashboard";
import ImportUser from "./components/views/Dashboard/ImportUser";
import Signwall from "./components/views/Dashboard/Signwall";
import DeleteStream, {
  deleteStream,
} from "./components/views/Dashboard/StreamList/DeleteStream";
import SymbolList, {
  pairsLoader,
  upsertStream,
} from "./components/views/Dashboard/StreamList/SymbolList";
import UserSettings, {
  nameAction,
} from "./components/views/Dashboard/UserSettings";
import UpdateCredentials from "./components/views/Dashboard/UserSettings/UpdateCredentials";
import ValidationModal from "./components/views/Dashboard/ValidationModal";
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
    element: <ErrorBoundary />,
  },
  {
    path: "/",
    element: <Home />,
    errorElement: <ErrorBoundary />,
    children: [
      {
        path: "register",
        element: <Registration />,
        children: [
          {
            path: "signin",
            element: <SignIn />,
          },
          {
            path: "signup",
            element: <SignUp isExport={false} />,
          },
          {
            path: "validate",
            element: <ValidateUser style="registration" />,
          },
          { path: "reset_password", element: <ResetPassword /> },
        ],
      },
    ],
  },
  {
    path: "/dashboard",
    element: <Dashboard />,
    id: "dash",
    errorElement: <ErrorBoundary />,
    loader: dashLoader(queryClient),
    shouldRevalidate: () => false,
    children: [
      {
        path: "streams/:id?",
        element: <SymbolList />,
        loader: pairsLoader(queryClient),
        action: upsertStream(queryClient),
      },
      {
        path: "export",
        element: <ImportUser />,
      },
      {
        path: "signwall",
        element: <Signwall />,
      },
      {
        path: "validate",
        element: <ValidationModal origin="/dashboard/export" />,
      },

      {
        path: "streams/delete/:id",
        element: <DeleteStream />,
        action: deleteStream(queryClient),
      },
      {
        path: "settings/:id?",
        element: <UserSettings />,
        action: nameAction(queryClient),
        children: [
          {
            path: "password",
            element: <UpdateCredentials type="password" />,
          },
          {
            path: "email",
            element: <UpdateCredentials type="email" />,
          },
          {
            path: "delete",
            element: <UpdateCredentials type="delete" />,
          },

          {
            path: "validate",
            element: <ValidationModal origin="/dashboard/settings" />,
          },
        ],
      },
    ],
  },
]);

root.render(
  <QueryClientProvider client={queryClient}>
    <RouterProvider router={router} />
    <ReactQueryDevtools initialIsOpen={false} position="left" />
  </QueryClientProvider>,
);
