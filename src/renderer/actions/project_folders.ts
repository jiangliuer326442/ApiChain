import { 
    TABLE_VERSION_ITERATION_FOLD_NAME,
    TABLE_VERSION_ITERATION_FOLD_FIELDS,
    TABLE_PROJECT_REQUEST_NAME,
    TABLE_PROJECT_REQUEST_FIELDS,
 } from '@conf/db';
 import {
    FoldSourcePrj
} from '@conf/global_config';
import {
    CLIENT_TYPE_TEAM,
    CLIENT_TYPE_SINGLE,
    FOLDERS_PROJECT_ALL, 
    FOLDERS_PROJECT_ADD, 
    FOLDERS_PROJECT_DEL,
} from '@conf/team';
import { isStringEmpty, mixedSort } from '@rutil/index';
import { intersect } from '@rutil/sets';
import { sendTeamMessage } from '@act/message'

let version_iteration_folder_uuid = TABLE_VERSION_ITERATION_FOLD_FIELDS.FIELD_ITERATOR_UUID;
let version_iteration_folder_project = TABLE_VERSION_ITERATION_FOLD_FIELDS.FIELD_PROJECT;
let version_iteration_folder_name = TABLE_VERSION_ITERATION_FOLD_FIELDS.FIELD_FOLD_NAME;
let version_iteration_folder_delFlg = TABLE_VERSION_ITERATION_FOLD_FIELDS.FIELD_DELFLG;
let version_iteration_folder_ctime = TABLE_VERSION_ITERATION_FOLD_FIELDS.FIELD_CTIME;
let version_iteration_folder_cuid = TABLE_VERSION_ITERATION_FOLD_FIELDS.FIELD_CUID;

let project_request_project = TABLE_PROJECT_REQUEST_FIELDS.FIELD_PROJECT_LABEL;
let project_request_title = TABLE_PROJECT_REQUEST_FIELDS.FIELD_TITLE;
let project_request_uri = TABLE_PROJECT_REQUEST_FIELDS.FIELD_URI;
let project_request_fold = TABLE_PROJECT_REQUEST_FIELDS.FIELD_FOLD;
let project_request_delFlg = TABLE_PROJECT_REQUEST_FIELDS.FIELD_DELFLG;

export async function getProjectFolders(clientType : string, project : string, title : string|null, uri : string|null) {
    let folders = await getFolders(clientType, project, title, uri);
    let result = [];

    for (let folder of folders) {
        let item : any = {};
        item.label = "/" + folder;
        item.value = FoldSourcePrj + folder;
        result.push(item);
    }

    return result;
}

export async function addProjectFolder(
    clientType : string, 
    teamId : string,
    project : string, 
    name : string, 
    device : any,
) {

        if (clientType === CLIENT_TYPE_TEAM) {
            await sendTeamMessage(FOLDERS_PROJECT_ADD, {prj: project, name});
        }

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
}

async function getFolders(clientType : string, project : string, title : string|null, uri : string|null) : Promise<Set<string>> {
    let folders = new Set<string>();

    if (clientType === CLIENT_TYPE_SINGLE) {
        let filterFolders = new Set<string>();
        if (!isStringEmpty(title) || !isStringEmpty(uri)) {
            let project_requests = await window.db[TABLE_PROJECT_REQUEST_NAME]
            .where([project_request_delFlg, project_request_project ])
            .equals([0, project])
            .filter(row => {
                if (!isStringEmpty(title) && row[project_request_title].indexOf(title) < 0) {
                    return false;
                }
                if (!isStringEmpty(uri) && row[project_request_uri].indexOf(uri) < 0) {
                    return false;
                }
                return true;
            })
            .toArray();
            for (let project_request of project_requests) {
                let folderName = project_request[project_request_fold];
                filterFolders.add(folderName);
            }
        }

        let project_folders = await window.db[TABLE_VERSION_ITERATION_FOLD_NAME]
        .where([version_iteration_folder_delFlg, version_iteration_folder_uuid, version_iteration_folder_project])
        .equals([0, "", project])
        .filter(row => {
            let folderName = row[version_iteration_folder_name];
            return !isStringEmpty(folderName)
        })
        .toArray();
        
        mixedSort(project_folders, version_iteration_folder_name);
        
        for (let project_folder of project_folders) {
            folders.add(project_folder[version_iteration_folder_name]);
        }
        folders.add("");
        if (filterFolders.size > 0){
            folders = intersect(folders, filterFolders);
        }
    } else {
        let ret = await sendTeamMessage(FOLDERS_PROJECT_ALL, {prj: project, title, uri});
        folders = new Set(ret.list);
    }
    return folders;
}