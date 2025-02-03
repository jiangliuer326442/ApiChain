import {
  Menu,
} from 'electron';

import { getWindow } from './main';
import { exportDb } from '../store/db/export';
import { importDb } from '../store/db/import';
import { trunkDb } from '../store/db/trunk';
import { langTrans } from '../../lang/i18n';

export default class MenuBuilder {

  buildMenu(): Menu {
    let template = this.buildDefaultTemplate();

    if (
      process.env.NODE_ENV === 'development' ||
      process.env.DEBUG_PROD === 'true'
    ) {
      template[0].submenu.push();
    }

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);

    return menu;
  }

  buildDefaultTemplate() {
    const templateDefault = [
      {
        label: langTrans("menu page"),
        submenu: [
          {
            label: langTrans("menu page refresh"),
            click: () => {
              getWindow().webContents.reload();  
            },
          },
        ]
      },
      {
        label: langTrans("menu db"),
        submenu: [
          {
            label: langTrans("menu db backup"),
            click : () => {
              exportDb(getWindow());
            },
          },
          {
            label: langTrans("menu db recovery"),
            click: () => {
              importDb(getWindow());
            },
          },
          {
            label: langTrans("menu db clean"),
            click: () => {
              trunkDb(getWindow());  
            },
          },
        ]
      },
      {
        label: langTrans("menu help"),
        submenu: [
          {
            label: langTrans("menu help debug"),
            click: () => {
              getWindow().webContents.toggleDevTools();
            },
          }
        ],
      },
    ];

    return templateDefault;
  }
}
