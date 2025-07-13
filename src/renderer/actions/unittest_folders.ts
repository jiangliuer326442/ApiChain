import { TABLE_UNITTEST_FOLD_NAME, TABLE_UNITTEST_FOLD_FIELDS } from '@conf/db';

let unittest_folder_iterator = TABLE_UNITTEST_FOLD_FIELDS.FIELD_ITERATOR;
let unittest_folder_project = TABLE_UNITTEST_FOLD_FIELDS.FIELD_PROJECT;
let unittest_folder_name = TABLE_UNITTEST_FOLD_FIELDS.FIELD_FOLD_NAME;
let unittest_folder_cuid = TABLE_UNITTEST_FOLD_FIELDS.FIELD_CUID;
let unittest_folder_delFlg = TABLE_UNITTEST_FOLD_FIELDS.FIELD_DELFLG;
let unittest_folder_ctime = TABLE_UNITTEST_FOLD_FIELDS.FIELD_CTIME;

export async function addProjectUnitTestFolder(project : string, folderName : string, device) {
    let version_iteration_test_folder : any = {};
    version_iteration_test_folder[unittest_folder_iterator] = "";
    version_iteration_test_folder[unittest_folder_project] = project;
    version_iteration_test_folder[unittest_folder_name] = folderName;
    version_iteration_test_folder[unittest_folder_cuid] = device.uuid;
    version_iteration_test_folder[unittest_folder_ctime] = Date.now();
    version_iteration_test_folder[unittest_folder_delFlg] = 0;
    await window.db[TABLE_UNITTEST_FOLD_NAME].put(version_iteration_test_folder);
}

export async function getProjectUnitTestFolders(project : string, cb) {

    let result = [];

    let unit_test_folders = await window.db[TABLE_UNITTEST_FOLD_NAME]
    .where([unittest_folder_delFlg, unittest_folder_project])
    .equals([0, project])
    .reverse()
    .toArray();

    for (let unit_test_folder of unit_test_folders) {
        let item = {};
        item.label = "/" + unit_test_folder[unittest_folder_name];
        item.value = unit_test_folder[unittest_folder_name];
        result.push(item);
    }

    let item = {};
    item.label = "/";
    item.value = "";
    result.push(item);

    cb(result);
}

export async function addIteratorUnitTestFolder(versionIteratorId : string, folderName : string, device) {
    let version_iteration_test_folder : any = {};
    version_iteration_test_folder[unittest_folder_iterator] = versionIteratorId;
    version_iteration_test_folder[unittest_folder_project] = "";
    version_iteration_test_folder[unittest_folder_name] = folderName;
    version_iteration_test_folder[unittest_folder_cuid] = device.uuid;
    version_iteration_test_folder[unittest_folder_ctime] = Date.now();
    version_iteration_test_folder[unittest_folder_delFlg] = 0;
    console.debug(version_iteration_test_folder);
    await window.db[TABLE_UNITTEST_FOLD_NAME].put(version_iteration_test_folder);
}

export async function getIteratorUnitTestFolders(version_iterator : string, cb) {

    let result = [];

    let unit_test_folders = await window.db[TABLE_UNITTEST_FOLD_NAME]
    .where([unittest_folder_delFlg, unittest_folder_iterator])
    .equals([0, version_iterator])
    .reverse()
    .toArray();

    for (let unit_test_folder of unit_test_folders) {
        let item = {};
        item.label = "/" + unit_test_folder[unittest_folder_name];
        item.value = unit_test_folder[unittest_folder_name];
        result.push(item);
    }

    let item = {};
    item.label = "/";
    item.value = "";
    result.push(item);

    cb(result);
}