import { v4 as uuidv4 } from 'uuid';

import { mixedSort } from '@rutil/index';
import { 
    TABLE_VERSION_ITERATION_REQUEST_NAME, TABLE_VERSION_ITERATION_REQUEST_FIELDS,
    TABLE_VERSION_ITERATION_NAME, TABLE_VERSION_ITERATION_FIELDS,
    TABLE_PROJECT_REQUEST_NAME, TABLE_PROJECT_REQUEST_FIELDS,
    TABLE_VERSION_ITERATION_FOLD_NAME, TABLE_VERSION_ITERATION_FOLD_FIELDS,
    UNAME,
} from '@conf/db';
import { GET_VERSION_ITERATORS } from '@conf/redux';
import { 
    VERSION_ITERATIONS_PAGE_URL, 
    VERSION_ITERATION_GET_URL, 
    VERSION_ITERATION_SET_URL, 
    VERSION_ITERATIONS_OPENS_URL,
    VERSION_ITERATION_DEL_URL,
    VERSION_ITERATION_ALL_URL,
    VERSION_ITERATION_RE_OPEN_URL,
    VERSION_ITERATION_CLOSE_URL,
    CLIENT_TYPE_SINGLE,
    CLIENT_TYPE_TEAM,
} from '@conf/team';

import { sendTeamMessage } from '@act/message';
import { getUsers } from '@act/user';
import { objectToMap } from '@rutil/sets';

let iteration_request_project = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_MICRO_SERVICE_LABEL;
let iteration_request_method = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_REQUEST_METHOD;
let iteration_request_uri = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_URI;
let iteration_request_title = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_TITLE;
let iteration_request_desc = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_DESC;
let iteration_request_fold = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_FOLD;
let iteration_request_header = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_REQUEST_HEADER;
let iteration_request_header_hash = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_REQUEST_HEADER_HASH;
let iteration_request_body = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_REQUEST_BODY;
let iteration_request_body_hash = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_REQUEST_BODY_HASH;
let iteration_request_param = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_REQUEST_PARAM;
let iteration_request_param_hash = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_REQUEST_PARAM_HASH;
let iteration_request_response_content = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_RESPONSE_CONTENT;
let iteration_request_response_head = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_RESPONSE_HEAD;
let iteration_request_response_cookie = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_RESPONSE_COOKIE;
let iteration_request_response_hash = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_RESPONSE_HASH;
let iteration_request_response_demo = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_RESPONSE_DEMO;
let iteration_request_jsonFlg = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_JSONFLG;
let iteration_request_htmlFlg = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_HTMLFLG;
let iteration_request_picFlg = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_PICFLG;
let iteration_request_fileFlg = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_FILEFLG;
let iteration_request_cuid = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_CUID;
let iteration_request_delFlg = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_DELFLG;
let iteration_request_ctime = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_CTIME;
let iteration_request_iteration_uuid = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_ITERATOR_UUID;

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

let version_iterator_uuid = TABLE_VERSION_ITERATION_FIELDS.FIELD_UUID;
let version_iterator_title = TABLE_VERSION_ITERATION_FIELDS.FIELD_NAME;
let version_iterator_content = TABLE_VERSION_ITERATION_FIELDS.FIELD_CONTENT;
let version_iterator_projects = TABLE_VERSION_ITERATION_FIELDS.FIELD_PROJECTS;
let version_iterator_openFlg = TABLE_VERSION_ITERATION_FIELDS.FIELD_OPENFLG;
let version_iterator_cuid = TABLE_VERSION_ITERATION_FIELDS.FIELD_CUID;
let version_iterator_ctime = TABLE_VERSION_ITERATION_FIELDS.FIELD_CTIME;
let version_iterator_close_time = TABLE_VERSION_ITERATION_FIELDS.FIELD_CLOSE_TIME;
let version_iterator_delFlg = TABLE_VERSION_ITERATION_FIELDS.FIELD_DELFLG;

let version_iteration_folder_uuid = TABLE_VERSION_ITERATION_FOLD_FIELDS.FIELD_ITERATOR_UUID;
let version_iteration_folder_project = TABLE_VERSION_ITERATION_FOLD_FIELDS.FIELD_PROJECT;
let version_iteration_folder_name = TABLE_VERSION_ITERATION_FOLD_FIELDS.FIELD_FOLD_NAME;
let version_iteration_folder_delFlg = TABLE_VERSION_ITERATION_FOLD_FIELDS.FIELD_DELFLG;
let version_iteration_folder_ctime = TABLE_VERSION_ITERATION_FOLD_FIELDS.FIELD_CTIME;
let version_iteration_folder_cuid = TABLE_VERSION_ITERATION_FOLD_FIELDS.FIELD_CUID;

export async function getVersionIteratorsByPage(clientType : string, pagination : any) {
    let datas = [];
    let page = pagination.current;
    let pageSize = pagination.pageSize;

    if (clientType === CLIENT_TYPE_SINGLE) {
        const offset = (page - 1) * pageSize;
        let count = await window.db[TABLE_VERSION_ITERATION_NAME]
        .where(version_iterator_delFlg).equals(0)
        .count();
        pagination.total = count;

        let users = await getUsers(clientType);

        datas = await window.db[TABLE_VERSION_ITERATION_NAME]
        .where(version_iterator_delFlg).equals(0)
        .offset(offset)
        .limit(pageSize)
        .reverse()
        .toArray();
    
        datas.forEach(item => {
            item[UNAME] = users.get(item[version_iterator_cuid]);
        });
    } else {
        let result = await sendTeamMessage(VERSION_ITERATIONS_PAGE_URL, pagination);
        let count = result.count;
        pagination.total = count;
        datas = result.list;
    }

    return datas;
}

export async function getVersionIterators(clientType : string) {

    let ret = new Map<string, string>();

    if (clientType === CLIENT_TYPE_SINGLE) {
        let versionIterators = await window.db[TABLE_VERSION_ITERATION_NAME]
        .where(version_iterator_delFlg).equals(0)
        .reverse()
        .toArray();

        versionIterators.forEach(item => {
            ret.set(item[version_iterator_uuid], item[version_iterator_title])
        });
    } else {
        ret = objectToMap(await sendTeamMessage(VERSION_ITERATION_ALL_URL, {}));
    }

    return ret;
}

export async function getOpenVersionIterators(clientType: string, dispatch) {
    let versionIterators;
    if (clientType === CLIENT_TYPE_SINGLE) {
        versionIterators = await window.db[TABLE_VERSION_ITERATION_NAME]
        .where([version_iterator_openFlg, version_iterator_delFlg])
        .equals([1, 0])
        .reverse()
        .toArray();

        mixedSort(versionIterators, version_iterator_title);
    } else {
        let result = await sendTeamMessage(VERSION_ITERATIONS_OPENS_URL, {});
        versionIterators = result.list;
    }

    if (dispatch != null) {
        dispatch({
            type: GET_VERSION_ITERATORS,
            versionIterators
        });
    }

    return versionIterators;
}

export async function getOpenVersionIteratorsByPrj(clientType : string, prj : string) {
    let versionIterators;
    if (clientType === CLIENT_TYPE_SINGLE) {
        versionIterators = await window.db[TABLE_VERSION_ITERATION_NAME]
        .where([version_iterator_openFlg, version_iterator_delFlg])
        .equals([1, 0])
        .reverse()
        .toArray();

        mixedSort(versionIterators, version_iterator_title);
    } else {
        let result = await sendTeamMessage(VERSION_ITERATIONS_OPENS_URL, {prj});
        versionIterators = result.list;
    }

    return versionIterators;
}

export async function getRemoteVersionIterator(clientType : string, uuid : string) {
    let version_iteration : any = {};
    let users = await getUsers(clientType);
    if (clientType === CLIENT_TYPE_SINGLE) {
        version_iteration = await window.db[TABLE_VERSION_ITERATION_NAME]
        .where(version_iterator_uuid).equals(uuid)
        .first();
    } else {
        version_iteration = await sendTeamMessage(VERSION_ITERATION_GET_URL, {uuid});
        version_iteration[version_iterator_projects] = JSON.parse(version_iteration[version_iterator_projects]);
    }
    version_iteration[UNAME] = users.get(version_iteration[version_iterator_cuid]);

    return version_iteration;
}

export async function delVersionIterator(clientType: string, teamId : string, row) {

    let uuid = row[version_iterator_uuid];
    
    if (clientType === CLIENT_TYPE_TEAM) {
        await sendTeamMessage(VERSION_ITERATION_DEL_URL, {uuid});
    }
    
    let version_iteration = await window.db[TABLE_VERSION_ITERATION_NAME]
    .where(version_iterator_uuid).equals(uuid)
    .first();

    if (version_iteration === undefined) return;
    
    version_iteration[version_iterator_uuid] = uuid;
    version_iteration[version_iterator_delFlg] = 1;
    if (clientType === CLIENT_TYPE_SINGLE) {
        version_iteration.upload_flg = 0;
        version_iteration.team_id = "";
    } else {
        version_iteration.upload_flg = 1;
        version_iteration.team_id = teamId;
    }
    await window.db[TABLE_VERSION_ITERATION_NAME].put(version_iteration);
}

export async function openVersionIterator(clientType : string, teamId : string, uuid : string) {
    if (clientType === CLIENT_TYPE_TEAM) {
        await sendTeamMessage(VERSION_ITERATION_RE_OPEN_URL, {uuid});
    }

    let version_iteration = await window.db[TABLE_VERSION_ITERATION_NAME]
    .where(version_iterator_uuid).equals(uuid)
    .first();

    if (version_iteration !== undefined) {
        version_iteration[version_iterator_openFlg] = 1;
        if (clientType === CLIENT_TYPE_SINGLE) {
            version_iteration.upload_flg = 0;
            version_iteration.team_id = "";
        } else {
            version_iteration.upload_flg = 1;
            version_iteration.team_id = teamId;
        }

        await window.db[TABLE_VERSION_ITERATION_NAME].put(version_iteration);
    }
}

export async function closeVersionIterator(clientType : string, teamId : string, uuid : string) {
    if (clientType === CLIENT_TYPE_TEAM) {
        await sendTeamMessage(VERSION_ITERATION_CLOSE_URL, {uuid});
    }

    let version_iteration_requests = await window.db[TABLE_VERSION_ITERATION_REQUEST_NAME]
    .where([ iteration_request_delFlg, iteration_request_iteration_uuid ])
    .equals([ 0, uuid ])
    .toArray();

    for (let version_iteration_request of version_iteration_requests) {
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

            let version_iteration_folder : any = {};
            version_iteration_folder[version_iteration_folder_uuid] = "";
            version_iteration_folder[version_iteration_folder_project] = project;
            version_iteration_folder[version_iteration_folder_name] = name;
            version_iteration_folder[version_iteration_folder_cuid] = device.uuid;
            version_iteration_folder[version_iteration_folder_ctime] = Date.now();
            version_iteration_folder[version_iteration_folder_delFlg] = 0;
            if (clientType === CLIENT_TYPE_SINGLE) {
                version_iteration_folder.upload_flg = 0;
                version_iteration_folder.team_id = "";
            } else {
                version_iteration_folder.upload_flg = 1;
                version_iteration_folder.team_id = teamId;
            }
            await window.db[TABLE_VERSION_ITERATION_FOLD_NAME].put(version_iteration_folder);

            let projectRequest : any = {};
            projectRequest[project_request_project] = project;
            projectRequest[project_request_method] = version_iteration_request[iteration_request_method];
            projectRequest[project_request_uri] = version_iteration_request[iteration_request_uri];
            projectRequest[project_request_title] = version_iteration_request[iteration_request_title];
            projectRequest[project_request_desc] = version_iteration_request[iteration_request_desc];
            projectRequest[project_request_fold] = foldName;
            projectRequest[project_request_header] = version_iteration_request[iteration_request_header];
            projectRequest[project_request_header_hash] = version_iteration_request[iteration_request_header_hash];
            projectRequest[project_request_body] = version_iteration_request[iteration_request_body];
            projectRequest[project_request_body_hash] = version_iteration_request[iteration_request_body_hash];
            projectRequest[project_request_param] = version_iteration_request[iteration_request_param];
            projectRequest[project_request_param_hash] = version_iteration_request[iteration_request_param_hash];
            projectRequest[project_request_response_content] = version_iteration_request[iteration_request_response_content];
            projectRequest[project_request_response_head] = version_iteration_request[iteration_request_response_head];
            projectRequest[project_request_response_cookie] = version_iteration_request[iteration_request_response_cookie];
            projectRequest[project_request_response_hash] = version_iteration_request[iteration_request_response_hash];
            projectRequest[project_request_response_demo] = version_iteration_request[iteration_request_response_demo];
            projectRequest[project_request_jsonFlg] = version_iteration_request[iteration_request_jsonFlg];
            projectRequest[project_request_htmlFlg] = version_iteration_request[iteration_request_htmlFlg];
            projectRequest[project_request_picFlg] = version_iteration_request[iteration_request_picFlg];
            projectRequest[project_request_fileFlg] = version_iteration_request[iteration_request_fileFlg];
            projectRequest[project_request_delFlg] = version_iteration_request[iteration_request_delFlg];
            projectRequest[project_request_ctime] = version_iteration_request[iteration_request_ctime];
            projectRequest[project_request_cuid] = version_iteration_request[iteration_request_cuid];
        
            if (clientType === CLIENT_TYPE_SINGLE) {
                projectRequest.upload_flg = 0;
                projectRequest.team_id = "";
            } else {
                projectRequest.upload_flg = 1;
                projectRequest.team_id = teamId;
            }
        
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
            existedProjectRequest[project_request_response_content] = version_iteration_request[iteration_request_response_content];
            existedProjectRequest[project_request_response_head] = version_iteration_request[iteration_request_response_head];
            existedProjectRequest[project_request_response_cookie] = version_iteration_request[iteration_request_response_cookie];
            existedProjectRequest[project_request_response_hash] = version_iteration_request[iteration_request_response_hash];
        
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

    let version_iteration = await window.db[TABLE_VERSION_ITERATION_NAME]
    .where(version_iterator_uuid).equals(uuid)
    .first();

    if (version_iteration !== undefined) {
        version_iteration[version_iterator_openFlg] = 0;
        version_iteration[version_iterator_close_time] = Date.now();
        if (clientType === CLIENT_TYPE_SINGLE) {
            version_iteration.upload_flg = 0;
            version_iteration.team_id = "";
        } else {
            version_iteration.upload_flg = 1;
            version_iteration.team_id = teamId;
        }
        await window.db[TABLE_VERSION_ITERATION_NAME].put(version_iteration);
    }
}

export async function addVersionIterator(clientType : string, teamId : string, title, content, projects, device) {
    let version_iteration_uuid = uuidv4() as string;
    
    if (clientType === CLIENT_TYPE_TEAM) {
        await sendTeamMessage(VERSION_ITERATION_SET_URL, {
            uuid:version_iteration_uuid, 
            title, 
            projects: JSON.stringify(projects), 
            content
        });
    }


    let version_iteration : any = {};
    version_iteration[version_iterator_uuid] = version_iteration_uuid;
    version_iteration[version_iterator_title] = title;
    version_iteration[version_iterator_content] = content;
    version_iteration[version_iterator_projects] = projects;
    version_iteration[version_iterator_openFlg] = 1;
    version_iteration[version_iterator_close_time] = 0;
    version_iteration[version_iterator_cuid] = device.uuid;
    version_iteration[version_iterator_ctime] = Date.now();
    version_iteration[version_iterator_delFlg] = 0;
    if (clientType === CLIENT_TYPE_SINGLE) {
        version_iteration.upload_flg = 0;
        version_iteration.team_id = "";
    } else {
        version_iteration.upload_flg = 1;
        version_iteration.team_id = teamId;
    }
    await window.db[TABLE_VERSION_ITERATION_NAME].put(version_iteration);
}

export async function editVersionIterator(clientType : string, teamId : string, uuid, title, content, projects) {

    if (clientType === CLIENT_TYPE_TEAM) {
        await sendTeamMessage(VERSION_ITERATION_SET_URL, {
            uuid, 
            title, 
            projects: JSON.stringify(projects), 
            content
        });
    }

    let version_iteration = await window.db[TABLE_VERSION_ITERATION_NAME]
    .where(version_iterator_uuid).equals(uuid)
    .first();

    if (version_iteration !== undefined) {
        version_iteration[version_iterator_uuid] = uuid;
        version_iteration[version_iterator_title] = title;
        version_iteration[version_iterator_content] = content;
        version_iteration[version_iterator_projects] = projects;
        if (clientType === CLIENT_TYPE_SINGLE) {
            version_iteration.upload_flg = 0;
            version_iteration.team_id = "";
        } else {
            version_iteration.upload_flg = 1;
            version_iteration.team_id = teamId;
        }
        await window.db[TABLE_VERSION_ITERATION_NAME].put(version_iteration);
    }
}