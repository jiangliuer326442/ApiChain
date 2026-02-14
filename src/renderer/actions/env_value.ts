import { cloneDeep } from 'lodash';

import {
    isStringEmpty,
    mixedSort
} from '@rutil/index'
import { ENV_VALUE_API_HOST, ENV_VALUE_RUN_MODE } from '@conf/envKeys';
import { 
    ChannelsEncryptStr, 
    ChannelsEncryptEncrypt, 
    ChannelsEncryptEncryptResult,
    ChannelsEncryptDecrypt,
    ChannelsEncryptDecryptResult,
} from '@conf/channel';
import { 
    TABLE_ENV_KEY_NAME, TABLE_ENV_KEY_FIELDS,
    TABLE_ENV_VAR_NAME, TABLE_ENV_VAR_FIELDS,
    UNAME
} from '@conf/db';
import { 
    CLIENT_TYPE_TEAM,
    CLIENT_TYPE_SINGLE, 
    ENV_VARS_GLOBAL_PAGE_URL,
    ENV_VARS_GLOBAL_COPY_URL,
    ENV_VARS_GLOBAL_SET_URL,
    ENV_VARS_PROJECT_SET_URL,
    ENV_VARS_GLOBAL_DEL_URL,
    ENV_VARS_PROJECT_DEL_URL,
    ENV_VARS_PROJECT_PAGE_URL,
    ENV_VARS_GLOBAL_DATAS_URL,
    ENV_VARS_PROJECT_DATAS_URL,
    ENV_VARS_ITERATOR_DATAS_URL,
    ENV_VARS_ITERATOR_PAGE_URL,
    ENV_VARS_ITERATOR_SET_URL,
    ENV_VARS_ITERATOR_DEL_URL,
    ENV_VARS_UNITTEST_DATAS_URL,
    ENV_VARS_UNITTEST_DEL_URL,
    ENV_VARS_UNITTEST_SET_URL,
    ENV_VARS_ITERATION_COPY_URL,
    ENV_VARS_PROJECT_COPY_URL,
    ENV_VARS_UNITTEST_PAGE_URL,
    PRJ_HOST_URL,
    PRJ_RUN_MODE_URL,
} from '@conf/team';
import { getUsers } from '@act/user';
import { sendTeamMessage } from '@act/message';

let env_key_delFlg = TABLE_ENV_KEY_FIELDS.FIELD_DELFLG;
let env_key_prj = TABLE_ENV_KEY_FIELDS.FIELD_MICRO_SERVICE_LABEL;
let env_key_pname = TABLE_ENV_KEY_FIELDS.FIELD_PARAM_NAME;
let env_key_cuid = TABLE_ENV_KEY_FIELDS.FIELD_CUID;
let env_key_ctime = TABLE_ENV_KEY_FIELDS.FIELD_CTIME;

let env_var_env = TABLE_ENV_VAR_FIELDS.FIELD_ENV_LABEL;
let env_var_micro_service = TABLE_ENV_VAR_FIELDS.FIELD_MICRO_SERVICE_LABEL;
let env_var_iteration = TABLE_ENV_VAR_FIELDS.FIELD_ITERATION;
let env_var_unittest = TABLE_ENV_VAR_FIELDS.FIELD_UNITTEST;
let env_var_pname = TABLE_ENV_VAR_FIELDS.FIELD_PARAM_NAME;
let env_var_pvalue = TABLE_ENV_VAR_FIELDS.FIELD_PARAM_VAR;
let env_var_premark = TABLE_ENV_VAR_FIELDS.FIELD_PARAM_REMARK;
let env_var_pencrypt = TABLE_ENV_VAR_FIELDS.FIELD_ENCRYPTFLG;
let env_var_delFlg = TABLE_ENV_VAR_FIELDS.FIELD_DELFLG;
let env_var_cuid = TABLE_ENV_VAR_FIELDS.FIELD_CUID;
let env_var_ctime = TABLE_ENV_VAR_FIELDS.FIELD_CTIME;

export function encryptPromise (content : string) {
    return new Promise((resolve, reject) => {

        let listener = window.electron.ipcRenderer.on(ChannelsEncryptStr, (action, encryptContent) => {
            if (action === ChannelsEncryptEncryptResult) {
                listener();
                resolve(encryptContent);
            }
        });

        window.electron.ipcRenderer.sendMessage(ChannelsEncryptStr, ChannelsEncryptEncrypt, content);
    });
}

export function batchDecryptPromise (keyvarEncryptContent) {
    return new Promise((resolve, reject) => {

        let listener = window.electron.ipcRenderer.on(ChannelsEncryptStr, (action, dataContent) => {
            if (action === ChannelsEncryptDecryptResult) {
                listener();
                resolve(dataContent);
            }
        });

        window.electron.ipcRenderer.sendMessage(ChannelsEncryptStr, ChannelsEncryptDecrypt, keyvarEncryptContent);
    });
}

export async function batchMoveIteratorEnvValue(prj : string, env : string, oldIterator : string, envVarKeyArr : Array<string>, newIterator : string, cb : () => void) {
    for (let _envVarKey of envVarKeyArr) {
        if (!isStringEmpty(prj)) {
            let iteratorPlusPrjObject = await db[TABLE_ENV_VAR_NAME]
            .where([env_var_env, env_var_micro_service, env_var_iteration, env_var_unittest, env_var_pname])
            .equals([env, prj, oldIterator, "", _envVarKey])
            .filter(row => {
                if (row[env_var_delFlg]) {
                    return false;
                }
                return true;
            })
            .first();

            if (iteratorPlusPrjObject === undefined) {
                continue;
            }

            await db[TABLE_ENV_VAR_NAME]
            .where([env_var_env, env_var_micro_service, env_var_iteration, env_var_unittest, env_var_pname])
            .equals([env, prj, oldIterator, "", _envVarKey])
            .filter(row => {
                if (row[env_var_delFlg]) {
                    return false;
                }
                return true;
            })
            .delete();
            let newData = cloneDeep(iteratorPlusPrjObject);
            newData[env_var_iteration] = newIterator;
            await window.db[TABLE_ENV_VAR_NAME].put(newData);
        }
        
        let iteratorObject = await db[TABLE_ENV_VAR_NAME]
        .where([env_var_env, env_var_micro_service, env_var_iteration, env_var_unittest, env_var_pname])
        .equals([env, "", oldIterator, "", _envVarKey])
        .filter(row => {
            if (row[env_var_delFlg]) {
                return false;
            }
            return true;
        })
        .first();
        
        if (iteratorObject === undefined) {
            continue;
        }

        await db[TABLE_ENV_VAR_NAME]
        .where([env_var_env, env_var_micro_service, env_var_iteration, env_var_unittest, env_var_pname])
        .equals([env, "", oldIterator, "", _envVarKey])
        .filter(row => {
            if (row[env_var_delFlg]) {
                return false;
            }
            return true;
        })
        .delete();
        let newData = cloneDeep(iteratorObject);
        newData[env_var_iteration] = newIterator;
        await window.db[TABLE_ENV_VAR_NAME].put(newData);
    }
    cb();
}

export async function getEnvRunModes(clientType : string, teamId : string, prj : string, env : string|null) : Promise<Map<string, string>> {
    let datas : any = {};

    if (clientType === CLIENT_TYPE_SINGLE) {
        const envVarItems = await db[TABLE_ENV_VAR_NAME]
        .where('[' + env_var_micro_service + '+' + env_var_iteration + '+' + env_var_unittest + '+' + env_var_pname + ']')
        .equals([prj, "", "", ENV_VALUE_RUN_MODE])
        .filter(row => {
            if (row[env_var_delFlg]) {
                return false;
            }
            if (env && row[env_var_env] !== env) {
                return false
            }
            return true;
        })
        .toArray();
        for (let globalRow of envVarItems) {
            datas[globalRow[env_var_env]] = globalRow[env_var_pvalue];
        }
    } else {
        datas = await sendTeamMessage(PRJ_RUN_MODE_URL, {teamId, prj, env});
    }

    return new Map(Object.entries(datas));
}

export async function getEnvHosts(clientType : string, teamId : string, prj : string, env : string|null) : Promise<Map<string, string>> {
    let datas : any = {};

    if (clientType === CLIENT_TYPE_SINGLE) {
        const envVarItems = await db[TABLE_ENV_VAR_NAME]
        .where('[' + env_var_micro_service + '+' + env_var_iteration + '+' + env_var_unittest + '+' + env_var_pname + ']')
        .equals([prj, "", "", ENV_VALUE_API_HOST])
        .filter(row => {
            if (row[env_var_delFlg]) {
                return false;
            }
            if (env && row[env_var_env] !== env) {
                return false
            }
            return true;
        })
        .toArray();
        for (let globalRow of envVarItems) {
            datas[globalRow[env_var_env]] = globalRow[env_var_pvalue];
        }
    } else {
        datas = await sendTeamMessage(PRJ_HOST_URL, {teamId, prj, env});
    }

    return new Map(Object.entries(datas));
}

export async function batchCopyGlobalEnvValues(clientType : string, teamId : string, oldEnv : string, newEnv : string, pnameArr : Array<string>) {
    if (clientType === CLIENT_TYPE_TEAM) {
        await sendTeamMessage(ENV_VARS_GLOBAL_COPY_URL, {pnamesStr: pnameArr.join(","), oldEnv, newEnv});
    } 
    for (let pname of pnameArr) {
        let envVarItem = await db[TABLE_ENV_VAR_NAME]
        .where('[' + env_var_env + '+' + env_var_micro_service + '+' + env_var_iteration + '+' + env_var_unittest + '+' + env_var_pname + ']')
        .equals([oldEnv, "", "", "", pname])
        .first();
        if (
            envVarItem === undefined || 
            envVarItem[env_var_delFlg] !== 0 ||
            envVarItem[env_var_env] === newEnv
        ) {
            continue;
        }
        envVarItem[env_var_env] = newEnv;
        if (clientType === CLIENT_TYPE_SINGLE) {
            envVarItem.upload_flg = 0;
            envVarItem.team_id = "";
        } else {
            envVarItem.upload_flg = 1;
            envVarItem.team_id = teamId;
        }
    
        await window.db[TABLE_ENV_VAR_NAME].put(envVarItem);
    }
}

export async function batchCopyProjectEnvValues(
    clientType : string, 
    teamId : string, 
    project : string, 
    oldEnv : string, 
    newEnv : string, 
    pnameArr : Array<string>
) {
    if (clientType === CLIENT_TYPE_TEAM) {
        await sendTeamMessage(ENV_VARS_PROJECT_COPY_URL, {
            project,
            pnamesStr: pnameArr.join(","), 
            oldEnv, newEnv
        });
    } 
    for (let pname of pnameArr) {
        let envVarItem = await db[TABLE_ENV_VAR_NAME]
        .where('[' + env_var_env + '+' + env_var_micro_service + '+' + env_var_iteration + '+' + env_var_unittest + '+' + env_var_pname + ']')
        .equals([oldEnv, project, "", "", pname])
        .first();
        if (
            envVarItem === undefined || 
            envVarItem[env_var_delFlg] !== 0 ||
            envVarItem[env_var_env] === newEnv
        ) {
            continue;
        }
        envVarItem[env_var_env] = newEnv;
        if (clientType === CLIENT_TYPE_SINGLE) {
            envVarItem.upload_flg = 0;
            envVarItem.team_id = "";
        } else {
            envVarItem.upload_flg = 1;
            envVarItem.team_id = teamId;
        }
    
        await window.db[TABLE_ENV_VAR_NAME].put(envVarItem);
    }
}

export async function batchCopyIteratorEnvValues(
    clientType : string, 
    teamId : string, 
    iterator : string,
    project : string, 
    oldEnv : string, 
    newEnv : string, 
    pnameArr : Array<string>
) {
    if (clientType === CLIENT_TYPE_TEAM) {
        await sendTeamMessage(ENV_VARS_ITERATION_COPY_URL, {
            iteration: iterator,
            project,
            pnamesStr: pnameArr.join(","), 
            oldEnv, newEnv
        });
    } 

    for (let pname of pnameArr) {
        let envVarItem = await db[TABLE_ENV_VAR_NAME]
        .where('[' + env_var_env + '+' + env_var_micro_service + '+' + env_var_iteration + '+' + env_var_unittest + '+' + env_var_pname + ']')
        .equals([oldEnv, project, iterator, '', pname])
        .reverse()
        .first();
        if (
            envVarItem === undefined || 
            envVarItem[env_var_delFlg] !== 0 ||
            envVarItem[env_var_env] === newEnv
        ) {
            continue;
        }
        envVarItem[env_var_env] = newEnv;
        if (clientType === CLIENT_TYPE_SINGLE) {
            envVarItem.upload_flg = 0;
            envVarItem.team_id = "";
        } else {
            envVarItem.upload_flg = 1;
            envVarItem.team_id = teamId;
        }
    
        await window.db[TABLE_ENV_VAR_NAME].put(envVarItem);
    }
}

export async function batchCopyEnvVales(prj : string, env : string, iterator : string, unittest : string, pnameArr : Array<string>, newEnv : string) {
    for (let pname of pnameArr) {
        let envVarItem = await db[TABLE_ENV_VAR_NAME]
        .where('[' + env_var_env + '+' + env_var_micro_service + '+' + env_var_iteration + '+' + env_var_unittest + '+' + env_var_pname + ']')
        .equals([env, prj, iterator, unittest, pname])
        .first();
        if (
            envVarItem === undefined || 
            envVarItem[env_var_delFlg] !== 0 ||
            envVarItem[env_var_env] === newEnv
        ) {
            continue;
        }
        envVarItem[env_var_env] = newEnv;

        console.debug("envVarItem", envVarItem);
    
        await window.db[TABLE_ENV_VAR_NAME].put(envVarItem);
    }
}

export async function getGlobalEnvValuesByPage(env : string, pname : string, clientType : string, pagination : any) {
    let page = pagination.current;
    let pageSize = pagination.pageSize;
    let datas = [];

    if (clientType === CLIENT_TYPE_SINGLE) {
        const offset = (page - 1) * pageSize;
        let globalArrays = await db[TABLE_ENV_VAR_NAME]
        .where([ env_var_env, env_var_micro_service, env_var_iteration, env_var_unittest ])
        .equals([ env, "", "", "" ])
        .filter(row => {
            if (row[env_var_delFlg]) {
                return false;
            }
            if (pname) {
                return row[env_var_pname] === pname;
            }
            return true;
        })
        .toArray();
        pagination.total = globalArrays.length;

        mixedSort(globalArrays, env_var_pname);

        datas = globalArrays.splice(offset, pageSize);

        let users = await getUsers(clientType);
        datas.forEach(item => {
            item[UNAME] = users.get(item[env_var_cuid]);
        });
    } else {
        let params = Object.assign({}, pagination, {env, pname});
        let result = await sendTeamMessage(ENV_VARS_GLOBAL_PAGE_URL, params);
        let count = result.count;
        pagination.total = count;
        datas = result.list;
    }

    return datas;
}

export async function getGlobalEnvValues(env : string, clientType : string) {
    let datas : any = {};

    if (clientType === CLIENT_TYPE_SINGLE) {
        let globalArrays = await db[TABLE_ENV_VAR_NAME]
        .where([ env_var_env, env_var_micro_service, env_var_iteration, env_var_unittest ])
        .equals([ env, "", "", "" ])
        .filter(row => {
            if (row[env_var_delFlg]) {
                return false;
            }
            return true;
        })
        .toArray(); 
        for (let globalRow of globalArrays) {
            datas[globalRow[env_var_pname]] = globalRow[env_var_pvalue];
        }
    } else {
        datas = await sendTeamMessage(ENV_VARS_GLOBAL_DATAS_URL, {env});
    }

    return new Map(Object.entries(datas));
}

export async function getPrjEnvValuesByPage(teamId, prj : string, env : string, pname : string, clientType : string, pagination : any) {
    let page = pagination.current;
    let pageSize = pagination.pageSize;
    let datas = [];

    if (clientType === CLIENT_TYPE_SINGLE) {
        const offset = (page - 1) * pageSize;
        let projectKeys = new Set<String>();
        let projectArrays = await db[TABLE_ENV_VAR_NAME]
        .where([ env_var_env, env_var_micro_service, env_var_iteration, env_var_unittest ])
        .equals([ env, prj, "", "" ])
        .filter(row => {
            if (pname) {
                return row[env_var_pname] === pname;
            }
            if (row[env_var_delFlg]) {
                return false;
            }
            return true;
        })
        .toArray();
        mixedSort(projectArrays, env_var_pname);
        projectKeys = new Set(projectArrays.map(item => ( item[env_var_pname])));
        for (let projectRow of projectArrays) {
            projectRow.source = 'prj';
            datas.push(projectRow);
        }
        let globalArrays = await db[TABLE_ENV_VAR_NAME]
        .where([ env_var_env, env_var_micro_service, env_var_iteration, env_var_unittest ])
        .equals([ env, "", "", "" ])
        .filter(row => {
            if (pname) {
                return row[env_var_pname] === pname;
            }
            if (projectKeys.has(row[env_var_pname])) {
                return false;
            }
            if (row[env_var_delFlg]) {
                return false;
            }
            return true;
        })
        .toArray(); 
        mixedSort(globalArrays, env_var_pname);
        for (let globalRow of globalArrays) {
            globalRow.source = 'global';
            datas.push(globalRow);
        }
        pagination.total = datas.length;

        datas = datas.splice(offset, pageSize);

        let users = await getUsers(clientType);
        datas.forEach(item => {
            item[UNAME] = users.get(item[env_var_cuid]);
        });
    } else {
        let params = Object.assign({}, pagination, {teamId, env, pname, prj});
        let result = await sendTeamMessage(ENV_VARS_PROJECT_PAGE_URL, params);
        let count = result.count;
        pagination.total = count;
        datas = result.list;
    }

    return datas;
}

export async function getPrjEnvValues(prj : string, env : string, teamId : string, clientType : string) {
    let datas : any = {};

    if (clientType === CLIENT_TYPE_SINGLE) {
        let waitDecryptDatas : any = {};
        let projectKeys = new Set<String>();
        let projectArrays = await db[TABLE_ENV_VAR_NAME]
        .where([ env_var_env, env_var_micro_service, env_var_iteration, env_var_unittest ])
        .equals([ env, prj, "", "" ])
        .filter(row => {
            if (row[env_var_delFlg]) {
                return false;
            }
            return true;
        })
        .toArray();
        projectKeys = new Set(projectArrays.map(item => ( item[env_var_pname])));
        for (let projectRow of projectArrays) {
            if (projectRow[env_var_pencrypt] != undefined && projectRow[env_var_pencrypt] == 1) {
                waitDecryptDatas[projectRow[env_var_pname]] = projectRow[env_var_pvalue];
            } else {
                datas[projectRow[env_var_pname]] = projectRow[env_var_pvalue];
            }
        }
        let globalArrays = await db[TABLE_ENV_VAR_NAME]
        .where([ env_var_env, env_var_micro_service, env_var_iteration, env_var_unittest ])
        .equals([ env, "", "", "" ])
        .filter(row => {
            if (projectKeys.has(row[env_var_pname])) {
                return false;
            }
            if (row[env_var_delFlg]) {
                return false;
            }
            return true;
        })
        .toArray(); 
        for (let globalRow of globalArrays) {
            if (globalRow[env_var_pencrypt] != undefined && globalRow[env_var_pencrypt] == 1) {
                waitDecryptDatas[globalRow[env_var_pname]] = globalRow[env_var_pvalue];
            } else {
                datas[globalRow[env_var_pname]] = globalRow[env_var_pvalue];
            }
        }
        if (Object.keys(waitDecryptDatas).length > 0) {
            let decryptResult = await batchDecryptPromise(waitDecryptDatas);
            Object.keys(decryptResult).forEach(key => {
                datas[key] = decryptResult[key]
            })
        }
    } else {
        datas = await sendTeamMessage(ENV_VARS_PROJECT_DATAS_URL, {teamId, env, prj});
    }

    return new Map(Object.entries(datas));
}

export async function getIteratorEnvValuesByPage(iterator : string, prj : string, env : string, pname : string, clientType : string, pagination : any) {
    let page = pagination.current;
    let pageSize = pagination.pageSize;
    let datas = [];

    if (clientType === CLIENT_TYPE_SINGLE) {
        const offset = (page - 1) * pageSize;
        let excludeKeys = new Set<String>();
        let iteratorPrjArrays = await db[TABLE_ENV_VAR_NAME]
        .where([ env_var_env, env_var_micro_service, env_var_iteration, env_var_unittest ])
        .equals([ env, prj, iterator, "" ])
        .filter(row => {
            if (pname) {
                return row[env_var_pname] === pname;
            }
            if (row[env_var_delFlg]) {
                return false;
            }
            return true;
        })
        .toArray();
        mixedSort(iteratorPrjArrays, env_var_pname);
        excludeKeys = new Set(iteratorPrjArrays.map(item => ( item[env_var_pname])));
        for (let iteratorPrjRow of iteratorPrjArrays) {
            iteratorPrjRow.source = 'iterator_prj';
            datas.push(iteratorPrjRow);
        }

        let iteratorArrays = await db[TABLE_ENV_VAR_NAME]
        .where([ env_var_env, env_var_micro_service, env_var_iteration, env_var_unittest ])
        .equals([ env, '', iterator, '' ])
        .filter(row => {
            if (pname) {
                return row[env_var_pname] === pname;
            }
            if (excludeKeys.has(row[env_var_pname])) {
                return false;
            }
            if (row[env_var_delFlg]) {
                return false;
            }
            return true;
        })
        .toArray();
        mixedSort(iteratorArrays, env_var_pname);
        for (let iteratorRow of iteratorArrays) {
            excludeKeys.add(iteratorRow[env_var_pname]);
            iteratorRow.source = 'iterator';
            datas.push(iteratorRow);
        }

        let prjArrays = await db[TABLE_ENV_VAR_NAME]
        .where([ env_var_env, env_var_micro_service, env_var_iteration, env_var_unittest ])
        .equals([ env, prj, '', '' ])
        .filter(row => {
            if (pname) {
                return row[env_var_pname] === pname;
            }
            if (excludeKeys.has(row[env_var_pname])) {
                return false;
            }
            if (row[env_var_delFlg]) {
                return false;
            }
            return true;
        })
        .toArray();
        mixedSort(prjArrays, env_var_pname);
        for (let prjRow of prjArrays) {
            excludeKeys.add(prjRow[env_var_pname]);
            prjRow.source = 'prj';
            datas.push(prjRow);
        }

        let globalArrays = await db[TABLE_ENV_VAR_NAME]
        .where([ env_var_env, env_var_micro_service, env_var_iteration, env_var_unittest ])
        .equals([ env, '', '', '' ])
        .filter(row => {
            if (pname) {
                return row[env_var_pname] === pname;
            }
            if (excludeKeys.has(row[env_var_pname])) {
                return false;
            }
            if (row[env_var_delFlg]) {
                return false;
            }
            return true;
        })
        .toArray();
        mixedSort(globalArrays, env_var_pname);
        for (let globalRow of globalArrays) {
            excludeKeys.add(globalRow[env_var_pname]);
            globalRow.source = 'global';
            datas.push(globalRow);
        }

        pagination.total = datas.length;

        datas = datas.splice(offset, pageSize);

        let users = await getUsers(clientType);
        datas.forEach(item => {
            item[UNAME] = users.get(item[env_var_cuid]);
        });
    } else {
        let params = Object.assign({}, pagination, {iterator, env, pname, prj});
        let result = await sendTeamMessage(ENV_VARS_ITERATOR_PAGE_URL, params);
        let count = result.count;
        pagination.total = count;
        datas = result.list;
    }

    return datas;
}

export async function getUnittestEnvValuesByPage(unittest : string, prj : string, env : string, pname : string, clientType : string, pagination : any) {
    let page = pagination.current;
    let pageSize = pagination.pageSize;
    let datas = [];

    if (clientType === CLIENT_TYPE_SINGLE) {
        const offset = (page - 1) * pageSize;
        let excludeKeys = new Set<String>();
        let unittestPrjArrays = await db[TABLE_ENV_VAR_NAME]
        .where([ env_var_env, env_var_micro_service, env_var_iteration, env_var_unittest ])
        .equals([ env, prj, "", unittest ])
        .filter(row => {
            if (pname) {
                return row[env_var_pname] === pname;
            }
            if (row[env_var_delFlg]) {
                return false;
            }
            return true;
        })
        .toArray();
        mixedSort(unittestPrjArrays, env_var_pname);
        excludeKeys = new Set(unittestPrjArrays.map(item => ( item[env_var_pname])));
        for (let unittestPrjRow of unittestPrjArrays) {
            unittestPrjRow.source = 'unittest_prj';
            datas.push(unittestPrjRow);
        }

        let unittestArrays = await db[TABLE_ENV_VAR_NAME]
        .where([ env_var_env, env_var_micro_service, env_var_iteration, env_var_unittest ])
        .equals([ env, '', "", unittest ])
        .filter(row => {
            if (pname) {
                return row[env_var_pname] === pname;
            }
            if (excludeKeys.has(row[env_var_pname])) {
                return false;
            }
            if (row[env_var_delFlg]) {
                return false;
            }
            return true;
        })
        .toArray();
        mixedSort(unittestArrays, env_var_pname);
        for (let unittestRow of unittestArrays) {
            excludeKeys.add(unittestRow[env_var_pname]);
            unittestRow.source = 'unittest';
            datas.push(unittestRow);
        }

        let prjArrays = await db[TABLE_ENV_VAR_NAME]
        .where([ env_var_env, env_var_micro_service, env_var_iteration, env_var_unittest ])
        .equals([ env, prj, '', '' ])
        .filter(row => {
            if (pname) {
                return row[env_var_pname] === pname;
            }
            if (excludeKeys.has(row[env_var_pname])) {
                return false;
            }
            if (row[env_var_delFlg]) {
                return false;
            }
            return true;
        })
        .toArray();
        mixedSort(prjArrays, env_var_pname);
        for (let prjRow of prjArrays) {
            excludeKeys.add(prjRow[env_var_pname]);
            prjRow.source = 'prj';
            datas.push(prjRow);
        }

        let globalArrays = await db[TABLE_ENV_VAR_NAME]
        .where([ env_var_env, env_var_micro_service, env_var_iteration, env_var_unittest ])
        .equals([ env, '', '', '' ])
        .filter(row => {
            if (pname) {
                return row[env_var_pname] === pname;
            }
            if (excludeKeys.has(row[env_var_pname])) {
                return false;
            }
            if (row[env_var_delFlg]) {
                return false;
            }
            return true;
        })
        .toArray();
        mixedSort(globalArrays, env_var_pname);
        for (let globalRow of globalArrays) {
            excludeKeys.add(globalRow[env_var_pname]);
            globalRow.source = 'global';
            datas.push(globalRow);
        }

        pagination.total = datas.length;

        datas = datas.splice(offset, pageSize);

        let users = await getUsers(clientType);
        datas.forEach(item => {
            item[UNAME] = users.get(item[env_var_cuid]);
        });
    } else {
        let params = Object.assign({}, pagination, {unittest, env, pname, prj});
        let result = await sendTeamMessage(ENV_VARS_UNITTEST_PAGE_URL, params);
        let count = result.count;
        pagination.total = count;
        datas = result.list;
    }

    return datas;
}

export async function getIteratorEnvValues(iterator : string, prj : string, env : string, clientType : string) {
    let datas : any = {};

    if (clientType === CLIENT_TYPE_SINGLE) {
        let excludeKeys = new Set<String>();
        let iteratorPrjArrays = await db[TABLE_ENV_VAR_NAME]
        .where([ env_var_env, env_var_micro_service, env_var_iteration, env_var_unittest ])
        .equals([ env, prj, iterator, "" ])
        .filter(row => {
            if (row[env_var_delFlg]) {
                return false;
            }
            return true;
        })
        .toArray();
        excludeKeys = new Set(iteratorPrjArrays.map(item => ( item[env_var_pname])));
        for (let iteratorPrjRow of iteratorPrjArrays) {
            datas[iteratorPrjRow[env_var_pname]] = iteratorPrjRow[env_var_pvalue];
        }

        let iteratorArrays = await db[TABLE_ENV_VAR_NAME]
        .where([ env_var_env, env_var_micro_service, env_var_iteration, env_var_unittest ])
        .equals([ env, '', iterator, '' ])
        .filter(row => {
            if (excludeKeys.has(row[env_var_pname])) {
                return false;
            }
            if (row[env_var_delFlg]) {
                return false;
            }
            return true;
        })
        .toArray();
        for (let iteratorRow of iteratorArrays) {
            excludeKeys.add(iteratorRow[env_var_pname]);
            datas[iteratorRow[env_var_pname]] = iteratorRow[env_var_pvalue];
        }

        let prjArrays = await db[TABLE_ENV_VAR_NAME]
        .where([ env_var_env, env_var_micro_service, env_var_iteration, env_var_unittest ])
        .equals([ env, prj, '', '' ])
        .filter(row => {
            if (excludeKeys.has(row[env_var_pname])) {
                return false;
            }
            if (row[env_var_delFlg]) {
                return false;
            }
            return true;
        })
        .toArray();
        for (let prjRow of prjArrays) {
            excludeKeys.add(prjRow[env_var_pname]);
            datas[prjRow[env_var_pname]] = prjRow[env_var_pvalue];
        }

        let globalArrays = await db[TABLE_ENV_VAR_NAME]
        .where([ env_var_env, env_var_micro_service, env_var_iteration, env_var_unittest ])
        .equals([ env, '', '', '' ])
        .filter(row => {
            if (excludeKeys.has(row[env_var_pname])) {
                return false;
            }
            if (row[env_var_delFlg]) {
                return false;
            }
            return true;
        })
        .toArray();
        for (let globalRow of globalArrays) {
            excludeKeys.add(globalRow[env_var_pname]);
            datas[globalRow[env_var_pname]] = globalRow[env_var_pvalue];
        }
    } else {
        datas = await sendTeamMessage(ENV_VARS_ITERATOR_DATAS_URL, {iterator, env, prj});
    }

    return new Map(Object.entries(datas));
}

export async function getUnittestEnvValues(unittest : string, prj : string, env : string, clientType : string) {
    let datas : any = {};

    if (clientType === CLIENT_TYPE_SINGLE) {
        let excludeKeys = new Set<String>();
        let unittestPrjArrays = await db[TABLE_ENV_VAR_NAME]
        .where([ env_var_env, env_var_micro_service, env_var_iteration, env_var_unittest ])
        .equals([ env, prj, "", unittest ])
        .filter(row => {
            if (row[env_var_delFlg]) {
                return false;
            }
            return true;
        })
        .toArray();
        excludeKeys = new Set(unittestPrjArrays.map(item => ( item[env_var_pname])));
        for (let unittestPrjRow of unittestPrjArrays) {
            datas[unittestPrjRow[env_var_pname]] = unittestPrjRow[env_var_pvalue];
        }

        let unittestArrays = await db[TABLE_ENV_VAR_NAME]
        .where([ env_var_env, env_var_micro_service, env_var_iteration, env_var_unittest ])
        .equals([ env, '', "", unittest ])
        .filter(row => {
            if (excludeKeys.has(row[env_var_pname])) {
                return false;
            }
            if (row[env_var_delFlg]) {
                return false;
            }
            return true;
        })
        .toArray();
        for (let unittestRow of unittestArrays) {
            excludeKeys.add(unittestRow[env_var_pname]);
            datas[unittestRow[env_var_pname]] = unittestRow[env_var_pvalue];
        }

        let prjArrays = await db[TABLE_ENV_VAR_NAME]
        .where([ env_var_env, env_var_micro_service, env_var_iteration, env_var_unittest ])
        .equals([ env, prj, '', '' ])
        .filter(row => {
            if (excludeKeys.has(row[env_var_pname])) {
                return false;
            }
            if (row[env_var_delFlg]) {
                return false;
            }
            return true;
        })
        .toArray();
        for (let prjRow of prjArrays) {
            excludeKeys.add(prjRow[env_var_pname]);
            datas[prjRow[env_var_pname]] = prjRow[env_var_pvalue];
        }

        let globalArrays = await db[TABLE_ENV_VAR_NAME]
        .where([ env_var_env, env_var_micro_service, env_var_iteration, env_var_unittest ])
        .equals([ env, '', '', '' ])
        .filter(row => {
            if (excludeKeys.has(row[env_var_pname])) {
                return false;
            }
            if (row[env_var_delFlg]) {
                return false;
            }
            return true;
        })
        .toArray();
        for (let globalRow of globalArrays) {
            excludeKeys.add(globalRow[env_var_pname]);
            datas[globalRow[env_var_pname]] = globalRow[env_var_pvalue];
        }
    } else {
        datas = await sendTeamMessage(ENV_VARS_UNITTEST_DATAS_URL, {unittest, env, prj});
    }

    return new Map(Object.entries(datas));
}

export async function delGlobalEnvValues(env : string, pname : string, clientType : string, teamId : string) {

    if (clientType === CLIENT_TYPE_TEAM) {
        await sendTeamMessage(ENV_VARS_GLOBAL_DEL_URL, {env, pname});
    }

    const envVarItem = await window.db[TABLE_ENV_VAR_NAME]
    .where('[' + env_var_env + '+' + env_var_micro_service + '+' + env_var_iteration + '+' + env_var_unittest + '+' + env_var_pname + ']')
    .equals([env, '', '', '', pname]).first();  
    if (envVarItem !== undefined) {
        envVarItem[env_var_delFlg] = 1;
        if (clientType === CLIENT_TYPE_SINGLE) {
            envVarItem.upload_flg = 0;
            envVarItem.team_id = "";
        } else {
            envVarItem.upload_flg = 1;
            envVarItem.team_id = teamId;
        }
        await window.db[TABLE_ENV_VAR_NAME].put(envVarItem);
    }

    const envVars = await window.db[TABLE_ENV_VAR_NAME]
    .where('[' + env_var_micro_service + '+' + env_var_iteration + '+' + env_var_unittest + '+' + env_var_pname + ']')
    .equals(['', '', "", pname]).toArray();  
    let delEnvKeyFlag = true;
    for (const envVarItem of envVars) {  
        if (envVarItem[env_var_delFlg] === 0) {
            delEnvKeyFlag = false;
        }
    }
    let env_key = await window.db[TABLE_ENV_KEY_NAME]
        .where('[' + env_key_prj + '+' + env_key_pname + ']')
        .equals(['', pname])
        .first();
    if (delEnvKeyFlag && env_key !== undefined) {
        env_key[env_key_prj] = '';
        env_key[env_key_pname] = pname;
        env_key[env_key_delFlg] = 1;
        if (clientType === CLIENT_TYPE_SINGLE) {
            env_key.upload_flg = 0;
            env_key.team_id = "";
        } else {
            env_key.upload_flg = 1;
            env_key.team_id = teamId;
        }
        await window.db[TABLE_ENV_KEY_NAME].put(env_key);
    }
}

export async function delPrjEnvValues(prj : string, env : string, pname : string, clientType : string, teamId : string) {
    if (clientType === CLIENT_TYPE_TEAM) {
        await sendTeamMessage(ENV_VARS_PROJECT_DEL_URL, {prj, env, pname});
    }

    const envVarItem = await window.db[TABLE_ENV_VAR_NAME]
    .where('[' + env_var_env + '+' + env_var_micro_service + '+' + env_var_iteration + '+' + env_var_unittest + '+' + env_var_pname + ']')
    .equals([env, prj, '', '', pname]).first();  
    if (envVarItem !== undefined) {
        envVarItem[env_var_delFlg] = 1;
        if (clientType === CLIENT_TYPE_SINGLE) {
            envVarItem.upload_flg = 0;
            envVarItem.team_id = "";
        } else {
            envVarItem.upload_flg = 1;
            envVarItem.team_id = teamId;
        }
        await window.db[TABLE_ENV_VAR_NAME].put(envVarItem);
    }

    const envVars = await window.db[TABLE_ENV_VAR_NAME]
    .where('[' + env_var_micro_service + '+' + env_var_iteration + '+' + env_var_unittest + '+' + env_var_pname + ']')
    .equals([prj, '', '', pname]).toArray();  
    let delEnvKeyFlag = true;
    for (const envVarItem of envVars) {  
        if (envVarItem[env_var_delFlg] === 0) {
            delEnvKeyFlag = false;
        }
    }
    let env_key = await window.db[TABLE_ENV_KEY_NAME]
        .where('[' + env_key_prj + '+' + env_key_pname + ']')
        .equals([prj, pname])
        .first();
    if (delEnvKeyFlag && env_key !== undefined) {
        env_key[env_key_prj] = prj;
        env_key[env_key_pname] = pname;
        env_key[env_key_delFlg] = 1;
        if (clientType === CLIENT_TYPE_SINGLE) {
            env_key.upload_flg = 0;
            env_key.team_id = "";
        } else {
            env_key.upload_flg = 1;
            env_key.team_id = teamId;
        }
        await window.db[TABLE_ENV_KEY_NAME].put(env_key);
    }
}

export async function delIterationEnvValues(clientType : string, teamId : string, iterator : string, prj : string, env : string, pname : string) {
    if (clientType === CLIENT_TYPE_TEAM) {
        await sendTeamMessage(ENV_VARS_ITERATOR_DEL_URL, {iterator, prj, env, pname});
    }

    const envVarItem = await window.db[TABLE_ENV_VAR_NAME]
    .where('[' + env_var_env + '+' + env_var_micro_service + '+' + env_var_iteration + '+' + env_var_unittest + '+' + env_var_pname + ']')
    .equals([env, prj, iterator, '', pname]).first();  
    if (envVarItem !== undefined) {
        envVarItem[env_var_delFlg] = 1;
        if (clientType === CLIENT_TYPE_SINGLE) {
            envVarItem.upload_flg = 0;
            envVarItem.team_id = "";
        } else {
            envVarItem.upload_flg = 1;
            envVarItem.team_id = teamId;
        }
        await window.db[TABLE_ENV_VAR_NAME].put(envVarItem);
    }
}

export async function delUnittestEnvValues(
    clientType : string, 
    teamId : string, 
    unittest : string, 
    prj : string, 
    env : string, 
    pname : string
) {
    if (clientType === CLIENT_TYPE_TEAM) {
        await sendTeamMessage(ENV_VARS_UNITTEST_DEL_URL, {unittest, prj, env, pname});
    }

    const envVarItem = await window.db[TABLE_ENV_VAR_NAME]
    .where('[' + env_var_env + '+' + env_var_micro_service + '+' + env_var_iteration + '+' + env_var_unittest + '+' + env_var_pname + ']')
    .equals([env, prj, "", unittest, pname]).reverse().first();  
    if (envVarItem !== undefined) {
        envVarItem[env_var_delFlg] = 1;
        if (clientType === CLIENT_TYPE_SINGLE) {
            envVarItem.upload_flg = 0;
            envVarItem.team_id = "";
        } else {
            envVarItem.upload_flg = 1;
            envVarItem.team_id = teamId;
        }
        await window.db[TABLE_ENV_VAR_NAME].put(envVarItem);
    }
}

export async function addEnvValues(
    clientType : string, teamId : string, 
    prj : string, env : string, iterator : string, unittest : string, 
    pname : string, pvar, oldVar, remark, encryptFlg, oldEncryptFlg,
    device) {

    if (clientType === CLIENT_TYPE_TEAM) {
        //全局环境变量
        if (isStringEmpty(prj) && isStringEmpty(iterator) && isStringEmpty(unittest)) {
            await sendTeamMessage(ENV_VARS_GLOBAL_SET_URL, {pname, pvar, oldVar, env, remark, encryptFlg, oldEncryptFlg});
        } else if (isStringEmpty(iterator) && isStringEmpty(unittest)) {
            await sendTeamMessage(ENV_VARS_PROJECT_SET_URL, {prj, pname, pvar, oldVar, env, remark, encryptFlg, oldEncryptFlg})
        } else if (isStringEmpty(unittest)) {
            await sendTeamMessage(ENV_VARS_ITERATOR_SET_URL, {iterator, prj, pname, pvar, oldVar, env, remark, encryptFlg, oldEncryptFlg})
        } else {
            await sendTeamMessage(ENV_VARS_UNITTEST_SET_URL, {unittest, prj, pname, pvar, oldVar, env, remark, encryptFlg, oldEncryptFlg})
        }
    }

    let env_key : any = {};
    env_key[env_key_prj] = prj;
    env_key[env_key_pname] = pname;
    env_key[env_key_cuid] = device.uuid;
    env_key[env_key_ctime] = Date.now();
    env_key[env_key_delFlg] = 0;
    if (clientType === CLIENT_TYPE_SINGLE) {
        env_key.upload_flg = 0;
        env_key.team_id = "";
    } else {
        env_key.upload_flg = 1;
        env_key.team_id = teamId;
    }
    await window.db[TABLE_ENV_KEY_NAME].put(env_key);

    let property_key : any = {};
    property_key[env_var_micro_service] = prj;
    property_key[env_var_env] = env;
    property_key[env_var_iteration] = iterator;
    property_key[env_var_unittest] = unittest;
    property_key[env_var_pname] = pname;
    property_key[env_var_pvalue] = pvar;
    property_key[env_var_premark] = remark;
    property_key[env_var_pencrypt] = encryptFlg;
    property_key[env_var_cuid] = device.uuid;
    property_key[env_var_ctime] = Date.now();
    property_key[env_var_delFlg] = 0;
    if (clientType === CLIENT_TYPE_SINGLE) {
        property_key.upload_flg = 0;
        property_key.team_id = "";
    } else {
        property_key.upload_flg = 1;
        property_key.team_id = teamId;
    }
    await window.db[TABLE_ENV_VAR_NAME].put(property_key);

}