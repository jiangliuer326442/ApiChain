import log from 'electron-log';
import { app, ipcMain, shell } from 'electron';
import axios from 'axios';
import { getLang } from '../../../lang/i18n';
import { getPackageJson, compareVersions } from '../../util/util'

import { 
    ChannelsAutoUpgradeStr, 
    ChannelsAutoUpgradeCheckStr, 
    ChannelsAutoUpgradeDownloadStr,
    ChannelsAutoUpgradeLatestStr,
    ChannelsAutoUpgradeNewVersionStr, 
} from '../../../config/channel';

async function getUpdateUrl() {
    let packageJson = await getPackageJson();
    let defaultRunnerUrl = packageJson.defaultRunnerUrl;
    let checkUpdateUrl = defaultRunnerUrl + "/version.json";
    return checkUpdateUrl;
}

export default function (){

    ipcMain.on(ChannelsAutoUpgradeStr, async (event, action) => {
        if (action !== ChannelsAutoUpgradeCheckStr) return;
        let lang = getLang();
        const checkUpdateUrl = await getUpdateUrl();
        axios.get(checkUpdateUrl)
        .then(response => {
            let originResponse = response.data;
            const newVersion = originResponse.version;
            const currentVersion = app.getVersion();
            if (compareVersions(newVersion, currentVersion) != 1) {
                event.reply(ChannelsAutoUpgradeStr, ChannelsAutoUpgradeLatestStr); 
                return;
            }
            event.reply(ChannelsAutoUpgradeStr, ChannelsAutoUpgradeNewVersionStr, {
                "version":newVersion,
                "releaseNotes":originResponse.releaseNotes[lang]
            });
        })
        .catch(error => {
          log.error("检测更新报错", error);
        });
    });

    ipcMain.on(ChannelsAutoUpgradeStr, async (event, action) => {
        if (action !== ChannelsAutoUpgradeDownloadStr) return;
        const checkUpdateUrl = await getUpdateUrl();
        axios.get(checkUpdateUrl)
        .then(response => {
            let originResponse = response.data;

            let lang = getLang();
            let source = "github";
            if (lang === "zh-CN") {
                source = "gitee";
            }
            let os = process.platform;
    
            const downloadUrl = originResponse.downloadUrls[source][os];
            log.info("downloadUrl:", downloadUrl);
            shell.openExternal(downloadUrl)
        });
    });
}