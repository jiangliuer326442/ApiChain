import { BrowserWindow, ipcMain } from 'electron';
import fs from 'fs-extra';

import { ChannelsReadFileStr } from '../../../config/channel';

export default function (mainWindow : BrowserWindow){

    ipcMain.on(ChannelsReadFileStr, (event, key, path) => {
        fs.readFile(path).then(
            content => mainWindow.webContents.send(ChannelsReadFileStr, key, path, content)
        );
    })

}