import { ipcMain, app, dialog } from 'electron';
import fs from 'fs-extra';

import { ChannelsPostmanStr, ChannelsPostmanOutStr, ChannelsPostmanInStr } from '../../../config/global_config';

export default function (){

    ipcMain.on(ChannelsPostmanStr, (event, action, projectName) => {
        if (action !== ChannelsPostmanInStr) return;
        dialog.showOpenDialog({
            title: "postman 导入到 " + projectName,
            defaultPath: app.getPath("documents"),
            filters: [
                { name: "postman 导出文件", extensions: ["json"] }
            ]
        }).then(filePathObj => {
            if (!filePathObj.canceled) {
                let filePath = filePathObj.filePaths[0];
                fs.readFile(filePath).then(
                    content => event.reply(ChannelsPostmanStr, ChannelsPostmanOutStr, projectName, content.toString())
                );
            }
        });
    });
}