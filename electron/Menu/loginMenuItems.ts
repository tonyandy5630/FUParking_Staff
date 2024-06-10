import { BrowserWindow } from "electron";
import { BASE_URL } from "../main";
import PAGE from "../../url";

function loginMenuItems(win: BrowserWindow | null) {
  if (win === null) {
    return [];
  }
  return [
    {
      label: "Settings",
      submenu: [
        {
          label: "Update Machine Code",
          click: () => {
            win.webContents.loadURL(BASE_URL + "#" + PAGE.CODE_SET_UP);
          },
        },
        {
          label: "Device Setup",
          click: () => {
            win.webContents.loadURL(BASE_URL + "#" + PAGE.DEVICE_SET_UP);
          },
        },
      ],
    },
  ];
}

export default loginMenuItems;
