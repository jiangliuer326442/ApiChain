import {
    app,
    dialog,
    ipcMain,
    BrowserWindow,
} from 'electron';
import fs from 'fs-extra';
import log from 'electron-log';

import { getNowdayjs } from '../../../renderer/util';
import { getPackageJson } from '../../util/util';

import { 
    ChannelsDbStr, 
    ChannelsDbProjectExportStr,
    ChannelsDbProjectExportResultStr,
    ChannelsDbProjectImportStr,
    ChannelsDbProjectImportResultStr,
} from '../../../config/channel';

export default function (mainWindow : BrowserWindow) {

    ipcMain.on(ChannelsDbStr, async (event, action) => {
        if(action === ChannelsDbProjectImportStr) {
            dialog.showOpenDialog({
                title: "导入项目",
                defaultPath: app.getPath("desktop"),
                filters: [
                    { name: "json 文件", extensions: ["json"] }
                ]
            }).then(filePathObj => {
                if (!filePathObj.canceled) {
                    let filePath = filePathObj.filePaths[0];
                    let fileContent = fs.readFileSync(filePath).toString();
                    mainWindow.webContents.send(ChannelsDbStr, ChannelsDbProjectImportResultStr, fileContent);
                }
            });
        }
    })

    ipcMain.on(ChannelsDbStr, async (event, action, selectedProjects : Array<string>, jsonString : string) => {
        if(action === ChannelsDbProjectExportStr) {
            let packageJsonFilePath = getPackageJson();
            let content = await fs.readFile(packageJsonFilePath);
            let packageJson = JSON.parse(content.toString());
            let appName = packageJson.name;
        
            let joinProjectName = "_" + selectedProjects.length + "project";

            dialog.showSaveDialog({
                title: "导出选中项目",
                defaultPath: app.getPath("documents") + "/" + appName + joinProjectName + "_" + (getNowdayjs().format("YYMMDDHHmm")) + ".json",
                filters: [
                    { name: "json 文件", extensions: ["json"] }
                ]
            }).then(filePathObj => {
              if (!filePathObj.canceled) {
                let fileLocation = filePathObj.filePath;
                fs.writeFile(fileLocation, jsonString, err => {
                    if (err != null) {
                        log.error("保存数据库文件失败", err);
                    } else {
                        mainWindow.webContents.send(ChannelsDbStr, ChannelsDbProjectExportResultStr, fileLocation);
                    }
                });
              }
            });
        }
    });
}