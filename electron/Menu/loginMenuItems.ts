import { BrowserWindow, MenuItem, MenuItemConstructorOptions } from "electron";
import { BASE_URL } from "../main";

function loginMenuItems(win: BrowserWindow | null) {
  if (win === null) {
    return [];
  }
  return [
    {
      label: "Settings",
      submenu: [
        {
          label: "Machine Settings",
          click: () => {
            win.webContents.loadURL(BASE_URL + "#/setup");
          },
        },
      ],
    },
  ];
}

export default loginMenuItems;
