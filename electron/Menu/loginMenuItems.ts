import dotenv from "dotenv";
import { BrowserWindow } from "electron";
import PAGE from "../../url";
import ElectronStore from "electron-store";
import { GATE_IN, GATE_OUT } from "../../src/constants/gate.const";
import ElectronRedirect from "../../src/utils/electron-redirect";
dotenv.config();

function loginMenuItems(win: BrowserWindow, store: ElectronStore | null): any {
  return [
    {
      label: "Cài đặt",
      submenu: [
        {
          label: "Camera",
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
      label: "Cổng",
      submenu: [
        {
          label: "Cổng vào",
          enabled: false,
          click: () => {
            if (store) store.set("gateType", GATE_IN);
            ElectronRedirect(win, PAGE.CHECK_IN);
          },
        },
        {
          label: "Cổng ra",
          enabled: false,
          click: () => {
            if (store) store.set("gateType", GATE_OUT);
            ElectronRedirect(win, PAGE.CHECK_OUT);
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

export default loginMenuItems;
