import { v4 as uuidv4 } from 'uuid';

import {
    TABLE_UNITTEST_TEMPLATE_FIELDS,
    UNAME,
} from '@conf/db';
import {
    GET_TEMPLATE_TESTS
} from '@conf/redux';
import {
    UNITTES_TEMPLATE_SAVE_URL,
    UNITTES_TEMPLATE_DEL_URL,
    UNITTES_TEMPLATE_ADD_URL,
    UNITTES_TEMPLATE_ALL_URL,
    UNITTES_TEMPLATE_PAGE_URL,
    UNITTES_TEMPLATE_ITERATOR_URL,
    UNITTES_TEMPLATE_STEP_SAVE_URL,
    CLIENT_TYPE_TEAM,
} from '@conf/team';
import { getUsers } from '@act/user';
import {
    sendTeamMessage,
} from '@act/message';

let field_unittest_template_uuid = TABLE_UNITTEST_TEMPLATE_FIELDS.FIELD_UUID;
let unittest_template_cuid = TABLE_UNITTEST_TEMPLATE_FIELDS.FIELD_CUID;

export async function getIterator(referFrom : string) {
    return await sendTeamMessage(UNITTES_TEMPLATE_ITERATOR_URL, {uuid: referFrom});
}

export async function editUnitTestTemplateStep(
    unitTestUuid : string, unittest_step_uuid : string, 
    title : string,
    header: object, param: object, pathVariable: object, body: object,
    assertTitleArr: Array<string>, 
    assertTypeArr: Array<String>, assertSqlArr: Array<string>, assertSqlParamArr: Array<any>,
    assertPrevArr: Array<string>, assertOperatorArr: Array<string>, assertAfterArr: Array<string>, 
    sort: number, continueEnable: string, waitSeconds: number) {
    await sendTeamMessage(UNITTES_TEMPLATE_STEP_SAVE_URL, {
        unitTest: unitTestUuid, step: unittest_step_uuid,
        title,
        header: JSON.stringify(header), param: JSON.stringify(param), pathVariable: JSON.stringify(pathVariable), body: JSON.stringify(body),
        assertTitles: assertTitleArr.join(','), 
        assertTypes: assertTypeArr.join(','), assertSqls: JSON.stringify(assertSqlArr), assertSqlParams: JSON.stringify(assertSqlParamArr),
        assertPrevs: assertPrevArr.join(','), assertOperators: assertOperatorArr.join(','), assertAfters: assertAfterArr.join(','),
        sort, continueEnable, waitSeconds
    });
}

export async function editUnitTestTemplate(unitTestUuid : string, title : string, folder : string, ) {
    await sendTeamMessage(UNITTES_TEMPLATE_SAVE_URL, {uuid: unitTestUuid, title, fold: folder});
}

export async function delUnitTest(row) {
    let uuid = row[field_unittest_template_uuid];
    await sendTeamMessage(UNITTES_TEMPLATE_DEL_URL, {uuid});
}

export async function getUnitTests(clientType : string, dispatch : any) {
    let users = await getUsers(clientType);

    let folders;

    let ret = await sendTeamMessage(UNITTES_TEMPLATE_PAGE_URL, {});
    let unitTests = ret.list;
    for (let i = 0; i < unitTests.length; i++) {
        let unitTest = unitTests[i].unitTest;
        let unitTestSteps = unitTests[i].unitTestSteps;
        let newUnitTest = await genUnitTest(unitTest, unitTestSteps)
        newUnitTest[UNAME] = users.get(unitTest[unittest_template_cuid]);
        unitTests[i] = newUnitTest;
    }
    let retFolders = ret.folders;
    if (retFolders.length > 0) {
        folders = new Set();
        for (let _ret_fold of retFolders) {
            folders.add(_ret_fold['name'])
        }
    } else {
        folders = null
    }

    dispatch({
        type: GET_TEMPLATE_TESTS,
        unitTests,
        folders: folders === null ? null : Array.from(folders)
    });
}

async function genUnitTest(unitTest, unitTestSteps) {
    unitTest['children'] = unitTestSteps;
    return unitTest;
}

export async function allTemplates() {
    return await sendTeamMessage(UNITTES_TEMPLATE_ALL_URL, {});
}

export async function addUnittestTemplate(clientType : string, iteratorId : string, stepIdList : string[], title : string) {
    let unittestId = "";
    let stepStr = "";
    let steps = [];
    for (let i = 0; i < stepIdList.length; i++) {
        let [_unitTestid, _stepId] = stepIdList[i].split("$$");
        steps.push(_stepId);
        if (i == 0) {
            unittestId = _unitTestid;
            stepStr += _stepId
        } else {
            stepStr += "," + _stepId;
        }
    }
    const unittest_template_uuid = uuidv4() as string;
    if (clientType === CLIENT_TYPE_TEAM) {
        await sendTeamMessage(UNITTES_TEMPLATE_ADD_URL, {
            iterator: iteratorId, 
            unittest: unittestId, 
            steps: stepStr, 
            title,
            templateUnittest: unittest_template_uuid
        });
    }

}