import { TABLE_ENV_NAME, UNAME, TABLE_ENV_FIELDS } from '@conf/db';
import { GET_ENVS } from '@conf/redux';
import { CLIENT_TYPE_SINGLE, ENVS_LIST_URL } from '@conf/team';
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
    
        let users = await getUsers();
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

export async function getEnvs(dispatch) {
    let users = await getUsers();

    let envs = await window.db[TABLE_ENV_NAME]
    .where(env_delFlg).equals(0)
    .reverse()
    .toArray();

    envs.forEach(item => {
        item[UNAME] = users.get(item[env_cuid]);
    });

    if (dispatch !== null) {
        dispatch({
            type: GET_ENVS,
            envs
        });
    }
    return envs;
}

export async function delEnv(row, cb) {
    let label = row[env_label];

    let env = await window.db[TABLE_ENV_NAME]
    .where(env_label).equals(label)
    .first();

    if (env !== undefined) {
        env[env_label] = label;
        env[env_delFlg] = 1;
        console.debug(env);
        await window.db[TABLE_ENV_NAME].put(env);
        cb();
    }
}

export async function addEnv(environment : string, remark : string, device : object, cb) {
    let env = {};
    env[env_label] = environment;
    env[env_remark] = remark;
    env[env_cuid] = device.uuid;
    env[env_ctime] = Date.now();
    env[env_delFlg] = 0;
    console.debug(env);
    await window.db[TABLE_ENV_NAME].put(env);
    cb();
}