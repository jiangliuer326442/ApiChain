import {
    TABLE_VERSION_ITERATION_REQUEST_FIELDS,
    TABLE_PROJECT_REQUEST_NAME, TABLE_PROJECT_REQUEST_FIELDS,
} from '../../config/db';
import {
    addVersionIteratorFolder
} from './version_iterator_folders';

import { isStringEmpty } from '../util';
import path from 'path';

let iteration_request_project = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_MICRO_SERVICE_LABEL;
let iteration_request_method = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_REQUEST_METHOD;
let iteration_request_uri = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_URI;
let iteration_request_title = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_TITLE;
let iteration_request_fold = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_FOLD;
let iteration_request_header = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_REQUEST_HEADER;
let iteration_request_header_hash = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_REQUEST_HEADER_HASH;
let iteration_request_body = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_REQUEST_BODY;
let iteration_request_body_hash = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_REQUEST_BODY_HASH;
let iteration_request_param = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_REQUEST_PARAM;
let iteration_request_param_hash = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_REQUEST_PARAM_HASH;
let iteration_request_response = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_RESPONSE_CONTENT;
let iteration_request_response_hash = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_RESPONSE_HASH;
let iteration_request_response_demo = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_RESPONSE_DEMO;
let iteration_request_jsonFlg = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_JSONFLG;
let iteration_request_htmlFlg = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_HTMLFLG;
let iteration_request_picFlg = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_PICFLG;
let iteration_request_fileFlg = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_FILEFLG;
let iteration_request_cuid = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_CUID;
let iteration_request_cuname = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_CUNAME;
let iteration_request_delFlg = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_DELFLG;
let iteration_request_ctime = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_CTIME;

let project_request_project = TABLE_PROJECT_REQUEST_FIELDS.FIELD_PROJECT_LABEL;
let project_request_method = TABLE_PROJECT_REQUEST_FIELDS.FIELD_REQUEST_METHOD;
let project_request_uri = TABLE_PROJECT_REQUEST_FIELDS.FIELD_URI;
let project_request_sort = TABLE_PROJECT_REQUEST_FIELDS.FIELD_SORT;
let project_request_title = TABLE_PROJECT_REQUEST_FIELDS.FIELD_TITLE;
let project_request_fold = TABLE_PROJECT_REQUEST_FIELDS.FIELD_FOLD;
let project_request_header = TABLE_PROJECT_REQUEST_FIELDS.FIELD_REQUEST_HEADER;
let project_request_header_hash = TABLE_PROJECT_REQUEST_FIELDS.FIELD_REQUEST_HEADER_HASH;
let project_request_body = TABLE_PROJECT_REQUEST_FIELDS.FIELD_REQUEST_BODY;
let project_request_body_hash = TABLE_PROJECT_REQUEST_FIELDS.FIELD_REQUEST_BODY_HASH;
let project_request_param = TABLE_PROJECT_REQUEST_FIELDS.FIELD_REQUEST_PARAM;
let project_request_param_hash = TABLE_PROJECT_REQUEST_FIELDS.FIELD_REQUEST_PARAM_HASH;
let project_request_path_variable = TABLE_PROJECT_REQUEST_FIELDS.FIELD_REQUEST_PATH_VARIABLE;
let project_request_path_variable_hash = TABLE_PROJECT_REQUEST_FIELDS.FIELD_REQUEST_PATH_VARIABLE_HASH;
let project_request_response = TABLE_PROJECT_REQUEST_FIELDS.FIELD_RESPONSE_CONTENT;
let project_request_response_hash = TABLE_PROJECT_REQUEST_FIELDS.FIELD_RESPONSE_HASH;
let project_request_response_demo = TABLE_PROJECT_REQUEST_FIELDS.FIELD_RESPONSE_DEMO;
let project_request_jsonFlg = TABLE_PROJECT_REQUEST_FIELDS.FIELD_JSONFLG;
let project_request_htmlFlg = TABLE_PROJECT_REQUEST_FIELDS.FIELD_HTMLFLG;
let project_request_picFlg = TABLE_PROJECT_REQUEST_FIELDS.FIELD_PICFLG;
let project_request_fileFlg = TABLE_PROJECT_REQUEST_FIELDS.FIELD_FILEFLG;
let project_request_cuid = TABLE_PROJECT_REQUEST_FIELDS.FIELD_CUID;
let project_request_cuname = TABLE_PROJECT_REQUEST_FIELDS.FIELD_CUNAME;
let project_request_delFlg = TABLE_PROJECT_REQUEST_FIELDS.FIELD_DELFLG;
let project_request_ctime = TABLE_PROJECT_REQUEST_FIELDS.FIELD_CTIME;

export async function addProjectRequest(project : string, method : string, uri : string, title : string, fold : string,
    header : object, headerHash : string, body : object, bodyHash : string, param : object, paramHash : string, pathVariable : object, pathVariableHash : string, response : object, responseHash : string, responseDemo : string,
    jsonFlg : boolean, htmlFlg : boolean, picFlg : boolean, fileFlg : boolean, device : object) {
    let existedProjectRequest = await window.db[TABLE_PROJECT_REQUEST_NAME]
    .where('[' + project_request_project + '+' + project_request_method + '+' + project_request_uri + ']')
    .equals([project, method, uri])
    .first();
    //不存在或者已删除，直接新增
    if (existedProjectRequest === undefined || existedProjectRequest[project_request_delFlg] === 1) {
        let projectRequest : any = {};
        projectRequest[project_request_project] = project;
        projectRequest[project_request_method] = method;
        projectRequest[project_request_uri] = uri;
        projectRequest[project_request_title] = title;
        projectRequest[project_request_fold] = fold;
        projectRequest[project_request_header] = header;
        projectRequest[project_request_header_hash] = headerHash;
        projectRequest[project_request_body] = body;
        projectRequest[project_request_body_hash] = bodyHash;
        projectRequest[project_request_param] = param;
        projectRequest[project_request_param_hash] = paramHash;
        projectRequest[project_request_path_variable] = pathVariable;
        projectRequest[project_request_path_variable_hash] = pathVariableHash;
        projectRequest[project_request_response] = response;
        projectRequest[project_request_response_hash] = responseHash;
        projectRequest[project_request_response_demo] = responseDemo;
        projectRequest[project_request_jsonFlg] = jsonFlg;
        projectRequest[project_request_htmlFlg] = htmlFlg;
        projectRequest[project_request_picFlg] = picFlg;
        projectRequest[project_request_fileFlg] = fileFlg;
        projectRequest[project_request_delFlg] = 0;
        projectRequest[project_request_ctime] = Date.now();
        projectRequest[project_request_cuid] = device.uuid;
        projectRequest[project_request_cuname] = device.uname;    
        await window.db[TABLE_PROJECT_REQUEST_NAME].put(projectRequest);
    } else {
        //存在判断是否需要更新
        existedProjectRequest[project_request_header] = header;
        existedProjectRequest[project_request_header_hash] = headerHash;
        existedProjectRequest[project_request_body] = body;
        existedProjectRequest[project_request_body_hash] = bodyHash;
        existedProjectRequest[project_request_param] = param;
        existedProjectRequest[project_request_param_hash] = paramHash;
        existedProjectRequest[project_request_path_variable] = pathVariable;
        existedProjectRequest[project_request_path_variable_hash] = pathVariableHash;
        existedProjectRequest[project_request_response] = response;
        existedProjectRequest[project_request_response_hash] = responseHash;
        existedProjectRequest[project_request_response_demo] = responseDemo;
        existedProjectRequest[project_request_jsonFlg] = jsonFlg;
        existedProjectRequest[project_request_htmlFlg] = htmlFlg;
        existedProjectRequest[project_request_picFlg] = picFlg;
        existedProjectRequest[project_request_fileFlg] = fileFlg;
    
        console.debug("addProjectRequest", existedProjectRequest);
    
        await window.db[TABLE_PROJECT_REQUEST_NAME].put(existedProjectRequest);
    }
}

export async function addProjectRequestFromVersionIterator(version_iteration_request : any) {
    let existedProjectRequest = await window.db[TABLE_PROJECT_REQUEST_NAME]
    .where('[' + project_request_project + '+' + project_request_method + '+' + project_request_uri + ']')
    .equals([version_iteration_request[iteration_request_project], version_iteration_request[iteration_request_method], version_iteration_request[iteration_request_uri]])
    .first();
    //不存在或者已删除，直接新增
    if (existedProjectRequest === undefined || existedProjectRequest[project_request_delFlg] === 1) {
        let project = version_iteration_request[iteration_request_project];
        let foldName = version_iteration_request[iteration_request_fold];
        let device : any = {};
        device.uuid = version_iteration_request[iteration_request_cuid];
        device.uname = version_iteration_request[iteration_request_cuname];
        //新增项目文件夹
        await addVersionIteratorFolder("", project, foldName, device, ()=>{});

        let projectRequest : any = {};
        projectRequest[project_request_project] = project;
        projectRequest[project_request_method] = version_iteration_request[iteration_request_method];
        projectRequest[project_request_uri] = version_iteration_request[iteration_request_uri];
        projectRequest[project_request_title] = version_iteration_request[iteration_request_title];
        projectRequest[project_request_fold] = foldName;
        projectRequest[project_request_header] = version_iteration_request[iteration_request_header];
        projectRequest[project_request_header_hash] = version_iteration_request[iteration_request_header_hash];
        projectRequest[project_request_body] = version_iteration_request[iteration_request_body];
        projectRequest[project_request_body_hash] = version_iteration_request[iteration_request_body_hash];
        projectRequest[project_request_param] = version_iteration_request[iteration_request_param];
        projectRequest[project_request_param_hash] = version_iteration_request[iteration_request_param_hash];
        projectRequest[project_request_response] = version_iteration_request[iteration_request_response];
        projectRequest[project_request_response_hash] = version_iteration_request[iteration_request_response_hash];
        projectRequest[project_request_response_demo] = version_iteration_request[iteration_request_response_demo];
        projectRequest[project_request_jsonFlg] = version_iteration_request[iteration_request_jsonFlg];
        projectRequest[project_request_htmlFlg] = version_iteration_request[iteration_request_htmlFlg];
        projectRequest[project_request_picFlg] = version_iteration_request[iteration_request_picFlg];
        projectRequest[project_request_fileFlg] = version_iteration_request[iteration_request_fileFlg];
        projectRequest[project_request_delFlg] = version_iteration_request[iteration_request_delFlg];
        projectRequest[project_request_ctime] = version_iteration_request[iteration_request_ctime];
        projectRequest[project_request_cuid] = version_iteration_request[iteration_request_cuid];
        projectRequest[project_request_cuname] = version_iteration_request[iteration_request_cuname];
    
        console.debug("addProjectRequestFromVersionIterator", projectRequest);
    
        await window.db[TABLE_PROJECT_REQUEST_NAME].put(projectRequest);
    } else if (
        (existedProjectRequest[project_request_header_hash] != version_iteration_request[iteration_request_header_hash])
        ||
        (existedProjectRequest[project_request_param_hash] != version_iteration_request[iteration_request_param_hash])
        ||
        (existedProjectRequest[project_request_body_hash] != version_iteration_request[iteration_request_body_hash])
        ||
        (existedProjectRequest[project_request_response_hash] != version_iteration_request[iteration_request_response_hash])
    ) {
        //存在判断是否需要更新
        existedProjectRequest[project_request_header] = version_iteration_request[iteration_request_header];
        existedProjectRequest[project_request_header_hash] = version_iteration_request[iteration_request_header_hash];
        existedProjectRequest[project_request_body] = version_iteration_request[iteration_request_body];
        existedProjectRequest[project_request_body_hash] = version_iteration_request[iteration_request_body_hash];
        existedProjectRequest[project_request_param] = version_iteration_request[iteration_request_param];
        existedProjectRequest[project_request_param_hash] = version_iteration_request[iteration_request_param_hash];
        existedProjectRequest[project_request_response] = version_iteration_request[iteration_request_response];
        existedProjectRequest[project_request_response_hash] = version_iteration_request[iteration_request_response_hash];
    
        console.debug("addProjectRequestFromVersionIterator", existedProjectRequest);
    
        await window.db[TABLE_PROJECT_REQUEST_NAME].put(existedProjectRequest);
    }
}

export async function getProjectRequest(project : string, method : string, uri : string) {
    let project_request = await window.db[TABLE_PROJECT_REQUEST_NAME]
    .where([ project_request_project, project_request_method, project_request_uri ])
    .equals([ project, method, uri ])
    .first();
    if (project_request === undefined || project_request[project_request_delFlg] !== 0) {
        return null;
    }
    return project_request;
}

export async function batchSetProjectRequestFold(project : string, methodUriArr : Array<string>, fold : string, cb : () => void) {
    for (let _methodUriRow of methodUriArr) {
        let [method, uri] = _methodUriRow.split("$$");

        let project_request = await window.db[TABLE_PROJECT_REQUEST_NAME]
        .where([ project_request_project, project_request_method, project_request_uri ])
        .equals([ project, method, uri ])
        .first();
        if (
            project_request === undefined || 
            project_request[project_request_delFlg] !== 0 ||
            project_request[project_request_fold] === fold
        ) {
            continue;
        }
        project_request[project_request_fold] = fold;
    
        console.debug("batchSetProjectRequestFold", project_request);
    
        await window.db[TABLE_PROJECT_REQUEST_NAME].put(project_request);
    }

    cb();
}

export async function setProjectRequestSort(project : string, method : string, uri : string, sort : number, cb : () => void) {
    let project_request = await window.db[TABLE_PROJECT_REQUEST_NAME]
    .where([ project_request_project, project_request_method, project_request_uri ])
    .equals([ project, method, uri ])
    .first();
    if (
        project_request === undefined || 
        project_request[project_request_delFlg] !== 0 ||
        project_request[project_request_sort] == sort
    ) {
        return;
    }
    project_request[project_request_sort] = sort;

    console.debug("setSort", project_request);

    await window.db[TABLE_PROJECT_REQUEST_NAME].put(project_request);
    
    cb();
}

export async function getProjectRequests(project : string, fold : string, title : string, uri : string) {
    let project_requests = await window.db[TABLE_PROJECT_REQUEST_NAME]
    .where([ project_request_delFlg, project_request_project ])
    .equals([ 0, project ])
    .filter(row => {
        if (!isStringEmpty(title)) {
            if (row[project_request_title].indexOf(title) < 0) {
                return false;
            }
        }
        if (!isStringEmpty(uri)) {
            if (row[project_request_uri].toLowerCase().indexOf(uri.toLowerCase()) < 0) {
                return false;
            }
        }
        if (!isStringEmpty(fold) || fold === "") {
            if (row[project_request_fold] !== fold) {
                return false;
            }
        }
        return true;
    })
    .reverse()
    .toArray();

    project_requests.sort((a, b) => {
        if (a[project_request_sort] === undefined) {
            a[project_request_sort] = 0;
        }
        if (b[project_request_sort] === undefined) {
            b[project_request_sort] = 0;
        }
        return b[project_request_sort] - a[project_request_sort];
    })
    
    return project_requests;
}

export async function delProjectRequest(record, cb) {
    let project = record[project_request_project];
    let method = record[project_request_method];
    let uri = record[project_request_uri];

    let project_request = await getProjectRequest(project, method, uri);
    if (project_request !== undefined) {
        project_request[project_request_delFlg] = 1;
        console.debug("delProjectRequest", project_request);
        await window.db[TABLE_PROJECT_REQUEST_NAME].put(project_request);
        cb();
    }
}

export async function editProjectRequest(
    project : string, method : string, uri : string, 
    title: string, fold: string, header: object, body: object, param: object, pathVariable: object, response: object
) {
    let project_request = await getProjectRequest(project, method, uri);
    project_request[project_request_title] = title;
    project_request[project_request_fold] = fold;
    project_request[project_request_header] = header;
    project_request[project_request_body] = body;
    project_request[project_request_param] = param;
    project_request[project_request_path_variable] = pathVariable;
    project_request[project_request_response] = response;

    console.debug("editProjectRequest", project_request);

    await window.db[TABLE_PROJECT_REQUEST_NAME].put(project_request);
}