import {
    BrowserWindow,
    ipcMain,
} from 'electron';

import { 
    ChannelsDbStr, 
    ChannelsDbTrunkStr, 
    ChannelsDbTrunkSuccessStr 
} from '../../../config/global_config'

export function trunkDb(mainWindow: BrowserWindow) {
    mainWindow.webContents.send(ChannelsDbStr, ChannelsDbTrunkStr);

    ipcMain.on(ChannelsDbStr, (event, action) => {
        if (action === ChannelsDbTrunkSuccessStr) {
            mainWindow.webContents.reload();
        }
    });
}