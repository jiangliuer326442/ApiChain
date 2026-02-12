import { mixedSort } from '@rutil/index';
import { intersect, union } from '@rutil/sets';
import {
    sendTeamMessage
} from '@act/message';

import { 
    CLIENT_TYPE_SINGLE,
    ENV_VARS_GLOBAL_KEYS_URL,
    ENV_VARS_PROJECT_KEYS_URL,
    ENV_VARS_ITERATOR_KEYS_URL,
    ENV_VARS_UNITTEST_KEYS_URL,
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

export async function getProjectKeys(clientType : string, teamId : string, project : string) : Promise<Array<String>> {
    let datas;
    if (clientType === CLIENT_TYPE_SINGLE) {
        let projectArrays1 = await db[TABLE_ENV_KEY_NAME]
        .where('[' + env_key_delFlg + '+' + env_key_micro_service + ']')
        .equals([0, project])
        .filter(row => {
            if (row[env_var_delFlg]) {
                return false;
            }
            return true;
        })
        .toArray();  
        mixedSort(projectArrays1, env_key_pname);
        let sets1 = new Set<string>(projectArrays1.map(item => ( item[env_key_pname])));

        let projectArrays2 = await db[TABLE_ENV_VAR_NAME]
        .where('[' + env_var_micro_service + '+' + env_var_iteration + '+' + env_var_unittest + ']')
        .equals([project, "", ""])
        .filter(row => {
            if (row[env_var_delFlg]) {
                return false;
            }
            return true;
        })
        .toArray(); 
        mixedSort(projectArrays2, env_var_pname);
        let sets2 = new Set<string>(projectArrays2.map(item => ( item[env_var_pname])));
        let sets3 = intersect(sets1, sets2);

       let globalArrays1 = await db[TABLE_ENV_KEY_NAME]
        .where('[' + env_key_delFlg + '+' + env_key_micro_service + ']')
        .equals([0, ""])
        .filter(row => {
            if (row[env_var_delFlg]) {
                return false;
            }
            return true;
        })
        .toArray();  
        mixedSort(globalArrays1, env_key_pname);
        let sets4 = new Set<String>(globalArrays1.map(item => ( item[env_key_pname])));
        datas = [...new Set([...sets3, ...sets4])]
    } else {
        datas = await sendTeamMessage(ENV_VARS_PROJECT_KEYS_URL, {teamId, project});
    }
    return datas;
}

export async function getIteratorKeys(clientType : string, teamId : string, iterator : string, project : string) {
    let datas;
    if (clientType === CLIENT_TYPE_SINGLE) {

        let iteratorArrays1 = await db[TABLE_ENV_VAR_NAME]
        .where('[' + env_var_micro_service + '+' + env_var_iteration + '+' + env_var_unittest + ']')
        .equals(["", iterator, ""])
        .filter(row => {
            if (row[env_var_delFlg]) {
                return false;
            }
            return true;
        })
        .toArray(); 

        mixedSort(iteratorArrays1, env_var_pname);
        let sets1 = new Set<string>(iteratorArrays1.map(item => ( item[env_key_pname])));

        let iteratorArrays2 = await db[TABLE_ENV_VAR_NAME]
        .where('[' + env_var_micro_service + '+' + env_var_iteration + '+' + env_var_unittest + ']')
        .equals([project, iterator, ""])
        .filter(row => {
            if (row[env_var_delFlg]) {
                return false;
            }
            return true;
        })
        .toArray(); 
        mixedSort(iteratorArrays2, env_var_pname);
        let sets2 = new Set<string>(iteratorArrays2.map(item => ( item[env_key_pname])));

        let sets3 = await getProjectKeys(clientType, teamId, project)
        datas = [...union(sets1, sets2, new Set<string>([...sets3]))]
    } else {
        datas = await sendTeamMessage(ENV_VARS_ITERATOR_KEYS_URL, {iterator, project});
    }
    return datas;
}

export async function getUnittestKeys(clientType : string, teamId : string, unittest : string, project : string) {
    let datas;
    if (clientType === CLIENT_TYPE_SINGLE) {

        let unittestArrays1 = await db[TABLE_ENV_VAR_NAME]
        .where('[' + env_var_micro_service + '+' + env_var_iteration + '+' + env_var_unittest + ']')
        .equals(["", "", unittest])
        .filter(row => {
            if (row[env_var_delFlg]) {
                return false;
            }
            return true;
        })
        .toArray(); 

        mixedSort(unittestArrays1, env_var_pname);
        let sets1 = new Set<string>(unittestArrays1.map(item => ( item[env_key_pname])));

        let unittestArrays2 = await db[TABLE_ENV_VAR_NAME]
        .where('[' + env_var_micro_service + '+' + env_var_iteration + '+' + env_var_unittest + ']')
        .equals([project, "", unittest])
        .filter(row => {
            if (row[env_var_delFlg]) {
                return false;
            }
            return true;
        })
        .toArray(); 
        mixedSort(unittestArrays2, env_var_pname);
        let sets2 = new Set<string>(unittestArrays2.map(item => ( item[env_key_pname])));

        let sets3 = await getProjectKeys(clientType, teamId, project)
        datas = [...union(sets1, sets2, new Set<string>([...sets3]))]
    } else {
        datas = await sendTeamMessage(ENV_VARS_UNITTEST_KEYS_URL, {unittest, project});
    }
    return datas;
}