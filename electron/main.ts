import {
  GET_GATE_IN_ID_CHANNEL,
  GET_GATE_OUT_ID_CHANNEL,
  GET_GATE_TYPE_CHANNEL,
  GET_NOT_FIRST_TIME_CHANNEL,
  GET_PARKING_AREA_ID_CHANNEL,
  GO_BACK_CHANNEL,
  LOGGED_IN,
  OPEN_ERROR_DIALOG_CHANNEL,
  SET_GATE_CHANNEL,
  SET_NOT_FIRST_TIME_CHANNEL,
  SET_PARKING_AREA_ID_CHANNEL,
  TO_CHECK_IN_CHANNEL,
  TO_CHECK_OUT_CHANNEL,
  TO_DEVICE_SETUP_CHANNEL,
} from "../channel";
import { app, BrowserWindow, Menu, dialog, ipcMain, MenuItem } from "electron";
import { fileURLToPath } from "node:url";
import path from "node:path";
import dotenv from "dotenv";
import loginMenuItems from "./menu/loginMenuItems";
import dotenvExpand from "dotenv-expand";
import PAGE from "../url";
import { loadURL } from "./utils/electron_utils";
import Store from "electron-store";
import ElectronStore from "electron-store";
import { GATE_IN, GATE_OUT } from "../src/constants/gate.const";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

if (process.resourcesPath) {
  dotenvExpand.expand(
    dotenv.config({ path: path.join(process.resourcesPath, ".env") })
  );
}
// The built directory structure
//
// ├─┬─┬ dist
// │ │ └── index.html
// │ │
// │ ├─┬ dist-electron
// │ │ ├── main.js
// │ │ └── preload.mjs
// │
process.env.APP_ROOT = path.join(__dirname, "..");

// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
export const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
export const MAIN_DIST = path.join(process.env.APP_ROOT, "dist-electron");
export const RENDERER_DIST = path.join(process.env.APP_ROOT, "dist");
export const BASE_URL = "http://localhost:" + process.env.PORT;

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL
  ? path.join(process.env.APP_ROOT, "public")
  : RENDERER_DIST;

let win: BrowserWindow | null;
let store: ElectronStore | null;

function createWindow() {
  const logoURL = path.join(__dirname, "../src/assets/Bai_Logo.png");
  win = new BrowserWindow({
    icon: path.join(logoURL),
    webPreferences: {
      preload: path.join(__dirname, "preload.mjs"),
      nodeIntegration: true,
    },
    title: "Bai Parking System",
  });

  win.once("ready-to-show", () => {
    win?.show();
    win?.maximize();
    store = new Store();
    console.log(store.path);
  });
  try {
    if (VITE_DEV_SERVER_URL) {
      win.loadURL(VITE_DEV_SERVER_URL);
      win.webContents.openDevTools();
    } else {
      // win.loadFile(path.join(RENDERER_DIST, "index.html"));
      win.loadFile(path.join(__dirname, "../dist/index.html"));
    }
  } catch (error) {
    console.error("Failed to load content:", error);
  }
}
//#region IPC MAIN
ipcMain.on(GO_BACK_CHANNEL, () => {
  win?.webContents.goBack();
});

ipcMain.on(TO_CHECK_IN_CHANNEL, () => {
  loadURL(PAGE.CHECK_IN);
});

ipcMain.on(TO_CHECK_OUT_CHANNEL, () => {
  loadURL(PAGE.CHECK_OUT);
});

ipcMain.on(TO_DEVICE_SETUP_CHANNEL, () => {
  loadURL(PAGE.DEVICE_SET_UP);
});

ipcMain.on(OPEN_ERROR_DIALOG_CHANNEL, (e) => {
  dialog.showErrorBox("Error", "Something went wrong");
});

ipcMain.on(SET_NOT_FIRST_TIME_CHANNEL, (_, isFirstTime: boolean) => {
  if (!store) {
    dialog.showErrorBox("Error", "Error in set store");
    return;
  }
  store.set("notFirstTime", isFirstTime);
});

ipcMain.handle(GET_NOT_FIRST_TIME_CHANNEL, () => {
  if (!store) {
    dialog.showErrorBox("Error", "Error in set store");
    return;
  }
  return store.get("notFirstTime", false);
});

ipcMain.on(SET_GATE_CHANNEL, (e, gate: { id: string; type: string }) => {
  if (!store) {
    dialog.showErrorBox("Error", "Error in getting store");
    return;
  }
  if (!gate.id || !gate.type) {
    dialog.showErrorBox("Select Gate", "Gate is not selected");
    return;
  }
  if (gate.type === GATE_IN)
    store.set({
      gateInId: gate.id,
      gateType: gate.type,
    });
  else if (gate.type === GATE_OUT) {
    store.set({
      gateOutId: gate.id,
      gateType: gate.type,
    });
  } else {
    dialog.showErrorBox("Gate is invalid", "Gate cannot be set");
  }
});

ipcMain.handle(GET_GATE_TYPE_CHANNEL, (e) => {
  if (!store) {
    dialog.showErrorBox("Error", "Error in getting store");
    return;
  }
  return store.get("gateType");
});

ipcMain.handle(GET_GATE_IN_ID_CHANNEL, (event: any) => {
  if (!store) {
    dialog.showErrorBox("Error", "Error in getting store");
    return;
  }
  return store.get("gateInId");
});

ipcMain.handle(GET_GATE_OUT_ID_CHANNEL, (event: any) => {
  if (!store) {
    dialog.showErrorBox("Error", "Error in getting store");
    return;
  }
  return store.get("gateOutId");
});

ipcMain.on(SET_PARKING_AREA_ID_CHANNEL, (_, parkingId: string) => {
  if (!store) {
    dialog.showErrorBox("Error", "Error in getting store");
    return;
  }

  store.set("parkingAreaId", parkingId);
});

ipcMain.handle(GET_PARKING_AREA_ID_CHANNEL, (_) => {
  if (!store) {
    dialog.showErrorBox("Error", "Error in getting store");
    return;
  }

  return store.get("parkingAreaId", "");
});

ipcMain.on(LOGGED_IN, (e: any, isLoggedIn: any) => {
  if (!win) {
    return;
  }

  if (!isLoggedIn) {
    return;
  }

  const loggedInMenu = loginMenuItems(win, store);
  if (loggedInMenu === undefined) return;

  const gateInMenuItem = loggedInMenu[1].submenu[0] as Partial<MenuItem>;
  const gateOutMenuItem = loggedInMenu[1].submenu[1] as Partial<MenuItem>;
  const cardCheckerMenuItem = loggedInMenu[2].submenu[0] as Partial<MenuItem>;
  const missingCardMenuITem = loggedInMenu[2].submenu[1] as Partial<MenuItem>;

  gateInMenuItem.enabled = true;
  gateOutMenuItem.enabled = true;
  cardCheckerMenuItem.enabled = true;
  cardCheckerMenuItem.enabled = true;
  missingCardMenuITem.enabled = true;
  const menu = Menu.buildFromTemplate(loggedInMenu);
  Menu.setApplicationMenu(menu);
});
//#endregion

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
    win = null;
  }
});

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app
  .whenReady()
  .then(() => {
    createWindow();
    if (!win) return;

    const loginMenu = loginMenuItems(win, store);
    if (loginMenu.length === 0) {
      Promise.reject();
    }
    const menu = Menu.buildFromTemplate(loginMenu);
    Menu.setApplicationMenu(menu);
  })
  .catch(() => {
    dialog.showErrorBox("System error", "Something went wrong");
  });
