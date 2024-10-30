import { BrowserWindow, ipcMain } from 'electron';
import log from 'electron-log';
import fs from 'fs-extra';

import { ChannelsReadFileStr } from '../../../config/global_config';

export default function (mainWindow : BrowserWindow){

    ipcMain.on(ChannelsReadFileStr, (event, key, path) => {
        log.debug(key, path);
        fs.readFile(path).then(
            content => mainWindow.webContents.send(ChannelsReadFileStr, key, path, content)
        );
    })

}