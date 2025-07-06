import {
    TABLE_PROJECT_REQUEST_NAME, TABLE_PROJECT_REQUEST_FIELDS,
    UNAME,
} from '@conf/db';
import { 
    CLIENT_TYPE_TEAM, CLIENT_TYPE_SINGLE,
    REQUEST_PROJECT_ADD_URL,
    REQUEST_PROJECT_EDIT_URL,
    REQUEST_PROJECT_QUERY_URL,
    REQUEST_PROJECT_SET_SORT_URL,
    REQUEST_PROJECT_MOVE_PRJ_URL,
    REQUEST_PROJECT_DEL_URL,
    REQUEST_PROJECT_FIND_URL,
    REQUEST_PROJECT_PAGE_FOLD_URL,
} from '@conf/team';
import { sendTeamMessage } from '@act/message';
import {
    getUsers
} from '@act/user';
import {
    addProjectFolder
} from '@act/project_folders';

import { isStringEmpty, mixedSort } from '@rutil/index';

let project_request_project = TABLE_PROJECT_REQUEST_FIELDS.FIELD_PROJECT_LABEL;
let project_request_method = TABLE_PROJECT_REQUEST_FIELDS.FIELD_REQUEST_METHOD;
let project_request_uri = TABLE_PROJECT_REQUEST_FIELDS.FIELD_URI;
let project_request_sort = TABLE_PROJECT_REQUEST_FIELDS.FIELD_SORT;
let project_request_title = TABLE_PROJECT_REQUEST_FIELDS.FIELD_TITLE;
let project_request_desc = TABLE_PROJECT_REQUEST_FIELDS.FIELD_DESC;
let project_request_fold = TABLE_PROJECT_REQUEST_FIELDS.FIELD_FOLD;
let project_request_header = TABLE_PROJECT_REQUEST_FIELDS.FIELD_REQUEST_HEADER;
let project_request_header_hash = TABLE_PROJECT_REQUEST_FIELDS.FIELD_REQUEST_HEADER_HASH;
let project_request_body = TABLE_PROJECT_REQUEST_FIELDS.FIELD_REQUEST_BODY;
let project_request_body_hash = TABLE_PROJECT_REQUEST_FIELDS.FIELD_REQUEST_BODY_HASH;
let project_request_param = TABLE_PROJECT_REQUEST_FIELDS.FIELD_REQUEST_PARAM;
let project_request_param_hash = TABLE_PROJECT_REQUEST_FIELDS.FIELD_REQUEST_PARAM_HASH;
let project_request_path_variable = TABLE_PROJECT_REQUEST_FIELDS.FIELD_REQUEST_PATH_VARIABLE;
let project_request_path_variable_hash = TABLE_PROJECT_REQUEST_FIELDS.FIELD_REQUEST_PATH_VARIABLE_HASH;
let project_request_response_content = TABLE_PROJECT_REQUEST_FIELDS.FIELD_RESPONSE_CONTENT;
let project_request_response_head = TABLE_PROJECT_REQUEST_FIELDS.FIELD_RESPONSE_HEAD;
let project_request_response_cookie = TABLE_PROJECT_REQUEST_FIELDS.FIELD_RESPONSE_COOKIE;
let project_request_response_hash = TABLE_PROJECT_REQUEST_FIELDS.FIELD_RESPONSE_HASH;
let project_request_response_demo = TABLE_PROJECT_REQUEST_FIELDS.FIELD_RESPONSE_DEMO;
let project_request_jsonFlg = TABLE_PROJECT_REQUEST_FIELDS.FIELD_JSONFLG;
let project_request_htmlFlg = TABLE_PROJECT_REQUEST_FIELDS.FIELD_HTMLFLG;
let project_request_picFlg = TABLE_PROJECT_REQUEST_FIELDS.FIELD_PICFLG;
let project_request_fileFlg = TABLE_PROJECT_REQUEST_FIELDS.FIELD_FILEFLG;
let project_request_cuid = TABLE_PROJECT_REQUEST_FIELDS.FIELD_CUID;
let project_request_delFlg = TABLE_PROJECT_REQUEST_FIELDS.FIELD_DELFLG;
let project_request_ctime = TABLE_PROJECT_REQUEST_FIELDS.FIELD_CTIME;

export async function addProjectRequest(
    clientType : string, teamId : string,
    prj : string, method : string, uri : string, title : string, description : string, fold : string,
    header : object, headerHash : string, body : object, bodyHash : string, param : object, paramHash : string, pathVariable : object, pathVariableHash : string, 
    responseContent : object, responseHead : object, responseCookie : object, responseHash : string, response_demo : string,
    json_flg : boolean, html_flg : boolean, pic_flg : boolean, file_flg : boolean, device : object) {

        if (clientType === CLIENT_TYPE_TEAM) {
            await sendTeamMessage(REQUEST_PROJECT_ADD_URL, {
                prj, method, uri, sort: 0,
                title, description, fold,
                pic_flg, file_flg, json_flg, html_flg, 
                header: JSON.stringify(header), 
                param: JSON.stringify(param), 
                pathVariable: JSON.stringify(pathVariable), 
                body: JSON.stringify(body), 
                responseContent: JSON.stringify(responseContent), 
                response_demo, 
                responseHead: JSON.stringify(responseHead), 
                responseCookie: JSON.stringify(responseCookie)
            });
        }

    let existedProjectRequest = await window.db[TABLE_PROJECT_REQUEST_NAME]
    .where('[' + project_request_project + '+' + project_request_method + '+' + project_request_uri + ']')
    .equals([prj, method, uri])
    .first();
    //不存在或者已删除，直接新增
    if (existedProjectRequest === undefined || existedProjectRequest[project_request_delFlg] === 1) {
        let projectRequest : any = {};
        projectRequest[project_request_project] = prj;
        projectRequest[project_request_method] = method;
        projectRequest[project_request_uri] = uri;
        projectRequest[project_request_title] = title;
        projectRequest[project_request_desc] = description;
        projectRequest[project_request_fold] = fold;
        projectRequest[project_request_header] = header;
        projectRequest[project_request_header_hash] = headerHash;
        projectRequest[project_request_body] = body;
        projectRequest[project_request_body_hash] = bodyHash;
        projectRequest[project_request_param] = param;
        projectRequest[project_request_param_hash] = paramHash;
        projectRequest[project_request_path_variable] = pathVariable;
        projectRequest[project_request_path_variable_hash] = pathVariableHash;
        projectRequest[project_request_response_content] = responseContent;
        projectRequest[project_request_response_head] = responseHead;
        projectRequest[project_request_response_cookie] = responseCookie;
        projectRequest[project_request_response_hash] = responseHash;
        projectRequest[project_request_response_demo] = response_demo;
        projectRequest[project_request_jsonFlg] = json_flg;
        projectRequest[project_request_htmlFlg] = html_flg;
        projectRequest[project_request_picFlg] = pic_flg;
        projectRequest[project_request_fileFlg] = file_flg;
        if (clientType === CLIENT_TYPE_SINGLE) {
            projectRequest.upload_flg = 0;
            projectRequest.team_id = "";
        } else {
            projectRequest.upload_flg = 1;
            projectRequest.team_id = teamId;
        }
        projectRequest[project_request_delFlg] = 0;
        projectRequest[project_request_ctime] = Date.now();
        projectRequest[project_request_cuid] = device.uuid;
        await window.db[TABLE_PROJECT_REQUEST_NAME].put(projectRequest);
    } else {
        //存在判断是否需要更新
        existedProjectRequest[project_request_title] = title;
        existedProjectRequest[project_request_desc] = description;
        existedProjectRequest[project_request_header] = header;
        existedProjectRequest[project_request_header_hash] = headerHash;
        existedProjectRequest[project_request_body] = body;
        existedProjectRequest[project_request_body_hash] = bodyHash;
        existedProjectRequest[project_request_param] = param;
        existedProjectRequest[project_request_param_hash] = paramHash;
        existedProjectRequest[project_request_path_variable] = pathVariable;
        existedProjectRequest[project_request_path_variable_hash] = pathVariableHash;
        existedProjectRequest[project_request_response_content] = responseContent;
        existedProjectRequest[project_request_response_head] = responseHead;
        existedProjectRequest[project_request_response_cookie] = responseCookie;
        existedProjectRequest[project_request_response_hash] = responseHash;
        existedProjectRequest[project_request_response_demo] = response_demo;
        existedProjectRequest[project_request_jsonFlg] = json_flg;
        existedProjectRequest[project_request_htmlFlg] = html_flg;
        existedProjectRequest[project_request_picFlg] = pic_flg;
        existedProjectRequest[project_request_fileFlg] = file_flg;
        if (clientType === CLIENT_TYPE_SINGLE) {
            existedProjectRequest.upload_flg = 0;
            existedProjectRequest.team_id = "";
        } else {
            existedProjectRequest.upload_flg = 1;
            existedProjectRequest.team_id = teamId;
        }
    
        await window.db[TABLE_PROJECT_REQUEST_NAME].put(existedProjectRequest);
    }
}

export async function getProjectRequest(clientType : string, prj : string, method : string, uri : string) {
    let users = await getUsers(clientType);
    let project_request;

    if (clientType === CLIENT_TYPE_TEAM) {
        project_request = await sendTeamMessage(REQUEST_PROJECT_FIND_URL, {prj, method, uri});
        if (project_request === null) return null;
    } else {
        project_request = await window.db[TABLE_PROJECT_REQUEST_NAME]
        .where([ project_request_project, project_request_method, project_request_uri ])
        .equals([ prj, method, uri ])
        .first();
        if (project_request === undefined || project_request[project_request_delFlg] !== 0) {
            return null;
        }
    }
    project_request[UNAME] = users.get(project_request[project_request_cuid]);
    return project_request;
}

export async function batchMoveProjectRequestPrj(clientType : string, teamId : string, project : string, methodUriArr : Array<string>, newPrj : string, device : object) {
    if (newPrj === project) return;

    if (clientType === CLIENT_TYPE_TEAM) {
        await sendTeamMessage(REQUEST_PROJECT_MOVE_PRJ_URL, {
            prj: project, 
            methodUris: methodUriArr.join(","), 
            newPrj
        });
    }

    for (let _methodUriRow of methodUriArr) {
        let [method, uri] = _methodUriRow.split("$$");

        let project_request = await window.db[TABLE_PROJECT_REQUEST_NAME]
        .where([ project_request_project, project_request_method, project_request_uri ])
        .equals([ project, method, uri ])
        .first();
        if (
            project_request === undefined || 
            project_request[project_request_delFlg] !== 0
        ) {
            continue;
        }

        project_request[project_request_project] = newPrj;
        if (clientType === CLIENT_TYPE_SINGLE) {
            project_request.upload_flg = 0;
            project_request.team_id = "";
        } else {
            project_request.upload_flg = 1;
            project_request.team_id = teamId;
        }
    
        await window.db[TABLE_PROJECT_REQUEST_NAME].put(project_request);

        let fold = project_request[project_request_fold];
        await addProjectFolder(clientType, teamId, newPrj, fold, device);
    }
}

export async function setProjectRequestSort(clientType : string, teamId : string, prj : string, method : string, uri : string, sort : number) {
    if (clientType === CLIENT_TYPE_TEAM) {
        await sendTeamMessage(REQUEST_PROJECT_SET_SORT_URL, {
            prj, method, uri, sort,
        });
    }


    let project_request = await window.db[TABLE_PROJECT_REQUEST_NAME]
    .where([ project_request_project, project_request_method, project_request_uri ])
    .equals([ prj, method, uri ])
    .reverse()
    .first();
    if (
        project_request === undefined || 
        project_request[project_request_delFlg] !== 0 ||
        project_request[project_request_sort] == sort
    ) {
        return;
    }
    project_request[project_request_sort] = sort;
    if (clientType === CLIENT_TYPE_SINGLE) {
        project_request.upload_flg = 0;
        project_request.team_id = "";
    } else {
        project_request.upload_flg = 1;
        project_request.team_id = teamId;
    }
    await window.db[TABLE_PROJECT_REQUEST_NAME].put(project_request);

    let project_requests = await window.db[TABLE_PROJECT_REQUEST_NAME]
    .where([ project_request_delFlg, project_request_project, project_request_fold ])
    .equals([ 0, prj, project_request[project_request_fold] ])
    .filter(row => {
        if (row[project_request_method] === method && row[project_request_uri] === uri) {
            return false;
        }
        if (row[project_request_sort] < sort) {
            return false;
        }
        return true;
    })
    .toArray();

    for(let project_request of project_requests) {
        let oldSort = Number(project_request[project_request_sort]);
        project_request[project_request_sort] = oldSort + 1;
        if (clientType === CLIENT_TYPE_SINGLE) {
            project_request.upload_flg = 0;
            project_request.team_id = "";
        } else {
            project_request.upload_flg = 1;
            project_request.team_id = teamId;
        }
        await window.db[TABLE_PROJECT_REQUEST_NAME].put(project_request);
    }
}

export async function getFolderProjectRequests(
    clientType : string, 
    prj : string, 
    fold : string, 
    title: string | null,
    uri: string | null,
    pagination : any
) {
    let datas = [];
    let page = pagination.current;
    let pageSize = pagination.pageSize;

    if (clientType == CLIENT_TYPE_SINGLE) {
        const offset = (page - 1) * pageSize;
        let count = await window.db[TABLE_PROJECT_REQUEST_NAME]
            .where([ project_request_delFlg, project_request_project, project_request_fold ])
            .equals([ 0, prj, fold ])
            .filter(row => {
                if (!isStringEmpty(title) && row[project_request_title].indexOf(title) < 0) {
                    return false;
                }
                if (!isStringEmpty(uri) && row[project_request_uri].indexOf(uri) < 0) {
                    return false;
                }
                return true;
            })
            .count();
        pagination.total = count;
        datas = await window.db[TABLE_PROJECT_REQUEST_NAME]
            .where([ project_request_delFlg, project_request_project, project_request_fold ])
            .equals([ 0, prj, fold ])
            .filter(row => {
                if (!isStringEmpty(title) && row[project_request_title].indexOf(title) < 0) {
                    return false;
                }
                if (!isStringEmpty(uri) && row[project_request_uri].indexOf(uri) < 0) {
                    return false;
                }
                return true;
            })
            .offset(offset)
            .limit(pageSize)
            .toArray();
        mixedSort(datas, project_request_title);
        datas = datas.sort((a, b) => {
            let asort = 0;
            if (!Number.isNaN(a[project_request_sort])) {
                asort = Number(a[project_request_sort]);
            }
            let bsort = 0;
            if (!Number.isNaN(b[project_request_sort])) {
                bsort = Number(b[project_request_sort]);
            }
            return asort - bsort;
        });
    } else {
        let result = await sendTeamMessage(REQUEST_PROJECT_PAGE_FOLD_URL, Object.assign({}, pagination, {prj, fold, title, uri}));
        let count = result.count;
        pagination.total = count;
        datas = result.list;
    }

    return datas;
}

export async function getProjectRequests(clientType : string, project : string, fold : string | null, title : string, uri : string) {
    let project_requests;
    
    if (clientType === CLIENT_TYPE_SINGLE) {
        project_requests = await window.db[TABLE_PROJECT_REQUEST_NAME]
        .where([ project_request_delFlg, project_request_project ])
        .equals([ 0, project ])
        .filter(row => {
            if (!isStringEmpty(title)) {
                if (row[project_request_title].indexOf(title) < 0 && row[project_request_desc].indexOf(title) < 0) {
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

        mixedSort(project_requests, project_request_title);
    } else {
        let ret = await sendTeamMessage(REQUEST_PROJECT_QUERY_URL, {prj: project, fold, title, uri});
        project_requests = ret.requests;
    }
    
    return project_requests;
}

export async function delProjectRequest(clientType : string, teamId : string, record) {
    let prj = record[project_request_project];
    let method = record[project_request_method];
    let uri = record[project_request_uri];

    if (clientType === CLIENT_TYPE_TEAM) {
        await sendTeamMessage(REQUEST_PROJECT_DEL_URL, {prj, method, uri});
    }

    let project_request = await window.db[TABLE_PROJECT_REQUEST_NAME]
    .where([ project_request_project, project_request_method, project_request_uri ])
    .equals([ prj, method, uri ])
    .reverse()
    .first();
    if (project_request === undefined || project_request[project_request_delFlg] !== 0) {
        return;
    }

    project_request[project_request_delFlg] = 1;
    if (clientType === CLIENT_TYPE_SINGLE) {
        project_request.upload_flg = 0;
        project_request.team_id = "";
    } else {
        project_request.upload_flg = 1;
        project_request.team_id = teamId;
    }
    await window.db[TABLE_PROJECT_REQUEST_NAME].put(project_request);
}

export async function editProjectRequest(
    clientType : string, teamId : string,
    initMethod : string, initUri : string,
    project : string, method : string, uri : string, 
    title: string, desc: string, fold: string, header: object, body: object, param: object, pathVariable: object, 
    responseContent: object, responseHead: object, responseCookie: object
) {
    if (clientType === CLIENT_TYPE_TEAM) {
        await sendTeamMessage(REQUEST_PROJECT_EDIT_URL, {
            initMethod, initUri,
            prj: project, method, uri,
            title, description: desc, fold, 
            header: JSON.stringify(header), param: JSON.stringify(param), pathVariable: JSON.stringify(pathVariable), body: JSON.stringify(body),
            responseContent: JSON.stringify(responseContent), responseHead: JSON.stringify(responseHead), responseCookie: JSON.stringify(responseCookie)
        });
    }

    //未改动基础，只修改
    if (initMethod === method && initUri === uri) {
        let project_request = await window.db[TABLE_PROJECT_REQUEST_NAME]
        .where([ project_request_project, project_request_method, project_request_uri ])
        .equals([ project, method, uri ])
        .reverse()
        .first();
        project_request[project_request_title] = title;
        project_request[project_request_desc] = desc;
        project_request[project_request_fold] = fold;
        project_request[project_request_header] = header;
        project_request[project_request_body] = body;
        project_request[project_request_param] = param;
        project_request[project_request_path_variable] = pathVariable;
        project_request[project_request_response_content] = responseContent;
        project_request[project_request_response_head] = responseHead;
        project_request[project_request_response_cookie] = responseCookie;
        if (clientType === CLIENT_TYPE_SINGLE) {
            project_request.upload_flg = 0;
            project_request.team_id = "";
        } else {
            project_request.upload_flg = 1;
            project_request.team_id = teamId;
        }
    
        await window.db[TABLE_PROJECT_REQUEST_NAME].put(project_request);
    } else {
        let project_request = await window.db[TABLE_PROJECT_REQUEST_NAME]
        .where([ project_request_project, project_request_method, project_request_uri ])
        .equals([ project, initMethod, initUri ])
        .reverse()
        .first();
        if (clientType === CLIENT_TYPE_SINGLE) {
            project_request.upload_flg = 0;
            project_request.team_id = "";
        } else {
            project_request.upload_flg = 1;
            project_request.team_id = teamId;
        }
        project_request[project_request_delFlg] = 1;
        await window.db[TABLE_PROJECT_REQUEST_NAME].put(project_request);
        
        project_request[project_request_method] = method;
        project_request[project_request_uri] = uri;
        project_request[project_request_title] = title;
        project_request[project_request_desc] = desc;
        project_request[project_request_fold] = fold;
        project_request[project_request_header] = header;
        project_request[project_request_body] = body;
        project_request[project_request_param] = param;
        project_request[project_request_path_variable] = pathVariable;
        project_request[project_request_response_content] = responseContent;
        project_request[project_request_response_head] = responseHead;
        project_request[project_request_response_cookie] = responseCookie;
        if (clientType === CLIENT_TYPE_SINGLE) {
            project_request.upload_flg = 0;
            project_request.team_id = "";
        } else {
            project_request.upload_flg = 1;
            project_request.team_id = teamId;
        }
        project_request[project_request_delFlg] = 0;
        await window.db[TABLE_PROJECT_REQUEST_NAME].put(project_request);
    }
}