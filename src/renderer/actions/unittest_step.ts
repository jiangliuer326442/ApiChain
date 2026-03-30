
import { v4 as uuidv4 } from 'uuid';

import {
    isStringEmpty, 
} from '@rutil/index';
import { 
    TABLE_FIELD_VALUE,
    buildJsonString
} from '@rutil/json';

import {
    TABLE_UNITTEST_STEP_ASSERTS_NAME, TABLE_UNITTEST_STEP_ASSERT_FIELDS,
    TABLE_UNITTEST_STEPS_NAME, TABLE_UNITTEST_STEPS_FIELDS,
    TABLE_VERSION_ITERATION_REQUEST_FIELDS,
} from '@conf/db';
import {
    UNITTES_ITERATION_STEP_SAVE_URL,
    UNITTES_ITERATION_STEP_DEL_URL,
    CLIENT_TYPE_TEAM,
} from '@conf/team';
import {
    sendTeamMessage,
} from '@act/message';

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

let iteration_request_title = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_TITLE;
let iteration_request_header = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_REQUEST_HEADER;
let iteration_request_body = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_REQUEST_BODY;
let iteration_request_param = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_REQUEST_PARAM;
let iteration_request_path_variable = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_REQUEST_PATH_VARIABLE;
let iteration_request_json_flg = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_JSONFLG;
let iteration_response_header = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_RESPONSE_HEAD;
let iteration_response_cookie = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_RESPONSE_COOKIE;
let iteration_response_content = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_RESPONSE_CONTENT;

export async function editUnitTestStep(
    clientType : string, versionIteratorId : string, unitTestUuid : string, unittest_step_uuid : string, 
    title : string,
    header: object, param: object, pathVariable: object, body: object,
    assertTitleArr: Array<string>, 
    assertTypeArr: Array<String>, assertSqlArr: Array<string>, assertSqlParamArr: Array<any>,
    assertPrevArr: Array<string>, assertOperatorArr: Array<string>, assertAfterArr: Array<string>, 
    assertUuidArr: Array<string>, sort: number, continueEnable: string, waitSeconds: number,
    device: any, cb) {

    if (clientType === CLIENT_TYPE_TEAM) {
        await sendTeamMessage(UNITTES_ITERATION_STEP_SAVE_URL, {
            iterator: versionIteratorId, unitTest: unitTestUuid, step: unittest_step_uuid,
            title,
            header: JSON.stringify(header), param: JSON.stringify(param), pathVariable: JSON.stringify(pathVariable), body: JSON.stringify(body),
            assertTitles: assertTitleArr.join(','), 
            assertTypes: assertTypeArr.join(','), assertSqls: JSON.stringify(assertSqlArr), assertSqlParams: JSON.stringify(assertSqlParamArr),
            assertPrevs: assertPrevArr.join(','), assertOperators: assertOperatorArr.join(','), assertAfters: assertAfterArr.join(','),
            sort, continueEnable, waitSeconds
        });
    }

    window.db.transaction('rw',
        window.db[TABLE_UNITTEST_STEPS_NAME],
        window.db[TABLE_UNITTEST_STEP_ASSERTS_NAME], 
        async () => {
            let unit_test_step = await window.db[TABLE_UNITTEST_STEPS_NAME]
            .where(field_unittest_step_uuid).equals(unittest_step_uuid)
            .first();
        
            if (unit_test_step !== undefined) {
                unit_test_step[unittest_step_title] = title;
                unit_test_step[unittest_step_header] = header;
                unit_test_step[unittest_step_param] = param;
                unit_test_step[unittest_step_path_variable] = pathVariable;
                unit_test_step[unittest_step_body] = body;
                unit_test_step[unittest_step_sort] = sort;
                unit_test_step[unittest_step_continue] = continueEnable;
                unit_test_step[unittest_step_wait_seconds] = waitSeconds;
                await window.db[TABLE_UNITTEST_STEPS_NAME].put(unit_test_step);
            }

            let unit_test_step_assert : Array<any> = [];

            for (let _index in assertTitleArr) {
                let operate;
                let assertUuid;
                if (isStringEmpty(assertUuidArr[_index])) {
                    operate = "add";
                    assertUuid = uuidv4() as string;
                } else {
                    operate = "edit";
                    assertUuid = assertUuidArr[_index];
                }
                let assertTitle = assertTitleArr[_index];
                let assertType = assertTypeArr[_index];
                let assertSql = assertSqlArr[_index];
                let assertSqlParams = assertSqlParamArr[_index];
                let assertPrev = assertPrevArr[_index];
                let assertOperator = assertOperatorArr[_index];
                let assertAfter = assertAfterArr[_index];
                let unit_test_step_assert_item : any;
                
                if (operate === "edit") {
                    unit_test_step_assert_item = await window.db[TABLE_UNITTEST_STEP_ASSERTS_NAME]
                    .where(unittest_step_assert_uuid).equals(assertUuid)
                    .first();
            
                    if (unit_test_step_assert_item !== undefined) {
                        unit_test_step_assert_item[unittest_step_assert_title] = assertTitle;
                        unit_test_step_assert_item[unittest_step_assert_type] = assertType;
                        unit_test_step_assert_item[unittest_step_assert_sql] = assertSql;
                        unit_test_step_assert_item[unittest_step_assert_sql_params] = assertSqlParams;
                        unit_test_step_assert_item[unittest_step_assert_left] = assertPrev;
                        unit_test_step_assert_item[unittest_step_assert_operator] = assertOperator;
                        unit_test_step_assert_item[unittest_step_assert_right] = assertAfter;
                        unit_test_step_assert.push(unit_test_step_assert_item);
                    }
                } else if (operate === "add") {
                    unit_test_step_assert_item = {};
                    unit_test_step_assert_item[unittest_step_assert_iterator] = versionIteratorId;
                    unit_test_step_assert_item[unittest_step_assert_unittest] = unitTestUuid;
                    unit_test_step_assert_item[unittest_step_assert_step] = unittest_step_uuid;
                    unit_test_step_assert_item[unittest_step_assert_uuid] = assertUuid;
                    unit_test_step_assert_item[unittest_step_assert_title] = assertTitle;
                    unit_test_step_assert_item[unittest_step_assert_type] = assertType;
                    unit_test_step_assert_item[unittest_step_assert_sql] = assertSql;
                    unit_test_step_assert_item[unittest_step_assert_sql_params] = assertSqlParams;
                    unit_test_step_assert_item[unittest_step_assert_left] = assertPrev;
                    unit_test_step_assert_item[unittest_step_assert_operator] = assertOperator;
                    unit_test_step_assert_item[unittest_step_assert_right] = assertAfter;
                    unit_test_step_assert_item[unittest_step_assert_cuid] = device.uuid;
                    unit_test_step_assert_item[unittest_step_assert_delFlg] = 0;
                    unit_test_step_assert_item[unittest_step_assert_ctime] = Date.now();
                    unit_test_step_assert.push(unit_test_step_assert_item);
                }
            }
            await window.db[TABLE_UNITTEST_STEP_ASSERTS_NAME].bulkPut(unit_test_step_assert);
            cb();
        });
}

export async function addUnitTestStep(
    clientType : string, 
    versionIteratorId : string, unitTestUuid : string, 
    title : string, project : string, method: string, uri : string,
    header: object, param: object, pathVariable: object, body: object,
    assertTitleArr: Array<string>, 
    assertTypeArr: Array<String>, assertSqlArr: Array<string>, assertSqlParamArr: Array<any>,
    assertPrevArr: Array<string>, assertOperatorArr: Array<string>, assertAfterArr: Array<string>,
    sort: number, continueEnable: string, waitSeconds: number,
    device : object, cb) {

        let stepId = uuidv4() as string;

        if (clientType === CLIENT_TYPE_TEAM) {
            await sendTeamMessage(UNITTES_ITERATION_STEP_SAVE_URL, {
                iterator: versionIteratorId, unitTest: unitTestUuid, step: stepId,
                title, prj: project, method, uri,
                header: JSON.stringify(header), param: JSON.stringify(param), pathVariable: JSON.stringify(pathVariable), body: JSON.stringify(body),
                assertTitles: assertTitleArr.join(','), 
                assertTypes: assertTypeArr.join(','), assertSqls: JSON.stringify(assertSqlArr), assertSqlParams: JSON.stringify(assertSqlParamArr),
                assertPrevs: assertPrevArr.join(','), assertOperators: assertOperatorArr.join(','), assertAfters: assertAfterArr.join(','),
                sort, continueEnable, waitSeconds
            });
        }

        window.db.transaction('rw',
            window.db[TABLE_UNITTEST_STEPS_NAME],
            window.db[TABLE_UNITTEST_STEP_ASSERTS_NAME], 
            async () => {

                let unit_test_step : any = {};
                unit_test_step[field_unittest_step_uuid] = stepId;
                unit_test_step[unittest_step_iterator_uuid] = versionIteratorId;
                unit_test_step[unittest_step_unittest_uuid] = unitTestUuid;
                unit_test_step[unittest_step_title] = title;
                unit_test_step[unittest_step_project] = project;
                unit_test_step[unittest_step_method] = method;
                unit_test_step[unittest_step_uri] = uri;
                unit_test_step[unittest_step_header] = header;
                unit_test_step[unittest_step_param] = param;
                unit_test_step[unittest_step_path_variable] = pathVariable;
                unit_test_step[unittest_step_body] = body;
                unit_test_step[unittest_step_continue] = continueEnable;
                unit_test_step[unittest_step_wait_seconds] = waitSeconds;
                unit_test_step[unittest_step_sort] = sort;
                unit_test_step[unittest_step_cuid] = device.uuid;
                unit_test_step[unittest_step_ctime] = Date.now();
                unit_test_step[unittest_step_delFlg] = 0;
                await window.db[TABLE_UNITTEST_STEPS_NAME].put(unit_test_step);

                let unit_test_step_assert : Array<any> = [];

                for(let i in assertTitleArr) {
                    let assertTitle = assertTitleArr[i];
                    let assertType = assertTypeArr[i];
                    let assertSql = assertSqlArr[i];
                    let assertSqlParams = assertSqlParamArr[i];
                    let assertPrev = assertPrevArr[i];
                    let assertOperator = assertOperatorArr[i];
                    let assertAfter = assertAfterArr[i];
                    let unit_test_step_assert_item : any = {};
                    unit_test_step_assert_item[unittest_step_assert_iterator] = versionIteratorId;
                    unit_test_step_assert_item[unittest_step_assert_unittest] = unitTestUuid;
                    unit_test_step_assert_item[unittest_step_assert_step] = stepId;
                    unit_test_step_assert_item[unittest_step_assert_uuid] = uuidv4() as string;
                    unit_test_step_assert_item[unittest_step_assert_title] = assertTitle;
                    unit_test_step_assert_item[unittest_step_assert_type] = assertType;
                    unit_test_step_assert_item[unittest_step_assert_sql] = assertSql;
                    unit_test_step_assert_item[unittest_step_assert_sql_params] = assertSqlParams;
                    unit_test_step_assert_item[unittest_step_assert_left] = assertPrev;
                    unit_test_step_assert_item[unittest_step_assert_operator] = assertOperator;
                    unit_test_step_assert_item[unittest_step_assert_right] = assertAfter;
                    unit_test_step_assert_item[unittest_step_assert_cuid] = device.uuid;
                    unit_test_step_assert_item[unittest_step_assert_delFlg] = 0;
                    unit_test_step_assert_item[unittest_step_assert_ctime] = Date.now();

                    unit_test_step_assert.push(unit_test_step_assert_item);
                }
                await window.db[TABLE_UNITTEST_STEP_ASSERTS_NAME].bulkPut(unit_test_step_assert);
                cb();
            }
        );
}

export async function delUnitTestStep(clientType : string, iteratorId : string, unittestUuid : string, unittestStepUuid : string, cb) {
    if (clientType === CLIENT_TYPE_TEAM) {
        await sendTeamMessage(UNITTES_ITERATION_STEP_DEL_URL, {
            iterator : iteratorId, unittest : unittestUuid, step : unittestStepUuid
        });
    }

    let unitTestStep = await window.db[TABLE_UNITTEST_STEPS_NAME]
    .where(field_unittest_step_uuid).equals(unittestStepUuid)
    .first();

    if (unitTestStep !== undefined) {
        unitTestStep[unittest_step_delFlg] = 1;
        await window.db[TABLE_UNITTEST_STEPS_NAME].put(unitTestStep);
    }
    cb();
}

export async function buildUnitTestStepFromRequest(request : any) {
    let formRequestHeadData = request[iteration_request_header];
    let formRequestBodyData = request[iteration_request_body];
    let formRequestParamData = request[iteration_request_param];
    let formRequestPathVariableData = request[iteration_request_path_variable];
    let jsonFlg = request[iteration_request_json_flg];
    let assertLength = 1;
    if (!jsonFlg) {
        assertLength = 0;
    }

    let requestHead : any = {};
    for (let _key in formRequestHeadData) {
        requestHead[_key] = formRequestHeadData[_key][TABLE_FIELD_VALUE];
    }

    let buildJsonStringRet = await buildJsonString(formRequestBodyData);
    let requestBody = buildJsonStringRet.returnObject;


    let requestParam : any = {};
    for (let _key in formRequestParamData) {
        requestParam[_key] = formRequestParamData[_key][TABLE_FIELD_VALUE];
    }

    let requestPathVariable : any = {};
    for (let _key in formRequestPathVariableData) {
        requestPathVariable[_key] = formRequestPathVariableData[_key][TABLE_FIELD_VALUE];
    }
    
    let responseContent = request[iteration_response_content];
    let responseHeader = request[iteration_response_header];
    let responseCookie = request[iteration_response_cookie];
    let title = request[iteration_request_title];

    return {
        requestHead,
        requestBody,
        requestParam,
        requestPathVariable,
        responseContent,
        responseHeader,
        responseCookie,
        title,
    };

}