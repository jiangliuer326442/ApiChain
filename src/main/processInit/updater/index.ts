import log from 'electron-log';
import { app, ipcMain } from 'electron';
import axios from 'axios';
import path from 'path'
import fs from 'fs';
import { getLang } from '../../../lang/i18n';
import { compareVersions } from '../../util/util';
import { ArgsUpgradeRestart } from '../../../config/startArgs';

import { 
    ChannelsAutoUpgradeStr, 
    ChannelsAutoUpgradeCheckStr, 
    ChannelsAutoUpgradeLatestStr,
} from '../../../config/channel';

async function getUpdateUrl() {
    let lang = getLang();
    // lang = "zh-CN";
    let checkUpdateUrl = "https://raw.githubusercontent.com/jiangliuer326442/ApiChain/refs/heads/main/package.json";
    if (lang === "zh-CN") {
        checkUpdateUrl = "https://gitee.com/onlinetool/apichain/raw/main/package.json";
    }

    return checkUpdateUrl;
}

/**
 * 
 * @returns 
const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');

let mainWindow;

// 创建主窗口
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true, // 开发环境下开启，生产环境建议用 contextBridge
      contextIsolation: false,
    },
  });

  mainWindow.loadFile('index.html');
  // 打开开发者工具（开发环境）
  mainWindow.webContents.openDevTools();

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(createWindow);

// 监听渲染进程的更新请求
ipcMain.handle('update-app', async (event, newAsarPath) => {
  try {
    // 1. 获取旧 asar 文件路径（根据你的应用打包结构调整）
    const oldAsarPath = path.join(process.resourcesPath, 'app.asar');
    // 2. 验证新 asar 文件是否存在
    if (!fs.existsSync(newAsarPath)) {
      throw new Error('新的asar文件不存在：' + newAsarPath);
    }

    // 3. 生成更新脚本路径
    const updateScriptPath = path.join(app.getPath('temp'), 'update-app.js');
    // 4. 写入更新脚本（子进程执行，避免主进程占用文件）
    const updateScript = `
      const fs = require('fs');
      const path = require('path');
      const { spawn } = require('child_process');
      
      // 替换asar文件并重启应用
      async function updateAndRestart() {
        try {
          // 旧asar路径
          const oldAsarPath = '${oldAsarPath}';
          // 新asar路径
          const newAsarPath = '${newAsarPath}';
          // 应用可执行文件路径
          const appExePath = '${process.execPath}';
          
          // 先备份旧asar（可选）
          if (fs.existsSync(oldAsarPath)) {
            fs.copyFileSync(oldAsarPath, oldAsarPath + '.bak');
          }
          
          // 替换asar文件
          fs.copyFileSync(newAsarPath, oldAsarPath);
          console.log('asar文件替换成功');
          
          // 删除临时更新脚本
          fs.unlinkSync(__filename);
          
          // 重启应用
          spawn(appExePath, [], {
            detached: true,
            stdio: 'ignore'
          });
        } catch (error) {
          console.error('更新失败：', error);
        }
      }
      
      // 延迟执行（确保主进程已关闭）
      setTimeout(updateAndRestart, 1000);
    `;

    // 写入更新脚本到临时目录
    fs.writeFileSync(updateScriptPath, updateScript);

    // 5. 启动子进程执行更新脚本（脱离主进程）
    spawn(process.execPath, [updateScriptPath], {
      detached: true,
      stdio: 'ignore'
    }).unref();

    // 6. 关闭当前应用
    app.quit();

    return { success: true, message: '开始执行更新流程' };
  } catch (error) {
    console.error('更新流程启动失败：', error);
    return { success: false, message: error.message };
  }
});

// 所有窗口关闭时退出（macOS 除外）
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
 */
export default function (){
    if (!app.isPackaged) return;
    ipcMain.on(ChannelsAutoUpgradeStr, async (event, action) => {
        if (action !== ChannelsAutoUpgradeCheckStr) return;
        const checkUpdateUrl = await getUpdateUrl();
        axios.get(checkUpdateUrl)
        .then(async response => {
            let originResponse = response.data;
            const newVersion = originResponse.version;
            const currentVersion = app.getVersion();
            if (compareVersions(newVersion, currentVersion) != 1) {
                log.info("check update3");
                event.reply(ChannelsAutoUpgradeStr, ChannelsAutoUpgradeLatestStr); 
                return;
            }
            //下载app.asar文件到临时目录
            let lang = getLang();
            // lang = "zh-CN";
            let source = "github";
            if (lang === "zh-CN") {
                source = "gitee";
            }
            const downloadUrl = originResponse.downloadUrls[source];
            log.info("downloadUrl", downloadUrl);
            const tempFilePath = path.join(app.getPath('temp'), `apichain-${Date.now()}.tmp`);
            const targetFilePath = app.getAppPath();
            log.info("tmepPath", tempFilePath);
            log.info("targetPath", targetFilePath);

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

                app.relaunch({
                    args: process.argv.slice(1).concat([
                        '--action=' + ArgsUpgradeRestart,
                        '--tmpPath=' + tempFilePath
                    ])
                });
                app.exit(0);
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