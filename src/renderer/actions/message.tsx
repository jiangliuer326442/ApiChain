import IDBExportImport from 'indexeddb-export-import';

import { Button, Card, notification, Space } from 'antd';

import { getStartParams, isStringEmpty } from '@rutil/index';
import {
    IS_AUTO_UPGRADE,
    UNITTEST_ENV,
    PRJ,
    ENV,
} from '@conf/storage';
import { 
    TABLE_VERSION_ITERATION_FIELDS,
    TABLE_MICRO_SERVICE_FIELDS,
    TABLE_REQUEST_HISTORY_NAME,
    TABLE_UNITTEST_EXECUTOR_REPORT_NAME,
    TABLE_UNITTEST_EXECUTOR_NAME,
} from '@conf/db';
import {
    ChannelsDbLongStr, 
    ChannelsDbExportStr,
    ChannelsDbWriteStr,
    ChannelsDbImportStr,
    ChannelsDbTrunkStr,
    ChannelsAutoUpgradeStr,
    ChannelsMarkdownLongStr,
    ChannelsAutoUpgradeDownloadStr,
    ChannelsMarkdownQueryStr,
    ChannelsMarkdownQueryResultStr,
    ChannelsMockServerLongStr,
    ChannelsMockServerQueryStr,
    ChannelsMockServerQueryResultStr,
    ChannelsAxioBreidgeStr, 
    ChannelsAxioBreidgeSendStr, 
    ChannelsAxioBreidgeReplyStr,
    ChannelsAxioTeanSendStr,
    ChannelsAutoUpgradeNewVersionStr,
    ChannelsAxioTeamReplyStr,
} from '@conf/channel';

import { getEnvHosts } from '@act/env_value';
import { getPrjs } from '@act/project';
import { getEnvs } from '@act/env';
import { getRemoteVersionIterator } from '@act/version_iterator';
import { getSimpleVersionIteratorRequests } from '@act/version_iterator_requests';
import { langFormat, langTrans } from '@lang/i18n';

let argsObject = getStartParams();
console.log("messages argsObject", argsObject)
let clientType = argsObject.clientType;

let prj_label = TABLE_MICRO_SERVICE_FIELDS.FIELD_LABEL;
let version_iterator_projects = TABLE_VERSION_ITERATION_FIELDS.FIELD_PROJECTS;

/**
 * 发送联网请求
 * @param url 请求地址
 * @param postData 主体数据
 * @returns 
 */
export function sendTeamMessage(url : string, postData) {
    return new Promise((resolve, reject) => {

        let messageSendListener = window.electron.ipcRenderer.on(ChannelsAxioBreidgeStr, (action, originUrl, errorMessage, data) => {
            if (action === ChannelsAxioTeamReplyStr && originUrl === url) {
                messageSendListener();
                if (isStringEmpty(errorMessage)) {
                    resolve(data);
                } else {
                    reject({errorMessage});
                }
            }
        });

        window.electron.ipcRenderer.sendMessage(ChannelsAxioBreidgeStr, ChannelsAxioTeanSendStr, url, postData);
    });
}

/**
 * 发送网络请求
 * @param method 请求方法
 * @param url 请求地址
 * @param headData 头部数据
 * @param postData 主体数据
 * @param fileData 文件数据
 * @returns 
 */
export function sendAjaxMessage(method : string, url : string, headData, postData, fileData) {
    return new Promise((resolve, reject) => {

        let messageSendListener = window.electron.ipcRenderer.on(ChannelsAxioBreidgeStr, (action, originUrl, targetUrl, statusCode, costTime, errorMessage, cookieObj, headers, data) => {
            if (action === ChannelsAxioBreidgeReplyStr) {
                messageSendListener();
                if (isStringEmpty(errorMessage) && statusCode == 200) {
                    resolve({originUrl, cookieObj, headers, costTime, data});
                } else {
                    if (statusCode === undefined) {
                        statusCode = 500;
                    }
                    if (errorMessage === undefined) {
                        errorMessage = "Internel Error";
                    }
                    reject({errorMessage, statusCode});
                }
            }
        });

        window.electron.ipcRenderer.sendMessage(ChannelsAxioBreidgeStr, ChannelsAxioBreidgeSendStr, method, url, headData, postData, fileData);
    });
}

/**
 * 处理消息通用类
 * @param dispatch 
 * @param cb 
 */
export default function() : void {
    if('electron' in window) {

        window.electron.ipcRenderer.on(ChannelsAutoUpgradeStr, (action, newVersion) => {
            if (action !== ChannelsAutoUpgradeNewVersionStr) {
              return;
            }
            let items = newVersion.releaseNotes.split("\\n");
            notification.open({
              message: langFormat("upgrade message", {"version": newVersion.version}),
              description:(<Card title={ langTrans("upgrade title") } style={{ width: 300 }}>
                {items.map((item, index) => (
                  <p key={index}>{item}</p >
                ))}
              </Card>),
              btn: <Space>
                <Button type="link" size="small" onClick={() => notification.destroy()}>
                    {langTrans("upgrade btn cancel")}
                </Button>
                <Button type="primary" size="small" onClick={() => {
                    window.electron.ipcRenderer.sendMessage(ChannelsAutoUpgradeStr, ChannelsAutoUpgradeDownloadStr);
                    notification.destroy();
                }}>
                    {langTrans("upgrade btn sure")}
                </Button>
                </Space>,
              key: 'newVersion',
              duration: 0,
            });
        });

        //备份数据库
        window.electron.ipcRenderer.on(ChannelsDbLongStr, (action, path) => {
            if (action === ChannelsDbExportStr) {
                const idbDatabase = window.db.backendDB();
                IDBExportImport.exportToJsonString(idbDatabase, (err, jsonString) => {
                    if (err) {
                        console.error(err);
                    } else {
                        window.electron.ipcRenderer.sendMessage(ChannelsDbLongStr, ChannelsDbWriteStr, path, jsonString);
                    }
                });
            }
        });

        //还原数据库
        window.electron.ipcRenderer.on(ChannelsDbLongStr, (action, jsonString) => {
            if (action === ChannelsDbImportStr) {
                const idbDatabase = window.db.backendDB();
                IDBExportImport.clearDatabase(idbDatabase, function(err) {
                    if (!err) {
                      IDBExportImport.importFromJsonString(idbDatabase, jsonString, function(err) {
                        if (!err) {
                          alert(langTrans("db load success"));
                        }
                      });
                    }
                });
            }
        });

        //清空缓存数据
        window.electron.ipcRenderer.on(ChannelsDbLongStr, (action) => {
            if (action === ChannelsDbTrunkStr) {
                window.db.transaction('rw',
                window.db[TABLE_REQUEST_HISTORY_NAME],
                window.db[TABLE_UNITTEST_EXECUTOR_NAME],
                window.db[TABLE_UNITTEST_EXECUTOR_REPORT_NAME],
                async () => {
                    await window.db[TABLE_REQUEST_HISTORY_NAME].clear();
                    await window.db[TABLE_UNITTEST_EXECUTOR_NAME].clear();
                    await window.db[TABLE_UNITTEST_EXECUTOR_REPORT_NAME].clear();

                    localStorage.removeItem(IS_AUTO_UPGRADE);
                    localStorage.removeItem(UNITTEST_ENV);
                    localStorage.removeItem(PRJ);
                    localStorage.removeItem(ENV);
                    alert("清空缓存成功!");
                },
              );
            }
        });

        //刷迭代文档
        window.electron.ipcRenderer.on(ChannelsMarkdownLongStr, async (action, iteratorId) => {
            if (action !== ChannelsMarkdownQueryStr) return;
            let prjs = await getPrjs(clientType, null);
            let envs = await getEnvs(clientType, null);
            let versionIteration = await getRemoteVersionIterator(clientType, iteratorId);
            let requests = await getSimpleVersionIteratorRequests(clientType, iteratorId, "", null, "", "");

            let versionIterationPrjs = versionIteration[version_iterator_projects];
            prjs = prjs.filter(_prj => versionIterationPrjs.includes(_prj[prj_label]));

            let envVars : any = {};
            for (let _prj of prjs) {
                let projectLabel = _prj[prj_label];
                const envVarItems = await getEnvHosts(clientType, projectLabel, null);
                envVars[projectLabel] = envVarItems;
            }

            window.electron.ipcRenderer.sendMessage(ChannelsMarkdownLongStr, ChannelsMarkdownQueryResultStr, versionIteration, requests, prjs, envs, envVars);
        });

        //mock 接口处理
        window.electron.ipcRenderer.on(ChannelsMockServerLongStr, async (action, iteratorId, projectId, method, uri) => {
            if (action !== ChannelsMockServerQueryStr) return;
            let versionIteration = await getRemoteVersionIterator(clientType, iteratorId);
            let requests = await getSimpleVersionIteratorRequests(clientType, iteratorId, projectId, null, "", uri);
            window.electron.ipcRenderer.sendMessage(ChannelsMockServerLongStr, ChannelsMockServerQueryResultStr, versionIteration, requests);
        });
    }
}