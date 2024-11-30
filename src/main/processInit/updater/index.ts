import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import { ipcMain } from 'electron';

import { 
    ChannelsAutoUpgradeStr, 
    ChannelsAutoUpgradeCheckStr, 
    ChannelsAutoUpgradeDownloadStr,
    ChannelsAutoUpgradeLatestStr,
    ChannelsAutoUpgradeNewVersionStr, 
} from '../../../config/channel';

export default function (){
    autoUpdater.logger = log;
    autoUpdater.fullChangelog = true;
    autoUpdater.disableWebInstaller = false;
    autoUpdater.autoDownload = false;
    autoUpdater.on('error', (error) => {
        log.error(['检查更新失败', error])
    });

    ipcMain.on(ChannelsAutoUpgradeStr, (event, action) => {
        if (action !== ChannelsAutoUpgradeCheckStr) return;
        autoUpdater.checkForUpdates();
        autoUpdater.on('update-available', (info) => {
            log.debug("updateCheckResult", info);
            if (info !== null) {
                log.debug("updateCheckResult", info);
                event.reply(ChannelsAutoUpgradeStr, ChannelsAutoUpgradeNewVersionStr, info);
            }
        });
        autoUpdater.on('update-not-available', () => {  
            event.reply(ChannelsAutoUpgradeStr, ChannelsAutoUpgradeLatestStr); 
        });
    });

    ipcMain.on(ChannelsAutoUpgradeStr, (event, action) => {
        if (action !== ChannelsAutoUpgradeDownloadStr) return;
        autoUpdater.downloadUpdate().then(paths => {
            log.info("downloadUpdate paths", paths);
            autoUpdater.quitAndInstall();
        });
    });
}