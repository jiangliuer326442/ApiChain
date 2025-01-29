import {
  Menu,
} from 'electron';

import { getWindow } from './main';
import { exportDb } from '../store/db/export';
import { importDb } from '../store/db/import';
import { trunkDb } from '../store/db/trunk';

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
        label: '页面',
        submenu: [
          {
            label: '刷新当前页面',
            click: () => {
              getWindow().webContents.reload();  
            },
          },
        ]
      },
      {
        label: '数据',
        submenu: [
          {
            label: '备份数据库',
            click : () => {
              exportDb(getWindow());
            },
          },
          {
            label: '还原数据库',
            click: () => {
              importDb(getWindow());
            },
          },
          {
            label: '清除缓存',
            click: () => {
              trunkDb(getWindow());  
            },
          },
        ]
      },
      {
        label: '帮助',
        submenu: [
          {
            label: '开发者模式',
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
