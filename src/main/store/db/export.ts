import {
    app,
    BrowserWindow,
    dialog,
    ipcMain,
    shell,
} from 'electron';
import path from 'path';
import fs from 'fs-extra';
import log from 'electron-log';

import { ChannelsDbStr, ChannelsDbExportStr, ChannelsDbWriteStr } from '../../../config/global_config';
import { getNowdayjs } from '../../../renderer/util';

export function exportDb(mainWindow: BrowserWindow) {
    dialog.showSaveDialog({
        title: "导出数据库",
        defaultPath: app.getPath("documents") + "/postman_db_" + (getNowdayjs().format("YYMMDDHHmm")) + ".json",
        filters: [
            { name: "json 文件", extensions: ["json"] }
        ]
    }).then(filePathObj => {
      if (!filePathObj.canceled) {
        mainWindow.webContents.send(ChannelsDbStr, ChannelsDbExportStr, filePathObj.filePath);

        ipcMain.on(ChannelsDbStr, (event, action,  filePath, jsonString) => {
            if(action === ChannelsDbWriteStr) {
                fs.writeFile(filePath, jsonString, err => {
                    if (err != null) {
                        log.error("保存数据库文件失败", err);
                    } else {
                        shell.openPath(path.dirname(filePath))
                    }
                });
            }
        });
      }
    });
}