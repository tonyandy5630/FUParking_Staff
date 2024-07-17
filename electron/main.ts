import {
  GO_BACK_CHANNEL,
  OPEN_ERROR_DIALOG_CHANNEL,
  TO_CHECK_IN_CHANNEL,
  TO_CHECK_OUT_CHANNEL,
  TO_DEVICE_SETUP_CHANNEL,
} from "../channel";
import { app, BrowserWindow, Menu, dialog, ipcMain } from "electron";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import path from "node:path";
import dotenv from "dotenv";
import loginMenuItems from "./menu/loginMenuItems";
import dotenvExpand from "dotenv-expand";
import PAGE from "../url";
import { loadURL } from "./utils/electron_utils";

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

dotenv.config();

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

function createWindow() {
  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC as string, "Bai_Logo.png"),
    webPreferences: {
      preload: path.join(__dirname, "preload.mjs"),
    },
    center: true,
    title: "Bai Parking System",
    show: false,
    resizable: true,
  });

  win.webContents.openDevTools();

  win.once("ready-to-show", () => {
    win?.show();
  });

  win.webContents.session.on(
    "select-hid-device",
    (event, details, callback) => {
      // Add events to handle devices being added or removed before the callback on
      // `select-hid-device` is called.
      if (win === null) {
        return dialog.showErrorBox("Window not exist", "Window is not existed");
      }
      win.webContents.session.on("hid-device-added", (event, device) => {
        console.log("hid-device-added FIRED WITH", device);
        // Optionally update details.deviceList
      });

      win.webContents.session.on("hid-device-removed", (event, device) => {
        console.log("hid-device-removed FIRED WITH", device);
        // Optionally update details.deviceList
      });

      event.preventDefault();
      if (details.deviceList && details.deviceList.length > 0) {
        win.webContents.send("send-devices", details.deviceList);
        callback(details.deviceList[0].deviceId);
      }
    }
  );

  win.webContents.session.setPermissionCheckHandler(
    (_, permission, __, details) => {
      if (
        (permission === "hid" || permission === "media") &&
        (details.securityOrigin === "file://" ||
          details.securityOrigin === "http://localhost:3000/")
      ) {
        return true;
      }
      return false;
    }
  );

  win.webContents.session.setDevicePermissionHandler((details) => {
    if (
      details.deviceType === "hid" &&
      (details.origin === "file://" ||
        details.origin === "http://localhost:3000/")
    ) {
      return true;
    }
    return false;
  });

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
  } else {
    // win.loadFile('dist/index.html')
    win.loadFile(path.join(RENDERER_DIST, "index.html"));
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

    const loginMenu = loginMenuItems(win);
    if (loginMenu.length === 0) {
      Promise.reject();
    }
    const menu = Menu.buildFromTemplate(loginMenu);
    Menu.setApplicationMenu(menu);
  })
  .catch(() => {
    dialog.showErrorBox("System error", "Something went wrong");
  });
