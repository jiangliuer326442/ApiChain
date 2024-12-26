import IDBExportImport from 'indexeddb-export-import';

import { 
    TABLE_VERSION_ITERATION_FIELDS,
    TABLE_MICRO_SERVICE_FIELDS,
    TABLE_REQUEST_HISTORY_NAME,
    TABLE_UNITTEST_EXECUTOR_REPORT_NAME,
    TABLE_UNITTEST_EXECUTOR_NAME,
} from '../../config/db';
import { ENV_VALUE_API_HOST } from '../../config/envKeys';
import {
    ChannelsDbLongStr, 
    ChannelsDbExportStr,
    ChannelsDbWriteStr,
    ChannelsDbImportStr,
    ChannelsDbTrunkStr,
    ChannelsMarkdownLongStr,
    ChannelsMarkdownQueryStr,
    ChannelsMarkdownQueryResultStr,
    ChannelsMockServerLongStr,
    ChannelsMockServerQueryStr,
    ChannelsMockServerQueryResultStr,
    ChannelsAxioBreidgeStr, 
    ChannelsAxioBreidgeSendStr, 
    ChannelsAxioBreidgeReplyStr,
} from '../../config/channel';

import { getVarsByKey } from '../actions/env_value';
import { getPrjs } from '../actions/project';
import { getEnvs } from '../actions/env';
import { getVersionIterator } from '../actions/version_iterator';
import { getVersionIteratorRequestsByProject } from '../actions/version_iterator_requests';
import { isStringEmpty } from '../util';

let prj_label = TABLE_MICRO_SERVICE_FIELDS.FIELD_LABEL;
let version_iterator_projects = TABLE_VERSION_ITERATION_FIELDS.FIELD_PROJECTS;

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
export default function(dispatch, cb) : void {
    if('electron' in window) {

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
                          alert("数据库还原成功!");
                        //   window.electron.ipcRenderer.sendMessage(ChannelsDbStr, ChannelsDbImportSuccessStr);
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
                  alert("清空缓存成功!");
                },
              );
            }
        });

        //刷迭代文档
        window.electron.ipcRenderer.on(ChannelsMarkdownLongStr, async (action, iteratorId) => {
            if (action !== ChannelsMarkdownQueryStr) return;
            let prjs = await getPrjs(null);
            let envs = await getEnvs(null);
            let versionIteration = await getVersionIterator(iteratorId);
            let requests = await getVersionIteratorRequestsByProject(iteratorId, "", null, "", "");

            let versionIterationPrjs = versionIteration[version_iterator_projects];
            prjs = prjs.filter(_prj => versionIterationPrjs.includes(_prj[prj_label]));

            let envVars : any = {};
            for (let _prj of prjs) {
                let projectLabel = _prj[prj_label];
                const envVarItems = await getVarsByKey(projectLabel, ENV_VALUE_API_HOST);
                envVars[projectLabel] = envVarItems;
            }

            window.electron.ipcRenderer.sendMessage(ChannelsMarkdownLongStr, ChannelsMarkdownQueryResultStr, versionIteration, requests, prjs, envs, envVars);
        });

        //mock 接口处理
        window.electron.ipcRenderer.on(ChannelsMockServerLongStr, async (action, iteratorId, projectId, method, uri) => {
            if (action !== ChannelsMockServerQueryStr) return;
            let versionIteration = await getVersionIterator(iteratorId);
            let requests = await getVersionIteratorRequestsByProject(iteratorId, projectId, null, "", uri);
            window.electron.ipcRenderer.sendMessage(ChannelsMockServerLongStr, ChannelsMockServerQueryResultStr, versionIteration, requests);
        });
    }
}