import url, { fileURLToPath } from "node:url";
import { BrowserWindow } from "electron";
import { BASE_URL } from "../../electron/main";
import PAGE from "../../url";
import path from "node:path";
const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default function ElectronRedirect(
  win: BrowserWindow,
  redirectTo: string
) {
  if (process.env.NODE_ENV === "development") {
    win.webContents.loadURL(BASE_URL + "#" + redirectTo);
  } else {
    const redirectURL = url.format({
      pathname: path.join(__dirname, "../dist/index.html"),
      hash: redirectTo,
      protocol: "file:",
      slashes: true,
    });
    win.webContents.loadURL(redirectURL);
  }
}
