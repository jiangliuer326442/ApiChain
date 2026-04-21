import { TABLE_UNITTEST_FOLD_FIELDS } from '@conf/db';
import { 
    UNITTES_ITERATION_FOLD_LIST_URL,
    UNITTES_ITERATION_FOLD_ADD_URL, 
} from '@conf/team';
import { sendTeamMessage, } from '@act/message';

let unittest_folder_name = TABLE_UNITTEST_FOLD_FIELDS.FIELD_FOLD_NAME;

export async function addIteratorUnitTestFolder(versionIteratorId : string, folderName : string) {
    await sendTeamMessage(UNITTES_ITERATION_FOLD_ADD_URL, {iterator: versionIteratorId, fold: folderName});
}

export async function getIteratorUnitTestFolders(version_iterator : string, cb) {

    let result = [];

    let unit_test_folders = await sendTeamMessage(UNITTES_ITERATION_FOLD_LIST_URL, {iterator: version_iterator});
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