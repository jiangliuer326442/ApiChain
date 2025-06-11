import { 
    TABLE_VERSION_ITERATION_REQUEST_NAME, 
    TABLE_PROJECT_REQUEST_FIELDS,
    TABLE_VERSION_ITERATION_REQUEST_FIELDS, 
    UNAME
} from '@conf/db';
import { 
    CLIENT_TYPE_TEAM, CLIENT_TYPE_SINGLE,
    REQUEST_VERSION_ITERATION_ADD_URL,
    REQUEST_VERSION_ITERATION_EDIT_URL,
    REQUEST_VERSION_ITERATION_QUERY_URL,
    REQUEST_VERSION_ITERATION_EXPORT_URL,
    REQUEST_VERSION_ITERATION_FIND_URL,
} from '@conf/team';
import { isStringEmpty } from '@rutil/index';
import { sendTeamMessage } from '@act/message';
import { getProjectRequests } from '@act/project_request';
import { getUsers } from '@act/user';

let iteration_request_iteration_uuid = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_ITERATOR_UUID;
let iteration_request_project = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_MICRO_SERVICE_LABEL;
let iteration_request_method = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_REQUEST_METHOD;
let iteration_request_title = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_TITLE;
let iteration_request_desc = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_DESC;
let iteration_request_sort = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_SORT;
let iteration_request_fold = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_FOLD;
let iteration_request_uri = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_URI;
let iteration_request_header = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_REQUEST_HEADER;
let iteration_request_header_hash = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_REQUEST_HEADER_HASH;
let iteration_request_body = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_REQUEST_BODY;
let iteration_request_body_hash = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_REQUEST_BODY_HASH;
let iteration_request_param = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_REQUEST_PARAM;
let iteration_request_param_hash = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_REQUEST_PARAM_HASH;
let iteration_request_path_variable = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_REQUEST_PATH_VARIABLE;
let iteration_request_path_variable_hash = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_REQUEST_PATH_VARIABLE_HASH;
let iteration_request_response_head = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_RESPONSE_HEAD;
let iteration_request_response_cookie = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_RESPONSE_COOKIE;
let iteration_request_response_content = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_RESPONSE_CONTENT;
let iteration_request_response_hash = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_RESPONSE_HASH;
let iteration_request_response_demo = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_RESPONSE_DEMO;
let iteration_request_jsonFlg = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_JSONFLG;
let iteration_request_htmlFlg = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_HTMLFLG;
let iteration_request_picFlg = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_PICFLG;
let iteration_request_fileFlg = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_FILEFLG;
let iteration_request_exportdocFlg = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_EXPORT_DOCFLG;
let iteration_request_cuid = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_CUID;
let iteration_request_delFlg = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_DELFLG;
let iteration_request_ctime = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_CTIME;

let project_request_uri = TABLE_PROJECT_REQUEST_FIELDS.FIELD_URI;

export async function getVersionIteratorRequest(clientType : string, iteratorId : string, prj : string, method : string, uri : string) {
    let users = await getUsers(clientType);
    let version_iteration_request;

    if (clientType === CLIENT_TYPE_TEAM) {
        version_iteration_request = await sendTeamMessage(REQUEST_VERSION_ITERATION_FIND_URL, {iteratorId, prj, method, uri});
    } else {
        version_iteration_request = await window.db[TABLE_VERSION_ITERATION_REQUEST_NAME]
        .where([ iteration_request_iteration_uuid, iteration_request_project, iteration_request_method, iteration_request_uri ])
        .equals([ iteratorId, prj, method, uri ])
        .first();
        if (version_iteration_request === undefined || version_iteration_request[iteration_request_delFlg] !== 0) {
            return null;
        }
    }

    version_iteration_request[UNAME] = users.get(version_iteration_request[iteration_request_cuid]);
    return version_iteration_request;
}

export async function delVersionIteratorRequest(clientType, record, cb) {
    let iteration_uuid = record[iteration_request_iteration_uuid];
    let project = record[iteration_request_project];
    let method = record[iteration_request_method];
    let uri = record[iteration_request_uri];

    let version_iteration_request = await getVersionIteratorRequest(clientType, iteration_uuid, project, method, uri);
    if (version_iteration_request !== undefined) {
        version_iteration_request[iteration_request_delFlg] = 1;
        await window.db[TABLE_VERSION_ITERATION_REQUEST_NAME].put(version_iteration_request);
        cb();
    }
}

export async function getUnitTestRequests(clientType : string, project : string, iteration_uuid : string, uri : string) {
    let uris = new Set();
    let requests = await getVersionIteratorRequestsByProject(iteration_uuid, project, null, "", uri);
    for (let _request of requests) {
        uris.add(_request[iteration_request_uri]);
    }
    let projectRequests = await getProjectRequests(clientType, project, null, "", uri);
    for (let _request of projectRequests) {
        if (!uris.has(_request[project_request_uri])) {
            requests.push(_request);
            uris.add(_request[project_request_uri]);
        }
    }
    return requests;
}

export async function batchSetProjectRequestFold(iterator : string, project : string, methodUriArr : Array<string>, fold : string) {
    for (let _methodUriRow of methodUriArr) {
        let [method, uri] = _methodUriRow.split("$$");

        let version_iteration_request = await window.db[TABLE_VERSION_ITERATION_REQUEST_NAME]
        .where([ iteration_request_iteration_uuid, iteration_request_project, iteration_request_method, iteration_request_uri ])
        .equals([ iterator, project, method, uri ])
        .first();
        if (
            version_iteration_request === undefined || 
            version_iteration_request[iteration_request_delFlg] !== 0 ||
            version_iteration_request[iteration_request_fold] === fold
        ) {
            continue;
        }
        version_iteration_request[iteration_request_fold] = fold;
    
        await window.db[TABLE_VERSION_ITERATION_REQUEST_NAME].put(version_iteration_request);
    }
}

export async function batchMoveIteratorRequest(oldIterator : string, project : string, requestArr : Array<string>, newIterator : string, cb : () => void) {
    for (let _requestRow of requestArr) {
        let [method, uri] = _requestRow.split("$$");
        let version_iteration_request = await window.db[TABLE_VERSION_ITERATION_REQUEST_NAME]
        .where([ iteration_request_iteration_uuid, iteration_request_project, iteration_request_method, iteration_request_uri ])
        .equals([ oldIterator, project, method, uri ])
        .first();
        if (version_iteration_request === undefined || version_iteration_request[iteration_request_delFlg] !== 0) {
            continue;
        }

        await window.db[TABLE_VERSION_ITERATION_REQUEST_NAME]
        .where([ iteration_request_iteration_uuid, iteration_request_project, iteration_request_method, iteration_request_uri ])
        .equals([ oldIterator, project, method, uri ]).delete();

        version_iteration_request[iteration_request_iteration_uuid] = newIterator;
    
        await window.db[TABLE_VERSION_ITERATION_REQUEST_NAME].put(version_iteration_request);
    }
    cb();
}

export async function getExportVersionIteratorRequests(clientType : string, iteration_uuid : string) {
    let version_iteration_requests;
    
    if (clientType === CLIENT_TYPE_SINGLE) {
        version_iteration_requests = await window.db[TABLE_VERSION_ITERATION_REQUEST_NAME]
        .where([ iteration_request_delFlg, iteration_request_iteration_uuid ])
        .equals([ 0, iteration_uuid ])
        .filter(row => {
            if (row[iteration_request_exportdocFlg] === false) {
                return false;
            }
            return true;
        })
        .reverse()
        .toArray();
    } else {
        let ret = await sendTeamMessage(REQUEST_VERSION_ITERATION_EXPORT_URL, {iteratorId: iteration_uuid});
        version_iteration_requests = ret.requests;
    }

    version_iteration_requests.sort((a, b) => {
        if (a[iteration_request_sort] === undefined) {
            a[iteration_request_sort] = 0;
        }
        if (b[iteration_request_sort] === undefined) {
            b[iteration_request_sort] = 0;
        }
        return b[iteration_request_sort] - a[iteration_request_sort];
    })
    
    return version_iteration_requests;
}

export async function getSimpleVersionIteratorRequests(clientType : string, iteration_uuid : string, project : string, fold : string | null, title : string, uri : string) {
    let version_iteration_requests;
    
    if (clientType === CLIENT_TYPE_SINGLE) {
        version_iteration_requests = await window.db[TABLE_VERSION_ITERATION_REQUEST_NAME]
        .where([ iteration_request_delFlg, iteration_request_iteration_uuid ])
        .equals([ 0, iteration_uuid ])
        .filter(row => {
            if (!isStringEmpty(title)) {
                if (row[iteration_request_title].indexOf(title) < 0 && row[iteration_request_desc].indexOf(title) < 0) {
                    return false;
                }
            }
            if (!isStringEmpty(uri)) {
                if (row[iteration_request_uri].toLowerCase().indexOf(uri.toLowerCase()) < 0) {
                    return false;
                }
            }
            if (!isStringEmpty(project)) {
                if (row[iteration_request_project] !== project) {
                    return false;
                }
            }
            if (!isStringEmpty(fold) || fold === "") {
                if (row[iteration_request_fold] !== fold || row[iteration_request_project] !== project) {
                    return false;
                }
            }
            return true;
        })
        .reverse()
        .toArray();
    } else {
        let ret = await sendTeamMessage(REQUEST_VERSION_ITERATION_QUERY_URL, {iteratorId: iteration_uuid, prj: project, fold, title, uri});
        version_iteration_requests = ret.requests;
    }

    version_iteration_requests.sort((a, b) => {
        if (a[iteration_request_sort] === undefined) {
            a[iteration_request_sort] = 0;
        }
        if (b[iteration_request_sort] === undefined) {
            b[iteration_request_sort] = 0;
        }
        return b[iteration_request_sort] - a[iteration_request_sort];
    })
    
    return version_iteration_requests;
}

async function getVersionIteratorRequestsByProject(iteration_uuid : string, project : string, fold : string | null, title : string, uri : string) {
    let version_iteration_requests = await window.db[TABLE_VERSION_ITERATION_REQUEST_NAME]
    .where([ iteration_request_delFlg, iteration_request_iteration_uuid ])
    .equals([ 0, iteration_uuid ])
    .filter(row => {
        if (!isStringEmpty(title)) {
            if (row[iteration_request_title].indexOf(title) < 0 && row[iteration_request_desc].indexOf(title) < 0) {
                return false;
            }
        }
        if (!isStringEmpty(uri)) {
            if (row[iteration_request_uri].toLowerCase().indexOf(uri.toLowerCase()) < 0) {
                return false;
            }
        }
        if (!isStringEmpty(project)) {
            if (row[iteration_request_project] !== project) {
                return false;
            }
        }
        if (!isStringEmpty(fold) || fold === "") {
            if (row[iteration_request_fold] !== fold || row[iteration_request_project] !== project) {
                return false;
            }
        }
        return true;
    })
    .reverse()
    .toArray();

    version_iteration_requests.sort((a, b) => {
        if (a[iteration_request_sort] === undefined) {
            a[iteration_request_sort] = 0;
        }
        if (b[iteration_request_sort] === undefined) {
            b[iteration_request_sort] = 0;
        }
        return b[iteration_request_sort] - a[iteration_request_sort];
    })
    
    return version_iteration_requests;
}

export async function editVersionIteratorRequest(
    clientType : string, teamId : string,
    initMethod : string, initUri : string,
    iteration_uuid : string, project : string, method : string, uri : string, 
    title: string, desc: string, fold: string, header: object, body: object, param: object, pathVariable: object, 
    responseContent: object, responseHead: object, responseCookie: object, isExportDoc: boolean
) {
    if (clientType === CLIENT_TYPE_TEAM) {
        await sendTeamMessage(REQUEST_VERSION_ITERATION_EDIT_URL, {
            initMethod, initUri, iteratorId: iteration_uuid,
            prj: project, method, uri,
            title, description: desc, fold, 
            header: JSON.stringify(header), param: JSON.stringify(param), pathVariable: JSON.stringify(pathVariable), body: JSON.stringify(body),
            responseContent: JSON.stringify(responseContent), responseHead: JSON.stringify(responseHead), responseCookie: JSON.stringify(responseCookie), 
            export_doc_flg: isExportDoc
        });
    }
    //未改动基础，只修改
    if (initMethod === method && initUri === uri) {
        let version_iteration_request = await getVersionIteratorRequest(clientType, iteration_uuid, project, method, uri);
        version_iteration_request[iteration_request_title] = title;
        version_iteration_request[iteration_request_desc] = desc;
        version_iteration_request[iteration_request_fold] = fold;
        version_iteration_request[iteration_request_header] = header;
        version_iteration_request[iteration_request_body] = body;
        version_iteration_request[iteration_request_param] = param;
        version_iteration_request[iteration_request_path_variable] = pathVariable;
        version_iteration_request[iteration_request_response_content] = responseContent;
        version_iteration_request[iteration_request_response_head] = responseHead;
        version_iteration_request[iteration_request_response_cookie] = responseCookie;
        version_iteration_request[iteration_request_exportdocFlg] = isExportDoc;
        if (clientType === CLIENT_TYPE_SINGLE) {
            version_iteration_request.upload_flg = 0;
            version_iteration_request.team_id = "";
        } else {
            version_iteration_request.upload_flg = 1;
            version_iteration_request.team_id = teamId;
        }
    
        await window.db[TABLE_VERSION_ITERATION_REQUEST_NAME].put(version_iteration_request);
    } else {
        let version_iteration_request = await getVersionIteratorRequest(clientType, iteration_uuid, project, initMethod, initUri);
        if (clientType === CLIENT_TYPE_SINGLE) {
            version_iteration_request.upload_flg = 0;
            version_iteration_request.team_id = "";
        } else {
            version_iteration_request.upload_flg = 1;
            version_iteration_request.team_id = teamId;
        }
        version_iteration_request[iteration_request_delFlg] = 1;
        await window.db[TABLE_VERSION_ITERATION_REQUEST_NAME].put(version_iteration_request);
        
        version_iteration_request[iteration_request_method] = method;
        version_iteration_request[iteration_request_uri] = uri;
        version_iteration_request[iteration_request_title] = title;
        version_iteration_request[iteration_request_desc] = desc;
        version_iteration_request[iteration_request_fold] = fold;
        version_iteration_request[iteration_request_header] = header;
        version_iteration_request[iteration_request_body] = body;
        version_iteration_request[iteration_request_param] = param;
        version_iteration_request[iteration_request_path_variable] = pathVariable;
        version_iteration_request[iteration_request_response_content] = responseContent;
        version_iteration_request[iteration_request_response_head] = responseHead;
        version_iteration_request[iteration_request_response_cookie] = responseCookie;
        version_iteration_request[iteration_request_exportdocFlg] = isExportDoc;
        if (clientType === CLIENT_TYPE_SINGLE) {
            version_iteration_request.upload_flg = 0;
            version_iteration_request.team_id = "";
        } else {
            version_iteration_request.upload_flg = 1;
            version_iteration_request.team_id = teamId;
        }
        version_iteration_request[iteration_request_delFlg] = 0;
        await window.db[TABLE_VERSION_ITERATION_REQUEST_NAME].put(version_iteration_request);
    }
}

export async function addVersionIteratorRequest(
    clientType : string, teamId : string,
    iteratorId : string, prj : string, method : string, uri : string, sort : number,
    title: string, description: string, fold: string, 
    header: object, headerHash: string, body: object, bodyHash: string, param: object, paramHash: string, pathVariable: object, pathVariableHash: string, 
    responseContent: object, responseHead: object, responseCookie: object, responseHash: string, response_demo: object,
    json_flg: boolean, html_flg: boolean, pic_flg: boolean, file_flg: boolean, export_doc_flg: boolean,
    device : any) {
        if (clientType === CLIENT_TYPE_TEAM) {
            await sendTeamMessage(REQUEST_VERSION_ITERATION_ADD_URL, {
                iteratorId, prj, method, uri, sort,
                title, description, fold,
                pic_flg, file_flg, json_flg, html_flg, 
                header: JSON.stringify(header), 
                param: JSON.stringify(param), 
                pathVariable: JSON.stringify(pathVariable), 
                body: JSON.stringify(body), 
                responseContent: JSON.stringify(responseContent), 
                response_demo, 
                responseHead: JSON.stringify(responseHead), 
                responseCookie: JSON.stringify(responseCookie), 
                export_doc_flg
            });
        }
    let version_iteration_request : any = {};
    version_iteration_request[iteration_request_iteration_uuid] = iteratorId;
    version_iteration_request[iteration_request_project] = prj;
    version_iteration_request[iteration_request_method] = method;
    version_iteration_request[iteration_request_uri] = uri;
    version_iteration_request[iteration_request_sort] = sort;
    version_iteration_request[iteration_request_title] = title;
    version_iteration_request[iteration_request_desc] = description;
    version_iteration_request[iteration_request_fold] = fold;
    version_iteration_request[iteration_request_header] = header;
    version_iteration_request[iteration_request_header_hash] = headerHash;
    version_iteration_request[iteration_request_body] = body;
    version_iteration_request[iteration_request_body_hash] = bodyHash;
    version_iteration_request[iteration_request_param] = param;
    version_iteration_request[iteration_request_param_hash] = paramHash;
    version_iteration_request[iteration_request_path_variable] = pathVariable;
    version_iteration_request[iteration_request_path_variable_hash] = pathVariableHash;
    version_iteration_request[iteration_request_response_content] = responseContent;
    version_iteration_request[iteration_request_response_head] = responseHead;
    version_iteration_request[iteration_request_response_cookie] = responseCookie;
    version_iteration_request[iteration_request_response_hash] = responseHash;
    version_iteration_request[iteration_request_response_demo] = response_demo;
    version_iteration_request[iteration_request_jsonFlg] = json_flg;
    version_iteration_request[iteration_request_htmlFlg] = html_flg;
    version_iteration_request[iteration_request_picFlg] = pic_flg;
    version_iteration_request[iteration_request_fileFlg] = file_flg;
    version_iteration_request[iteration_request_exportdocFlg] = export_doc_flg;

    if (clientType === CLIENT_TYPE_SINGLE) {
        version_iteration_request.upload_flg = 0;
        version_iteration_request.team_id = "";
    } else {
        version_iteration_request.upload_flg = 1;
        version_iteration_request.team_id = teamId;
    }

    version_iteration_request[iteration_request_cuid] = device.uuid;
    version_iteration_request[iteration_request_ctime] = Date.now();
    version_iteration_request[iteration_request_delFlg] = 0;

    await window.db[TABLE_VERSION_ITERATION_REQUEST_NAME].put(version_iteration_request);
}

export async function setVersionIterationRequestSort(iteratorId : string, project : string, method : string, uri : string, sort : number, cb : () => void) {
    let version_iteration_request = await window.db[TABLE_VERSION_ITERATION_REQUEST_NAME]
    .where([ iteration_request_iteration_uuid, iteration_request_project, iteration_request_method, iteration_request_uri ])
    .equals([ iteratorId, project, method, uri ])
    .first();
    if (version_iteration_request === undefined || version_iteration_request[iteration_request_delFlg] !== 0 || version_iteration_request[iteration_request_sort] == sort) {
        return;
    }
    version_iteration_request[iteration_request_sort] = sort;

    await window.db[TABLE_VERSION_ITERATION_REQUEST_NAME].put(version_iteration_request);
    
    cb();
}