import {
    app,
    BrowserWindow,
    ipcMain,
    dialog,
} from 'electron';
import fs from 'fs-extra';

import { 
    ChannelsDbLongStr, 
    ChannelsDbImportStr, 
    ChannelsDbImportSuccessStr 
} from '../../../config/channel'

export function importDb(mainWindow: BrowserWindow) {
    dialog.showOpenDialog({
        title: "还原数据库",
        defaultPath: app.getPath("documents"),
        filters: [
            { name: "json 文件", extensions: ["json"] }
        ]
    }).then(filePathObj => {
        if (!filePathObj.canceled) {
            let filePath = filePathObj.filePaths[0];
            let fileContent = fs.readFileSync(filePath).toString();

            mainWindow.webContents.send(ChannelsDbLongStr, ChannelsDbImportStr, fileContent);

            // ipcMain.once(ChannelsDbLongStr, (event, action) => {
            //     if (action === ChannelsDbImportSuccessStr) {
            //         mainWindow.webContents.reload();
            //     }
            // });
        }
    });
}