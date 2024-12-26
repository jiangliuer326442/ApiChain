import {
    BrowserWindow,
    app,
} from 'electron';
import path from 'path';
import fse from 'fs-extra';

import { 
    ChannelsDbLongStr, 
    ChannelsDbTrunkStr, 
} from '../../../config/channel'

export function trunkDb(mainWindow: BrowserWindow) {
    fse.removeSync(path.join(app.getPath('logs'), 'main.log'));
    mainWindow.webContents.send(ChannelsDbLongStr, ChannelsDbTrunkStr);
}