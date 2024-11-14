import {
  TABLE_REQUEST_HISTORY_NAME,
  TABLE_REQUEST_HISTORY_FIELDS,
} from '../../config/db';

import { isStringEmpty } from '../util';

let request_history_id = TABLE_REQUEST_HISTORY_FIELDS.FIELD_ID;
let request_history_env = TABLE_REQUEST_HISTORY_FIELDS.FIELD_ENV_LABEL;
let request_history_micro_service = TABLE_REQUEST_HISTORY_FIELDS.FIELD_MICRO_SERVICE_LABEL;
let request_history_uri = TABLE_REQUEST_HISTORY_FIELDS.FIELD_URI;
let request_history_method = TABLE_REQUEST_HISTORY_FIELDS.FIELD_REQUEST_METHOD;
let request_history_head = TABLE_REQUEST_HISTORY_FIELDS.FIELD_REQUEST_HEADER;
let request_history_body = TABLE_REQUEST_HISTORY_FIELDS.FIELD_REQUEST_BODY;
let request_history_file = TABLE_REQUEST_HISTORY_FIELDS.FIELD_REQUEST_FILE;
let request_history_param = TABLE_REQUEST_HISTORY_FIELDS.FIELD_REQUEST_PARAM;
let request_history_path_variable = TABLE_REQUEST_HISTORY_FIELDS.FIELD_REQUEST_PATH_VARIABLE;
let request_history_response = TABLE_REQUEST_HISTORY_FIELDS.FIELD_RESPONSE_CONTENT;
let request_history_jsonFlg = TABLE_REQUEST_HISTORY_FIELDS.FIELD_JSONFLG;
let request_history_htmlFlg = TABLE_REQUEST_HISTORY_FIELDS.FIELD_HTMLFLG;
let request_history_picFlg = TABLE_REQUEST_HISTORY_FIELDS.FIELD_PICFLG;
let request_history_fileFlg = TABLE_REQUEST_HISTORY_FIELDS.FIELD_FILEFLG;
let request_history_delFlg = TABLE_REQUEST_HISTORY_FIELDS.FIELD_DELFLG;
let request_history_ctime = TABLE_REQUEST_HISTORY_FIELDS.FIELD_CTIME;

export async function getRequestHistorys(env : string, prj : string, btime : number, etime : number, uri : string, cb : any) {
    const records = await window.db[TABLE_REQUEST_HISTORY_NAME]
    .where("[" + request_history_delFlg + "+" + request_history_env + "+" + request_history_micro_service + "+" + request_history_ctime + "]")
    .between([0, env, prj, btime], [0, env, prj, etime])
    .filter(row => isStringEmpty(uri) || (row[request_history_uri].toUpperCase().indexOf(uri.toUpperCase()) >= 0))
    .reverse().toArray();
    cb(records);
}

export async function getRequestHistory(id : number) : Promise<any> {
    let record = await window.db[TABLE_REQUEST_HISTORY_NAME].get(id);
    if (record === undefined || record[request_history_delFlg] === 1) {
        return null;
    }
    return record;
}

export async function delRequestHistory(row, cb) {
    let id = row[request_history_id];
    let record = await window.db[TABLE_REQUEST_HISTORY_NAME].get(id);
    if (record !== undefined) {
        record[request_history_id] = id;
        record[request_history_delFlg] = 1;
        console.debug(record);
        await window.db[TABLE_REQUEST_HISTORY_NAME].put(record);
        cb();
    }
}

export async function addRequestHistory(
    env : string, prj : string, uri : string, method : string,
    head, body, pathVariable, param, file,
    response : string, jsonFlg : boolean, htmlFlg : boolean, picFlg : boolean, fileFlg : boolean, cb) {

    for (let _key in file) {
        delete file[_key].blob;
    }

    let request_history : any = {};
    request_history[request_history_env] = env;
    request_history[request_history_micro_service] = prj;
    request_history[request_history_uri] = uri;
    request_history[request_history_method] = method;
    request_history[request_history_head] = head;
    request_history[request_history_body] = body;
    request_history[request_history_file] = file;
    request_history[request_history_param] = param;
    request_history[request_history_path_variable] = pathVariable;
    request_history[request_history_response] = response;
    request_history[request_history_jsonFlg] = jsonFlg;
    request_history[request_history_htmlFlg] = htmlFlg;
    request_history[request_history_picFlg] = picFlg;
    request_history[request_history_fileFlg] = fileFlg;
    request_history[request_history_ctime] = Date.now();
    request_history[request_history_delFlg] = 0;
    let id = await window.db[TABLE_REQUEST_HISTORY_NAME].put(request_history);
    cb(id);
}
