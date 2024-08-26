import React, { Suspense } from "react";
import ReactDOM from "react-dom/client";
import { lazy } from "react";
import { HashRouter, Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import QueryProviders from "./utils/queryClientProvider";
const Layout = lazy(() => import("@components/Layout"));
const CheckInPage = lazy(() => import("./pages/CheckIn"));
const MachineSetupPage = lazy(() => import("./pages/MachineSetup"));
import Login from "./pages/Login";
import PAGE from "../url";
const CheckOutPage = lazy(() => import("./pages/CheckOut"));
const SelectGateTypePage = lazy(() => import("./pages/SelectGateType"));
const DeviceSetupPage = lazy(() => import("./pages/DeviceSetup"));
import { Provider } from "react-redux";
import { store } from "@utils/store";
const CardCheckerPage = lazy(() => import("./pages/CardChecker"));
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Provider store={store}>
      <QueryProviders>
        <HashRouter>
          <Routes>
            <Route path='/' element={<Login />} />
            <Route
              path={PAGE.CODE_SET_UP}
              element={
                <Suspense fallback={<p>Loading...</p>}>
                  <MachineSetupPage />
                </Suspense>
              }
            />
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
        </HashRouter>
      </QueryProviders>
      <ToastContainer autoClose={800} />
    </Provider>
  </React.StrictMode>
);

// Use contextBridge
window.ipcRenderer.on(
  "main-process-message",
  (_event: any, message: string) => {
    console.log(message);
  }
);
