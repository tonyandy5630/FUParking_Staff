import dotenv from "dotenv";
import url, { fileURLToPath } from "node:url";
import path from "node:path";
import { BrowserWindow } from "electron";
import { BASE_URL } from "../main";
import PAGE from "../../url";
import ElectronStore from "electron-store";
import { GATE_IN, GATE_OUT } from "../../src/constants/gate.const";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config();

function loginMenuItems(
  win: BrowserWindow | null,
  store: ElectronStore | null
) {
  if (win === null) {
    return [];
  }
  return [
    {
      label: "Settings",
      submenu: [
        {
          label: "Update Machine Code",
          enable: true,
          click: () => {
            if (process.env.NODE_ENV === "development") {
              win.webContents.loadURL(BASE_URL + "#" + PAGE.CODE_SET_UP);
            } else {
              const redirectURL = url.format({
                pathname: path.join(__dirname, "../dist/index.html"),
                hash: PAGE.CODE_SET_UP,
                protocol: "file:",
                slashes: true,
              });
              win.webContents.loadURL(redirectURL);
            }
          },
        },
        {
          label: "Device Setup",
          enable: true,
          click: () => {
            if (process.env.NODE_ENV === "development") {
              win.webContents.loadURL(BASE_URL + "#" + PAGE.DEVICE_SET_UP);
            } else {
              const redirectURL = url.format({
                pathname: path.join(__dirname, "../dist/index.html"),
                hash: PAGE.DEVICE_SET_UP,
                protocol: "file:",
                slashes: true,
              });
              win.webContents.loadURL(redirectURL);
            }
          },
        },
      ],
    },
    {
      label: "Change gate",
      submenu: [
        {
          label: "Cổng vào",
          enabled: false,
          click: () => {
            if (store) store.set("gateType", GATE_IN);
            if (process.env.NODE_ENV === "development") {
              win.webContents.loadURL(BASE_URL + "#" + PAGE.CHECK_IN);
            } else {
              const redirectURL = url.format({
                pathname: path.join(__dirname, "../dist/index.html"),
                hash: PAGE.CHECK_IN,
                protocol: "file:",
                slashes: true,
              });
              win.webContents.loadURL(redirectURL);
            }
          },
        },
        {
          label: "Cổng ra",
          enabled: false,
          click: () => {
            if (store) store.set("gateType", GATE_OUT);
            if (process.env.NODE_ENV === "development") {
              win.webContents.loadURL(BASE_URL + "#" + PAGE.CHECK_OUT);
            } else {
              const redirectURL = url.format({
                pathname: path.join(__dirname, "../dist/index.html"),
                hash: PAGE.CHECK_OUT,
                protocol: "file:",
                slashes: true,
              });
              if (store) store.set("gateType", GATE_OUT);

              win.webContents.loadURL(redirectURL);
            }
          },
        },
      ],
    },
  ];
}

export default loginMenuItems;
