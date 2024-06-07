import React from "react";
import ReactDOM from "react-dom/client";
import Login from "./pages/Login";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import QueryProviders from "./utils/queryClientProvider";
import MachineSetupPage from "./pages/MachineSetup";
import CheckInPage from "./pages/CheckIn";
import Layout from "@components/Layout";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryProviders>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<Login />} />
          <Route path='/setup' element={<MachineSetupPage />} />
          <Route path='/check' element={<Layout />}>
            <Route path='in' element={<CheckInPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
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
