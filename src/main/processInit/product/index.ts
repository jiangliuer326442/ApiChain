/**
 * 拿到产品名称和版本号
 */

import fs from 'fs-extra';
import { ipcMain, IpcMainEvent } from 'electron';
import { getPackageJson, resolveHtmlPath } from '../../util/util';
import { getUUID } from '../../store/config/user';

import { 
    ChannelsUserInfoStr, 
    ChannelsUserInfoPingStr, 
    ChannelsUserInfoSetAppinfoStr 
} from '../../../config/channel';

export default function() {

    ipcMain.on(ChannelsUserInfoStr, async (event : IpcMainEvent, action) => {
        if(action !== ChannelsUserInfoPingStr) return;

        let path = getPackageJson();
        let content = await fs.readFile(path);
        let uuid = getUUID();
        let html = resolveHtmlPath('index.html');
        let packageJson = JSON.parse(content.toString());
        let appVersion = packageJson.version;
        let appName = packageJson.name;
        event.reply(ChannelsUserInfoStr, ChannelsUserInfoSetAppinfoStr, uuid, html, appName, appVersion);
    });
}