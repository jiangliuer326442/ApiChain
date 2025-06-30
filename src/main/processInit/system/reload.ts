import { BrowserWindow, ipcMain } from 'electron';

import { ChannelsLoadAppStr } from '../../../config/channel';

export default function (mainWindow : BrowserWindow){
    ipcMain.on(ChannelsLoadAppStr, (event) => {
        mainWindow.webContents.reload();
    });
}