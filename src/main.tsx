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
import CheckOutPage from "./pages/CheckOut";
const DeviceSetupPage = lazy(() => import("./pages/DeviceSetup"));

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
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
            path={PAGE.DEVICE_SET_UP}
            element={
              <Suspense>
                <DeviceSetupPage />
              </Suspense>
            }
          />
          <Route
            path='/check'
            element={
              <Suspense>
                <Layout />
              </Suspense>
            }
          >
            <Route path='in' element={<CheckInPage />} />
            <Route path='out' element={<CheckOutPage />} />
          </Route>
        </Routes>
      </HashRouter>
    </QueryProviders>
    <ToastContainer autoClose={800} />
  </React.StrictMode>
);

// Use contextBridge
window.ipcRenderer.on(
  "main-process-message",
  (_event: any, message: string) => {
    console.log(message);
  }
);
