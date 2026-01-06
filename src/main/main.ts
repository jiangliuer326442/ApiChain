import { app, BrowserWindow } from 'electron';
import Store from 'electron-store';
import crypto from 'crypto';
import fs from 'fs-extra';
import log from 'electron-log';
import path from 'path';

import bindIpcEvents from './processInit';
import { createWindow as createMainWindow, getWindow as getMainWindow } from './window/main';
import { getInitParams } from './window/params';

// 定义初始化文件路径
let basePath = app.getPath('userData')
const installFilePath = path.join(basePath, '.lock');
const pubKeyPath = path.join(basePath, '.pub');
const priKeyPath = path.join(basePath, '.rsa');
let exportPrivateKey = "";
let exportPublicKey = "";
if (!fs.existsSync(installFilePath)) {
  const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: {
      type: 'spki',
      format: 'pem'
    },
    privateKeyEncoding: {
      type: 'pkcs8',
      format: 'pem',
      cipher: 'aes-256-cbc',
      passphrase: 'BE1BDEC0AA74B4DCB079943E70528096CCA985F8'
    }
  });
  exportPublicKey = publicKey;
  exportPrivateKey = privateKey;

  fs.writeFileSync(pubKeyPath, exportPublicKey);
  fs.writeFileSync(priKeyPath, exportPrivateKey);
  fs.writeFileSync(installFilePath, '');
} else {
  exportPublicKey = fs.readFileSync(pubKeyPath).toString();
  exportPrivateKey = fs.readFileSync(priKeyPath).toString();
}
let store = new Store({encryptionKey : exportPrivateKey});

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

app
  .whenReady()
  .then(() => {
    createWindow(); 
    app.on('activate', () => {
      if (getMainWindow() === null) createWindow();
    });
  })
  .catch(log.error);