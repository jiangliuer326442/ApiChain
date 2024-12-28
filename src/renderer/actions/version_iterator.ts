import { v4 as uuidv4 } from 'uuid';

import { 
    TABLE_VERSION_ITERATION_REQUEST_NAME, TABLE_VERSION_ITERATION_REQUEST_FIELDS,
    TABLE_VERSION_ITERATION_NAME, TABLE_VERSION_ITERATION_FIELDS,
    TABLE_PROJECT_REQUEST_NAME, TABLE_VERSION_ITERATION_FOLD_NAME,
    UNAME,
} from '../../config/db';
import { GET_VERSION_ITERATORS } from '../../config/redux';

import { getUsers } from './user';
import { addProjectRequestFromVersionIterator } from './project_request';

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

export async function getVersionIterators(dispatch) {
    let users = await getUsers();

    let versionIterators = await window.db[TABLE_VERSION_ITERATION_NAME]
    .where(version_iterator_delFlg).equals(0)
    .reverse()
    .toArray();

    versionIterators.forEach(item => {
        item[UNAME] = users.get(item[version_iterator_cuid]);
    });

    dispatch({
        type: GET_VERSION_ITERATORS,
        versionIterators
    });
}

export async function getOpenVersionIterators() {
    let versionIterators = await window.db[TABLE_VERSION_ITERATION_NAME]
    .where([version_iterator_openFlg, version_iterator_delFlg])
    .equals([1, 0])
    .reverse()
    .toArray();

    return versionIterators;
}

export async function getOpenVersionIteratorsByPrj(prj : string) {
    let versionIterators = await window.db[TABLE_VERSION_ITERATION_NAME]
    .where([version_iterator_openFlg, version_iterator_delFlg])
    .equals([1, 0])
    .filter(row => row[version_iterator_projects].some(_item => _item === prj))
    .reverse()
    .toArray();

    return versionIterators;
}

export async function getVersionIterator(uuid) {
    let users = await getUsers();

    let version_iteration = await window.db[TABLE_VERSION_ITERATION_NAME]
    .where(version_iterator_uuid).equals(uuid)
    .first();

    version_iteration[UNAME] = users.get(version_iteration[version_iterator_cuid]);

    return version_iteration;
}

export async function delVersionIterator(row, cb) {
    let uuid = row[version_iterator_uuid];

    let version_iteration = await window.db[TABLE_VERSION_ITERATION_NAME]
    .where(version_iterator_uuid).equals(uuid)
    .first();

    if (version_iteration !== undefined) {
        version_iteration[version_iterator_uuid] = uuid;
        version_iteration[version_iterator_delFlg] = 1;
        console.debug(version_iteration);
        await window.db[TABLE_VERSION_ITERATION_NAME].put(version_iteration);
        cb();
    }
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

export async function closeVersionIterator(uuid, cb) {
    window.db.transaction('rw',
    window.db[TABLE_VERSION_ITERATION_REQUEST_NAME], 
    window.db[TABLE_VERSION_ITERATION_NAME], 
    window.db[TABLE_PROJECT_REQUEST_NAME],
    window.db[TABLE_VERSION_ITERATION_FOLD_NAME], async () => {
        let version_iteration_requests = await window.db[TABLE_VERSION_ITERATION_REQUEST_NAME]
        .where([ iteration_request_delFlg, iteration_request_iteration_uuid ])
        .equals([ 0, uuid ])
        .toArray();
    
        for (let version_iteration_request of version_iteration_requests) {
            addProjectRequestFromVersionIterator(version_iteration_request);
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
    });
}

export async function addVersionIterator(title, content, projects, device, cb) {
    let version_iteration : any = {};
    version_iteration[version_iterator_uuid] = uuidv4() as string;
    version_iteration[version_iterator_title] = title;
    version_iteration[version_iterator_content] = content;
    version_iteration[version_iterator_projects] = projects;
    version_iteration[version_iterator_openFlg] = 1;
    version_iteration[version_iterator_close_time] = 0;
    version_iteration[version_iterator_cuid] = device.uuid;
    version_iteration[version_iterator_ctime] = Date.now();
    version_iteration[version_iterator_delFlg] = 0;
    console.debug(version_iteration);
    await window.db[TABLE_VERSION_ITERATION_NAME].put(version_iteration);
    cb();
}

export async function editVersionIterator(uuid, title, content, projects, cb) {
    let version_iteration = await window.db[TABLE_VERSION_ITERATION_NAME]
    .where(version_iterator_uuid).equals(uuid)
    .first();

    if (version_iteration !== undefined) {
        version_iteration[version_iterator_uuid] = uuid;
        version_iteration[version_iterator_title] = title;
        version_iteration[version_iterator_content] = content;
        version_iteration[version_iterator_projects] = projects;
        console.debug(version_iteration);
        await window.db[TABLE_VERSION_ITERATION_NAME].put(version_iteration);
        cb();
    }
}