import { mixedSort } from '@rutil/index';
import { intersect } from '@rutil/sets';
import {
    sendTeamMessage
} from '@act/message';

import { 
    CLIENT_TYPE_SINGLE,
    ENV_VARS_GLOBAL_KEYS_URL,
    ENV_VARS_PROJECT_KEYS_URL,
} from '@conf/team';

import {
    TABLE_ENV_KEY_NAME, TABLE_ENV_KEY_FIELDS,
    TABLE_ENV_VAR_NAME, TABLE_ENV_VAR_FIELDS
} from '@conf/db';

let env_key_micro_service = TABLE_ENV_KEY_FIELDS.FIELD_MICRO_SERVICE_LABEL;
let env_key_pname = TABLE_ENV_KEY_FIELDS.FIELD_PARAM_NAME;
let env_key_delFlg = TABLE_ENV_KEY_FIELDS.FIELD_DELFLG;

let env_var_micro_service = TABLE_ENV_VAR_FIELDS.FIELD_MICRO_SERVICE_LABEL;
let env_var_iteration = TABLE_ENV_VAR_FIELDS.FIELD_ITERATION;
let env_var_unittest = TABLE_ENV_VAR_FIELDS.FIELD_UNITTEST;
let env_var_pname = TABLE_ENV_VAR_FIELDS.FIELD_PARAM_NAME;
let env_var_delFlg = TABLE_ENV_VAR_FIELDS.FIELD_DELFLG;

export async function getGlobalKeys(clientType : string) {
    let datas;
    if (clientType === CLIENT_TYPE_SINGLE) {
        let globalArrays1 = await db[TABLE_ENV_KEY_NAME]
        .where('[' + env_key_delFlg + '+' + env_key_micro_service + ']')
        .equals([0, ""])
        .toArray();  
        mixedSort(globalArrays1, env_key_pname);
        let sets1 = new Set<String>(globalArrays1.map(item => ( item[env_key_pname])));

        let globalArrays2 = await db[TABLE_ENV_VAR_NAME]
        .where('[' + env_var_micro_service + '+' + env_var_iteration + '+' + env_var_unittest + ']')
        .equals(["", "", ""])
        .filter(row => {
            if (row[env_var_delFlg]) {
                return false;
            }
            return true;
        })
        .toArray(); 
        mixedSort(globalArrays2, env_var_pname);
        let sets2 = new Set<String>(globalArrays2.map(item => ( item[env_var_pname])));
        datas = [...intersect(sets1, sets2)];
    } else {
        datas = await sendTeamMessage(ENV_VARS_GLOBAL_KEYS_URL, {});
    }
    return datas;
}

export async function getProjectKeys(clientType : string, project : string) {
    let datas;
    if (clientType === CLIENT_TYPE_SINGLE) {
        let globalArrays1 = await db[TABLE_ENV_KEY_NAME]
        .where('[' + env_key_delFlg + '+' + env_key_micro_service + ']')
        .equals([0, project])
        .toArray();  
        mixedSort(globalArrays1, env_key_pname);
        let sets1 = new Set<String>(globalArrays1.map(item => ( item[env_key_pname])));

        let globalArrays2 = await db[TABLE_ENV_VAR_NAME]
        .where('[' + env_var_micro_service + '+' + env_var_iteration + '+' + env_var_unittest + ']')
        .equals([project, "", ""])
        .filter(row => {
            if (row[env_var_delFlg]) {
                return false;
            }
            return true;
        })
        .toArray(); 
        mixedSort(globalArrays2, env_var_pname);
        let sets2 = new Set<String>(globalArrays2.map(item => ( item[env_var_pname])));
        datas = [...intersect(sets1, sets2)];
    } else {
        datas = await sendTeamMessage(ENV_VARS_PROJECT_KEYS_URL, {project});
    }
    return datas;
}