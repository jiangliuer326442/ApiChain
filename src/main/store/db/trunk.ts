import {
    BrowserWindow,
    ipcMain,
} from 'electron';

import { 
    ChannelsDbLongStr, 
    ChannelsDbTrunkStr, 
    ChannelsDbTrunkSuccessStr 
} from '../../../config/channel'

export function trunkDb(mainWindow: BrowserWindow) {
    mainWindow.webContents.send(ChannelsDbLongStr, ChannelsDbTrunkStr);

    // ipcMain.once(ChannelsDbLongStr, (event, action) => {
    //     if (action === ChannelsDbTrunkSuccessStr) {
    //         mainWindow.webContents.reload();
    //     }
    // });
}