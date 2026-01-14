import { app, BrowserWindow, dialog } from 'electron';
import serve from 'electron-serve'
import log from 'electron-log';

import {
  ChannelsVipStr
} from '../config/channel'
import { isStringEmpty } from '../renderer/util';
import bindIpcEvents from './processInit';
import { topUpCallback } from './logic/topup';
import { createWindow as createMainWindow, getWindow as getMainWindow } from './window/main';
import { getInitParams, systemInit } from './window/params';

const PROTOCOL = 'com-mustafa-apichain';

const isProd: boolean = process.env.NODE_ENV === 'production'

if (isProd) {
  serve({ directory: './dist/renderer/', scheme: 'apichain' })
} else {
  app.setPath('userData', `${app.getPath('userData')}_dev`)
}

const { exportPrivateKey, exportPublicKey, store } = systemInit();

//获取启动参数创建主窗口
const createWindow = async () => {
  let initParam = await getInitParams(exportPrivateKey, exportPublicKey, store);
  createMainWindow(initParam, (mainWindow : BrowserWindow) => {
    bindIpcEvents(mainWindow, exportPrivateKey, exportPublicKey, store);
  });
};

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  // 如果获取锁失败，说明已有实例在运行，直接关闭当前进程
  app.quit();
} else {
  app.on('second-instance', async (_event, args) => {
    const url = args.find((arg) =>
      arg.startsWith(`${PROTOCOL}://`)
    )
    if (url == undefined) {
      return;
    }
    log.info('second-instance url:', url);
    const mainWindow = getMainWindow();

    let coreStr = url.replace(/^com-mustafa-apichain:\/\//, '');
    coreStr = coreStr.replace(/^member\/yuanreturn\//, '');
    //注册激活事件
    if (!isStringEmpty(coreStr)) {
      topUpCallback(coreStr, exportPrivateKey, 
        () => {
          dialog.showErrorBox('会员充值失败', '会员充值失败，请稍后再试');
        },
        (uid, expireTime, buyTimes) => {
          app.relaunch()
          app.exit(0);
        },
        (uid, apiKey, orderNo) => {
          app.relaunch()
          app.exit(0);
        },
        store);
    }
  })

  app
    .whenReady()
    .then(() => {
      app.setAsDefaultProtocolClient(PROTOCOL);
      createWindow(); 
      app.on('activate', () => {
        if (getMainWindow() === null) createWindow();
      });
    })
    .catch(log.error);
}