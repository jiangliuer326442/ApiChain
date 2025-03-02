import { 
    TABLE_VERSION_ITERATION_FOLD_NAME, TABLE_VERSION_ITERATION_FOLD_FIELDS,
    TABLE_VERSION_ITERATION_REQUEST_NAME, TABLE_VERSION_ITERATION_REQUEST_FIELDS,
    TABLE_PROJECT_REQUEST_NAME, TABLE_PROJECT_REQUEST_FIELDS,
} from '@conf/db';
import { isStringEmpty } from '@rutil/index';
let version_iteration_folder_uuid = TABLE_VERSION_ITERATION_FOLD_FIELDS.FIELD_ITERATOR_UUID;
let version_iteration_folder_project = TABLE_VERSION_ITERATION_FOLD_FIELDS.FIELD_PROJECT;
let version_iteration_folder_name = TABLE_VERSION_ITERATION_FOLD_FIELDS.FIELD_FOLD_NAME;
let version_iteration_folder_delFlg = TABLE_VERSION_ITERATION_FOLD_FIELDS.FIELD_DELFLG;
let version_iteration_folder_ctime = TABLE_VERSION_ITERATION_FOLD_FIELDS.FIELD_CTIME;
let version_iteration_folder_cuid = TABLE_VERSION_ITERATION_FOLD_FIELDS.FIELD_CUID;

let iteration_request_delFlg = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_DELFLG;
let iteration_request_iteration_uuid = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_ITERATOR_UUID;
let iteration_request_project = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_MICRO_SERVICE_LABEL;
let iteration_request_fold = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_FOLD;

let project_request_delFlg = TABLE_PROJECT_REQUEST_FIELDS.FIELD_DELFLG;
let project_request_project = TABLE_PROJECT_REQUEST_FIELDS.FIELD_PROJECT_LABEL;
let project_request_fold = TABLE_PROJECT_REQUEST_FIELDS.FIELD_FOLD;

export async function delVersionIteratorFolder(version_iterator : string, project : string, fold : string, cb) {
    window.db.transaction('rw',
    window.db[TABLE_VERSION_ITERATION_FOLD_NAME],
    window.db[TABLE_VERSION_ITERATION_REQUEST_NAME],
    window.db[TABLE_PROJECT_REQUEST_NAME], async () => {
        
        if (isStringEmpty(version_iterator)) {
            let project_requests = await window.db[TABLE_PROJECT_REQUEST_NAME]
            .where([ project_request_delFlg, project_request_project ])
            .equals([ 0, project ])
            .filter(row => (row[project_request_fold] === fold))
            .toArray();
    
            for(let project_request of project_requests) {
                project_request[project_request_fold] = "";
                await window.db[TABLE_PROJECT_REQUEST_NAME].put(project_request);
            }
        } else {
            let version_iteration_requests = await window.db[TABLE_VERSION_ITERATION_REQUEST_NAME]
            .where([ iteration_request_delFlg, iteration_request_iteration_uuid ])
            .equals([ 0, version_iterator ])
            .filter(row => (row[iteration_request_project] === project && row[iteration_request_fold] === fold))
            .toArray();
    
            for(let version_iteration_request of version_iteration_requests) {
                version_iteration_request[iteration_request_fold] = "";
                await window.db[TABLE_VERSION_ITERATION_REQUEST_NAME].put(version_iteration_request);
            }
        }

        let selectedFold = await window.db[TABLE_VERSION_ITERATION_FOLD_NAME]
            .where([version_iteration_folder_uuid, version_iteration_folder_project, version_iteration_folder_name])
            .equals([version_iterator, project, fold])
            .first();
        selectedFold[version_iteration_folder_delFlg] = 1;
        await window.db[TABLE_VERSION_ITERATION_FOLD_NAME].put(selectedFold)
    
        cb();
    });
}

export async function getVersionIteratorFolders(version_iterator : string, project : string) {

    let folders = new Set<String>();

    let project_folders = await window.db[TABLE_VERSION_ITERATION_FOLD_NAME]
    .where([version_iteration_folder_delFlg, version_iteration_folder_uuid, version_iteration_folder_project])
    .equals([0, "", project])
    .toArray();
    for (let project_folder of project_folders) {
        let folderName = project_folder[version_iteration_folder_name];
        if (folders.has(folderName) || isStringEmpty(folderName)){
            continue;
        }
        folders.add(folderName);
    }
    if (!isStringEmpty(version_iterator)) {
        let version_iteration_folders = await window.db[TABLE_VERSION_ITERATION_FOLD_NAME]
        .where([version_iteration_folder_delFlg, version_iteration_folder_uuid, version_iteration_folder_project])
        .equals([0, version_iterator, project])
        .toArray();
        for (let version_iteration_folder of version_iteration_folders) {
            let folderName = version_iteration_folder[version_iteration_folder_name];
            if (folders.has(folderName) || isStringEmpty(folderName)){
                continue;
            }
            folders.add(folderName);
        }
    }

    let result = [];

    for (let folder of folders) {
        let item = {};
        item.label = "/" + folder;
        item.value = folder;
        result.push(item);
    }

    let item = {};
    item.label = "/";
    item.value = "";
    result.push(item);

    return result;
}

export async function addVersionIteratorFolder(version_iterator : string, project : string, name : string, device, cb) {
    let version_iteration_folder : any = {};
    version_iteration_folder[version_iteration_folder_uuid] = version_iterator;
    version_iteration_folder[version_iteration_folder_project] = project;
    version_iteration_folder[version_iteration_folder_name] = name;
    version_iteration_folder[version_iteration_folder_cuid] = device.uuid;
    version_iteration_folder[version_iteration_folder_ctime] = Date.now();
    version_iteration_folder[version_iteration_folder_delFlg] = 0;
    await window.db[TABLE_VERSION_ITERATION_FOLD_NAME].put(version_iteration_folder);
    cb();
}