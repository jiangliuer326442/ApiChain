import { sendTeamMessage } from '@act/message';
import { mixedSort } from '@rutil/index';
import { 
    TABLE_MICRO_SERVICE_NAME, 
    TABLE_MICRO_SERVICE_FIELDS, UNAME,
    TABLE_ENV_VAR_NAME, TABLE_ENV_VAR_FIELDS
} from '@conf/db';
import { GET_PRJS } from '@conf/redux';
import { 
    CLIENT_TYPE_SINGLE, 
    CLIENT_TYPE_TEAM, PRJS_LIST_URL, 
    PRJS_SET_URL, 
    PRJS_DEL_URL,
    PRJS_ALL_LIST_URL,
    PROJECT_CONFIG_GET_URL,
} from '@conf/team';
import { 
    ENV_VALUE_API_HOST, 
    ENV_VALUE_RUN_MODE, 
    ENV_VALUE_API_PREFIX,
    ENV_VALUE_RUN_MODE_CLIENT
} from '@conf/envKeys';
import { getUsers } from '@act/user';

let prj_label = TABLE_MICRO_SERVICE_FIELDS.FIELD_LABEL;
let prj_remark = TABLE_MICRO_SERVICE_FIELDS.FIELD_REMARK;
let prj_info = TABLE_MICRO_SERVICE_FIELDS.FIELD_INFO;
let prj_cuid = TABLE_MICRO_SERVICE_FIELDS.FIELD_CUID;
let prj_ctime = TABLE_MICRO_SERVICE_FIELDS.FIELD_CTIME;
let prj_delFlg = TABLE_MICRO_SERVICE_FIELDS.FIELD_DELFLG;

let env_var_env = TABLE_ENV_VAR_FIELDS.FIELD_ENV_LABEL;
let env_var_micro_service = TABLE_ENV_VAR_FIELDS.FIELD_MICRO_SERVICE_LABEL;
let env_var_iteration = TABLE_ENV_VAR_FIELDS.FIELD_ITERATION;
let env_var_unittest = TABLE_ENV_VAR_FIELDS.FIELD_UNITTEST;
let env_var_pname = TABLE_ENV_VAR_FIELDS.FIELD_PARAM_NAME;
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

export async function getPrjConfig(clientType : string, prj : string, env : string) {
    let ret : any;

    if (clientType === CLIENT_TYPE_SINGLE) {
        let projectArrays = await db[TABLE_ENV_VAR_NAME]
        .where([ env_var_env, env_var_micro_service, env_var_iteration, env_var_unittest ])
        .equals([ env, prj, "", "" ])
        .filter(row => {
            return true;
            // if (row[env_var_pname] === ENV_VALUE_API_HOST || 
            //     row[env_var_pname] === ENV_VALUE_RUN_MODE || 
            //     row[env_var_pname] === ENV_VALUE_API_PREFIX) {
            //     return true;
            // }
            // return false;
        })
        .toArray();
        console.log("projectArrays", env, prj,projectArrays);
        ret = {
            "run_mode": ENV_VALUE_RUN_MODE_CLIENT,
        };
        for (let projectRow of projectArrays) {
            ret[projectRow[env_var_pname]] = projectRow[env_var_pvalue]
        }
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
    info : string,
    device : object
) {
    if (clientType === CLIENT_TYPE_TEAM) {
        await sendTeamMessage(PRJS_SET_URL, {
            label: prjName, remark, info
        });
    }

    let prj : any = {};
    prj[prj_label] = prjName;
    prj[prj_remark] = remark;
    prj[prj_info] = info;
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