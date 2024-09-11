import React, { Suspense } from "react";
import ReactDOM from "react-dom/client";
import { lazy } from "react";
import { HashRouter, Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import QueryProviders from "./utils/queryClientProvider";
const Layout = lazy(() => import("@components/Layout"));
const GatePage = lazy(() => import("./pages/Gate"));
import Login from "./pages/Login";
import PAGE from "../url";
const SelectGateTypePage = lazy(() => import("./pages/SelectGateType"));
const DeviceSetupPage = lazy(() => import("./pages/DeviceSetup"));
import { Provider } from "react-redux";
import { store } from "@utils/store";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import moment from "moment-timezone";
import "moment/locale/vi";
import RouteFallBack from "@components/RouteFallBack";
const CardCheckerPage = lazy(() => import("./pages/CardChecker"));
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Provider store={store}>
      <HashRouter>
        <QueryProviders>
          <LocalizationProvider
            dateAdapter={AdapterMoment}
            dateLibInstance={moment}
            adapterLocale='vi'
          >
            <Routes>
              <Route path='/' element={<Login />} />
              <Route
                path={PAGE.SELECT_GATE_TYPE}
                element={
                  <Suspense fallback={<RouteFallBack />}>
                    <SelectGateTypePage />
                  </Suspense>
                }
              />
              <Route
                element={
                  <Suspense fallback={<RouteFallBack />}>
                    <Layout />
                  </Suspense>
                }
              >
                <Route
                  path={PAGE.GATE}
                  element={
                    <Suspense fallback={<RouteFallBack />}>
                      <GatePage />
                    </Suspense>
                  }
                />
              </Route>
              <Route
                path={PAGE.DEVICE_SET_UP}
                element={
                  <Suspense fallback={<RouteFallBack />}>
                    <DeviceSetupPage />
                  </Suspense>
                }
              />
              <Route
                path='/card'
                element={
                  <Suspense fallback={<RouteFallBack />}>
                    <Layout />
                  </Suspense>
                }
              >
                <Route
                  path='check'
                  element={
                    <Suspense fallback={<RouteFallBack />}>
                      <CardCheckerPage />
                    </Suspense>
                  }
                />
              </Route>
            </Routes>
          </LocalizationProvider>
        </QueryProviders>
      </HashRouter>
      <ToastContainer autoClose={1000} />
    </Provider>
  </React.StrictMode>
);
