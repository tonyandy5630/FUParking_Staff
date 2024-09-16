import type { GateType } from "@my_types/gate";
import {
  GET_CAMERA_LEFT_OTHER_CHANNEL,
  GET_CAMERA_LEFT_PLATE_CHANNEL,
  GET_CAMERA_RIGHT_OTHER_CHANNEL,
  GET_CAMERA_RIGHT_PLATE_CHANNEL,
  GET_GATE_ID_CHANNEL,
  GET_IS_2_LANE_CHANNEL,
  GET_LEFT_LANE_CHANNEL,
  GET_LOG_IN_CHANNEL,
  GET_NOT_FIRST_TIME_CHANNEL,
  GET_PARKING_AREA_ID_CHANNEL,
  GET_RIGHT_LANE_CHANNEL,
  GO_BACK_CHANNEL,
  LOG_OUT_CHANNEL,
  LOGGED_IN,
  OPEN_ERROR_DIALOG_CHANNEL,
  SET_CAMERA_LEFT_OTHER_CHANNEL,
  SET_CAMERA_LEFT_PLATE_CHANNEL,
  SET_CAMERA_RIGHT_OTHER_CHANNEL,
  SET_CAMERA_RIGHT_PLATE_CHANNEL,
  SET_GATE_CHANNEL,
  SET_IS_2_LANE_CHANNEL,
  SET_LEFT_LANE_CHANNEL,
  SET_NOT_FIRST_TIME_CHANNEL,
  SET_PARKING_AREA_ID_CHANNEL,
  SET_RIGHT_LANE_CHANNEL,
} from "../channel";
import { app, BrowserWindow, Menu, dialog, ipcMain, MenuItem } from "electron";
import { fileURLToPath } from "node:url";
import path from "node:path";
import MenuItems, { LoggedInMenuItems } from "./menu/loginMenuItems";
import Store from "electron-store";
import ElectronStore from "electron-store";
import { GATE_IN, GATE_OUT } from "../src/constants/gate.const";
import {
  GATE_ID_KEY,
  IS_2_LANE_KEY,
  LEFT_LANE_KEY,
  LEFT_OTHER_CAMERA_ID_KEY,
  LEFT_PLATE_CAMERA_ID_KEY,
  LOGGED_IN_KEY,
  NOT_FIRST_TIME_KEY,
  PARKING_AREA_ID_KEY,
  RIGHT_LANE_KEY,
  RIGHT_OTHER_CAMERA_ID_KEY,
  RIGHT_PLATE_CAMERA_ID_KEY,
} from "./store/keys";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

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
const PORT = import.meta.env.VITE_PORT;

// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
export const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
export const MAIN_DIST = path.join(process.env.APP_ROOT, "dist-electron");
export const RENDERER_DIST = path.join(process.env.APP_ROOT, "dist");
export const BASE_URL = "http://localhost:" + PORT;

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

ipcMain.on(OPEN_ERROR_DIALOG_CHANNEL, (e) => {
  dialog.showErrorBox("Error", "Something went wrong");
});

ipcMain.on(SET_NOT_FIRST_TIME_CHANNEL, (_, isFirstTime: boolean) => {
  if (!store) {
    dialog.showErrorBox("Error", "Error in set store");
    return;
  }
  store.set(NOT_FIRST_TIME_KEY, isFirstTime);
});

ipcMain.handle(GET_NOT_FIRST_TIME_CHANNEL, () => {
  if (!store) {
    dialog.showErrorBox("Error", "Error in set store");
    return;
  }
  return store.get(NOT_FIRST_TIME_KEY, false);
});

ipcMain.on(SET_GATE_CHANNEL, (_, id: string) => {
  if (!store) {
    dialog.showErrorBox("Error", "Error in getting store");
    return;
  }
  if (!id) {
    dialog.showErrorBox("Select Gate", "Gate is not selected");
    return;
  }
  store.set(GATE_ID_KEY, id);
});

ipcMain.handle(GET_GATE_ID_CHANNEL, () => {
  if (!store) {
    dialog.showErrorBox("Error", "Error in getting store");
    return;
  }

  return store.get(GATE_ID_KEY, "");
});

ipcMain.on(SET_PARKING_AREA_ID_CHANNEL, (_, parkingId: string) => {
  if (!store) {
    dialog.showErrorBox("Error", "Error in getting store");
    return;
  }

  store.set(PARKING_AREA_ID_KEY, parkingId);
});

ipcMain.handle(GET_PARKING_AREA_ID_CHANNEL, (_) => {
  if (!store) {
    dialog.showErrorBox("Error", "Error in getting store");
    return;
  }

  return store.get(PARKING_AREA_ID_KEY, "");
});

//#region Left Camera

ipcMain.handle(GET_CAMERA_LEFT_PLATE_CHANNEL, () => {
  if (!store) {
    dialog.showErrorBox("Error", "Error in getting store");
    return;
  }

  return store.get(LEFT_PLATE_CAMERA_ID_KEY, "");
});

ipcMain.on(SET_CAMERA_LEFT_PLATE_CHANNEL, (_, cameraId: string) => {
  if (!store) {
    dialog.showErrorBox("Error", "Error in getting store");
    return;
  }

  store.set(LEFT_PLATE_CAMERA_ID_KEY, cameraId);
});

ipcMain.handle(GET_CAMERA_LEFT_OTHER_CHANNEL, () => {
  if (!store) {
    dialog.showErrorBox("Error", "Error in getting store");
    return;
  }

  return store.get(LEFT_OTHER_CAMERA_ID_KEY, "");
});

ipcMain.on(SET_CAMERA_LEFT_OTHER_CHANNEL, (_, cameraId: string) => {
  if (!store) {
    dialog.showErrorBox("Error", "Error in getting store");
    return;
  }

  store.set(LEFT_OTHER_CAMERA_ID_KEY, cameraId);
});
//#endregion

//#region Right Camera

ipcMain.handle(GET_CAMERA_RIGHT_PLATE_CHANNEL, () => {
  if (!store) {
    dialog.showErrorBox("Error", "Error in getting store");
    return;
  }

  return store.get(RIGHT_PLATE_CAMERA_ID_KEY, "");
});

ipcMain.on(SET_CAMERA_RIGHT_PLATE_CHANNEL, (_, cameraId: string) => {
  if (!store) {
    dialog.showErrorBox("Error", "Error in getting store");
    return;
  }

  return store.set(RIGHT_PLATE_CAMERA_ID_KEY, cameraId);
});

ipcMain.handle(GET_CAMERA_RIGHT_OTHER_CHANNEL, () => {
  if (!store) {
    dialog.showErrorBox("Error", "Error in getting store");
    return;
  }

  return store.get(RIGHT_OTHER_CAMERA_ID_KEY, "");
});

ipcMain.on(SET_CAMERA_RIGHT_OTHER_CHANNEL, (_, cameraId: string) => {
  if (!store) {
    dialog.showErrorBox("Error", "Error in getting store");
    return;
  }

  return store.set(RIGHT_OTHER_CAMERA_ID_KEY, cameraId);
});

//#endregion

//#region Swap Lane
ipcMain.on(SET_LEFT_LANE_CHANNEL, (_, value: GateType) => {
  if (!win) return;
  if (!store) {
    dialog.showErrorBox("Error", "Error in getting store");
    return;
  }

  store.set(LEFT_LANE_KEY, value);
  win.webContents.send(SET_LEFT_LANE_CHANNEL, value);
});

ipcMain.handle(GET_LEFT_LANE_CHANNEL, () => {
  if (!store) {
    dialog.showErrorBox("Error", "Error in getting store");
    return;
  }

  return store.get(LEFT_LANE_KEY, GATE_IN);
});

ipcMain.on(SET_RIGHT_LANE_CHANNEL, (_, value: GateType) => {
  if (!win) return;

  if (!store) {
    dialog.showErrorBox("Error", "Error in getting store");
    return;
  }

  store.set(RIGHT_LANE_KEY, value);
  win.webContents.send(SET_RIGHT_LANE_CHANNEL, value);
});

ipcMain.handle(GET_RIGHT_LANE_CHANNEL, () => {
  if (!store) {
    dialog.showErrorBox("Error", "Error in getting store");
    return;
  }

  return store.get(RIGHT_LANE_KEY, GATE_OUT);
});

//#endregion

ipcMain.handle(GET_IS_2_LANE_CHANNEL, () => {
  if (!store) {
    dialog.showErrorBox("Error", "Error in getting store");
    return;
  }

  return store.get(IS_2_LANE_KEY, false);
});

ipcMain.on(SET_IS_2_LANE_CHANNEL, (_, is2Lane: boolean) => {
  if (!store) {
    dialog.showErrorBox("Error", "Error in getting store");
    return;
  }

  return store.set(IS_2_LANE_KEY, is2Lane);
});

ipcMain.handle(LOG_OUT_CHANNEL, () => {
  if (!win) {
    return;
  }

  if (!store) {
    dialog.showErrorBox("Error", "Error in getting store");
    return;
  }
  const menuItems = MenuItems(win, store);
  if (menuItems === undefined) return;

  const cardCheckerMenuItem = menuItems[1].submenu[0] as Partial<MenuItem>;

  cardCheckerMenuItem.enabled = false;

  const menu = Menu.buildFromTemplate(menuItems);
  store.set(LOGGED_IN_KEY, false);
  Menu.setApplicationMenu(menu);
});

ipcMain.handle(GET_LOG_IN_CHANNEL, () => {
  if (!store) {
    dialog.showErrorBox("Error", "Error in getting store");
    return;
  }

  return store.get(LOGGED_IN_KEY, false);
});

ipcMain.on(LOGGED_IN, (e: any, isLoggedIn: any) => {
  if (!win) {
    return;
  }
  if (!store) {
    dialog.showErrorBox("Error", "Error in getting store");
    return;
  }

  if (!isLoggedIn) {
    return;
  }

  store.set(LOGGED_IN_KEY, isLoggedIn);

  const menuItems = MenuItems(win, store);
  if (menuItems === undefined) return;

  const cardCheckerMenuItem = menuItems[1].submenu[0] as Partial<MenuItem>;

  cardCheckerMenuItem.enabled = true;

  const loggedInMenuItems = LoggedInMenuItems(win);
  const menu = Menu.buildFromTemplate(
    (menuItems as Array<any>).concat(loggedInMenuItems)
  );
  Menu.setApplicationMenu(menu);
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    if (!store) {
      dialog.showErrorBox("Error", "Error in getting store");
      return;
    }

    store.set(LOGGED_IN_KEY, false);
    win = null;
    app.quit();
  }
});

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

//* handle single instance of app at a time
let isSingleInstance = app.requestSingleInstanceLock();
if (!isSingleInstance) {
  app.quit();
}

// Behaviour on second instance for parent process- Pretty much optional
app.on("second-instance", () => {
  if (win) {
    if (win.isMinimized()) win.restore();
    win.focus();
  }
});

app
  .whenReady()
  .then(() => {
    createWindow();
    if (!win) return;

    const loginMenu = MenuItems(win, store);
    if (loginMenu.length === 0) {
      Promise.reject();
    }
    const menu = Menu.buildFromTemplate(loginMenu);
    Menu.setApplicationMenu(menu);
  })
  .catch(() => {
    dialog.showErrorBox("System error", "Something went wrong");
  });
