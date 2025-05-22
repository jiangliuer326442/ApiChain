import { 
    TABLE_VERSION_ITERATION_FOLD_NAME,
    TABLE_VERSION_ITERATION_FOLD_FIELDS
 } from '@conf/db';
 import {
    FoldSourcePrj
} from '@conf/global_config';
import {
    CLIENT_TYPE_TEAM,
    CLIENT_TYPE_SINGLE,
    FOLDERS_PROJECT_ALL, FOLDERS_PROJECT_ADD, FOLDERS_PROJECT_DEL,
} from '@conf/team';
import { isStringEmpty } from '@rutil/index';
import { sendTeamMessage } from '@act/message'

let version_iteration_folder_uuid = TABLE_VERSION_ITERATION_FOLD_FIELDS.FIELD_ITERATOR_UUID;
let version_iteration_folder_project = TABLE_VERSION_ITERATION_FOLD_FIELDS.FIELD_PROJECT;
let version_iteration_folder_name = TABLE_VERSION_ITERATION_FOLD_FIELDS.FIELD_FOLD_NAME;
let version_iteration_folder_delFlg = TABLE_VERSION_ITERATION_FOLD_FIELDS.FIELD_DELFLG;
let version_iteration_folder_ctime = TABLE_VERSION_ITERATION_FOLD_FIELDS.FIELD_CTIME;
let version_iteration_folder_cuid = TABLE_VERSION_ITERATION_FOLD_FIELDS.FIELD_CUID;

export async function getProjectFolders(clientType : string, project : string) {
    let folders = new Set<String>();

    if (clientType === CLIENT_TYPE_SINGLE) {
        let project_folders = await window.db[TABLE_VERSION_ITERATION_FOLD_NAME]
        .where([version_iteration_folder_delFlg, version_iteration_folder_uuid, version_iteration_folder_project])
        .equals([0, "", project])
        .toArray();
        for (let project_folder of project_folders) {
            let folderName = project_folder[version_iteration_folder_name];
            if (isStringEmpty(folderName)){
                continue;
            }
            folders.add(FoldSourcePrj + folderName);
        }
    } else {
        let ret = await sendTeamMessage(FOLDERS_PROJECT_ALL, {prj: project});
        folders = new Set(ret.list);
    }

    let result = [];

    for (let folder of folders) {
        let simpleFolderName = folder.replaceAll(FoldSourcePrj, "");
        let item : any = {};
        item.label = "/" + simpleFolderName;
        item.value = folder;
        result.push(item);
    }

    let item : any = {};
    item.label = "/";
    item.value = "";
    result.push(item);

    return result;
}

export async function addProjectFolder(
    clientType : string, 
    teamId : string,
    project : string, 
    name : string, 
    device
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