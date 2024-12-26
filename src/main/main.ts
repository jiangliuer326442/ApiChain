import { app } from 'electron';
import log from 'electron-log';

import { createWindow as createMainWindow, getWindow as getMainWindow } from './window/main';
import { getInitParams } from './window/params';
import { startServer } from './window/server';

startServer();

const createWindow = async () => {
  let initParam = await getInitParams();
  createMainWindow(initParam);
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