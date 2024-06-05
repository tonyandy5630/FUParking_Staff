import React from "react";
import ReactDOM from "react-dom/client";
import Login from "./pages/Login";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import QueryProviders from "./utils/queryClientProvider";
import MachineSetupPage from "./pages/MachineSetup";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryProviders>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<Login />} />
          <Route path='/setup' element={<MachineSetupPage />} />
        </Routes>
      </BrowserRouter>
    </QueryProviders>
    <ToastContainer />
  </React.StrictMode>
);

// Use contextBridge
(window as any).ipcRenderer.on(
  "main-process-message",
  (_event: any, message: string) => {
    console.log(message);
  }
);
