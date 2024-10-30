import { TABLE_UNITTEST_FOLD_NAME, TABLE_UNITTEST_FOLD_FIELDS } from '../../config/db';

let version_iteration_test_folder_iterator = TABLE_UNITTEST_FOLD_FIELDS.FIELD_ITERATOR_UUID;
let version_iteration_test_folder_name = TABLE_UNITTEST_FOLD_FIELDS.FIELD_FOLD_NAME;
let version_iteration_test_folder_cuid = TABLE_UNITTEST_FOLD_FIELDS.FIELD_CUID;
let version_iteration_test_folder_cuname = TABLE_UNITTEST_FOLD_FIELDS.FIELD_CUNAME;
let version_iteration_test_folder_delFlg = TABLE_UNITTEST_FOLD_FIELDS.FIELD_DELFLG;
let version_iteration_test_folder_ctime = TABLE_UNITTEST_FOLD_FIELDS.FIELD_CTIME;

export async function addUnitTestFolder(versionIteratorId : string, folderName : string, device, cb) {
    let version_iteration_test_folder : any = {};
    version_iteration_test_folder[version_iteration_test_folder_iterator] = versionIteratorId;
    version_iteration_test_folder[version_iteration_test_folder_name] = folderName;
    version_iteration_test_folder[version_iteration_test_folder_cuid] = device.uuid;
    version_iteration_test_folder[version_iteration_test_folder_cuname] = device.uname;
    version_iteration_test_folder[version_iteration_test_folder_ctime] = Date.now();
    version_iteration_test_folder[version_iteration_test_folder_delFlg] = 0;
    console.debug(version_iteration_test_folder);
    await window.db[TABLE_UNITTEST_FOLD_NAME].put(version_iteration_test_folder);
    cb();
}

export async function getUnitTestFolders(version_iterator : string, cb) {

    let result = [];

    let unit_test_folders = await window.db[TABLE_UNITTEST_FOLD_NAME]
    .where([version_iteration_test_folder_delFlg, version_iteration_test_folder_iterator])
    .equals([0, version_iterator])
    .reverse()
    .toArray();

    for (let unit_test_folder of unit_test_folders) {
        let item = {};
        item.label = "/" + unit_test_folder[version_iteration_test_folder_name];
        item.value = unit_test_folder[version_iteration_test_folder_name];
        result.push(item);
    }

    let item = {};
    item.label = "/";
    item.value = "";
    result.push(item);

    cb(result);
}