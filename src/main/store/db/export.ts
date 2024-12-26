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

import { 
    ChannelsDbLongStr,
    ChannelsDbExportStr, 
    ChannelsDbWriteStr 
} from '../../../config/channel';
import { getNowdayjs } from '../../../renderer/util';
import { getPackageJson } from '../../util/util';

export async function exportDb(mainWindow: BrowserWindow) {
    let packageJsonFilePath = getPackageJson();
    let content = await fs.readFile(packageJsonFilePath);
    let packageJson = JSON.parse(content.toString());
    let appName = packageJson.name;

    dialog.showSaveDialog({
        title: "导出数据库",
        defaultPath: app.getPath("documents") + "/" + appName + "_db_" + (getNowdayjs().format("YYMMDDHHmm")) + ".json",
        filters: [
            { name: "json 文件", extensions: ["json"] }
        ]
    }).then(filePathObj => {
      if (!filePathObj.canceled) {
        mainWindow.webContents.send(ChannelsDbLongStr, ChannelsDbExportStr, filePathObj.filePath);

        ipcMain.once(ChannelsDbLongStr, (event, action,  filePath, jsonString) => {
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