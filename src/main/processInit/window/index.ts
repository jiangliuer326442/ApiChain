import { app, BrowserWindow, ipcMain, shell } from 'electron';
import path from 'path';

import { ChannelsOpenWindowStr } from '../../../config/global_config';
import { resolveHtmlPath, getAssetPath } from '../../util/util';

export default function (mainWindow : BrowserWindow){
    ipcMain.on(ChannelsOpenWindowStr, (event, windowId, windowUrl) => {
    
        let window: BrowserWindow | null = null;
    
        window = new BrowserWindow({
            show: false,
            width: 1024,
            height: 728,
            parent: mainWindow,
            // modal: true,
            icon: getAssetPath('icon.png'),
            webPreferences: {
              preload: app.isPackaged
                ? path.join(__dirname, '../../preload.js')
                : path.join(__dirname, '../../../../.erb/dll/preload.js'),
            },
        });
    
        let url = decodeURIComponent(resolveHtmlPath('index.html' + windowUrl));
        window.loadURL(url);
    
        window.on('ready-to-show', () => {
            if (process.env.START_MINIMIZED) {
              window.minimize();
            } else {
              window.show();
            }
        });
        
        window.on('closed', () => {
            window = null;
            mainWindow.webContents.send(ChannelsOpenWindowStr, windowId);
        });

        window.webContents.setWindowOpenHandler((edata) => {
          shell.openExternal(edata.url);
          return { action: 'deny' };
        });
      
        window.webContents.on('will-navigate', event =>{
            if(!event.isSameDocument) {
              event.preventDefault();
              let url = event.url;
              shell.openExternal(url);
            }
        });
    });
}