import { sendTeamMessage } from '@act/message';
import { mixedSort } from '@rutil/index';
import { 
    TABLE_ENV_KEY_NAME, TABLE_ENV_KEY_FIELDS,
    TABLE_MICRO_SERVICE_NAME, 
    TABLE_MICRO_SERVICE_FIELDS, UNAME,
    TABLE_ENV_VAR_NAME, TABLE_ENV_VAR_FIELDS
} from '@conf/db';
import { 
    ENV_VALUE_API_HOST, ENV_VALUE_RUN_MODE, ENV_VALUE_API_PREFIX,
    ENV_VALUE_DB_HOST, ENV_VALUE_DB_PORT, ENV_VALUE_DB_USERNAME, ENV_VALUE_DB_PASSWORD, ENV_VALUE_DB_NAME, ENV_VALUE_DB_RUN_MODE
} from '@conf/envKeys';
import { GET_PRJS } from '@conf/redux';
import { 
    CLIENT_TYPE_SINGLE, 
    CLIENT_TYPE_TEAM, PRJS_LIST_URL, 
    PRJS_SET_URL, 
    PRJS_DEL_URL,
    PRJS_ALL_LIST_URL,
    PROJECT_CONFIG_GET_URL,
    PROJECT_CONFIG_SAVE_URL,
} from '@conf/team';
import { 
    ENV_VALUE_RUN_MODE_CLIENT
} from '@conf/envKeys';
import { getUsers } from '@act/user';

let env_key_delFlg = TABLE_ENV_KEY_FIELDS.FIELD_DELFLG;
let env_key_prj = TABLE_ENV_KEY_FIELDS.FIELD_MICRO_SERVICE_LABEL;
let env_key_pname = TABLE_ENV_KEY_FIELDS.FIELD_PARAM_NAME;
let env_key_cuid = TABLE_ENV_KEY_FIELDS.FIELD_CUID;
let env_key_ctime = TABLE_ENV_KEY_FIELDS.FIELD_CTIME;

let prj_label = TABLE_MICRO_SERVICE_FIELDS.FIELD_LABEL;
let prj_remark = TABLE_MICRO_SERVICE_FIELDS.FIELD_REMARK;
let prj_info = TABLE_MICRO_SERVICE_FIELDS.FIELD_INFO;
let prj_cuid = TABLE_MICRO_SERVICE_FIELDS.FIELD_CUID;
let prj_ctime = TABLE_MICRO_SERVICE_FIELDS.FIELD_CTIME;
let prj_delFlg = TABLE_MICRO_SERVICE_FIELDS.FIELD_DELFLG;

let env_var_env = TABLE_ENV_VAR_FIELDS.FIELD_ENV_LABEL;
let env_var_micro_service = TABLE_ENV_VAR_FIELDS.FIELD_MICRO_SERVICE_LABEL;
let env_var_premark = TABLE_ENV_VAR_FIELDS.FIELD_PARAM_REMARK;
let env_var_pencrypt = TABLE_ENV_VAR_FIELDS.FIELD_ENCRYPTFLG;
let env_var_iteration = TABLE_ENV_VAR_FIELDS.FIELD_ITERATION;
let env_var_unittest = TABLE_ENV_VAR_FIELDS.FIELD_UNITTEST;
let env_var_pname = TABLE_ENV_VAR_FIELDS.FIELD_PARAM_NAME;
let env_var_cuid = TABLE_ENV_VAR_FIELDS.FIELD_CUID;
let env_var_ctime = TABLE_ENV_VAR_FIELDS.FIELD_CTIME;
let env_var_delFlg = TABLE_ENV_VAR_FIELDS.FIELD_DELFLG;
let env_var_pvalue = TABLE_ENV_VAR_FIELDS.FIELD_PARAM_VAR;

export async function getPrjsByPage(clientType : string, pagination : any) {
    let datas = [];
    let page = pagination.current;
    let pageSize = pagination.pageSize;

    if (clientType === CLIENT_TYPE_SINGLE) {
        const offset = (page - 1) * pageSize;
        let count = await window.db[TABLE_MICRO_SERVICE_NAME]
        .where(prj_delFlg).equals(0)
        .count();
        pagination.total = count;

        datas = await window.db[TABLE_MICRO_SERVICE_NAME]
        .where(prj_delFlg).equals(0)
        .offset(offset)
        .limit(pageSize)
        .reverse()
        .toArray();

        let users = await getUsers(clientType);
        datas.forEach(item => {
            item[UNAME] = users.get(item[prj_cuid]);
        });
    } else {
        let result = await sendTeamMessage(PRJS_LIST_URL, pagination);
        let count = result.count;
        pagination.total = count;
        datas = result.list;
    }

    return datas;
}

export async function savePrjConfig(clientType : string, teamId : string, prj : string, env : string, 
    apiHost : string, apiPrefix : string, runMode : string, projectDesc : string,
    dbHost : string, dbPort : number, dbUsername : string, 
    localPassword : string, dbPassword : string, oldPassword : string, 
    dbName : string, dbRunMode : string, device) {
    if (clientType === CLIENT_TYPE_TEAM) {
        await sendTeamMessage(PROJECT_CONFIG_SAVE_URL, {
            prj, env, 
            apiHost, apiPrefix, runMode, 
            dbHost, dbPort, dbUsername, 
            dbPassword, oldPassword, 
            dbName, dbRunMode,
            projectDesc
        }
        );
    }

    let env_key : any = {};
    env_key[env_key_prj] = prj;
    env_key[env_key_pname] = ENV_VALUE_API_HOST;
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
    property_key[env_var_iteration] = "";
    property_key[env_var_unittest] = "";
    property_key[env_var_pname] = ENV_VALUE_API_HOST;
    property_key[env_var_pvalue] = apiHost;
    property_key[env_var_premark] = "";
    property_key[env_var_pencrypt] = 0;
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

    env_key = {};
    env_key[env_key_prj] = prj;
    env_key[env_key_pname] = ENV_VALUE_API_PREFIX;
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

    property_key = {};
    property_key[env_var_micro_service] = prj;
    property_key[env_var_env] = env;
    property_key[env_var_iteration] = "";
    property_key[env_var_unittest] = "";
    property_key[env_var_pname] = ENV_VALUE_API_PREFIX;
    property_key[env_var_pvalue] = apiPrefix;
    property_key[env_var_premark] = "";
    property_key[env_var_pencrypt] = 0;
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

    env_key = {};
    env_key[env_key_prj] = prj;
    env_key[env_key_pname] = ENV_VALUE_RUN_MODE;
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

    property_key = {};
    property_key[env_var_micro_service] = prj;
    property_key[env_var_env] = env;
    property_key[env_var_iteration] = "";
    property_key[env_var_unittest] = "";
    property_key[env_var_pname] = ENV_VALUE_RUN_MODE;
    property_key[env_var_pvalue] = runMode;
    property_key[env_var_premark] = "";
    property_key[env_var_pencrypt] = 0;
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

    env_key = {};
    env_key[env_key_prj] = prj;
    env_key[env_key_pname] = ENV_VALUE_DB_HOST;
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

    property_key = {};
    property_key[env_var_micro_service] = prj;
    property_key[env_var_env] = env;
    property_key[env_var_iteration] = "";
    property_key[env_var_unittest] = "";
    property_key[env_var_pname] = ENV_VALUE_DB_HOST;
    property_key[env_var_pvalue] = dbHost;
    property_key[env_var_premark] = "";
    property_key[env_var_pencrypt] = 0;
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

    env_key = {};
    env_key[env_key_prj] = prj;
    env_key[env_key_pname] = ENV_VALUE_DB_PORT;
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

    property_key = {};
    property_key[env_var_micro_service] = prj;
    property_key[env_var_env] = env;
    property_key[env_var_iteration] = "";
    property_key[env_var_unittest] = "";
    property_key[env_var_pname] = ENV_VALUE_DB_PORT;
    property_key[env_var_pvalue] = dbPort;
    property_key[env_var_premark] = "";
    property_key[env_var_pencrypt] = 0;
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

    env_key = {};
    env_key[env_key_prj] = prj;
    env_key[env_key_pname] = ENV_VALUE_DB_USERNAME;
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

    property_key = {};
    property_key[env_var_micro_service] = prj;
    property_key[env_var_env] = env;
    property_key[env_var_iteration] = "";
    property_key[env_var_unittest] = "";
    property_key[env_var_pname] = ENV_VALUE_DB_USERNAME;
    property_key[env_var_pvalue] = dbUsername;
    property_key[env_var_premark] = "";
    property_key[env_var_pencrypt] = 0;
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

    env_key = {};
    env_key[env_key_prj] = prj;
    env_key[env_key_pname] = ENV_VALUE_DB_PASSWORD;
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

    property_key = {};
    property_key[env_var_micro_service] = prj;
    property_key[env_var_env] = env;
    property_key[env_var_iteration] = "";
    property_key[env_var_unittest] = "";
    property_key[env_var_pname] = ENV_VALUE_DB_PASSWORD;
    property_key[env_var_pvalue] = localPassword;
    property_key[env_var_premark] = "";
    property_key[env_var_pencrypt] = 1;
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

    env_key = {};
    env_key[env_key_prj] = prj;
    env_key[env_key_pname] = ENV_VALUE_DB_NAME;
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

    property_key = {};
    property_key[env_var_micro_service] = prj;
    property_key[env_var_env] = env;
    property_key[env_var_iteration] = "";
    property_key[env_var_unittest] = "";
    property_key[env_var_pname] = ENV_VALUE_DB_NAME;
    property_key[env_var_pvalue] = dbName;
    property_key[env_var_premark] = "";
    property_key[env_var_pencrypt] = 0;
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

    env_key = {};
    env_key[env_key_prj] = prj;
    env_key[env_key_pname] = ENV_VALUE_DB_RUN_MODE;
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

    property_key = {};
    property_key[env_var_micro_service] = prj;
    property_key[env_var_env] = env;
    property_key[env_var_iteration] = "";
    property_key[env_var_unittest] = "";
    property_key[env_var_pname] = ENV_VALUE_DB_RUN_MODE;
    property_key[env_var_pvalue] = dbRunMode;
    property_key[env_var_premark] = "";
    property_key[env_var_pencrypt] = 0;
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

    let currentPrj = await window.db[TABLE_MICRO_SERVICE_NAME]
    .where(prj_label).equals(prj)
    .first();
    if (currentPrj !== undefined) {
        currentPrj[prj_info] = projectDesc;

        if (clientType === CLIENT_TYPE_SINGLE) {
            currentPrj.upload_flg = 0;
            currentPrj.team_id = "";
        } else {
            currentPrj.upload_flg = 1;
            currentPrj.team_id = teamId;
        }
        await window.db[TABLE_MICRO_SERVICE_NAME].put(currentPrj);
    }
}

export async function getPrjConfig(clientType : string, prj : string, env : string) {
    let ret : any;

    if (clientType === CLIENT_TYPE_SINGLE) {
        let projectArrays = await db[TABLE_ENV_VAR_NAME]
        .where([ env_var_env, env_var_micro_service, env_var_iteration, env_var_unittest ])
        .equals([ env, prj, "", "" ])
        .filter(row => {
            if (row[env_var_pname] === ENV_VALUE_API_HOST || 
                row[env_var_pname] === ENV_VALUE_API_PREFIX ||
                row[env_var_pname] === ENV_VALUE_RUN_MODE ||
                row[env_var_pname] === ENV_VALUE_DB_HOST ||
                row[env_var_pname] === ENV_VALUE_DB_PORT ||
                row[env_var_pname] === ENV_VALUE_DB_USERNAME ||
                row[env_var_pname] === ENV_VALUE_DB_PASSWORD ||
                row[env_var_pname] === ENV_VALUE_DB_NAME) {
                return true;
            }
            return false;
        })
        .toArray();
        ret = {};
        for (let projectRow of projectArrays) {
            ret[projectRow[env_var_pname]] = projectRow[env_var_pvalue]
        }
        let currentPrj = await window.db[TABLE_MICRO_SERVICE_NAME]
        .where(prj_label).equals(prj)
        .first();
        ret["projectDesc"] = currentPrj[prj_info];
        ret["run_mode"] = ENV_VALUE_RUN_MODE_CLIENT;
        ret["db_run_mode"] = ENV_VALUE_RUN_MODE_CLIENT;
    } else {
        ret = await sendTeamMessage(PROJECT_CONFIG_GET_URL, {prj, env});
    }
    return ret;
}

export async function getPrjs(clientType : string, dispatch) {
    let prjs;

    if (clientType === CLIENT_TYPE_SINGLE) {
        prjs = await window.db[TABLE_MICRO_SERVICE_NAME]
        .where(prj_delFlg).equals(0)
        .reverse()
        .toArray();

        mixedSort(prjs, prj_remark);
    } else {
        let ret = await sendTeamMessage(PRJS_ALL_LIST_URL, {});
        prjs = ret.list;
    }

    if (dispatch !== null) {
        dispatch({
            type: GET_PRJS,
            prjs
        });
    }
    
    return prjs;
}

export async function delPrj(clientType: string, teamId : string, row) {
    let label = row[prj_label];

    if (clientType === CLIENT_TYPE_TEAM) {
        await sendTeamMessage(PRJS_DEL_URL, {label});
    }

    let prj = await window.db[TABLE_MICRO_SERVICE_NAME]
    .where(prj_label).equals(label)
    .first();

    if (prj === undefined) return;

    prj[prj_label] = label;
    prj[prj_delFlg] = 1;

    if (clientType === CLIENT_TYPE_SINGLE) {
        prj.upload_flg = 0;
        prj.team_id = "";
    } else {
        prj.upload_flg = 1;
        prj.team_id = teamId;
    }

    await window.db[TABLE_MICRO_SERVICE_NAME].put(prj);
}

export async function addPrj(
    clientType : string, teamId : string, 
    prjName : string, 
    remark : string, 
    device : object
) {
    if (clientType === CLIENT_TYPE_TEAM) {
        await sendTeamMessage(PRJS_SET_URL, {
            label: prjName, remark
        });
    }

    let prj : any = {};
    prj[prj_label] = prjName;
    prj[prj_remark] = remark;
    prj[prj_cuid] = device.uuid;
    prj[prj_ctime] = Date.now();
    prj[prj_delFlg] = 0;
    if (clientType === CLIENT_TYPE_SINGLE) {
        prj.upload_flg = 0;
        prj.team_id = "";
    } else {
        prj.upload_flg = 1;
        prj.team_id = teamId;
    }
    await window.db[TABLE_MICRO_SERVICE_NAME].put(prj);
}