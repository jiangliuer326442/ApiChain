import { TABLE_ENV_NAME, TABLE_ENV_FIELDS } from '../../config/db';
import { GET_ENVS } from '../../config/redux';

let env_label = TABLE_ENV_FIELDS.FIELD_LABEL;
let env_remark = TABLE_ENV_FIELDS.FIELD_REMARK;
let env_cuid = TABLE_ENV_FIELDS.FIELD_CUID;
let env_cuname = TABLE_ENV_FIELDS.FIELD_CUNAME;
let env_ctime = TABLE_ENV_FIELDS.FIELD_CTIME;
let env_delFlg = TABLE_ENV_FIELDS.FIELD_DELFLG;

export async function getEnvs(dispatch) {
    let envs = await window.db[TABLE_ENV_NAME]
    .where(env_delFlg).equals(0)
    .reverse()
    .toArray();

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
    env[env_cuname] = device.uname;
    env[env_ctime] = Date.now();
    env[env_delFlg] = 0;
    console.debug(env);
    await window.db[TABLE_ENV_NAME].put(env);
    cb();
}