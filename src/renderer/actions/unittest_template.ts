import { v4 as uuidv4 } from 'uuid';

import {
    isStringEmpty, 
} from '@rutil/index';
import {
    TABLE_UNITTEST_STEP_ASSERTS_NAME, TABLE_UNITTEST_STEP_ASSERT_FIELDS,
    TABLE_UNITTEST_STEPS_NAME, TABLE_UNITTEST_STEPS_FIELDS,
    TABLE_UNITTEST_NAME, TABLE_UNITTEST_FIELDS,
    TABLE_UNITTEST_TEMPLATE_NAME, TABLE_UNITTEST_TEMPLATE_FIELDS,
    TABLE_UNITTEST_TEMPLATE_STEP_ASSERTS_NAME, TABLE_UNITTEST_TEMPLATE_STEP_ASSERT_FIELDS,
    TABLE_UNITTEST_TEMPLATE_STEPS_NAME, TABLE_UNITTEST_TEMPLATE_STEPS_FIELDS,
} from '@conf/db';
import {
    UNITTES_TEMPLATE_ADD_URL,
    UNITTES_TEMPLATE_ALL_URL,
    CLIENT_TYPE_TEAM,
} from '@conf/team';

import {
    sendTeamMessage,
} from '@act/message';

let unittest_iterator_uuid = TABLE_UNITTEST_FIELDS.FIELD_ITERATOR_UUID;
let field_unittest_uuid = TABLE_UNITTEST_FIELDS.FIELD_UUID;
let unittest_delFlg = TABLE_UNITTEST_FIELDS.FIELD_DELFLG;
let unittest_projects = TABLE_UNITTEST_FIELDS.FIELD_PROJECTS;
let unittest_collectFlg = TABLE_UNITTEST_FIELDS.FIELD_COLLECT;
let unittest_fold = TABLE_UNITTEST_FIELDS.FIELD_FOLD_NAME;
let unittest_title = TABLE_UNITTEST_FIELDS.FIELD_TITLE;
let unittest_cuid = TABLE_UNITTEST_FIELDS.FIELD_CUID;
let unittest_ctime = TABLE_UNITTEST_FIELDS.FIELD_CTIME;
let field_unittest_refer_from = TABLE_UNITTEST_FIELDS.FIELD_REFER_FROM;

let field_unittest_step_uuid = TABLE_UNITTEST_STEPS_FIELDS.FIELD_UUID;
let unittest_step_iterator_uuid = TABLE_UNITTEST_STEPS_FIELDS.FIELD_ITERATOR_UUID;
let unittest_step_unittest_uuid = TABLE_UNITTEST_STEPS_FIELDS.FIELD_UNITTEST_UUID;
let unittest_step_title = TABLE_UNITTEST_STEPS_FIELDS.FIELD_TITLE;
let unittest_step_project = TABLE_UNITTEST_STEPS_FIELDS.FIELD_MICRO_SERVICE_LABEL;
let unittest_step_method = TABLE_UNITTEST_STEPS_FIELDS.FIELD_REQUEST_METHOD;
let unittest_step_uri = TABLE_UNITTEST_STEPS_FIELDS.FIELD_URI;
let unittest_step_header = TABLE_UNITTEST_STEPS_FIELDS.FIELD_REQUEST_HEADER;
let unittest_step_param = TABLE_UNITTEST_STEPS_FIELDS.FIELD_REQUEST_PARAM;
let unittest_step_path_variable = TABLE_UNITTEST_STEPS_FIELDS.FIELD_REQUEST_PATH_VARIABLE;
let unittest_step_body = TABLE_UNITTEST_STEPS_FIELDS.FIELD_REQUEST_BODY;
let unittest_step_continue = TABLE_UNITTEST_STEPS_FIELDS.FIELD_CONTINUE;
let unittest_step_wait_seconds = TABLE_UNITTEST_STEPS_FIELDS.FIELD_WAIT_SECONDS;
let unittest_step_sort = TABLE_UNITTEST_STEPS_FIELDS.FIELD_SORT;
let unittest_step_cuid = TABLE_UNITTEST_STEPS_FIELDS.FIELD_CUID;
let unittest_step_ctime = TABLE_UNITTEST_STEPS_FIELDS.FIELD_CTIME;
let unittest_step_delFlg = TABLE_UNITTEST_STEPS_FIELDS.FIELD_DELFLG;

let field_unittest_template_uuid = TABLE_UNITTEST_TEMPLATE_FIELDS.FIELD_UUID;
let unittest_template_delFlg = TABLE_UNITTEST_TEMPLATE_FIELDS.FIELD_DELFLG;
let unittest_template_fold = TABLE_UNITTEST_TEMPLATE_FIELDS.FIELD_FOLD_NAME;
let unittest_template_title = TABLE_UNITTEST_TEMPLATE_FIELDS.FIELD_TITLE;
let unittest_template_cuid = TABLE_UNITTEST_TEMPLATE_FIELDS.FIELD_CUID;
let unittest_template_ctime = TABLE_UNITTEST_TEMPLATE_FIELDS.FIELD_CTIME;

let field_unittest_template_step_uuid = TABLE_UNITTEST_TEMPLATE_STEPS_FIELDS.FIELD_UUID;
let unittest_template_step_unittest_uuid = TABLE_UNITTEST_TEMPLATE_STEPS_FIELDS.FIELD_UNITTEST_UUID;
let unittest_template_step_title = TABLE_UNITTEST_TEMPLATE_STEPS_FIELDS.FIELD_TITLE;
let unittest_template_step_project = TABLE_UNITTEST_TEMPLATE_STEPS_FIELDS.FIELD_MICRO_SERVICE_LABEL;
let unittest_template_step_method = TABLE_UNITTEST_TEMPLATE_STEPS_FIELDS.FIELD_REQUEST_METHOD;
let unittest_template_step_uri = TABLE_UNITTEST_TEMPLATE_STEPS_FIELDS.FIELD_URI;
let unittest_template_step_header = TABLE_UNITTEST_TEMPLATE_STEPS_FIELDS.FIELD_REQUEST_HEADER;
let unittest_template_step_param = TABLE_UNITTEST_TEMPLATE_STEPS_FIELDS.FIELD_REQUEST_PARAM;
let unittest_template_step_path_variable = TABLE_UNITTEST_TEMPLATE_STEPS_FIELDS.FIELD_REQUEST_PATH_VARIABLE;
let unittest_template_step_body = TABLE_UNITTEST_TEMPLATE_STEPS_FIELDS.FIELD_REQUEST_BODY;
let unittest_template_step_continue = TABLE_UNITTEST_TEMPLATE_STEPS_FIELDS.FIELD_CONTINUE;
let unittest_template_step_wait_seconds = TABLE_UNITTEST_TEMPLATE_STEPS_FIELDS.FIELD_WAIT_SECONDS;
let unittest_template_step_sort = TABLE_UNITTEST_TEMPLATE_STEPS_FIELDS.FIELD_SORT;
let unittest_template_step_cuid = TABLE_UNITTEST_TEMPLATE_STEPS_FIELDS.FIELD_CUID;
let unittest_template_step_ctime = TABLE_UNITTEST_TEMPLATE_STEPS_FIELDS.FIELD_CTIME;
let unittest_template_step_delFlg = TABLE_UNITTEST_TEMPLATE_STEPS_FIELDS.FIELD_DELFLG;

let unittest_template_step_assert_unittest = TABLE_UNITTEST_TEMPLATE_STEP_ASSERT_FIELDS.FIELD_UNITTEST_UUID;
let unittest_template_step_assert_step = TABLE_UNITTEST_TEMPLATE_STEP_ASSERT_FIELDS.FIELD_STEP_UUID;
let unittest_template_step_assert_uuid = TABLE_UNITTEST_TEMPLATE_STEP_ASSERT_FIELDS.FIELD_UUID;
let unittest_template_step_assert_title = TABLE_UNITTEST_TEMPLATE_STEP_ASSERT_FIELDS.FIELD_TITLE;
let unittest_template_step_assert_type = TABLE_UNITTEST_TEMPLATE_STEP_ASSERT_FIELDS.FIELD_TYPE;
let unittest_template_step_assert_sql = TABLE_UNITTEST_TEMPLATE_STEP_ASSERT_FIELDS.FIELD_SQL;
let unittest_template_step_assert_sql_params = TABLE_UNITTEST_TEMPLATE_STEP_ASSERT_FIELDS.FIELD_SQL_PARAMS;
let unittest_template_step_assert_left = TABLE_UNITTEST_TEMPLATE_STEP_ASSERT_FIELDS.FIELD_ASSERT_LEFT;
let unittest_template_step_assert_operator = TABLE_UNITTEST_TEMPLATE_STEP_ASSERT_FIELDS.FIELD_ASSERT_OPERATOR;
let unittest_template_step_assert_right = TABLE_UNITTEST_TEMPLATE_STEP_ASSERT_FIELDS.FIELD_ASSERT_RIGHT;
let unittest_template_step_assert_cuid = TABLE_UNITTEST_TEMPLATE_STEP_ASSERT_FIELDS.FIELD_CUID;
let unittest_template_step_assert_delFlg = TABLE_UNITTEST_TEMPLATE_STEP_ASSERT_FIELDS.FIELD_DELFLG;
let unittest_template_step_assert_ctime = TABLE_UNITTEST_TEMPLATE_STEP_ASSERT_FIELDS.FIELD_CTIME;

let unittest_step_assert_iterator = TABLE_UNITTEST_STEP_ASSERT_FIELDS.FIELD_ITERATOR_UUID;
let unittest_step_assert_unittest = TABLE_UNITTEST_STEP_ASSERT_FIELDS.FIELD_UNITTEST_UUID;
let unittest_step_assert_step = TABLE_UNITTEST_STEP_ASSERT_FIELDS.FIELD_STEP_UUID;
let unittest_step_assert_uuid = TABLE_UNITTEST_STEP_ASSERT_FIELDS.FIELD_UUID;
let unittest_step_assert_title = TABLE_UNITTEST_STEP_ASSERT_FIELDS.FIELD_TITLE;
let unittest_step_assert_type = TABLE_UNITTEST_STEP_ASSERT_FIELDS.FIELD_TYPE;
let unittest_step_assert_sql = TABLE_UNITTEST_STEP_ASSERT_FIELDS.FIELD_SQL;
let unittest_step_assert_sql_params = TABLE_UNITTEST_STEP_ASSERT_FIELDS.FIELD_SQL_PARAMS;
let unittest_step_assert_left = TABLE_UNITTEST_STEP_ASSERT_FIELDS.FIELD_ASSERT_LEFT;
let unittest_step_assert_operator = TABLE_UNITTEST_STEP_ASSERT_FIELDS.FIELD_ASSERT_OPERATOR;
let unittest_step_assert_right = TABLE_UNITTEST_STEP_ASSERT_FIELDS.FIELD_ASSERT_RIGHT;
let unittest_step_assert_cuid = TABLE_UNITTEST_STEP_ASSERT_FIELDS.FIELD_CUID;
let unittest_step_assert_delFlg = TABLE_UNITTEST_STEP_ASSERT_FIELDS.FIELD_DELFLG;
let unittest_step_assert_ctime = TABLE_UNITTEST_STEP_ASSERT_FIELDS.FIELD_CTIME;

export async function allTemplates(clientType : string) {
    if (clientType === CLIENT_TYPE_TEAM) {
        return await sendTeamMessage(UNITTES_TEMPLATE_ALL_URL, {});
    } else {
        let unitTests = await window.db[TABLE_UNITTEST_TEMPLATE_NAME]
        .where(unittest_template_delFlg)
        .equals(0)
        .reverse()
        .toArray();
        let list = [];
        for (let unitTest of unitTests) {
            list.push({
                label: unitTest[unittest_template_title],
                value: unitTest[field_unittest_template_uuid],
            });
        }
        return list;
    }
}

export async function addUnittestTemplate(clientType : string, iteratorId : string, stepIdList : string[], title : string, device : any, cb) {
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

    window.db.transaction('rw',
        window.db[TABLE_UNITTEST_NAME],
        window.db[TABLE_UNITTEST_STEPS_NAME], 
        window.db[TABLE_UNITTEST_STEP_ASSERTS_NAME],
        window.db[TABLE_UNITTEST_TEMPLATE_NAME],
        window.db[TABLE_UNITTEST_TEMPLATE_STEPS_NAME],
        window.db[TABLE_UNITTEST_TEMPLATE_STEP_ASSERTS_NAME],
        async () => {
            let unitTest = await window.db[TABLE_UNITTEST_NAME]
            .where(field_unittest_uuid).equals(unittestId)
            .first();

            if (unitTest === undefined || !isStringEmpty(unitTest[field_unittest_refer_from])) {
                cb();
                return;
            }

            let unit_test_template : any = {};
            unit_test_template[field_unittest_template_uuid] = unittest_template_uuid;
            unit_test_template[unittest_template_title] = title;
            unit_test_template[unittest_template_fold] = "";
            unit_test_template[unittest_template_cuid] = device.uuid;
            unit_test_template[unittest_template_ctime] = Date.now();
            unit_test_template[unittest_template_delFlg] = 0;
            await window.db[TABLE_UNITTEST_TEMPLATE_NAME].put(unit_test_template);

            for (let _stepId of steps) {
                let unitTestStep = await window.db[TABLE_UNITTEST_STEPS_NAME]
                .where(field_unittest_step_uuid).equals(_stepId)
                .first();

                let unit_test_template_step : any = {};
                unit_test_template_step[field_unittest_template_step_uuid] = _stepId;
                unit_test_template_step[unittest_template_step_unittest_uuid] = unittest_template_uuid;
                unit_test_template_step[unittest_template_step_title] = unitTestStep[unittest_step_title];
                unit_test_template_step[unittest_template_step_project] = unitTestStep[unittest_step_project];
                unit_test_template_step[unittest_template_step_method] = unitTestStep[unittest_step_method];
                unit_test_template_step[unittest_template_step_uri] = unitTestStep[unittest_step_uri];
                unit_test_template_step[unittest_template_step_header] = unitTestStep[unittest_step_header];
                unit_test_template_step[unittest_template_step_param] = unitTestStep[unittest_step_param];
                unit_test_template_step[unittest_template_step_path_variable] = unitTestStep[unittest_step_path_variable];
                unit_test_template_step[unittest_template_step_body] = unitTestStep[unittest_step_body];
                unit_test_template_step[unittest_template_step_continue] = unitTestStep[unittest_step_continue];
                unit_test_template_step[unittest_template_step_wait_seconds] = unitTestStep[unittest_step_wait_seconds];
                unit_test_template_step[unittest_template_step_sort] = unitTestStep[unittest_step_sort];
                unit_test_template_step[unittest_template_step_cuid] = device.uuid;
                unit_test_template_step[unittest_template_step_ctime] = Date.now();
                unit_test_template_step[unittest_template_step_delFlg] = 0;
                await window.db[TABLE_UNITTEST_TEMPLATE_STEPS_NAME].put(unit_test_template_step);

                let unitTestAsserts = await window.db[TABLE_UNITTEST_STEP_ASSERTS_NAME]
                .where([unittest_step_assert_delFlg, unittest_step_assert_iterator, unittest_step_assert_unittest, unittest_step_assert_step])
                .equals([0, iteratorId, unittestId, _stepId])
                .reverse()
                .toArray();
                for (let _unitTestAssert of unitTestAsserts) {
                    let unit_test_template_step_assert : any = {};
                    unit_test_template_step_assert[unittest_template_step_assert_unittest] = unittest_template_uuid;
                    unit_test_template_step_assert[unittest_template_step_assert_step] = _stepId;
                    unit_test_template_step_assert[unittest_template_step_assert_uuid] = _unitTestAssert[unittest_step_assert_uuid];
                    unit_test_template_step_assert[unittest_template_step_assert_title] = _unitTestAssert[unittest_step_assert_title];
                    unit_test_template_step_assert[unittest_template_step_assert_type] = _unitTestAssert[unittest_step_assert_type];
                    unit_test_template_step_assert[unittest_template_step_assert_sql] = _unitTestAssert[unittest_step_assert_sql];
                    unit_test_template_step_assert[unittest_template_step_assert_sql_params] = _unitTestAssert[unittest_step_assert_sql_params];
                    unit_test_template_step_assert[unittest_template_step_assert_left] = _unitTestAssert[unittest_step_assert_left];
                    unit_test_template_step_assert[unittest_template_step_assert_operator] = _unitTestAssert[unittest_step_assert_operator];
                    unit_test_template_step_assert[unittest_template_step_assert_right] = _unitTestAssert[unittest_step_assert_right];
                    unit_test_template_step_assert[unittest_template_step_assert_cuid] = device.uuid;
                    unit_test_template_step_assert[unittest_template_step_assert_delFlg] = 0;
                    unit_test_template_step_assert[unittest_template_step_assert_ctime] = Date.now();
                    await window.db[TABLE_UNITTEST_TEMPLATE_STEP_ASSERTS_NAME].put(unit_test_template_step_assert);

                    _unitTestAssert[unittest_step_assert_delFlg] = 1;
                    await window.db[TABLE_UNITTEST_STEP_ASSERTS_NAME].put(unit_test_template_step_assert);
                }

                unitTestStep[unittest_delFlg] = 1;
                await window.db[TABLE_UNITTEST_STEPS_NAME].put(unitTestStep);
            }

            unitTest[field_unittest_refer_from] = unittest_template_uuid;
            await window.db[TABLE_UNITTEST_NAME].put(unitTest);

            cb();
        }
    )

}