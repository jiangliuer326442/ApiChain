import { 
    TABLE_VERSION_ITERATION_FOLD_NAME, TABLE_VERSION_ITERATION_FOLD_FIELDS,
    TABLE_VERSION_ITERATION_REQUEST_NAME, TABLE_VERSION_ITERATION_REQUEST_FIELDS,
    TABLE_PROJECT_REQUEST_NAME, TABLE_PROJECT_REQUEST_FIELDS,
} from '@conf/db';
import {
    CLIENT_TYPE_TEAM,
    CLIENT_TYPE_SINGLE,
    FOLDERS_ITERATOR_BY_PROJECT, 
    FOLDERS_ITERATOR_ADD_URL, 
    FOLDERS_ITERATOR_SET_REQUEST,
    FOLDERS_ITERATOR_ALL,
    FOLDERS_ITERATOR_DEL_URL,
} from '@conf/team';
import {
    FoldSourceIterator
} from '@conf/global_config';
import { isStringEmpty, mixedSort } from '@rutil/index';
import { sendTeamMessage } from '@act/message'

let version_iteration_folder_uuid = TABLE_VERSION_ITERATION_FOLD_FIELDS.FIELD_ITERATOR_UUID;
let version_iteration_folder_project = TABLE_VERSION_ITERATION_FOLD_FIELDS.FIELD_PROJECT;
let version_iteration_folder_name = TABLE_VERSION_ITERATION_FOLD_FIELDS.FIELD_FOLD_NAME;
let version_iteration_folder_delFlg = TABLE_VERSION_ITERATION_FOLD_FIELDS.FIELD_DELFLG;
let version_iteration_folder_ctime = TABLE_VERSION_ITERATION_FOLD_FIELDS.FIELD_CTIME;
let version_iteration_folder_cuid = TABLE_VERSION_ITERATION_FOLD_FIELDS.FIELD_CUID;

let iteration_request_delFlg = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_DELFLG;
let iteration_request_iteration_uuid = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_ITERATOR_UUID;
let iteration_request_project = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_MICRO_SERVICE_LABEL;
let iteration_request_title = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_TITLE;
let iteration_request_method = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_REQUEST_METHOD;
let iteration_request_uri = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_URI;
let iteration_request_fold = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_FOLD;
export async function delIteratorFolder(
    clientType : string, 
    teamId : string, 
    iteratorId : string, 
    project : string, 
    fold : string
) {
    if (clientType === CLIENT_TYPE_TEAM) {
        await sendTeamMessage(FOLDERS_ITERATOR_DEL_URL, {iteratorId, prj: project, fold});
    }

    let version_iteration_requests = await window.db[TABLE_VERSION_ITERATION_REQUEST_NAME]
    .where([ iteration_request_delFlg, iteration_request_iteration_uuid ])
    .equals([ 0, iteratorId ])
    .filter(row => (row[iteration_request_project] === project && row[iteration_request_fold] === fold))
    .toArray();

    for(let version_iteration_request of version_iteration_requests) {
        version_iteration_request[iteration_request_fold] = "";
        if (clientType === CLIENT_TYPE_SINGLE) {
            version_iteration_request.upload_flg = 0;
            version_iteration_request.team_id = "";
        } else {
            version_iteration_request.upload_flg = 1;
            version_iteration_request.team_id = teamId;
        }
        await window.db[TABLE_VERSION_ITERATION_REQUEST_NAME].put(version_iteration_request);
    }

    let selectedFold = await window.db[TABLE_VERSION_ITERATION_FOLD_NAME]
        .where([version_iteration_folder_uuid, version_iteration_folder_project, version_iteration_folder_name])
        .equals([iteratorId, "", fold])
        .filter(row => {
            if (row[version_iteration_folder_delFlg] === 1) {
                return false;
            }
            return true;
        })
        .reverse()
        .first();
    if (selectedFold === undefined) {
        return;
    }
    if (clientType === CLIENT_TYPE_SINGLE) {
        selectedFold.upload_flg = 0;
        selectedFold.team_id = "";
    } else {
        selectedFold.upload_flg = 1;
        selectedFold.team_id = teamId;
    }
    selectedFold[version_iteration_folder_delFlg] = 1;
    await window.db[TABLE_VERSION_ITERATION_FOLD_NAME].put(selectedFold)
}

export async function allFolders(clientType : string, iterator : string) {
    let folders;
    if (clientType === CLIENT_TYPE_SINGLE) {
        folders = await window.db[TABLE_VERSION_ITERATION_FOLD_NAME]
        .where([version_iteration_folder_delFlg, version_iteration_folder_uuid])
        .equals([0, iterator])
        .toArray();
    } else {
        let ret = await sendTeamMessage(FOLDERS_ITERATOR_ALL, {iteratorId: iterator});
        folders = ret.list;
    }
    let result = folders.map(item => ({
        label: "/" + item,
        value: FoldSourceIterator + item
    }));
    mixedSort(result, "label");
    return result
}

export async function getIteratorFolders(
    clientType : string, 
    version_iterator : string, 
    title : string|null, 
    uri : string|null, 
    prj : string|null, 
    folder : string|null
) {
    let prjfolders = {};

    if (!isStringEmpty(folder)) {
        folder = folder.substring(FoldSourceIterator.length);
    }

    if (clientType === CLIENT_TYPE_SINGLE) {
        let filterFolders : any = {};
        let interation_requests = await window.db[TABLE_VERSION_ITERATION_REQUEST_NAME]
            .where([ iteration_request_delFlg, iteration_request_iteration_uuid ])
            .equals([ 0, version_iterator ])
            .filter(row => {
                if (!isStringEmpty(title) && row[iteration_request_title].indexOf(title) < 0) {
                    return false;
                }
                if (!isStringEmpty(uri) && row[iteration_request_uri].indexOf(uri) < 0) {
                    return false;
                }
                if (!isStringEmpty(prj) && row[iteration_request_project] !== prj) {
                    return false;
                }
                if (folder !== null && row[iteration_request_fold] !== folder) {
                    return false;
                }
                return true;
            })
            .toArray();
        for (let interation_request of interation_requests) {
            let projectName = interation_request[iteration_request_project];
            let folderName = interation_request[iteration_request_fold];
            if (! (projectName in filterFolders)) {
                filterFolders[projectName] = new Set<string>();
            }
            filterFolders[projectName].add(folderName);
        }


        let version_iteration_folders = await window.db[TABLE_VERSION_ITERATION_FOLD_NAME]
        .where([version_iteration_folder_delFlg, version_iteration_folder_uuid])
        .equals([0, version_iterator])
        .toArray();

        for (let _prj in filterFolders) {
            let filterFoldersSet = filterFolders[_prj];
            for (let version_iteration_folder of version_iteration_folders) {
                let folderName = version_iteration_folder[version_iteration_folder_name];
                if (!filterFoldersSet.has(folderName)){
                    continue;
                }
                if (! (_prj in prjfolders)) {
                    prjfolders[_prj] = [];
                }
                if (!prjfolders[_prj].includes(folderName)) {
                    prjfolders[_prj].push(folderName);
                }

            }
        }
    } else {
        let ret = await sendTeamMessage(FOLDERS_ITERATOR_BY_PROJECT, {iterator: version_iterator, title, uri, prj, folder});
        prjfolders = ret;
    }

    let result = {};

    for (let prj in prjfolders) {
        result[prj] = prjfolders[prj].map(item => ({
            label: "/" + item,
            value: FoldSourceIterator + item
        }));
    }

    return result;
}

export async function addIteratorFolder(
    clientType : string, 
    teamId : string,
    version_iterator : string, 
    project : string, 
    name : string, 
    device
) {

        if (clientType === CLIENT_TYPE_TEAM) {
            await sendTeamMessage(FOLDERS_ITERATOR_ADD_URL, {iterator: version_iterator, prj: project, name});
        }

        let version_iteration_folder : any = {};
        version_iteration_folder[version_iteration_folder_uuid] = version_iterator;
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
}

export async function batchSetIteratorRequestFold(clientType : string, teamId : string, iterator : string, project : string, methodUriArr : Array<string>, fold : string) {
    if (clientType === CLIENT_TYPE_TEAM) {
        await sendTeamMessage(FOLDERS_ITERATOR_SET_REQUEST, {iterator, prj: project, methodUris: methodUriArr.join(","), fold});
    }

    for (let _methodUriRow of methodUriArr) {
        let [method, uri] = _methodUriRow.split("$$");

        let iteration_request = await window.db[TABLE_VERSION_ITERATION_REQUEST_NAME]
        .where([ iteration_request_iteration_uuid, iteration_request_project, iteration_request_method, iteration_request_uri ])
        .equals([ iterator, project, method, uri ])
        .first();
        if (
            iteration_request === undefined || 
            iteration_request[iteration_request_delFlg] !== 0 ||
            iteration_request[iteration_request_fold] === fold
        ) {
            continue;
        }
        iteration_request[iteration_request_delFlg] = fold;
        if (clientType === CLIENT_TYPE_SINGLE) {
            iteration_request.upload_flg = 0;
            iteration_request.team_id = "";
        } else {
            iteration_request.upload_flg = 1;
            iteration_request.team_id = teamId;
        }
    
        await window.db[TABLE_VERSION_ITERATION_REQUEST_NAME].put(iteration_request);
    }
}