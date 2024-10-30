import { 
    TABLE_FIELD_NAME, 
    TABLE_FIELD_VALUE,
    TABLE_FIELD_REMARK,
    TABLE_FIELD_TYPE,
} from '../util/json';

import { isStringEmpty } from '../util';

import { TABLE_JSON_FRAGEMENT_NAME, TABLE_JSON_FRAGEMENT_FIELDS } from '../../config/db';

let json_fragement_name = TABLE_JSON_FRAGEMENT_FIELDS.FIELD_NAME;
let json_fragement_hash = TABLE_JSON_FRAGEMENT_FIELDS.FIELD_HASH;
let json_fragement_dtype = TABLE_JSON_FRAGEMENT_FIELDS.FIELD_DTYPE;
let json_fragement_remark = TABLE_JSON_FRAGEMENT_FIELDS.FIELD_REMARK;
let json_fragement_fields = TABLE_JSON_FRAGEMENT_FIELDS.FIELD_FIELDS;
let json_fragement_delFlg = TABLE_JSON_FRAGEMENT_FIELDS.FIELD_DELFLG;
let json_fragement_ctime = TABLE_JSON_FRAGEMENT_FIELDS.FIELD_CTIME;

export async function getJsonFragment(name, hash) {
    const json_fragement = await window.db[TABLE_JSON_FRAGEMENT_NAME]
    .where('[' + json_fragement_delFlg + '+' + json_fragement_name + '+' + json_fragement_hash + ']')
    .equals([0, name, hash]).first(); 
    return json_fragement;
}

export async function addJsonFragement(newObject) {
    let arr = newObject[TABLE_FIELD_NAME].split('@');
    let name = arr[0];
    let hash = arr[1];
    let content = newObject[TABLE_FIELD_VALUE];
    let remark =  isStringEmpty(content[TABLE_FIELD_REMARK]) ? "" : content[TABLE_FIELD_REMARK];
    delete content[TABLE_FIELD_REMARK];
    let dtype = content[TABLE_FIELD_TYPE];
    delete content[TABLE_FIELD_TYPE];

    let json_fragement : any = {};
    json_fragement[json_fragement_name] = name;
    json_fragement[json_fragement_hash] = hash;
    json_fragement[json_fragement_dtype] = dtype;
    json_fragement[json_fragement_remark] = remark;
    json_fragement[json_fragement_fields] = content;
    json_fragement[json_fragement_ctime] = Date.now();
    json_fragement[json_fragement_delFlg] = 0;
    await window.db[TABLE_JSON_FRAGEMENT_NAME].put(json_fragement);
}