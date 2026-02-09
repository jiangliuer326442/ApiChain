import log from 'electron-log';
import { app, ipcMain } from 'electron';
import axios from 'axios';
import path from 'path'
import fs from 'fs';
import { getLang } from '../../../lang/i18n';
import { compareVersions } from '../../util/util'

import { 
    ChannelsAutoUpgradeStr, 
    ChannelsAutoUpgradeCheckStr, 
    ChannelsAutoUpgradeLatestStr,
} from '../../../config/channel';

async function getUpdateUrl() {
    let lang = getLang();
    let checkUpdateUrl = "https://raw.githubusercontent.com/jiangliuer326442/ApiChain/refs/heads/main/package.json";
    if (lang === "zh-CN") {
        checkUpdateUrl = "https://gitee.com/onlinetool/apichain/raw/main/package.json";
    }

    return checkUpdateUrl;
}

export default function (){
    if (!app.isPackaged) return;
    ipcMain.on(ChannelsAutoUpgradeStr, async (event, action) => {
        if (action !== ChannelsAutoUpgradeCheckStr) return;
        if (!(process.env.UPGRADE_CHECK == "true")) return;
        const checkUpdateUrl = await getUpdateUrl();
        axios.get(checkUpdateUrl)
        .then(async response => {
            let originResponse = response.data;
            const newVersion = originResponse.version;
            const currentVersion = app.getVersion();
            if (compareVersions(newVersion, currentVersion) != 1) {
                event.reply(ChannelsAutoUpgradeStr, ChannelsAutoUpgradeLatestStr); 
                return;
            }
            //下载app.asar文件到临时目录
            let lang = getLang();
            let source = "github";
            if (lang === "zh-CN") {
                source = "gitee";
            }
            const downloadUrl = originResponse.downloadUrls[source];
            const tempFilePath = path.join(app.getPath('temp'), `apichain-${Date.now()}.tmp`);
            const targetFilePath = app.getAppPath();

            try {
                // 创建写入流
                const writer = fs.createWriteStream(tempFilePath);

                // 使用 axios 发起下载请求，并设置 responseType 为 'stream'
                const response = await axios.get(downloadUrl, {
                    responseType: 'stream'
                });

                // 将响应流写入文件
                response.data.pipe(writer);

                // 等待写入完成
                await new Promise((resolve, reject) => {
                    writer.on('finish', resolve);
                    writer.on('error', reject);
                });

                  // 重命名文件
                fs.rename(tempFilePath, targetFilePath, (err) => {
                    if (err) {
                        log.error('Error renaming file:', err);
                    } else {
                        log.info('File renamed successfully to:', targetFilePath);
                    }
                });
            } catch (err) {
                log.error('Error downloading or renaming file:', err);
                fs.unlink(tempFilePath, () => {});
            }
        })
        .catch(error => {
            log.error("检测更新报错", error);
        });
    });
}