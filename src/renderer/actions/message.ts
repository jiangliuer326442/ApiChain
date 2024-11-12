import IDBExportImport from 'indexeddb-export-import';

import { 
    TABLE_VERSION_ITERATION_FIELDS,
    TABLE_MICRO_SERVICE_FIELDS,
} from '../../config/db';
import { ENV_VALUE_API_HOST } from '../../config/envKeys';
import { 
    ChannelsMarkdownStr,
    ChannelsDbStr, 
    ChannelsDbExportStr,
    ChannelsDbWriteStr,
    ChannelsDbImportStr,
    ChannelsMarkdownQueryStr,
    ChannelsMarkdownQueryResultStr,
    ChannelsUserInfoSetUserinfoStr,
    ChannelsUserInfoSetAppinfoStr,
    ChannelsUserInfoStr,
    ChannelsMockServerStr,
    ChannelsMockServerQueryStr,
    ChannelsMockServerQueryResultStr,
} from '../../config/global_config';
import { SET_DEVICE_INFO } from '../../config/redux';

import { getVarsByKey } from '../actions/env_value';
import { getPrjs } from '../actions/project';
import { getEnvs } from '../actions/env';
import { getVersionIterator } from '../actions/version_iterator';
import { getVersionIteratorRequestsByProject } from '../actions/version_iterator_requests';

let prj_label = TABLE_MICRO_SERVICE_FIELDS.FIELD_LABEL;
let version_iterator_projects = TABLE_VERSION_ITERATION_FIELDS.FIELD_PROJECTS;

/**
 * 处理消息通用类
 * @param dispatch 
 * @param cb 
 */
export default function(dispatch, cb) : void {
    if('electron' in window) {

        //备份数据库
        window.electron.ipcRenderer.on(ChannelsDbStr, (action, path) => {
            if (action === ChannelsDbExportStr) {
                const idbDatabase = window.db.backendDB();
                IDBExportImport.exportToJsonString(idbDatabase, (err, jsonString) => {
                    if (err) {
                        console.error(err);
                    } else {
                        window.electron.ipcRenderer.sendMessage(ChannelsDbStr, ChannelsDbWriteStr, path, jsonString);
                    }
                });
            }
        });

        //还原数据库
        window.electron.ipcRenderer.on(ChannelsDbStr, (action, jsonString) => {
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

        //刷迭代文档
        window.electron.ipcRenderer.on(ChannelsMarkdownStr, async (action, iteratorId) => {
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

            window.electron.ipcRenderer.sendMessage(ChannelsMarkdownStr, ChannelsMarkdownQueryResultStr, versionIteration, requests, prjs, envs, envVars);
        });

        //刷迭代接口
        window.electron.ipcRenderer.on(ChannelsMockServerStr, async (action, iteratorId, projectId, method, uri) => {
            if (action !== ChannelsMockServerQueryStr) return;
            let versionIteration = await getVersionIterator(iteratorId);
            let requests = await getVersionIteratorRequestsByProject(iteratorId, projectId, null, "", uri);
            window.electron.ipcRenderer.sendMessage(ChannelsMockServerStr, ChannelsMockServerQueryResultStr, versionIteration, requests);
        });

        //设置用户信息
        window.electron.ipcRenderer.on(ChannelsUserInfoStr, (action, uuid, uname, rtime, vipFlg, expireTime) => {
            if (action !== ChannelsUserInfoSetUserinfoStr) return;
            dispatch({
                type: SET_DEVICE_INFO,
                uuid,
                uname,
                rtime,
                vipFlg, 
                expireTime
            });
        });

        //设置app信息
        window.electron.ipcRenderer.on(ChannelsUserInfoStr, (action, html, ip, appName, appVersion) => {
            if (action !== ChannelsUserInfoSetAppinfoStr) return;
            dispatch({
                type: SET_DEVICE_INFO,
                html,
                ip,
                appName,
                appVersion
            });
        });
    }
}