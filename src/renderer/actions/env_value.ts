import {
    isStringEmpty,
    mixedSort
} from '../util'
import {
    sub, union
} from '../util/sets'
import { 
    TABLE_ENV_KEY_NAME, TABLE_ENV_KEY_FIELDS,
    TABLE_ENV_VAR_NAME, TABLE_ENV_VAR_FIELDS,
    TABLE_USER_NAME, UNAME
} from '../../config/db';
import {
    ENV_VALUE_API_HOST
} from '../../config/envKeys';
import { GET_ENV_VALS } from '../../config/redux';
import { getUsers } from './user';

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
let env_var_delFlg = TABLE_ENV_VAR_FIELDS.FIELD_DELFLG;
let env_var_cuid = TABLE_ENV_VAR_FIELDS.FIELD_CUID;
let env_var_ctime = TABLE_ENV_VAR_FIELDS.FIELD_CTIME;

export async function getVarsByKey(prj, pname) {
    const envVarItems = await db[TABLE_ENV_VAR_NAME]
    .where('[' + env_var_micro_service + '+' + env_var_iteration + '+' + env_var_unittest + '+' + env_var_pname + ']')
    .equals([prj, "", "", pname]).toArray();
    return envVarItems;
}

export async function getKeys(prj, iteration) {
    let envKeys = await window.db[TABLE_ENV_KEY_NAME]
    .where('[' + env_key_delFlg + '+' + env_key_prj + ']')
    .equals([0, prj])
    .toArray();

    let prjKeyArr = new Set<String>(envKeys.map(envKey => envKey[env_key_pname]));
    let iterationKeyArr = new Set<String>();

    if (iteration) {
        let iterationKeys = await window.db[TABLE_ENV_VAR_NAME]
        .where('[' + env_var_micro_service + '+' + env_var_iteration + ']')
        .equals(['', iteration])
        .filter(row => {
            if (row[env_var_delFlg]) {
                return false;
            }
            return true;
        })
        .toArray();
        iterationKeyArr = new Set(iterationKeys.map(iterationKey => iterationKey[env_var_pname]));
    }

    let globalArrays = await db[TABLE_ENV_VAR_NAME]
    .where('[' + env_var_micro_service + '+' + env_var_iteration + ']')
    .equals(["", ""])
    .filter(row => {
        if (row[env_var_delFlg]) {
            return false;
        }
        return true;
    })
    .toArray();  
    let globalKeyArr = new Set<String>(globalArrays.map(item => ( item[env_var_pname])));

    return union(prjKeyArr, iterationKeyArr, globalKeyArr);
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

export async function getEnvValues(prj, env, iterator, unittest, pname, dispatch, cb) : Promise<Array<any>> {
    const env_vars = []; 

    // 优先级 迭代+项目 > 迭代 > 项目 > 全局
    let iteratorPlusPrjKeys = new Set<String>();
    let iteratorKeys = new Set<String>();
    let unittestPlusPrjKeys = new Set<String>();
    let unittestKeys = new Set<String>();
    let projectKeys = new Set<String>();
    let globalKeys = new Set<String>();

    if (!isStringEmpty(iterator)) {
        if (!isStringEmpty(prj)) {
            let iteratorPlusPrjArrays = await db[TABLE_ENV_VAR_NAME]
            .where('[' + env_var_env + '+' + env_var_micro_service + '+' + env_var_iteration + '+' + env_var_unittest + ']')
            .equals([env, prj, iterator, ""])
            .filter(row => {
                if (row[env_var_delFlg]) {
                    return false;
                }
                return true;
            })
            .toArray();
            if (pname) {
                iteratorPlusPrjKeys = new Set([pname]);
            } else {
                iteratorPlusPrjKeys = new Set(iteratorPlusPrjArrays.map(item => ( item[env_var_pname])));
            }
            for (let iteratorPlusPrjRow of iteratorPlusPrjArrays) {
                let _pname = iteratorPlusPrjRow[env_var_pname];
                if (iteratorPlusPrjKeys.has(_pname)) {
                    iteratorPlusPrjRow['allow_del'] = true;
                    env_vars.push(iteratorPlusPrjRow);
                }
            }
        }

        let iteratorArrays = await db[TABLE_ENV_VAR_NAME]
        .where('[' + env_var_env + '+' + env_var_micro_service + '+' + env_var_iteration + '+' + env_var_unittest + ']')
        .equals([env, "", iterator, ""])
        .filter(row => {
            if (row[env_var_delFlg]) {
                return false;
            }
            return true;
        })
        .toArray();
        if (pname) {
            iteratorKeys = new Set([pname]);
        } else {
            let _keys = iteratorArrays.map(item => ( item[env_var_pname]));
            iteratorKeys = sub(_keys, iteratorPlusPrjKeys);
        }
        for (let iteratorRow of iteratorArrays) {
            let _pname = iteratorRow[env_var_pname];
            if (iteratorKeys.has(_pname)) {
                iteratorRow['allow_del'] = !prj;
                env_vars.push(iteratorRow);
            }
        }
    } else if (!isStringEmpty(unittest)) {
        if (!isStringEmpty(prj)) {
            let unittestPlusPrjArrays = await db[TABLE_ENV_VAR_NAME]
            .where('[' + env_var_env + '+' + env_var_micro_service + '+' + env_var_iteration + '+' + env_var_unittest + ']')
            .equals([env, prj, "", unittest])
            .filter(row => {
                if (row[env_var_delFlg]) {
                    return false;
                }
                return true;
            })
            .toArray();
            if (pname) {
                unittestPlusPrjKeys = new Set([pname]);
            } else {
                unittestPlusPrjKeys = new Set(unittestPlusPrjArrays.map(item => ( item[env_var_pname])));
            }
            for (let unittestPlusPrjRow of unittestPlusPrjArrays) {
                let _pname = unittestPlusPrjRow[env_var_pname];
                if (unittestPlusPrjKeys.has(_pname)) {
                    unittestPlusPrjRow['allow_del'] = true;
                    env_vars.push(unittestPlusPrjRow);
                }
            }
        }

        let unittestArrays = await db[TABLE_ENV_VAR_NAME]
        .where('[' + env_var_env + '+' + env_var_micro_service + '+' + env_var_iteration + '+' + env_var_unittest + ']')
        .equals([env, "", "", unittest])
        .filter(row => {
            if (row[env_var_delFlg]) {
                return false;
            }
            return true;
        })
        .toArray();
        if (pname) {
            unittestKeys = new Set([pname]);
        } else {
            let _keys = unittestArrays.map(item => ( item[env_var_pname]));
            unittestKeys = sub(_keys, unittestPlusPrjKeys);
        }
        for (let unittestRow of unittestArrays) {
            let _pname = unittestRow[env_var_pname];
            if (unittestKeys.has(_pname)) {
                unittestRow['allow_del'] = !prj;
                env_vars.push(unittestRow);
            }
        }
    }

    if (prj) {
        let projectArrays = await db[TABLE_ENV_VAR_NAME]
        .where('[' + env_var_env + '+' + env_var_micro_service + '+' + env_var_iteration + '+' + env_var_unittest + ']')
        .equals([env, prj, "", ""])
        .filter(row => {
            if (row[env_var_delFlg]) {
                return false;
            }
            return true;
        })
        .toArray();  
        if (pname) {
            projectKeys = new Set([pname]);
        } else {
            let _keys = projectArrays.map(item => ( item[env_var_pname]));
            _keys = sub(sub(_keys, iteratorPlusPrjKeys), unittestPlusPrjKeys);
            projectKeys = sub(sub(_keys, iteratorKeys), unittestKeys);
        }
        for (let projectRow of projectArrays) {
            let _pname = projectRow[env_var_pname];
            if (projectKeys.has(_pname)) {
                projectRow['allow_del'] = (!iterator && !unittest && (_pname !== ENV_VALUE_API_HOST));
                env_vars.push(projectRow);
            }
        }
    }

    let globalArrays = await db[TABLE_ENV_VAR_NAME]
    .where('[' + env_var_env + '+' + env_var_micro_service + '+' + env_var_iteration + '+' + env_var_unittest + ']')
    .equals([env, "", "", ""])
    .filter(row => {
        if (row[env_var_delFlg]) {
            return false;
        }
        return true;
    })
    .toArray();  
    if (pname) {
        globalKeys = new Set([pname]);
    } else {
        let _keys = globalArrays.map(item => ( item[env_var_pname]));
        _keys = sub(sub(_keys, iteratorPlusPrjKeys), unittestPlusPrjKeys);
        _keys = sub(sub(_keys, iteratorKeys), unittestKeys);
        globalKeys = sub(_keys, projectKeys);
    }
    for (let globalRow of globalArrays) {
        let _pname = globalRow[env_var_pname];
        if (globalKeys.has(_pname)) {
            globalRow['allow_del'] = !(iterator || unittest || prj);
            env_vars.push(globalRow);
        }
    }

    let users = await getUsers();
    env_vars.forEach(item => {
        item[UNAME] = users.get(item[env_var_cuid]);
    });

    mixedSort(env_vars, env_var_pname);

    cb(env_vars);

    dispatch({
        type: GET_ENV_VALS,
        prj,
        env,
        iterator,
        unittest,
        env_vars,
    });

    return env_vars;
}

export async function delEnvValue(prj, env, iteration, unittest, row, cb) {
    window.db.transaction('rw',
        window.db[TABLE_ENV_KEY_NAME],
        window.db[TABLE_ENV_VAR_NAME], 
        window.db[TABLE_USER_NAME],
        async () => {
            let pname = row[env_var_pname];

            const envVarItem = await window.db[TABLE_ENV_VAR_NAME]
            .where('[' + env_var_env + '+' + env_var_micro_service + '+' + env_var_iteration + '+' + env_var_unittest + '+' + env_var_pname + ']')
            .equals([env, prj, iteration, unittest, pname]).first();  
            if (envVarItem !== undefined) {
                envVarItem[env_var_delFlg] = 1;
                await window.db[TABLE_ENV_VAR_NAME].put(envVarItem);
            }

            const envVars = await window.db[TABLE_ENV_VAR_NAME]
            .where('[' + env_var_micro_service + '+' + env_var_iteration + '+' + env_var_unittest + '+' + env_var_pname + ']')
            .equals([prj, iteration, "", pname]).toArray();  
            let delEnvKeyFlag = true;
            for (const envVarItem of envVars) {  
                if (envVarItem[env_var_delFlg] === 0) {
                    delEnvKeyFlag = false;
                }
            }
            if (delEnvKeyFlag) {
                let env_key = await window.db[TABLE_ENV_KEY_NAME]
                .where('[' + env_key_prj + '+' + env_key_pname + ']')
                .equals([prj, pname])
                .first();
                env_key[env_key_prj] = prj;
                env_key[env_key_pname] = pname;
                env_key[env_key_delFlg] = 1;
                console.debug(env_key);
                await window.db[TABLE_ENV_KEY_NAME].put(env_key);
            }
            cb();
    });
}

export async function addEnvValues(
    prj, env, iteration, unittest, 
    pname, pval, premark,
    device, cb) {
    window.db.transaction('rw',
    window.db[TABLE_ENV_KEY_NAME],
    window.db[TABLE_USER_NAME],
    window.db[TABLE_ENV_VAR_NAME], async () => {
        let env_key : any = {};
        env_key[env_key_prj] = prj;
        env_key[env_key_pname] = pname;
        env_key[env_key_cuid] = device.uuid;
        env_key[env_key_ctime] = Date.now();
        env_key[env_key_delFlg] = 0;
        await window.db[TABLE_ENV_KEY_NAME].put(env_key);

        let property_key : any = {};
        property_key[env_var_micro_service] = prj;
        property_key[env_var_env] = env;
        property_key[env_var_iteration] = iteration;
        property_key[env_var_unittest] = unittest;
        property_key[env_var_pname] = pname;
        property_key[env_var_pvalue] = pval;
        property_key[env_var_premark] = premark;
        property_key[env_var_cuid] = device.uuid;
        property_key[env_var_ctime] = Date.now();
        property_key[env_var_delFlg] = 0;
        await window.db[TABLE_ENV_VAR_NAME].put(property_key);
        cb();
    })
}