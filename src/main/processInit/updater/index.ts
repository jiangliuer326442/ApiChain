import log from 'electron-log';
import { app, ipcMain } from 'electron';
import axios from 'axios';
import path from 'path';
import fs from 'fs';
import { spawn } from 'child_process';
import { getLang } from '../../../lang/i18n';
import { compareVersions } from '../../util/util';
import { getProjectUrl } from '../../../config/url';

import { 
    ChannelsAutoUpgradeStr, 
    ChannelsAutoUpgradeCheckStr, 
    ChannelsAutoUpgradeLatestStr,
} from '../../../config/channel';

function getUpdateUrl() {
    let lang = getLang();
    let checkUpdateUrl = "https://raw.githubusercontent.com/jiangliuer326442/ApiChain/refs/heads/main/package.json";
    if (lang == "zh-CN" || lang == "zh-TW") {
        checkUpdateUrl = "https://gitee.com/onlinetool/apichain/raw/main/package.json";
    }

    return checkUpdateUrl;
}

function get7zaPath() {
    if (process.platform === "darwin") {
        return path.join(__dirname, "7zip-bin", "7za")
    }
    else if (process.platform === "win32") {
        return path.join(__dirname, "7zip-bin", "7za.exe")
    }
    else {
        return path.join(__dirname, "7zip-bin", "7za")
    }
}

export default function (){
    if (!app.isPackaged) return;
    ipcMain.on(ChannelsAutoUpgradeStr, async (event, action) => {
        if (action !== ChannelsAutoUpgradeCheckStr) return;
        if (!process.env.UPGRADE_CHECK) return;
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
            const downloadUrl = `${getProjectUrl()}/releases/download/v${newVersion}/app_${process.platform}.7z`;
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

                const path7za = get7zaPath();

                //解压放入新代码
                log.info(`path7za:${path7za} tempFilePath:${tempFilePath} targetFilePath:${targetFilePath}`);
                spawn(path7za, [
                    'x',
                    tempFilePath,
                    '-o' + targetFilePath,
                    '-y'
                  ], {
                    stdio: 'inherit'
                  })
            } catch (err) {
                log.error(`Error downloading or renaming downloadUrl:${downloadUrl} tempFilePath:${tempFilePath} targetFilePath:${targetFilePath}`, err);
            }
        })
        .catch(error => {
            log.error("检测更新报错", error);
        });
    });
}