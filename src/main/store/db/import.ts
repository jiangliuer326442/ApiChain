import {
    app,
    BrowserWindow,
    ipcMain,
    dialog,
} from 'electron';
import fs from 'fs-extra';

import { 
    ChannelsDbStr, 
    ChannelsDbImportStr, 
    ChannelsDbImportSuccessStr 
} from '../../../config/global_config'

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

            mainWindow.webContents.send(ChannelsDbStr, ChannelsDbImportStr, fileContent);

            ipcMain.on(ChannelsDbStr, (event, action) => {
                action === ChannelsDbImportSuccessStr && mainWindow.webContents.reload();
            });
        }
    });
}