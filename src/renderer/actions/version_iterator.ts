import { v4 as uuidv4 } from 'uuid';

import { mixedSort } from '@rutil/index';
import { 
    TABLE_VERSION_ITERATION_REQUEST_NAME, TABLE_VERSION_ITERATION_REQUEST_FIELDS,
    TABLE_VERSION_ITERATION_NAME, TABLE_VERSION_ITERATION_FIELDS,
    UNAME,
} from '@conf/db';
import { GET_VERSION_ITERATORS } from '@conf/redux';
import { 
    VERSION_ITERATIONS_PAGE_URL, 
    VERSION_ITERATION_GET_URL, 
    VERSION_ITERATION_SET_URL, 
    VERSION_ITERATIONS_OPENS_URL,
    VERSION_ITERATION_DEL_URL,
    CLIENT_TYPE_SINGLE,
    CLIENT_TYPE_TEAM,
} from '@conf/team';

import { sendTeamMessage } from '@act/message';
import { getUsers } from '@act/user';
import { addProjectRequestFromVersionIterator } from '@act/project_request';

let iteration_request_delFlg = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_DELFLG;
let iteration_request_iteration_uuid = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_ITERATOR_UUID;

let version_iterator_uuid = TABLE_VERSION_ITERATION_FIELDS.FIELD_UUID;
let version_iterator_title = TABLE_VERSION_ITERATION_FIELDS.FIELD_NAME;
let version_iterator_content = TABLE_VERSION_ITERATION_FIELDS.FIELD_CONTENT;
let version_iterator_projects = TABLE_VERSION_ITERATION_FIELDS.FIELD_PROJECTS;
let version_iterator_openFlg = TABLE_VERSION_ITERATION_FIELDS.FIELD_OPENFLG;
let version_iterator_cuid = TABLE_VERSION_ITERATION_FIELDS.FIELD_CUID;
let version_iterator_ctime = TABLE_VERSION_ITERATION_FIELDS.FIELD_CTIME;
let version_iterator_close_time = TABLE_VERSION_ITERATION_FIELDS.FIELD_CLOSE_TIME;
let version_iterator_delFlg = TABLE_VERSION_ITERATION_FIELDS.FIELD_DELFLG;

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
    let users = await getUsers(clientType);

    let versionIterators = await window.db[TABLE_VERSION_ITERATION_NAME]
    .where(version_iterator_delFlg).equals(0)
    .reverse()
    .toArray();

    versionIterators.forEach(item => {
        item.key = item[version_iterator_uuid];
        item[UNAME] = users.get(item[version_iterator_cuid]);
    });

    return versionIterators;
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

        version_iteration[UNAME] = users.get(version_iteration[version_iterator_cuid]);
    } else {
        version_iteration = await sendTeamMessage(VERSION_ITERATION_GET_URL, {uuid});
        version_iteration[version_iterator_projects] = JSON.parse(version_iteration[version_iterator_projects]);
        version_iteration[UNAME] = users.get(version_iteration[version_iterator_cuid]);
    }

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

export async function openVersionIterator(uuid, cb) {
    let version_iteration = await window.db[TABLE_VERSION_ITERATION_NAME]
    .where(version_iterator_uuid).equals(uuid)
    .first();

    if (version_iteration !== undefined) {
        version_iteration[version_iterator_openFlg] = 1;
        version_iteration[version_iterator_close_time] = Date.now();

        console.debug(version_iteration);
        await window.db[TABLE_VERSION_ITERATION_NAME].put(version_iteration);
        cb();
    }
}

export async function closeVersionIterator(clientType : string, teamId : string, uuid, cb) {
    let version_iteration_requests = await window.db[TABLE_VERSION_ITERATION_REQUEST_NAME]
    .where([ iteration_request_delFlg, iteration_request_iteration_uuid ])
    .equals([ 0, uuid ])
    .toArray();

    for (let version_iteration_request of version_iteration_requests) {
        addProjectRequestFromVersionIterator(clientType, teamId, version_iteration_request);
    }

    let version_iteration = await window.db[TABLE_VERSION_ITERATION_NAME]
    .where(version_iterator_uuid).equals(uuid)
    .first();

    if (version_iteration !== undefined) {
        version_iteration[version_iterator_openFlg] = 0;
        version_iteration[version_iterator_close_time] = Date.now();

        console.debug(version_iteration);
        await window.db[TABLE_VERSION_ITERATION_NAME].put(version_iteration);
        cb();
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