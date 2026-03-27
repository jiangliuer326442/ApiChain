import IDBExportImport from 'indexeddb-export-import';
import axios from 'axios';

import { Button, Card, message, notification, Space } from 'antd';

import { getStartParams, isStringEmpty } from '@rutil/index';
import {
    IS_AUTO_UPGRADE,
    UNITTEST_ENV,
    ENV,
} from '@conf/storage';
import { 
    TABLE_ENV_VAR_NAME, TABLE_ENV_VAR_FIELDS,
    TABLE_VERSION_ITERATION_FIELDS,
    TABLE_MICRO_SERVICE_FIELDS,
    TABLE_REQUEST_HISTORY_NAME,
    TABLE_UNITTEST_EXECUTOR_REPORT_NAME,
    TABLE_UNITTEST_EXECUTOR_NAME,
} from '@conf/db';
import {
    ENV_VALUE_RUN_MODE_CLIENT,
    ENV_VALUE_DB_HOST, 
    ENV_VALUE_DB_PORT, 
    ENV_VALUE_DB_USERNAME, 
    ENV_VALUE_DB_PASSWORD, 
    ENV_VALUE_DB_NAME, 
    ENV_VALUE_DB_RUN_MODE,
    ENV_VALUE_RUN_MODE_RUMMER 
} from '@conf/envKeys';
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
    ChannelsMessageStr,
    ChannelsMessageErrorStr,
    ChannelsMessageInfoStr,
    ChannelsDatabaseStr, 
    ChannelsDatabaseQuery, 
    ChannelsDatabaseQueryResult
} from '@conf/channel';
import {
    CLIENT_TYPE_TEAM,
    NETWORK_REQUEST_URL,
    DB_CONFIG_GET_URL,
    NETWORK_DB_REQUEST_URL,
} from '@conf/team';
import {
    CONTENT_TYPE_FORMDATA
} from '@conf/contentType';

import { getEnvHosts, encryptPromise } from '@act/env_value';
import { getPrjs } from '@act/project';
import { getEnvs } from '@act/env';
import { getRemoteVersionIterator } from '@act/version_iterator';
import { getSimpleVersionIteratorRequests } from '@act/version_iterator_requests';
import { langFormat, langTrans } from '@lang/i18n';

let env_var_env = TABLE_ENV_VAR_FIELDS.FIELD_ENV_LABEL;
let env_var_micro_service = TABLE_ENV_VAR_FIELDS.FIELD_MICRO_SERVICE_LABEL;
let env_var_iteration = TABLE_ENV_VAR_FIELDS.FIELD_ITERATION;
let env_var_unittest = TABLE_ENV_VAR_FIELDS.FIELD_UNITTEST;
let env_var_delFlg = TABLE_ENV_VAR_FIELDS.FIELD_DELFLG;
let env_var_pname = TABLE_ENV_VAR_FIELDS.FIELD_PARAM_NAME;
let env_var_pvalue = TABLE_ENV_VAR_FIELDS.FIELD_PARAM_VAR;

let argsObject = getStartParams();
let clientType = argsObject.clientType;
let clientHost = argsObject.clientHost;

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

export async function executeQuerySql(clientType : string, env : string, project : string, sql : string, params : Array<string>) {
    let dbConfig = await getDbConfig(clientType, env, project);
    if (dbConfig['db_run_mode'] == ENV_VALUE_RUN_MODE_CLIENT) {
        return executeQuerySqlByClient(dbConfig, sql, params);
    } else {
        let teamRet = await sendTeamMessage(NETWORK_DB_REQUEST_URL, {
            project,
            env,
            sql,
            params: JSON.stringify(params),
        });
        return new Promise((resolve, reject) => {
            let isSuccess = teamRet["isSuccess"];
            let errorMessage = teamRet['errorMessage'];
            let ret = teamRet['ret'];
            if (isSuccess) {
                resolve(ret);
            } else {
                reject({message: errorMessage});
            }
        });
    }
}

function executeQuerySqlByClient(dbConfig, sql : string, params : Array<string>) {
    return new Promise((resolve, reject) => {

        let listener = window.electron.ipcRenderer.on(ChannelsDatabaseStr, (action, isSuccess, errorMessage, ret) => {
            if (action === ChannelsDatabaseQueryResult) {
                listener();
                if (isSuccess) {
                    resolve(ret);
                } else {
                    reject({message: errorMessage});
                }
            }
        });

        window.electron.ipcRenderer.sendMessage(ChannelsDatabaseStr, ChannelsDatabaseQuery, dbConfig, sql, params);
    });
}

async function getDbConfig(clientType : string, env : string, project : string) {
    let dbConfig : any;
    if (clientType === CLIENT_TYPE_TEAM) {
        dbConfig = await sendTeamMessage(DB_CONFIG_GET_URL, {prj: project, env});
        let encryptPwd = await encryptPromise(dbConfig["db_password"]);
        dbConfig["db_password"] = encryptPwd;
    } else {
        let envValues = await db[TABLE_ENV_VAR_NAME]
        .where([ env_var_env, env_var_micro_service, env_var_iteration, env_var_unittest ])
        .equals([ env, project, "", "" ])
        .filter(row => {
            if (row[env_var_delFlg]) {
                return false;
            }
            return [    
                ENV_VALUE_DB_HOST, 
                ENV_VALUE_DB_PORT, 
                ENV_VALUE_DB_USERNAME, 
                ENV_VALUE_DB_PASSWORD, 
                ENV_VALUE_DB_NAME, 
                ENV_VALUE_DB_RUN_MODE
            ].includes(row[env_var_pname])
        })
        .toArray();

        dbConfig = {};
        for(let row of envValues) {
            if (row[env_var_pname] == ENV_VALUE_DB_HOST) {
                dbConfig['db_host'] = row[env_var_pvalue];
            } else if (row[env_var_pname] == ENV_VALUE_DB_PORT) {
                dbConfig['db_port'] = row[env_var_pvalue];
            } else if (row[env_var_pname] == ENV_VALUE_DB_USERNAME) {
                dbConfig['db_username'] = row[env_var_pvalue];
            } else if (row[env_var_pname] == ENV_VALUE_DB_PASSWORD) {
                dbConfig['db_password'] = row[env_var_pvalue];
            } else if (row[env_var_pname] == ENV_VALUE_DB_NAME) {
                dbConfig['db_name'] = row[env_var_pvalue];
            } else if (row[env_var_pname] == ENV_VALUE_DB_RUN_MODE) {
                dbConfig['db_run_mode'] = row[env_var_pvalue];
            }
        }
    }
    return dbConfig;
}

export function sendAjaxMessage(runMode : string, method : string, url : string, headData, postData, fileData) {
    if (runMode === ENV_VALUE_RUN_MODE_RUMMER) {
        return sendAjaxMessageByRunner(method, url, headData, postData, fileData);
    } else {
        return sendAjaxMessageByClient(method, url, headData, postData, fileData);
    }
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
function sendAjaxMessageByClient(method : string, url : string, headData, postData, fileData) {
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

function sendAjaxMessageByRunner(method : string, url : string, headData, postData, fileData) {
    let formData = new FormData();
    formData.append("url", url);
    formData.append("method", method);
    formData.append("headData", JSON.stringify(headData))
    if (postData !== null){
        formData.append("bodyData", JSON.stringify(postData))
    }
    if (fileData !== null) {
        for (let _key in fileData) {
            let _file = fileData[_key];
            const blobFile = new Blob([_file.blob], { type: _file.type });  
            formData.append(_key, blobFile, _file.name);
        }
    }

    return new Promise((resolve, reject) => {
        axios.post(clientHost + NETWORK_REQUEST_URL, formData, {
            headers: {
                CONTENT_TYPE: CONTENT_TYPE_FORMDATA,
            },
            maxRedirects: 0,
        }).then(response => {
            let data = response.data.data;
            let errorMessage = data[3];
            let statusCode = data[1];
            let originUrl = data[0];
            let cookieObj = data[4];
            let headers = data[5];
            let costTime = data[2];
            if (isStringEmpty(errorMessage) && statusCode == 200) {
                resolve({originUrl, cookieObj, headers, costTime, data: data[6]});
            } else {
                if (statusCode === undefined) {
                    statusCode = 500;
                }
                if (errorMessage === undefined) {
                    errorMessage = "Internel Error";
                }
                reject({errorMessage, statusCode});
            }
        })
    });
}

/**
 * 处理消息通用类
 * @param dispatch 
 * @param cb 
 */
export default function() : void {
    if('electron' in window) {

        //版本更新
        window.electron.ipcRenderer.on(ChannelsAutoUpgradeStr, (action, newVersion) => {
            if (action !== ChannelsAutoUpgradeNewVersionStr) {
              return;
            }
            let items = newVersion.releaseNotes.split("\n");
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
                    localStorage.removeItem(ENV);
                    alert(langTrans("db clean success"));
                },
              );
            }
        });

        //刷迭代文档
        window.electron.ipcRenderer.on(ChannelsMarkdownLongStr, async (action, teamId : string, iteratorId : string) => {
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
                const envVarItems = await getEnvHosts(clientType, teamId, projectLabel, null);
                envVars[projectLabel] = envVarItems;
            }

            window.electron.ipcRenderer.sendMessage(ChannelsMarkdownLongStr, ChannelsMarkdownQueryResultStr, versionIteration, requests, prjs, envs, envVars);
        });

        //mock 接口处理
        window.electron.ipcRenderer.on(ChannelsMockServerLongStr, async (action, iteratorId : string, projectId : string, method, uri) => {
            if (action !== ChannelsMockServerQueryStr) return;
            let versionIteration = await getRemoteVersionIterator(clientType, iteratorId);
            let requests = await getSimpleVersionIteratorRequests(clientType, iteratorId, projectId, null, "", uri);
            window.electron.ipcRenderer.sendMessage(ChannelsMockServerLongStr, ChannelsMockServerQueryResultStr, versionIteration, requests);
        });

        window.electron.ipcRenderer.on(ChannelsMessageStr, (action, content : string) => {
            if (action === ChannelsMessageErrorStr) {
                message.error(content, 5);
                return;
            }
            if (action === ChannelsMessageInfoStr) {
                message.info(content, 5);
                return;
            }
        })
    }
}