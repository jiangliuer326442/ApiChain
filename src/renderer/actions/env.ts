import { TABLE_ENV_NAME, UNAME, TABLE_ENV_FIELDS } from '@conf/db';
import { GET_ENVS } from '@conf/redux';
import { 
    CLIENT_TYPE_SINGLE, 
    CLIENT_TYPE_TEAM, 
    ENVS_LIST_URL, 
    ENVS_DEL_URL, ENVS_SET_URL,
    ENVS_ALL_LIST_URL,
} from '@conf/team';
import { getUsers } from '@act/user';
import { sendTeamMessage } from '@act/message';

let env_label = TABLE_ENV_FIELDS.FIELD_LABEL;
let env_remark = TABLE_ENV_FIELDS.FIELD_REMARK;
let env_cuid = TABLE_ENV_FIELDS.FIELD_CUID;
let env_ctime = TABLE_ENV_FIELDS.FIELD_CTIME;
let env_delFlg = TABLE_ENV_FIELDS.FIELD_DELFLG;

export async function getEnvsByPage(clientType : string, pagination : any) {
    let datas = [];
    let page = pagination.current;
    let pageSize = pagination.pageSize;

    if (clientType === CLIENT_TYPE_SINGLE) {
        const offset = (page - 1) * pageSize;
        let count = await window.db[TABLE_ENV_NAME]
        .where(env_delFlg).equals(0)
        .count();
        pagination.total = count;
    
        datas = await window.db[TABLE_ENV_NAME]
        .where(env_delFlg).equals(0)
        .offset(offset)
        .limit(pageSize)
        .reverse()
        .toArray();
    
        let users = await getUsers(clientType);
        datas.forEach(item => {
            item[UNAME] = users.get(item[env_cuid]);
        });
    } else {
        let result = await sendTeamMessage(ENVS_LIST_URL, pagination);
        let count = result.count;
        pagination.total = count;
        datas = result.list;
    }

    return datas;
}

export async function getEnvs(clientType : string, dispatch) {
    let envs;

    if (clientType === CLIENT_TYPE_SINGLE) {
        envs = await window.db[TABLE_ENV_NAME]
        .where(env_delFlg).equals(0)
        .reverse()
        .toArray();
    } else {
        let ret = await sendTeamMessage(ENVS_ALL_LIST_URL, {});
        envs = ret.list;
    }

    if (dispatch !== null) {
        dispatch({
            type: GET_ENVS,
            envs
        });
    }
    return envs;
}

export async function delEnv(clientType: string, teamId : string, row) {
    let label = row[env_label];

    if (clientType === CLIENT_TYPE_TEAM) {
        await sendTeamMessage(ENVS_DEL_URL, {label});
    }

    let env = await window.db[TABLE_ENV_NAME]
    .where(env_label).equals(label)
    .first();

    if (env === undefined) return;

    env[env_label] = label;
    env[env_delFlg] = 1;

    if (clientType === CLIENT_TYPE_SINGLE) {
        env.upload_flg = 0;
        env.team_id = "";
    } else {
        env.upload_flg = 1;
        env.team_id = teamId;
    }

    await window.db[TABLE_ENV_NAME].put(env);
}

export async function addEnv(clientType : string, teamId : string, environment : string, remark : string, device : object) {
    if (clientType === CLIENT_TYPE_TEAM) {
        await sendTeamMessage(ENVS_SET_URL, {label: environment, remark});
    }

    let env : any = {};
    env[env_label] = environment;
    env[env_remark] = remark;
    env[env_cuid] = device.uuid;
    env[env_ctime] = Date.now();
    env[env_delFlg] = 0;
    if (clientType === CLIENT_TYPE_SINGLE) {
        env.upload_flg = 0;
        env.team_id = "";
    } else {
        env.upload_flg = 1;
        env.team_id = teamId;
    }
    await window.db[TABLE_ENV_NAME].put(env);
}