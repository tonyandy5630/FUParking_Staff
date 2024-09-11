import dotenv from "dotenv";
import { BrowserWindow } from "electron";
import PAGE from "../../url";
import ElectronStore from "electron-store";
import ElectronRedirect from "../../src/utils/electron-redirect";
dotenv.config();

function MenuItems(win: BrowserWindow, store: ElectronStore | null): any {
  return [
    {
      label: "Cài đặt",
      submenu: [
        {
          label: "Camera và Làn",
          enabled: true,
          click: () => {
            ElectronRedirect(win, PAGE.DEVICE_SET_UP);
          },
        },
        {
          label: "Cổng",
          enabled: true,
          click: () => {
            ElectronRedirect(win, PAGE.SELECT_GATE_TYPE);
          },
        },
      ],
    },
    {
      label: "Thẻ",
      submenu: [
        {
          label: "Tra cứu thẻ",
          enabled: false,
          click: () => {
            ElectronRedirect(win, PAGE.CARD_CHECKER);
          },
        },
      ],
    },
  ];
}

export function LoggedInMenuItems(win: BrowserWindow) {
  return [
    {
      label: "Cổng",
      click: () => {
        ElectronRedirect(win, PAGE.GATE);
      },
    },
  ];
}

export default MenuItems;
