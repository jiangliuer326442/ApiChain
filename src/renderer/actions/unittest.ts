import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import { cloneDeep } from 'lodash';

import { 
    TABLE_UNITTEST_NAME, TABLE_UNITTEST_FIELDS,
    TABLE_UNITTEST_STEPS_NAME,TABLE_UNITTEST_STEPS_FIELDS,
    TABLE_UNITTEST_EXECUTOR_NAME, TABLE_UNITTEST_EXECUTOR_FIELDS,
    TABLE_UNITTEST_EXECUTOR_REPORT_NAME, TABLE_UNITTEST_EXECUTOR_REPORT_FIELDS,
    TABLE_UNITTEST_STEP_ASSERTS_NAME, TABLE_UNITTEST_STEP_ASSERT_FIELDS,
    TABLE_REQUEST_HISTORY_FIELDS, 
    TABLE_ENV_VAR_NAME, TABLE_ENV_VAR_FIELDS,
} from '../../config/db';
import {
    ChannelsReadFileStr,
    CONTENT_TYPE,
    REQUEST_METHOD_GET,
    REQUEST_METHOD_POST
} from '../../config/global_config';
import {
    CONTENT_TYPE_HTML,
    CONTENT_TYPE_JSON,
    CONTENT_TYPE_IMAGE_JPG,
    CONTENT_TYPE_IMAGE_PNG,
    CONTENT_TYPE_IMAGE_GIF,
    CONTENT_TYPE_IMAGE_WEBP,
    CONTENT_TYPE_ATTACH_GZIP1,
    CONTENT_TYPE_ATTACH_GZIP2,
    CONTENT_TYPE_ATTACH_ZIP,
    CONTENT_TYPE_ATTACH_TAR,
    CONTENT_TYPE_ATTACH_STREAM,
    CONTENT_TYPE_URLENCODE,
    CONTENT_TYPE_FORMDATA,
} from '../../config/contentType';
import {
    UNITTEST_RESULT_SUCCESS,
    UNITTEST_RESULT_FAILURE,
    UNITTEST_RESULT_UNKNOWN
} from '../../config/unittest';
import { GET_ITERATOR_TESTS, GET_PROJECT_TESTS } from '../../config/redux';

import { addRequestHistory, getRequestHistory } from './request_history';

import { getType, isStringEmpty, isJsonString, paramToString } from '../util';

import RequestSendTips from '../classes/RequestSendTips';
import JsonParamTips from '../classes/JsonParamTips';

let unittest_iterator_uuid = TABLE_UNITTEST_FIELDS.FIELD_ITERATOR_UUID;
let field_unittest_uuid = TABLE_UNITTEST_FIELDS.FIELD_UUID;
let unittest_delFlg = TABLE_UNITTEST_FIELDS.FIELD_DELFLG;
let unittest_projects = TABLE_UNITTEST_FIELDS.FIELD_PROJECTS;
let unittest_collectFlg = TABLE_UNITTEST_FIELDS.FIELD_COLLECT;
let unittest_fold = TABLE_UNITTEST_FIELDS.FIELD_FOLD_NAME;
let unittest_title = TABLE_UNITTEST_FIELDS.FIELD_TITLE;
let unittest_cuid = TABLE_UNITTEST_FIELDS.FIELD_CUID;
let unittest_cuname = TABLE_UNITTEST_FIELDS.FIELD_CUNAME;
let unittest_ctime = TABLE_UNITTEST_FIELDS.FIELD_CTIME;

let env_var_micro_service = TABLE_ENV_VAR_FIELDS.FIELD_MICRO_SERVICE_LABEL;
let env_var_iteration = TABLE_ENV_VAR_FIELDS.FIELD_ITERATION;
let env_var_unittest = TABLE_ENV_VAR_FIELDS.FIELD_UNITTEST;
let env_var_delFlg = TABLE_ENV_VAR_FIELDS.FIELD_DELFLG;

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
let unittest_step_sort = TABLE_UNITTEST_STEPS_FIELDS.FIELD_SORT;
let unittest_step_cuid = TABLE_UNITTEST_STEPS_FIELDS.FIELD_CUID;
let unittest_step_cuname = TABLE_UNITTEST_STEPS_FIELDS.FIELD_CUNAME;
let unittest_step_ctime = TABLE_UNITTEST_STEPS_FIELDS.FIELD_CTIME;
let unittest_step_delFlg = TABLE_UNITTEST_STEPS_FIELDS.FIELD_DELFLG;

let unittest_step_assert_iterator = TABLE_UNITTEST_STEP_ASSERT_FIELDS.FIELD_ITERATOR_UUID;
let unittest_step_assert_unittest = TABLE_UNITTEST_STEP_ASSERT_FIELDS.FIELD_UNITTEST_UUID;
let unittest_step_assert_step = TABLE_UNITTEST_STEP_ASSERT_FIELDS.FIELD_STEP_UUID;
let unittest_step_assert_uuid = TABLE_UNITTEST_STEP_ASSERT_FIELDS.FIELD_UUID;
let unittest_step_assert_title = TABLE_UNITTEST_STEP_ASSERT_FIELDS.FIELD_TITLE;
let unittest_step_assert_left = TABLE_UNITTEST_STEP_ASSERT_FIELDS.FIELD_ASSERT_LEFT;
let unittest_step_assert_operator = TABLE_UNITTEST_STEP_ASSERT_FIELDS.FIELD_ASSERT_OPERATOR;
let unittest_step_assert_right = TABLE_UNITTEST_STEP_ASSERT_FIELDS.FIELD_ASSERT_RIGHT;
let unittest_step_assert_cuid = TABLE_UNITTEST_STEP_ASSERT_FIELDS.FIELD_CUID;
let unittest_step_assert_cuname = TABLE_UNITTEST_STEP_ASSERT_FIELDS.FIELD_CUNAME;
let unittest_step_assert_delFlg = TABLE_UNITTEST_STEP_ASSERT_FIELDS.FIELD_DELFLG;
let unittest_step_assert_ctime = TABLE_UNITTEST_STEP_ASSERT_FIELDS.FIELD_CTIME;

let unittest_executor_batch = TABLE_UNITTEST_EXECUTOR_FIELDS.FIELD_BATCH_UUID;
let unittest_executor_iterator = TABLE_UNITTEST_EXECUTOR_FIELDS.FIELD_ITERATOR_UUID;
let unittest_executor_unittest = TABLE_UNITTEST_EXECUTOR_FIELDS.FIELD_UNITTEST_UUID;
let unittest_executor_step = TABLE_UNITTEST_EXECUTOR_FIELDS.FIELD_STEPS_UUID;
let unittest_executor_history_id = TABLE_UNITTEST_EXECUTOR_FIELDS.FIELD_HISTORY_ID;
let unittest_executor_delFlg = TABLE_UNITTEST_EXECUTOR_FIELDS.FIELD_DELFLG;
let unittest_executor_ctime = TABLE_UNITTEST_EXECUTOR_FIELDS.FIELD_CTIME;
let unittest_executor_assert_left = TABLE_UNITTEST_EXECUTOR_FIELDS.FIELD_ASSERT_LEFT;
let unittest_executor_assert_right = TABLE_UNITTEST_EXECUTOR_FIELDS.FIELD_ASSERT_RIGHT;
let unittest_executor_result = TABLE_UNITTEST_EXECUTOR_FIELDS.FIELD_RESULT;
let unittest_executor_cost_time = TABLE_UNITTEST_EXECUTOR_FIELDS.FIELD_COST_TIME;

let unittest_report_iterator = TABLE_UNITTEST_EXECUTOR_REPORT_FIELDS.FIELD_ITERATOR_UUID;
let unittest_report_env = TABLE_UNITTEST_EXECUTOR_REPORT_FIELDS.FIELD_ENV;
let unittest_report_unittest = TABLE_UNITTEST_EXECUTOR_REPORT_FIELDS.FIELD_UNITTEST_UUID;
let unittest_report_batch = TABLE_UNITTEST_EXECUTOR_REPORT_FIELDS.FIELD_BATCH_UUID;
let unittest_report_delFlg = TABLE_UNITTEST_EXECUTOR_REPORT_FIELDS.FIELD_DELFLG;
let unittest_report_ctime = TABLE_UNITTEST_EXECUTOR_REPORT_FIELDS.FIELD_CTIME;
let unittest_report_result = TABLE_UNITTEST_EXECUTOR_REPORT_FIELDS.FIELD_RESULT;
let unittest_report_step = TABLE_UNITTEST_EXECUTOR_REPORT_FIELDS.FIELD_STEP;
let unittest_report_cost_time = TABLE_UNITTEST_EXECUTOR_REPORT_FIELDS.FIELD_COST_TIME;
let unittest_report_failure_reason = TABLE_UNITTEST_EXECUTOR_REPORT_FIELDS.FIELD_REASON;

let request_history_uri = TABLE_REQUEST_HISTORY_FIELDS.FIELD_URI;
let request_history_response = TABLE_REQUEST_HISTORY_FIELDS.FIELD_RESPONSE_CONTENT;
let request_history_body = TABLE_REQUEST_HISTORY_FIELDS.FIELD_REQUEST_BODY;
let request_history_jsonFlg = TABLE_REQUEST_HISTORY_FIELDS.FIELD_JSONFLG;
let request_history_header = TABLE_REQUEST_HISTORY_FIELDS.FIELD_REQUEST_HEADER;
let request_history_param = TABLE_REQUEST_HISTORY_FIELDS.FIELD_REQUEST_PARAM;
let request_history_path_variable = TABLE_REQUEST_HISTORY_FIELDS.FIELD_REQUEST_PATH_VARIABLE;

export async function addUnitTest(versionIteratorId : string, title : string, folder : string, device : object, cb) {
    let unit_test : any = {};
    unit_test[unittest_iterator_uuid] = versionIteratorId;
    unit_test[field_unittest_uuid] = uuidv4() as string;
    unit_test[unittest_title] = title;
    unit_test[unittest_fold] = folder;
    unit_test[unittest_cuid] = device.uuid;
    unit_test[unittest_cuname] = device.uname;
    unit_test[unittest_ctime] = Date.now();
    unit_test[unittest_delFlg] = 0;
    await window.db[TABLE_UNITTEST_NAME].put(unit_test);

    cb();
}

export async function addUnitTestStep(
    versionIteratorId : string, unitTestUuid : string, 
    title : string, project : string, method: string, uri : string,
    header: object, param: object, pathVariable: object, body: object,
    assertTitleArr: Array<string>, assertPrevArr: Array<string>, assertOperatorArr: Array<string>, assertAfterArr: Array<string>,
    sort: number, continueEnable: string,
    device : object, cb) {
        window.db.transaction('rw',
            window.db[TABLE_UNITTEST_STEPS_NAME],
            window.db[TABLE_UNITTEST_STEP_ASSERTS_NAME], 
            async () => {

                let stepId = uuidv4() as string;

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
                unit_test_step[unittest_step_sort] = sort;
                unit_test_step[unittest_step_cuid] = device.uuid;
                unit_test_step[unittest_step_cuname] = device.uname;
                unit_test_step[unittest_step_ctime] = Date.now();
                unit_test_step[unittest_step_delFlg] = 0;
                await window.db[TABLE_UNITTEST_STEPS_NAME].put(unit_test_step);

                let unit_test_step_assert : Array<any> = [];

                for(let i in assertTitleArr) {
                    let assertTitle = assertTitleArr[i];
                    let assertPrev = assertPrevArr[i];
                    let assertOperator = assertOperatorArr[i];
                    let assertAfter = assertAfterArr[i];
                    let unit_test_step_assert_item : any = {};
                    unit_test_step_assert_item[unittest_step_assert_iterator] = versionIteratorId;
                    unit_test_step_assert_item[unittest_step_assert_unittest] = unitTestUuid;
                    unit_test_step_assert_item[unittest_step_assert_step] = stepId;
                    unit_test_step_assert_item[unittest_step_assert_uuid] = uuidv4() as string;
                    unit_test_step_assert_item[unittest_step_assert_title] = assertTitle;
                    unit_test_step_assert_item[unittest_step_assert_left] = assertPrev;
                    unit_test_step_assert_item[unittest_step_assert_operator] = assertOperator;
                    unit_test_step_assert_item[unittest_step_assert_right] = assertAfter;
                    unit_test_step_assert_item[unittest_step_assert_cuid] = device.uuid;
                    unit_test_step_assert_item[unittest_step_assert_cuname] = device.uname;
                    unit_test_step_assert_item[unittest_step_assert_delFlg] = 0;
                    unit_test_step_assert_item[unittest_step_assert_ctime] = Date.now();

                    unit_test_step_assert.push(unit_test_step_assert_item);
                }
                await window.db[TABLE_UNITTEST_STEP_ASSERTS_NAME].bulkPut(unit_test_step_assert);
                cb();
            }
        );
}

export async function editUnitTest(uuid : string, title : string, folder : string, cb) {
    let unitTest = await window.db[TABLE_UNITTEST_NAME]
    .where(field_unittest_uuid).equals(uuid)
    .first();

    if (unitTest !== undefined) {
        unitTest[unittest_title] = title;
        unitTest[unittest_fold] = folder;
        await window.db[TABLE_UNITTEST_NAME].put(unitTest);
    
        cb();
    }
}

export async function editUnitTestStep(
    unittest_step_uuid : string, title : string,
    header: object, param: object, pathVariable: object, body: object,
    assertTitleArr: Array<string>, assertPrevArr: Array<string>, assertOperatorArr: Array<string>, assertAfterArr: Array<string>, 
    assertUuidArr: Array<string>, sort: number, continueEnable: string, device: any, cb) {
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
                unit_test_step_assert_item[unittest_step_assert_left] = assertPrev;
                unit_test_step_assert_item[unittest_step_assert_operator] = assertOperator;
                unit_test_step_assert_item[unittest_step_assert_right] = assertAfter;
                unit_test_step_assert.push(unit_test_step_assert_item);
            }
        } else if (operate === "add") {
            unit_test_step_assert_item = {};
            unit_test_step_assert_item[unittest_step_assert_iterator] = unit_test_step[unittest_step_iterator_uuid];
            unit_test_step_assert_item[unittest_step_assert_unittest] = unit_test_step[unittest_step_unittest_uuid];
            unit_test_step_assert_item[unittest_step_assert_step] = unittest_step_uuid;
            unit_test_step_assert_item[unittest_step_assert_uuid] = assertUuid;
            unit_test_step_assert_item[unittest_step_assert_title] = assertTitle;
            unit_test_step_assert_item[unittest_step_assert_left] = assertPrev;
            unit_test_step_assert_item[unittest_step_assert_operator] = assertOperator;
            unit_test_step_assert_item[unittest_step_assert_right] = assertAfter;
            unit_test_step_assert_item[unittest_step_assert_cuid] = device.uuid;
            unit_test_step_assert_item[unittest_step_assert_cuname] = device.uname;
            unit_test_step_assert_item[unittest_step_assert_delFlg] = 0;
            unit_test_step_assert_item[unittest_step_assert_ctime] = Date.now();
            unit_test_step_assert.push(unit_test_step_assert_item);
        }
    }
    await window.db[TABLE_UNITTEST_STEP_ASSERTS_NAME].bulkPut(unit_test_step_assert);
    cb();
}

export async function delUnitTest(row, cb) {
    let uuid = row[field_unittest_uuid];

    let unitTest = await window.db[TABLE_UNITTEST_NAME]
    .where(field_unittest_uuid).equals(uuid)
    .first();

    if (unitTest !== undefined) {
        unitTest[field_unittest_uuid] = uuid;
        unitTest[unittest_delFlg] = 1;
        await window.db[TABLE_UNITTEST_NAME].put(unitTest);
        cb();
    }
}

export async function delUnitTestStep(unittestStepUuid : string, cb) {
    let unitTestStep = await window.db[TABLE_UNITTEST_STEPS_NAME]
    .where(field_unittest_step_uuid).equals(unittestStepUuid)
    .first();

    if (unitTestStep !== undefined) {
        unitTestStep[unittest_step_delFlg] = 1;
        await window.db[TABLE_UNITTEST_STEPS_NAME].put(unitTestStep);
        cb();
    }
}

export async function getSingleUnittest(unittest_uuid : string, env : string | null, iteratorId : string) {
    //单测列表
    let unitTest = await window.db[TABLE_UNITTEST_NAME]
    .where(field_unittest_uuid)
    .equals(unittest_uuid)
    .first();

    let iterator_uuid = unitTest[unittest_iterator_uuid];
    let batch_uuid = "";
    //拿整体执行报告
    let unittestReport;
    if (env !== null) {
        unittestReport = await window.db[TABLE_UNITTEST_EXECUTOR_REPORT_NAME]
        .where([unittest_report_delFlg, unittest_report_iterator, unittest_report_unittest, unittest_report_env])
        .equals([0, iteratorId, unittest_uuid, env])
        .reverse()
        .first();
    } else {
        unittestReport = await window.db[TABLE_UNITTEST_EXECUTOR_REPORT_NAME]
        .where([unittest_report_delFlg, unittest_report_iterator, unittest_report_unittest])
        .equals([0, iteratorId, unittest_uuid])
        .reverse()
        .first();
    }
    if (unittestReport !== undefined) {
        env = unittestReport[unittest_report_env];
        batch_uuid = unittestReport[unittest_report_batch];
        unitTest[unittest_report_batch] = batch_uuid; //批次 id
        unitTest[unittest_report_step] = unittestReport[unittest_report_step]; //执行 浮标
        unitTest[unittest_report_result] = unittestReport[unittest_report_result];
        unitTest[unittest_report_env] = env;
        unitTest[unittest_report_cost_time] = unittestReport[unittest_report_cost_time];
    }

    let unitTestSteps = await window.db[TABLE_UNITTEST_STEPS_NAME]
    .where([unittest_step_delFlg, unittest_step_iterator_uuid, unittest_step_unittest_uuid])
    .equals([0, iterator_uuid, unittest_uuid])
    .toArray();

    if (!isStringEmpty(unitTest[unittest_report_step])) {
        if (unitTest[unittest_report_result] === UNITTEST_RESULT_UNKNOWN) {
            let markFlg = -1;
            for (let unitTestStep of unitTestSteps) {
                let stepUuid = unitTestStep[field_unittest_step_uuid];
                //还没打标，遇到数值一样的步骤，开始打标
                if (markFlg === -1 && stepUuid === unitTest[unittest_report_step]) {
                    markFlg = 0;
                    continue;
                }
                //打标
                if (markFlg === 0) {
                    unitTest[unittest_report_step] = stepUuid;
                    markFlg = 1;
                    continue;
                }
                //已经打过标
                if (markFlg === 1) {
                    break;
                }
            }
        } else {
            unitTest[unittest_report_step] = "";
        }
    }

    if (!isStringEmpty(batch_uuid)) {
        for (let unitTestStep of unitTestSteps) {
            //当前执行步骤
            unitTestStep[unittest_report_step] = unitTest[unittest_report_step];
            //当前执行批次
            unitTestStep[unittest_report_batch] = batch_uuid;
            //当前环境
            unitTestStep[unittest_report_env] = env;
            let stepUuid = unitTestStep[field_unittest_step_uuid];
            let unittest_executor_report = await window.db[TABLE_UNITTEST_EXECUTOR_NAME]
            .where([unittest_executor_iterator, unittest_executor_unittest, unittest_executor_batch, unittest_executor_step])
            .equals(["", unittest_uuid, batch_uuid, stepUuid])
            .first();
            if (unittest_executor_report !== undefined) {
                unitTestStep[unittest_executor_result] = unittest_executor_report[unittest_executor_result];
                unitTestStep[unittest_executor_cost_time] = unittest_executor_report[unittest_executor_cost_time];
            }
        }
    }

    unitTest['children'] = unitTestSteps;

    return unitTest;
}

export async function getProjectUnitTests(project : string, env : string|null, dispatch : any) {
    //单测列表
    let unitTests = await window.db[TABLE_UNITTEST_NAME]
    .where(unittest_projects)
    .equals(project)
    .filter(row => {
        if (!row[unittest_collectFlg]) {
            return false;
        }
        if (row[unittest_delFlg]) {
            return false;
        }
        return true;
    })
    .reverse()
    .toArray();

    for (let i = 0; i < unitTests.length; i++) {
        let unitTest = unitTests[i];
        let unittest_uuid = unitTest[field_unittest_uuid];
        let newUnitTest = await getSingleUnittest(unittest_uuid, env, "");
        unitTests[i] = newUnitTest;
    }

    dispatch({
        type: GET_PROJECT_TESTS,
        project: project,
        unitTests
    });
}

export async function getIterationUnitTests(iteratorId : string, env : string|null, dispatch : any) {
    //单测列表
    let unitTests = await window.db[TABLE_UNITTEST_NAME]
    .where([unittest_delFlg, unittest_iterator_uuid])
    .equals([0, iteratorId])
    .reverse()
    .toArray();

    for (let i = 0; i < unitTests.length; i++) {
        let unitTest = unitTests[i];
        let unittest_uuid = unitTest[field_unittest_uuid];
        let newUnitTest = await getSingleUnittest(unittest_uuid, env, iteratorId);
        unitTests[i] = newUnitTest;
    }

    dispatch({
        type: GET_ITERATOR_TESTS,
        iteratorId,
        unitTests
    });
}

export async function getUnitTestStepAsserts(iteratorId : string, unitTestId : string, stepId : string) {
    let unitTestAsserts = await window.db[TABLE_UNITTEST_STEP_ASSERTS_NAME]
    .where([unittest_step_assert_delFlg, unittest_step_assert_iterator, unittest_step_assert_unittest, unittest_step_assert_step])
    .equals([0, iteratorId, unitTestId, stepId])
    .reverse()
    .toArray();

    return unitTestAsserts;
}

export async function continueIteratorExecuteUnitTest(
    iteratorId : string, unitTestId : string, batchId : string, stepId : string,
    env : string, dispatch : any) {

    let allSteps = await window.db[TABLE_UNITTEST_STEPS_NAME]
    .where([unittest_step_delFlg, unittest_step_iterator_uuid, unittest_step_unittest_uuid])
    .equals([0, iteratorId, unitTestId])
    .toArray();

    let executeFlg = false;
    let steps = [];
    for (let _unit_test_step of allSteps) {  
        let stepUuid = _unit_test_step[field_unittest_step_uuid];
        if (stepUuid === stepId) {
            executeFlg = true;
        }
        if (!executeFlg) {
            continue;
        }
        steps.push(_unit_test_step);
    }
    let ret = await stepsExecutor(steps, iteratorId, unitTestId, batchId, env, 
        (project : string) => {
            let envVarTips = new RequestSendTips();
            envVarTips.init(project, env, iteratorId, "", dispatch, env_vars => {});
            return envVarTips;
        },
        (project : string, content : string) => {
            let jsonParamTips = new JsonParamTips(project, iteratorId, "", content, dispatch);
            jsonParamTips.setEnv(env);
            return jsonParamTips;
        }, 
        async (stepUuid, requestHistoryId, assertLeftValue, assertRightValue, breakFlg, costTime) => {
            let unit_test_executor : any = {};
            unit_test_executor[unittest_executor_batch] = batchId;
            unit_test_executor[unittest_executor_iterator] = iteratorId;
            unit_test_executor[unittest_executor_unittest] = unitTestId;
    
    
            unit_test_executor[unittest_executor_step] = stepUuid;
            unit_test_executor[unittest_executor_history_id] = requestHistoryId;
            unit_test_executor[unittest_executor_assert_left] = assertLeftValue;
            unit_test_executor[unittest_executor_assert_right] = assertRightValue;
            unit_test_executor[unittest_executor_result] = !breakFlg;
            unit_test_executor[unittest_executor_cost_time] = costTime;
            
            unit_test_executor[unittest_executor_delFlg] = 0;
            unit_test_executor[unittest_executor_ctime] = Date.now();
            await window.db[TABLE_UNITTEST_EXECUTOR_NAME].put(unit_test_executor);
        });
    let success = ret.success;
    let recentStepUuid = ret.recentStepUuid;
    let errorMessage = ret.errorMessage;
    let btime = ret.btime;
    let unitTestReport = await window.db[TABLE_UNITTEST_EXECUTOR_REPORT_NAME]
    .where([unittest_report_iterator, unittest_report_unittest, unittest_report_batch])
    .equals([iteratorId, unitTestId, batchId])
    .first();
    unitTestReport[unittest_report_result] = success;
    unitTestReport[unittest_report_step] = recentStepUuid;
    unitTestReport[unittest_report_failure_reason] = errorMessage;
    unitTestReport[unittest_report_cost_time] = Date.now() - btime;
    await window.db[TABLE_UNITTEST_EXECUTOR_REPORT_NAME].put(unitTestReport);
    return batchId;
}

export async function continueProjectExecuteUnitTest(
    iteratorId : string, unitTestId : string, batchId : string, stepId : string,
    env : string, dispatch : any) {

    let allSteps = await window.db[TABLE_UNITTEST_STEPS_NAME]
    .where([unittest_step_delFlg, unittest_step_iterator_uuid, unittest_step_unittest_uuid])
    .equals([0, iteratorId, unitTestId])
    .toArray();

    let executeFlg = false;
    let steps = [];
    for (let _unit_test_step of allSteps) {  
        let stepUuid = _unit_test_step[field_unittest_step_uuid];
        if (stepUuid === stepId) {
            executeFlg = true;
        }
        if (!executeFlg) {
            continue;
        }
        steps.push(_unit_test_step);
    }
    let ret = await stepsExecutor(steps, iteratorId, unitTestId, batchId, env, 
        (project : string) => {
            let envVarTips = new RequestSendTips();
            envVarTips.init(project, env, "", unitTestId, dispatch, env_vars => {});
            return envVarTips;
        },
        (project : string, content : string) => {
            let jsonParamTips = new JsonParamTips(project, "", unitTestId, content, dispatch);
            jsonParamTips.setEnv(env);
            return jsonParamTips;
        }, 
        async (stepUuid, requestHistoryId, assertLeftValue, assertRightValue, breakFlg, costTime) => {
            let unit_test_executor : any = {};
            unit_test_executor[unittest_executor_batch] = batchId;
            unit_test_executor[unittest_executor_iterator] = "";
            unit_test_executor[unittest_executor_unittest] = unitTestId;
    
    
            unit_test_executor[unittest_executor_step] = stepUuid;
            unit_test_executor[unittest_executor_history_id] = requestHistoryId;
            unit_test_executor[unittest_executor_assert_left] = assertLeftValue;
            unit_test_executor[unittest_executor_assert_right] = assertRightValue;
            unit_test_executor[unittest_executor_result] = !breakFlg;
            unit_test_executor[unittest_executor_cost_time] = costTime;
            
            unit_test_executor[unittest_executor_delFlg] = 0;
            unit_test_executor[unittest_executor_ctime] = Date.now();
            await window.db[TABLE_UNITTEST_EXECUTOR_NAME].put(unit_test_executor);
        });
    let success = ret.success;
    let recentStepUuid = ret.recentStepUuid;
    let errorMessage = ret.errorMessage;
    let btime = ret.btime;
    let unitTestReport = await window.db[TABLE_UNITTEST_EXECUTOR_REPORT_NAME]
    .where([unittest_report_iterator, unittest_report_unittest, unittest_report_batch])
    .equals([iteratorId, unitTestId, batchId])
    .first();
    unitTestReport[unittest_report_result] = success;
    unitTestReport[unittest_report_step] = recentStepUuid;
    unitTestReport[unittest_report_failure_reason] = errorMessage;
    unitTestReport[unittest_report_cost_time] = Date.now() - btime;
    await window.db[TABLE_UNITTEST_EXECUTOR_REPORT_NAME].put(unitTestReport);
    return batchId;
}

export async function executeProjectUnitTest(
    iteratorId : string, unitTestId : string, 
    steps : Array<any>, env : string, dispatch : any) : Promise<string>
    {
    let batch_uuid = uuidv4() as string;

    let ret = await stepsExecutor(steps, iteratorId, unitTestId, batch_uuid, env, 
        (project : string) => {
            let envVarTips = new RequestSendTips();
            envVarTips.init(project, env, "", unitTestId, dispatch, env_vars => {});
            return envVarTips;
        },
        (project : string, content : string) => {
            let jsonParamTips = new JsonParamTips(project, "", unitTestId, content, dispatch);
            jsonParamTips.setEnv(env);
            return jsonParamTips;
        },
        async (stepUuid, requestHistoryId, assertLeftValue, assertRightValue, breakFlg, costTime) => {
            let unit_test_executor : any = {};
            unit_test_executor[unittest_executor_batch] = batch_uuid;
            unit_test_executor[unittest_executor_iterator] = "";
            unit_test_executor[unittest_executor_unittest] = unitTestId;
    
    
            unit_test_executor[unittest_executor_step] = stepUuid;
            unit_test_executor[unittest_executor_history_id] = requestHistoryId;
            unit_test_executor[unittest_executor_assert_left] = assertLeftValue;
            unit_test_executor[unittest_executor_assert_right] = assertRightValue;
            unit_test_executor[unittest_executor_result] = !breakFlg;
            unit_test_executor[unittest_executor_cost_time] = costTime;
            
            unit_test_executor[unittest_executor_delFlg] = 0;
            unit_test_executor[unittest_executor_ctime] = Date.now();
            await window.db[TABLE_UNITTEST_EXECUTOR_NAME].put(unit_test_executor);
        });
    let success = ret.success;
    let recentStepUuid = ret.recentStepUuid;
    let errorMessage = ret.errorMessage;
    let btime = ret.btime;

    let unittest_result : any = {};
    unittest_result[unittest_report_iterator] = "";
    unittest_result[unittest_report_env] = env;
    unittest_result[unittest_report_unittest] = unitTestId;
    unittest_result[unittest_report_batch] = batch_uuid;
    unittest_result[unittest_report_delFlg] = 0;
    unittest_result[unittest_report_ctime] = Date.now();
    unittest_result[unittest_report_result] = success;
    unittest_result[unittest_report_step] = recentStepUuid;
    unittest_result[unittest_report_failure_reason] = errorMessage;
    unittest_result[unittest_report_cost_time] = Date.now() - btime;

    await window.db[TABLE_UNITTEST_EXECUTOR_REPORT_NAME].put(unittest_result);

    return batch_uuid;
}

export async function executeIteratorUnitTest(
    iteratorId : string, unitTestId : string, 
    steps : Array<any>, env : string, dispatch : any) : Promise<string>
    {
    let batch_uuid = uuidv4() as string;

    let ret = await stepsExecutor(steps, iteratorId, unitTestId, batch_uuid, env, 
        (project : string) => {
            let envVarTips = new RequestSendTips();
            envVarTips.init(project, env, iteratorId, "", dispatch, env_vars => {});
            return envVarTips;
        },
        (project : string, content : string) => {
            let jsonParamTips = new JsonParamTips(project, iteratorId, "", content, dispatch);
            jsonParamTips.setEnv(env);
            return jsonParamTips;
        },
        async (stepUuid, requestHistoryId, assertLeftValue, assertRightValue, breakFlg, costTime) => {
            let unit_test_executor : any = {};
            unit_test_executor[unittest_executor_batch] = batch_uuid;
            unit_test_executor[unittest_executor_iterator] = iteratorId;
            unit_test_executor[unittest_executor_unittest] = unitTestId;
    
    
            unit_test_executor[unittest_executor_step] = stepUuid;
            unit_test_executor[unittest_executor_history_id] = requestHistoryId;
            unit_test_executor[unittest_executor_assert_left] = assertLeftValue;
            unit_test_executor[unittest_executor_assert_right] = assertRightValue;
            unit_test_executor[unittest_executor_result] = !breakFlg;
            unit_test_executor[unittest_executor_cost_time] = costTime;
            
            unit_test_executor[unittest_executor_delFlg] = 0;
            unit_test_executor[unittest_executor_ctime] = Date.now();
            await window.db[TABLE_UNITTEST_EXECUTOR_NAME].put(unit_test_executor);
        });
    let success = ret.success;
    let recentStepUuid = ret.recentStepUuid;
    let errorMessage = ret.errorMessage;
    let btime = ret.btime;

    let unittest_result : any = {};
    unittest_result[unittest_report_iterator] = iteratorId;
    unittest_result[unittest_report_env] = env;
    unittest_result[unittest_report_unittest] = unitTestId;
    unittest_result[unittest_report_batch] = batch_uuid;
    unittest_result[unittest_report_delFlg] = 0;
    unittest_result[unittest_report_ctime] = Date.now();
    unittest_result[unittest_report_result] = success;
    unittest_result[unittest_report_step] = recentStepUuid;
    unittest_result[unittest_report_failure_reason] = errorMessage;
    unittest_result[unittest_report_cost_time] = Date.now() - btime;

    await window.db[TABLE_UNITTEST_EXECUTOR_REPORT_NAME].put(unittest_result);

    return batch_uuid;
}

async function stepsExecutor(
    steps : Array<any>, 
    iteratorId : string, 
    unitTestId : string, 
    batch_uuid : string,
    env : string, 
    getEnvVarTipsFunc : Function,
    getJsonParamTipsFunc : Function,
    saveStepResultFunc : Function,
) : Promise<any> {
    let btime = Date.now();
    let success = UNITTEST_RESULT_SUCCESS;
    let errorMessage = "";
    let firstStepUuid = steps.at(0)[field_unittest_step_uuid];
    let recentStepUuid = "";
    let index = 0;
    outerLoop1: for (let _unit_test_step of steps) {  
        index++;
        let unit_test_step = cloneDeep(_unit_test_step);
        let stepUuid = unit_test_step[field_unittest_step_uuid];
        let project = unit_test_step[unittest_step_project];
        let requestUri = unit_test_step[unittest_step_uri];
        let method = unit_test_step[unittest_step_method];
        let header = unit_test_step[unittest_step_header];
        let param = unit_test_step[unittest_step_param];
        let pathVariable = unit_test_step[unittest_step_path_variable] ? unit_test_step[unittest_step_path_variable] : {};
        let body = unit_test_step[unittest_step_body];
        let file = new Object();
        let isContinue = unit_test_step[unittest_step_continue];

        let breakFlg = true;

        //不继续了，且不是最后一步，结果就是未知的，并且记录下最后执行的步骤 uuid，以便于继续执行
        if (!(isContinue == 1) && stepUuid !== firstStepUuid) {
            success = UNITTEST_RESULT_UNKNOWN;
            break;
        }
        recentStepUuid = stepUuid;

        let promises : any = {};
        let unitTestAsserts = await getUnitTestStepAsserts(iteratorId, unitTestId, stepUuid);
        let envVarTips = getEnvVarTipsFunc(project);
        let requestHost = await envVarTips.getHostAsync();
        let url = requestHost + requestUri;

        let contentType = "";

        if (Object.keys(header).length > 0) {
            for (let _key in header) {
                if (_key === CONTENT_TYPE) {
                    contentType = header[_key];
                }
                let jsonParamTips = getJsonParamTipsFunc(project, header[_key]);
                try {
                    header[_key] = await jsonParamTips.getValue(envVarTips, param, pathVariable, header, body, {}, unitTestId, batch_uuid);
                } catch (error) {
                    errorMessage = error.message;
                    success = UNITTEST_RESULT_FAILURE;
                    break outerLoop1;
                }
            }
        }

        if (Object.keys(pathVariable).length > 0) {
            for (let _key in pathVariable) {
                let jsonParamTips = getJsonParamTipsFunc(project, pathVariable[_key]);
                try {
                    let value = await jsonParamTips.getValue(envVarTips, param, pathVariable, header, body, {}, unitTestId, batch_uuid);
                    pathVariable[_key] = value;
                    url = url.replaceAll("{{" + _key + "}}", value);
                } catch (error) {
                    errorMessage = error.message;
                    success = UNITTEST_RESULT_FAILURE;
                    break outerLoop1;
                }
            }
        }

        if (Object.keys(body).length > 0) {
            for (let _key in body) {
                if (contentType === CONTENT_TYPE_FORMDATA) {
                    //文件类型取 blob 格式的数据
                    if (getType(body[_key]) === "Object") {
                        let path = body[_key].path;
                        promises[_key] = {};
                        file[_key] = cloneDeep(body[_key]);
                        promises[_key].promise = new Promise((resolve, reject) => {
                            promises[_key].listener = window.electron.ipcRenderer.on(ChannelsReadFileStr, (key, path, blob) => {
                                if (key === _key) {
                                    let _file = body[_key];
                                    _file.blob = blob.buffer;
                                    resolve({key: _key, file: _file});
                                }
                            });
                            window.electron.ipcRenderer.sendMessage(ChannelsReadFileStr, _key, path);
                        });
                    } else {
                        let jsonParamTips = getJsonParamTipsFunc(project, body[_key]);
                        try {
                            body[_key] = await jsonParamTips.getValue(envVarTips, param, pathVariable, header, body, {}, unitTestId, batch_uuid);
                        } catch (error) {
                            errorMessage = error.message;
                            success = UNITTEST_RESULT_FAILURE;
                            break outerLoop1;
                        }
                    }
                } else {
                    let jsonParamTips = getJsonParamTipsFunc(project, body[_key]);
                    try {
                        body[_key] = await jsonParamTips.getValue(envVarTips, param, pathVariable, header, body, {}, unitTestId, batch_uuid);
                    } catch (error) {
                        errorMessage = error.message;
                        success = UNITTEST_RESULT_FAILURE;
                        break outerLoop1;
                    }
                }

            }
        }

        if (Object.keys(param).length > 0) {
            for (let _key in param) {
                let jsonParamTips = getJsonParamTipsFunc(project, param[_key]);
                try {
                    param[_key] = await jsonParamTips.getValue(envVarTips, param, pathVariable, header, body, {}, unitTestId, batch_uuid);
                } catch (error) {
                    errorMessage = error.message;
                    success = UNITTEST_RESULT_FAILURE;
                    break outerLoop1;
                }
            }
        }

        if (!isStringEmpty(paramToString(param))) {
            url += "?" + paramToString(param);
        }

        let response = null;

        let executorBtime = Date.now();

        if (method === REQUEST_METHOD_POST) {
            if (contentType === CONTENT_TYPE_FORMDATA) {
                let formData = new FormData();
                //有文件上传，需要等待文件上传完成再操作
                if (Object.keys(promises).length > 0) {
                    let promiseArr = [];
                    for (let _key in promises) {
                        promiseArr.push(promises[_key].promise);
                    }
                    //资源上传全部处理完成
                    let values = await Promise.all(promiseArr);

                    for (let _value of values) {
                        let _key = _value.key;
                        //移除监听器
                        promises[_key].listener();
                        //移除 body
                        delete body[_key];
                        let _file = _value.file;
                        const blobFile = new Blob([_file.blob], { type: _file.type });  
                        formData.append(_key, blobFile, _file.name);
                    }
                }
                for (let _key in body) {
                    formData.append(_key, body[_key]);
                }
                try {
                    response = await axios.post(url, formData, {
                        headers: header
                    });
                } catch (error) {
                    errorMessage = error.message;
                }
            } else {
                try {
                    response = await axios.post(url, body, {
                      headers: header
                    });
                } catch (error) {
                    errorMessage = error.message;
                }
            }
        } else if (method === REQUEST_METHOD_GET) {
            try {
                response = await axios.get(url, {
                    headers: header
                });
            } catch (error) {
                errorMessage = error.message;
            }
        }
        let executorEtime = Date.now();
        let assertLeftValue : any[] = [];
        let assertRightValue : any[] = [];

        let isResponseJson = false;
        let isResponseHtml = false;
        let isResponsePic = false;
        let isResponseFile = false;
        let content = "";
        
        if(response !== null && isStringEmpty(errorMessage)) {
            if (response.headers['content-type'] && response.headers['content-type'].toString().indexOf(CONTENT_TYPE_HTML) >= 0) {
                isResponseHtml = true;
                content = response.data;
                breakFlg = false;
            } else if (
                response.headers['content-type'] && (
                response.headers['content-type'].toString().indexOf(CONTENT_TYPE_IMAGE_JPG) >= 0 || 
                response.headers['content-type'].toString().indexOf(CONTENT_TYPE_IMAGE_PNG) >= 0 || 
                response.headers['content-type'].toString().indexOf(CONTENT_TYPE_IMAGE_GIF) >= 0 || 
                response.headers['content-type'].toString().indexOf(CONTENT_TYPE_IMAGE_WEBP) >= 0 
                )) {
                    isResponsePic = true;
                    content = url;
                    breakFlg = false;
            } else if (
                response.headers['content-type'] && (
                response.headers['content-type'].toString().indexOf(CONTENT_TYPE_ATTACH_GZIP1) >= 0 || 
                response.headers['content-type'].toString().indexOf(CONTENT_TYPE_ATTACH_GZIP2) >= 0 || 
                response.headers['content-type'].toString().indexOf(CONTENT_TYPE_ATTACH_ZIP) >= 0 || 
                response.headers['content-type'].toString().indexOf(CONTENT_TYPE_ATTACH_TAR) >= 0 ||
                response.headers['content-type'].toString().indexOf(CONTENT_TYPE_ATTACH_STREAM) >= 0
                )) {
                    isResponseFile = true;
                    content = "[!返回了一个文件]";
                    breakFlg = false;
            } else if (
                (response.headers['content-type'] && response.headers['content-type'].toString().indexOf(CONTENT_TYPE_JSON) >= 0) || 
                isJsonString(JSON.stringify(response.data))
            ) {
                isResponseJson = true;
                breakFlg = false;
                content = JSON.stringify(response.data);

                for (let _key in unitTestAsserts) {
                    let keyNumber = Number(_key) as number;
                    let unitTestAssert = unitTestAsserts[keyNumber];

                    let assertLeft = unitTestAssert[unittest_step_assert_left];
                    let assertRight = unitTestAssert[unittest_step_assert_right];
                    let assertOperator = unitTestAssert[unittest_step_assert_operator];
    
                    let leftJsonParamTips = getJsonParamTipsFunc(project, assertLeft);
                    try {
                        assertLeftValue[keyNumber] = await leftJsonParamTips.getValue(envVarTips, param, pathVariable, header, body, response.data, unitTestId, batch_uuid);
                    } catch (error) {
                        errorMessage = error.message;
                        breakFlg = true;
                        break;
                    }
    
                    let rightJsonParamTips = getJsonParamTipsFunc(project, assertRight);
                    try {
                        assertRightValue[keyNumber] = await rightJsonParamTips.getValue(envVarTips, param, pathVariable, header, body, response.data, unitTestId, batch_uuid);
                    } catch (error) {
                        errorMessage = error.message;
                        breakFlg = true;
                        break;
                    }

                    if (typeof assertLeftValue[keyNumber] === "number") {
                        assertLeftValue[keyNumber] = assertLeftValue[keyNumber].toString();
                    }

                    if (typeof assertRightValue[keyNumber] === "number") {
                        assertRightValue[keyNumber] = assertRightValue[keyNumber].toString();
                    }

                    if (assertOperator === " == ") {
                        if (assertLeftValue[keyNumber] === assertRightValue[keyNumber]) {
                            breakFlg = false;
                        } else {
                            breakFlg = true;
                            break;
                        }
                    } else {
                        if (assertLeftValue[keyNumber] !== assertRightValue[keyNumber]) {
                            breakFlg = false;
                        } else {
                            breakFlg = true;
                            break;
                        }
                    }
                }
            } else {
                content = response.data;
                breakFlg = false;
            }
        }
        let requestHistoryId = await addRequestHistory(env, project, requestUri, method, 
            header, body, pathVariable, param, file, 
            content, isResponseJson, isResponseHtml, isResponsePic, isResponseFile);

        let costTime = executorEtime - executorBtime;

        await saveStepResultFunc(stepUuid, requestHistoryId, assertLeftValue, assertRightValue, breakFlg, costTime);

        //遇到错误结束
        if (breakFlg) {
            success = UNITTEST_RESULT_FAILURE;
            break;
        }
    }

    return {
        success,
        recentStepUuid,
        errorMessage,
        etime: Date.now(),
        btime,
    };
}


export async function getExecutorReports(iteratorId : string, unittest_uuid : string, env : string) {
    let unittestReports = await window.db[TABLE_UNITTEST_EXECUTOR_REPORT_NAME]
    .where([unittest_report_delFlg, unittest_report_iterator, unittest_report_unittest, unittest_report_env])
    .equals([0, iteratorId, unittest_uuid, env])
    .reverse()
    .toArray();

    return unittestReports;
}

export async function getSingleExecutorReport(iteratorId : string, unittestId : string, batchId : string) {
    let unitTestReport = await window.db[TABLE_UNITTEST_EXECUTOR_REPORT_NAME]
    .where([unittest_report_iterator, unittest_report_unittest, unittest_report_batch])
    .equals([iteratorId, unittestId, batchId])
    .first();

    return unitTestReport;
}

export async function getSingleExecutorStep(iteratorId : string, unittestId : string, batchId : string, stepId : string) : Promise<any> {
    let unitTestStep = await window.db[TABLE_UNITTEST_EXECUTOR_NAME]
    .where([unittest_executor_iterator, unittest_executor_unittest, unittest_executor_batch, unittest_executor_step])
    .equals([iteratorId, unittestId, batchId, stepId])
    .first();

    if (unitTestStep === undefined || unitTestStep[unittest_executor_delFlg] === 1) {
        return null;
    }

    let historyId = unitTestStep[unittest_executor_history_id];

    let historyRecord = await getRequestHistory(historyId);

    if (historyRecord === null) {
        return null;
    }

    unitTestStep[request_history_uri] = historyRecord[request_history_uri];
    unitTestStep[request_history_response] = historyRecord[request_history_response];
    unitTestStep[request_history_body] = historyRecord[request_history_body];
    unitTestStep[request_history_jsonFlg] = historyRecord[request_history_jsonFlg];
    unitTestStep[request_history_param] = historyRecord[request_history_param];
    unitTestStep[request_history_header] = historyRecord[request_history_header];
    unitTestStep[request_history_path_variable] = historyRecord[request_history_path_variable];

    return unitTestStep;
}

export async function getRecentExecutorReport(iteratorId : string) {
    let unitTestReport = await window.db[TABLE_UNITTEST_EXECUTOR_REPORT_NAME]
    .where([unittest_report_delFlg, unittest_report_iterator])
    .equals([0, iteratorId])
    .reverse()
    .first();

    return unitTestReport;
}

export async function copyFromProjectToIterator(unittest_uuid : string, cb) {
    let unitTest = await window.db[TABLE_UNITTEST_NAME]
    .where(field_unittest_uuid).equals(unittest_uuid)
    .first();

    if (unitTest === undefined) {
        return;
    }

    let envVarKeys : any[] = [];

    let unitTestEnvVars = await db[TABLE_ENV_VAR_NAME]
    .where("[" + env_var_micro_service + "+" + env_var_iteration + "+" + env_var_unittest + "]")
    .equals(["", "", unittest_uuid])
    .filter(row => {
        if (row[env_var_delFlg]) {
            return false;
        }
        return true;
    })
    .toArray();
    if (unitTestEnvVars.length > 0) {
        envVarKeys = envVarKeys.concat(unitTestEnvVars);
    }

    let prjs = unitTest[unittest_projects];
    for (let prj of prjs) {
        let prjEnvVars = await db[TABLE_ENV_VAR_NAME]
        .where("[" + env_var_micro_service + "+" + env_var_iteration + "+" + env_var_unittest + "]")
        .equals([prj, "", unittest_uuid])
        .filter(row => {
            if (row[env_var_delFlg]) {
                return false;
            }
            return true;
        })
        .toArray();
        if (prjEnvVars.length > 0) {
            envVarKeys = envVarKeys.concat(prjEnvVars);
        }
    }

    let newEnvVarKeys = envVarKeys.map(obj => ({...obj, del_flg: 1}));
    await window.db[TABLE_ENV_VAR_NAME].bulkPut(newEnvVarKeys);

    unitTest[unittest_projects] = [];
    unitTest[unittest_collectFlg] = 0;
    
    await window.db[TABLE_UNITTEST_NAME].put(unitTest);

    cb();
}

export async function copyFromIteratorToProject(iteratorId : string, unittest_uuid : string, cb) {
    let unitTest = await window.db[TABLE_UNITTEST_NAME]
    .where(field_unittest_uuid).equals(unittest_uuid)
    .first();

    if (unitTest === undefined) {
        return;
    }

    let unitTestSteps : any[] = await window.db[TABLE_UNITTEST_STEPS_NAME]
    .where([unittest_step_delFlg, unittest_step_iterator_uuid, unittest_step_unittest_uuid])
    .equals([0, iteratorId, unittest_uuid])
    .toArray();

    let prjs = new Set<String>();
    for (let unitTestStep of unitTestSteps) {
        prjs.add(unitTestStep[unittest_step_project]);
    }

    let envVarKeys : any[] = [];

    let iteratorArrays = await db[TABLE_ENV_VAR_NAME]
    .where("[" + env_var_micro_service + "+" + env_var_iteration + "+" + env_var_unittest + "]")
    .equals(["", iteratorId, ""])
    .filter(row => {
        if (row[env_var_delFlg]) {
            return false;
        }
        return true;
    })
    .toArray();
    if (iteratorArrays.length > 0) {
        envVarKeys = envVarKeys.concat(iteratorArrays);
    }

    for (let prj of prjs) {
        let iteratorPlusPrjArrays = await db[TABLE_ENV_VAR_NAME]
        .where("[" + env_var_micro_service + "+" + env_var_iteration + "+" + env_var_unittest + "]")
        .equals([prj, iteratorId, ""])
        .filter(row => {
            if (row[env_var_delFlg]) {
                return false;
            }
            return true;
        })
        .toArray();
        if (iteratorPlusPrjArrays.length > 0) {
            envVarKeys = envVarKeys.concat(iteratorPlusPrjArrays);
        }
    }

    let newEnvVarKeys = envVarKeys.map(obj => ({...obj, iteration: "", unittest: unittest_uuid, del_flg: 0}));
    await window.db[TABLE_ENV_VAR_NAME].bulkPut(newEnvVarKeys);

    unitTest[unittest_projects] = [...prjs];
    unitTest[unittest_collectFlg] = 1;

    await window.db[TABLE_UNITTEST_NAME].put(unitTest);

    cb();
}