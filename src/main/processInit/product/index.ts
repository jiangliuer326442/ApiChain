import fs from 'fs-extra';
import { ipcMain, IpcMainEvent } from 'electron';
import { getPackageJson, getIpV4, resolveHtmlPath } from '../../util/util';

import { ChannelsUserInfoStr, ChannelsUserInfoPingStr, ChannelsUserInfoSetAppinfoStr } from '../../../config/global_config';

export default function() {

    ipcMain.on(ChannelsUserInfoStr, (event : IpcMainEvent, action) => {
        if(action !== ChannelsUserInfoPingStr) return;

        let path = getPackageJson();

        fs.readFile(path).then(
            content => {
                let ip = getIpV4();
                let html = resolveHtmlPath('index.html');
                let packageJson = JSON.parse(content.toString());
                let appVersion = packageJson.version;
                let appName = packageJson.name;
                event.reply(ChannelsUserInfoStr, ChannelsUserInfoSetAppinfoStr, html, ip, appName, appVersion);
            }
        );
    });
}