import React, { Suspense } from "react";
import ReactDOM from "react-dom/client";
import { lazy } from "react";
import { HashRouter, Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import QueryProviders from "./utils/queryClientProvider";
const Layout = lazy(() => import("@components/Layout"));
const CheckInPage = lazy(() => import("./pages/CheckIn"));
import Login from "./pages/Login";
import PAGE from "../url";
const CheckOutPage = lazy(() => import("./pages/CheckOut"));
const SelectGateTypePage = lazy(() => import("./pages/SelectGateType"));
const DeviceSetupPage = lazy(() => import("./pages/DeviceSetup"));
import { Provider } from "react-redux";
import { store } from "@utils/store";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import moment from "moment-timezone";
import "moment/locale/vi";
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
                  <Suspense>
                    <SelectGateTypePage />
                  </Suspense>
                }
              />
              <Route
                path={PAGE.DEVICE_SET_UP}
                element={
                  <Suspense>
                    <DeviceSetupPage />
                  </Suspense>
                }
              />
              <Route
                path='/card'
                element={
                  <Suspense>
                    <Layout />
                  </Suspense>
                }
              >
                <Route
                  path='check'
                  element={
                    <Suspense fallback={<p>Loading...</p>}>
                      <CardCheckerPage />
                    </Suspense>
                  }
                />
              </Route>
              <Route
                path='/check'
                element={
                  <Suspense>
                    <Layout />
                  </Suspense>
                }
              >
                <Route
                  path='in'
                  element={
                    <Suspense fallback={<p>Loading...</p>}>
                      <CheckInPage />
                    </Suspense>
                  }
                />
                <Route
                  path='out'
                  element={
                    <Suspense>
                      <CheckOutPage />
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
