import { BrowserWindow } from "electron";
import { BASE_URL } from "../main";

export function loadURL(url: string, win?: BrowserWindow): void {
  if (win) {
    win.webContents.loadURL(BASE_URL + "#" + url);
    win.maximize();
  }
}
