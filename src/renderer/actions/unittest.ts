import { v4 as uuidv4 } from 'uuid';
import { cloneDeep } from 'lodash';

import {
    TABLE_UNITTEST_FIELDS,
    TABLE_UNITTEST_CLEAN_FIELDS,
    TABLE_UNITTEST_STEPS_FIELDS,
    TABLE_UNITTEST_EXECUTOR_NAME, 
    TABLE_UNITTEST_EXECUTOR_FIELDS,
    TABLE_UNITTEST_EXECUTOR_REPORT_NAME, 
    TABLE_UNITTEST_EXECUTOR_REPORT_FIELDS,
    TABLE_UNITTEST_STEP_ASSERT_FIELDS,
    TABLE_REQUEST_HISTORY_FIELDS,
    UNAME,
} from '@conf/db';
import {
    CONTENT_TYPE,
    REQUEST_METHOD_GET,
    REQUEST_METHOD_POST,
    DataTypeJsonObject,
    INPUTTYPE_FILE
} from '@conf/global_config';
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
    CONTENT_TYPE_FORMDATA,
} from '@conf/contentType';
import {
    UNITTEST_RESULT_SUCCESS,
    UNITTEST_RESULT_FAILURE,
    UNITTEST_RESULT_UNKNOWN,
    ASSERT_TYPE_DB,
} from '@conf/unittest';
import {
    ENV_VALUE_RUN_MODE_CLIENT,
} from '@conf/envKeys';
import { GET_ITERATOR_TESTS, GET_PROJECT_TESTS } from '@conf/redux';
import {
    CLIENT_TYPE_TEAM, 
    UNITTES_PROJECT_SAVE_URL,
    UNITTES_PROJECT_REMOVE_URL,
    UNITTES_ITERATION_SAVE_URL,
    UNITTES_ITERATION_DEL_URL,
    UNITTEST_MOVE_ITERATOR_URL,
    UNITTES_ITERATION_ALL_URL,
    UNITTES_PROJECT_FETCH_SINGLE_URL,
    UNITTES_PROJECT_ALL_URL,
    UNITTES_ITERATION_FETCH_SINGLE_URL
} from '@conf/team';

import { 
    executeQuerySql,
    executeDeleteSql,
    sendAjaxMessage,
    sendTeamMessage,
} from '@act/message';
import { getUsers } from '@act/user';
import { addRequestHistory, getRequestHistory } from '@act/request_history';
import { getVersionIteratorRequest } from '@act/version_iterator_requests';
import { getProjectRequest } from '@act/project_request';
import { getEnvHosts, getEnvRunModes } from '@act/env_value';

import { 
    getType, 
    isStringEmpty, 
    isJsonString, 
    paramToString, 
    waitSeconds, 
    getMapValueOrDefault 
} from '@rutil/index';
import { TABLE_FIELD_TYPE } from '@rutil/json';

import RequestSendTips from '@clazz/RequestSendTips';
import JsonParamTips from '@clazz/JsonParamTips';

let unittest_iterator_uuid = TABLE_UNITTEST_FIELDS.FIELD_ITERATOR_UUID;
let field_unittest_uuid = TABLE_UNITTEST_FIELDS.FIELD_UUID;
let unittest_cuid = TABLE_UNITTEST_FIELDS.FIELD_CUID;

let field_clean_prj = TABLE_UNITTEST_CLEAN_FIELDS.FIELD_PROJECTS;
let field_clean_sql = TABLE_UNITTEST_CLEAN_FIELDS.FIELD_SQL;
let field_clean_sql_params = TABLE_UNITTEST_CLEAN_FIELDS.FIELD_SQL_PARAMS;

let field_unittest_step_uuid = TABLE_UNITTEST_STEPS_FIELDS.FIELD_UUID;
let unittest_step_project = TABLE_UNITTEST_STEPS_FIELDS.FIELD_MICRO_SERVICE_LABEL;
let unittest_step_method = TABLE_UNITTEST_STEPS_FIELDS.FIELD_REQUEST_METHOD;
let unittest_step_uri = TABLE_UNITTEST_STEPS_FIELDS.FIELD_URI;
let unittest_step_header = TABLE_UNITTEST_STEPS_FIELDS.FIELD_REQUEST_HEADER;
let unittest_step_param = TABLE_UNITTEST_STEPS_FIELDS.FIELD_REQUEST_PARAM;
let unittest_step_path_variable = TABLE_UNITTEST_STEPS_FIELDS.FIELD_REQUEST_PATH_VARIABLE;
let unittest_step_body = TABLE_UNITTEST_STEPS_FIELDS.FIELD_REQUEST_BODY;
let unittest_step_continue = TABLE_UNITTEST_STEPS_FIELDS.FIELD_CONTINUE;
let unittest_step_wait_seconds = TABLE_UNITTEST_STEPS_FIELDS.FIELD_WAIT_SECONDS;

let unittest_step_assert_type = TABLE_UNITTEST_STEP_ASSERT_FIELDS.FIELD_TYPE;
let unittest_step_assert_sql = TABLE_UNITTEST_STEP_ASSERT_FIELDS.FIELD_SQL;
let unittest_step_assert_sql_params = TABLE_UNITTEST_STEP_ASSERT_FIELDS.FIELD_SQL_PARAMS;
let unittest_step_assert_left = TABLE_UNITTEST_STEP_ASSERT_FIELDS.FIELD_ASSERT_LEFT;
let unittest_step_assert_operator = TABLE_UNITTEST_STEP_ASSERT_FIELDS.FIELD_ASSERT_OPERATOR;
let unittest_step_assert_right = TABLE_UNITTEST_STEP_ASSERT_FIELDS.FIELD_ASSERT_RIGHT;

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
let request_history_response_header = TABLE_REQUEST_HISTORY_FIELDS.FIELD_RESPONSE_HEAD;
let request_history_response_cookie = TABLE_REQUEST_HISTORY_FIELDS.FIELD_RESPONSE_COOKIE;
let request_history_response_content = TABLE_REQUEST_HISTORY_FIELDS.FIELD_RESPONSE_CONTENT;
let request_history_body = TABLE_REQUEST_HISTORY_FIELDS.FIELD_REQUEST_BODY;
let request_history_jsonFlg = TABLE_REQUEST_HISTORY_FIELDS.FIELD_JSONFLG;
let request_history_header = TABLE_REQUEST_HISTORY_FIELDS.FIELD_REQUEST_HEADER;
let request_history_param = TABLE_REQUEST_HISTORY_FIELDS.FIELD_REQUEST_PARAM;
let request_history_path_variable = TABLE_REQUEST_HISTORY_FIELDS.FIELD_REQUEST_PATH_VARIABLE;

export async function addIteratorUnitTest( 
    versionIteratorId : string, 
    title : string, 
    folder : string, 
    referFrom : string
) {

    const unittest_uuid = uuidv4() as string;
    await sendTeamMessage(UNITTES_ITERATION_SAVE_URL, {
        iterator: versionIteratorId, 
        uuid: unittest_uuid, 
        title, 
        fold: folder,
        referFrom
    });
}

export async function editIteratorUnitTest(versionIteratorId : string, unitTestUuid : string, title : string, folder : string, ) {
    await sendTeamMessage(UNITTES_ITERATION_SAVE_URL, {iterator: versionIteratorId, uuid: unitTestUuid, title, fold: folder});
}

export async function delUnitTest(row) {
    let uuid = row[field_unittest_uuid];
    let iteratorId = row[unittest_iterator_uuid];
    await sendTeamMessage(UNITTES_ITERATION_DEL_URL, {iterator: iteratorId, uuid});
}

export async function getIteratorSingleUnittest(unittest_uuid : string, iteratorId : string, env : string | null) {
    let ret = await sendTeamMessage(UNITTES_ITERATION_FETCH_SINGLE_URL, {iterator: iteratorId, unittest: unittest_uuid});
    let unitTest = ret.ret;
    let unitTestSteps = ret.list

    return genUnitTest(unitTest, unitTestSteps, unittest_uuid, iteratorId, env);
}

async function genUnitTest(unitTest, unitTestSteps, unittest_uuid : string, iteratorId : string, env : string | null) {
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
            .equals([iteratorId, unittest_uuid, batch_uuid, stepUuid])
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

export async function batchMoveUnittest(clientType : string, unittestArr : Array<string>, newIterator : string, device : object) {
    const newUnittestArr = unittestArr.map(item => {
        // 对每个 item 做处理，返回新值
        return uuidv4() as string;
    });
    if (clientType === CLIENT_TYPE_TEAM) {
        await sendTeamMessage(UNITTEST_MOVE_ITERATOR_URL, {
            new_iterator: newIterator, 
            old_uuids: unittestArr.join(','),
            new_uuids: newUnittestArr.join(','),
        })
    }
}

export async function getProjectSingleUnittest(unittest_uuid : string, teamId : string, project : string, env : string | null) {
    let ret = await sendTeamMessage(UNITTES_PROJECT_FETCH_SINGLE_URL, {teamId, project, unittest: unittest_uuid});
    let unitTest = ret.ret;
    let unitTestSteps = ret.list

    return genUnitTest(unitTest, unitTestSteps, unittest_uuid, "", env);
}

export async function getProjectUnitTests(clientType : string, teamId : string, project : string, folder : string | null, env : string|null, dispatch : any) {

    let folders;

    let users = await getUsers(clientType);

    let ret = await sendTeamMessage(UNITTES_PROJECT_ALL_URL, {project, teamId, fold: folder});
    let unitTests = ret.list;
    for (let i = 0; i < unitTests.length; i++) {
        let unitTest = unitTests[i].unitTest;
        let unitTestSteps = unitTests[i].unitTestSteps;
        let unittest_uuid = unitTest[field_unittest_uuid];
        let newUnitTest = await genUnitTest(unitTest, unitTestSteps, unittest_uuid, "", env)
        newUnitTest[UNAME] = users.get(unitTest[unittest_cuid]);
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
        type: GET_PROJECT_TESTS,
        project,
        unitTests,
        folders: folders === null ? null : Array.from(folders)
    });
}

export async function getIterationUnitTests(clientType : string, iteratorId : string, folder : string | null, env : string|null, dispatch : any) {
    let folders;

    let users = await getUsers(clientType);
    let ret = await sendTeamMessage(UNITTES_ITERATION_ALL_URL, {iterator: iteratorId, fold: folder});
    let unitTests = ret.list;
    for (let i = 0; i < unitTests.length; i++) {
        let unitTest = unitTests[i].unitTest;
        let unitTestSteps = unitTests[i].unitTestSteps;
        let unittest_uuid = unitTest[field_unittest_uuid];
        let newUnitTest = await genUnitTest(unitTest, unitTestSteps, unittest_uuid, iteratorId, env)
        newUnitTest[UNAME] = users.get(unitTest[unittest_cuid]);
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
        type: GET_ITERATOR_TESTS,
        iteratorId,
        unitTests,
        folders: folders === null ? null : Array.from(folders)
    });
}

export async function executeProjectUnitTest(
    clientType : string, teamId : string, unitTestId : string, 
    steps : Array<any>,  cleanNodes : Array<any>, 
    env : string, cb : Function
)
    {
    let batch_uuid = uuidv4() as string;
    let progressCb = cb;

    let unittest_result : any = {};
    unittest_result[unittest_report_iterator] = "";
    unittest_result[unittest_report_env] = env;
    unittest_result[unittest_report_unittest] = unitTestId;
    unittest_result[unittest_report_batch] = batch_uuid;
    unittest_result[unittest_report_delFlg] = 0;
    unittest_result[unittest_report_ctime] = Date.now();
    await window.db[TABLE_UNITTEST_EXECUTOR_REPORT_NAME].put(unittest_result);

    let ret = await stepsExecutor(steps, cleanNodes, "", unitTestId, batch_uuid, env, 
        async (project : string, sql : string, sqlParams : Array<string>) => {
            await executeDeleteSql(clientType, env, project, sql, sqlParams)
        },
        async (project : string, sql : string, sqlParams : Array<string>) => {
            return await executeQuerySql(clientType, env, project, sql, sqlParams)
        },
        async (project : string) => {
            let datas = await getEnvHosts(clientType, teamId, project, env);
            return datas.get(env);
        },
        async (project : string) => {
            let datas = await getEnvRunModes(clientType, teamId, project, env);
            let runMode = getMapValueOrDefault(datas, env, ENV_VALUE_RUN_MODE_CLIENT);
            return runMode;
        },
        (project : string) => {
            let envVarTips = new RequestSendTips();
            envVarTips.init("unittest", project, "", unitTestId, clientType);
            return envVarTips;
        },
        () => {
            let jsonParamTips = new JsonParamTips("", unitTestId, clientType);
            jsonParamTips.setEnv(env);
            return jsonParamTips;
        },
        async (stepUuid, requestHistoryId, singleCostTime, assertLeftValue, assertRightValue, breakFlg) => {
            let unit_test_executor : any = {};
            unit_test_executor[unittest_executor_batch] = batch_uuid;
            unit_test_executor[unittest_executor_iterator] = "";
            unit_test_executor[unittest_executor_unittest] = unitTestId;
            unit_test_executor[unittest_executor_step] = stepUuid;
            unit_test_executor[unittest_executor_history_id] = requestHistoryId;
            unit_test_executor[unittest_executor_assert_left] = assertLeftValue;
            unit_test_executor[unittest_executor_assert_right] = assertRightValue;
            unit_test_executor[unittest_executor_result] = !breakFlg;
            unit_test_executor[unittest_executor_cost_time] = singleCostTime;
            unit_test_executor[unittest_executor_delFlg] = 0;
            unit_test_executor[unittest_executor_ctime] = Date.now();
            await window.db[TABLE_UNITTEST_EXECUTOR_NAME].put(unit_test_executor);
        },
        async (project, method, requestUri) => {
            let request = await getProjectRequest(clientType, project, method, requestUri);
            return request;
        },
        progressCb
    );

    let lastUnittestReport = await window.db[TABLE_UNITTEST_EXECUTOR_REPORT_NAME]
    .where([unittest_report_delFlg, unittest_report_iterator, unittest_report_unittest, unittest_report_env])
    .equals([0, "", unitTestId, env])
    .reverse()
    .first();
    let success = ret.success;
    let recentStepUuid = ret.recentStepUuid;
    let errorMessage = ret.errorMessage;
    let btime = ret.btime;

    lastUnittestReport[unittest_report_result] = success;
    lastUnittestReport[unittest_report_step] = recentStepUuid;
    lastUnittestReport[unittest_report_failure_reason] = errorMessage;
    lastUnittestReport[unittest_report_cost_time] = Date.now() - btime;
    await window.db[TABLE_UNITTEST_EXECUTOR_REPORT_NAME].put(lastUnittestReport);

    progressCb(batch_uuid, "");
}

export async function executeIteratorUnitTest(
    clientType : string, teamId : string,
    iteratorId : string, unitTestId : string, 
    steps : Array<any>, cleanNodes : Array<any>, 
    env : string,
    cb : Function
)
    {
    let batch_uuid = uuidv4() as string;
    let progressCb = cb;

    //预输入数据
    let unittest_result : any = {};
    unittest_result[unittest_report_iterator] = iteratorId;
    unittest_result[unittest_report_env] = env;
    unittest_result[unittest_report_unittest] = unitTestId;
    unittest_result[unittest_report_batch] = batch_uuid;
    unittest_result[unittest_report_delFlg] = 0;
    unittest_result[unittest_report_ctime] = Date.now();

    await window.db[TABLE_UNITTEST_EXECUTOR_REPORT_NAME].put(unittest_result);

    let ret = await stepsExecutor(steps, cleanNodes, iteratorId, unitTestId, batch_uuid, env, 
        async (project : string, sql : string, sqlParams : Array<string>) => {
            await executeDeleteSql(clientType, env, project, sql, sqlParams)
        },
        async (project : string, sql : string, sqlParams : Array<string>) => {
            return await executeQuerySql(clientType, env, project, sql, sqlParams)
        },
        async (project : string) => {
            let datas = await getEnvHosts(clientType, teamId, project, env);
            return datas.get(env);
        },
        async (project : string) => {
            let datas = await getEnvRunModes(clientType, teamId, project, env);
            let runMode = getMapValueOrDefault(datas, env, ENV_VALUE_RUN_MODE_CLIENT);
            return runMode;
        },
        (project : string) => {
            let envVarTips = new RequestSendTips();
            envVarTips.init("unittest", project, iteratorId, unitTestId, clientType);
            return envVarTips;
        },
        () => {
            let jsonParamTips = new JsonParamTips(iteratorId, unitTestId, clientType);
            jsonParamTips.setEnv(env);
            return jsonParamTips;
        },
        async (stepUuid, requestHistoryId, singleCostTime, assertLeftValue, assertRightValue, breakFlg) => {
            let unit_test_executor : any = {};
            unit_test_executor[unittest_executor_batch] = batch_uuid;
            unit_test_executor[unittest_executor_iterator] = iteratorId;
            unit_test_executor[unittest_executor_unittest] = unitTestId;
            unit_test_executor[unittest_executor_step] = stepUuid;
            unit_test_executor[unittest_executor_history_id] = requestHistoryId;
            unit_test_executor[unittest_executor_assert_left] = assertLeftValue;
            unit_test_executor[unittest_executor_assert_right] = assertRightValue;
            unit_test_executor[unittest_executor_result] = !breakFlg;
            unit_test_executor[unittest_executor_cost_time] = singleCostTime;
            unit_test_executor[unittest_executor_delFlg] = 0;
            unit_test_executor[unittest_executor_ctime] = Date.now();
            await window.db[TABLE_UNITTEST_EXECUTOR_NAME].put(unit_test_executor);
        },
        async (project, method, requestUri) => {
            let request = await getVersionIteratorRequest(clientType, iteratorId, project, method, requestUri);
            if (request === null) {
                request = await getProjectRequest(clientType, project, method, requestUri);
            }
            return request;
        },
        progressCb
    );

    //登记结果
    let lastUnittestReport = await window.db[TABLE_UNITTEST_EXECUTOR_REPORT_NAME]
    .where([unittest_report_delFlg, unittest_report_iterator, unittest_report_unittest, unittest_report_env])
    .equals([0, iteratorId, unitTestId, env])
    .reverse()
    .first();
    let success = ret.success;
    let recentStepUuid = ret.recentStepUuid;
    let errorMessage = ret.errorMessage;
    let btime = ret.btime;
    lastUnittestReport[unittest_report_result] = success;
    lastUnittestReport[unittest_report_step] = recentStepUuid;
    lastUnittestReport[unittest_report_failure_reason] = errorMessage;
    lastUnittestReport[unittest_report_cost_time] = Date.now() - btime;
    await window.db[TABLE_UNITTEST_EXECUTOR_REPORT_NAME].put(lastUnittestReport);

    progressCb(batch_uuid, "");
}

async function stepsExecutor(
    steps : Array<any>, 
    cleanNodes : Array<any>,
    iteratorId : string,
    unitTestId : string, 
    batch_uuid : string,
    env : string, 
    dbExecuteFunc : Function,
    getDbRetFunc : Function,
    getEnvHostFunc : Function,
    getRunModeFunc : Function,
    getEnvVarTipsFunc : Function,
    getJsonParamTipsFunc : Function,
    saveStepResultFunc : Function,
    getRequestFunc : Function,
    progressCb : Function,
) : Promise<any> {
    let jsonParamTips = getJsonParamTipsFunc();
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
        let delaySeconds = unit_test_step[unittest_step_wait_seconds];

        let originRequest = await getRequestFunc(project, method, requestUri);


        jsonParamTips.setProject(project);

        let breakFlg = true;

        //不继续了，且不是最后一步，结果就是未知的，并且记录下最后执行的步骤 uuid，以便于继续执行
        if (isContinue == 0 && stepUuid !== firstStepUuid) {
            success = UNITTEST_RESULT_UNKNOWN;
            break;
        } else if (isContinue == 2 && delaySeconds > 0) {
            await waitSeconds(delaySeconds);
        }
        recentStepUuid = stepUuid;

        let unitTestAsserts = _unit_test_step.asserts;
        let envVarTips = getEnvVarTipsFunc(project);
        let requestHost = await getEnvHostFunc(project);
        let runMode = await getRunModeFunc(project);
        let url = requestHost + requestUri;

        let contentType = "";

        if (Object.keys(header).length > 0) {
            for (let _key in header) {
                if (_key === CONTENT_TYPE) {
                    contentType = header[_key];
                }
                jsonParamTips.setContent(header[_key]);
                try {
                    header[_key] = await jsonParamTips.getValue(envVarTips, param, pathVariable, header, body, {}, {}, {}, unitTestId, batch_uuid);
                } catch (error) {
                    errorMessage = error.message;
                    success = UNITTEST_RESULT_FAILURE;
                    break outerLoop1;
                }
            }
        }

        if (Object.keys(pathVariable).length > 0) {
            for (let _key in pathVariable) {
                jsonParamTips.setContent(pathVariable[_key]);
                try {
                    let value = await jsonParamTips.getValue(envVarTips, param, pathVariable, header, body, {}, {}, {}, unitTestId, batch_uuid);
                    pathVariable[_key] = value;
                    url = url.replaceAll("{{" + _key + "}}", value);
                } catch (error) {
                    errorMessage = error.message;
                    success = UNITTEST_RESULT_FAILURE;
                    break outerLoop1;
                }
            }
        }

        if (originRequest != null) {
            let iteratorBodyObjectRet = await iteratorBodyObject(
                envVarTips, param, pathVariable, header,
                body, contentType, 
                jsonParamTips, file,
                unitTestId, batch_uuid,
                originRequest.body
            );
            if (iteratorBodyObjectRet.error !== null) {
                errorMessage = iteratorBodyObjectRet.error;
                success = iteratorBodyObjectRet.success;
                break outerLoop1;
            }
        }

        if (Object.keys(param).length > 0) {
            for (let _key in param) {
                jsonParamTips.setContent(param[_key]);
                try {
                    param[_key] = await jsonParamTips.getValue(envVarTips, param, pathVariable, header, body, {}, {}, {}, unitTestId, batch_uuid);
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

        if (method === REQUEST_METHOD_POST) {
            if (contentType === CONTENT_TYPE_FORMDATA) {
                try {
                    response = await sendAjaxMessage(runMode, REQUEST_METHOD_POST, url, header, body, file)
                } catch (err) {
                    errorMessage = err.errorMessage;
                }
            } else {
                try {
                    response = await sendAjaxMessage(runMode, REQUEST_METHOD_POST, url, header, body, null)
                } catch (err) {
                    errorMessage = err.errorMessage;
                }
            }
        } else if (method === REQUEST_METHOD_GET) {
            try {
                response = await sendAjaxMessage(runMode, REQUEST_METHOD_GET, url, header, null, null)
            } catch (err) {
                errorMessage = err.errorMessage;
            }
        }
        let assertLeftValue : any[] = [];
        let assertRightValue : any[] = [];

        let isResponseJson = false;
        let isResponseHtml = false;
        let isResponsePic = false;
        let isResponseFile = false;
        let content = "";
        
        let singleCostTime = 0;

        if(response !== null && isStringEmpty(errorMessage)) {
            singleCostTime = response.costTime;
            if (getType(response.data) === "String" && isJsonString(response.data)) {
                response.data = JSON.parse(response.data);
            }
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
                    let assertLeft = unitTestAssert[unittest_step_assert_left].trim();
                    let assertRight = unitTestAssert[unittest_step_assert_right].trim();
                    let assertOperator = unitTestAssert[unittest_step_assert_operator];
                    if (unitTestAssert[unittest_step_assert_type] == ASSERT_TYPE_DB) {
                        let sql = unitTestAssert[unittest_step_assert_sql];
                        let sql_params = unitTestAssert[unittest_step_assert_sql_params];
                        let parsed_sql_params = [];
                        for (let _sql_param of sql_params) {
                            jsonParamTips.setContent(_sql_param);
                            try {
                                let _parsed_value = await jsonParamTips.getValue(envVarTips, param, pathVariable, header, body, response.headers, response.cookieObj, response.data, unitTestId, batch_uuid);
                                parsed_sql_params.push(_parsed_value);
                            } catch (error) {
                                console.error(error);
                                errorMessage = error.message;
                                breakFlg = true;
                                break;
                            }
                        }

                        try {
                            let dbRet = await getDbRetFunc(project, sql, parsed_sql_params)
                            if (assertLeft in dbRet) {
                                assertLeftValue[keyNumber] = dbRet[assertLeft];
                            } else {
                                errorMessage = `查询语句返回空结果，sql:${sql}, 参数：${parsed_sql_params}`;
                                breakFlg = true;
                                break;
                            }
                        } catch (error) {
                            console.error(error);
                            errorMessage = error.message;
                            breakFlg = true;
                            break;
                        }

                        jsonParamTips.setContent(assertRight);
                        try {
                            assertRightValue[keyNumber] = await jsonParamTips.getValue(envVarTips, param, pathVariable, header, body, response.headers, response.cookieObj, response.data, unitTestId, batch_uuid);
                        } catch (error) {
                            console.error(error);
                            errorMessage = error.message;
                            breakFlg = true;
                            break;
                        }
                    } else {
                        jsonParamTips.setContent(assertLeft);
                        try {
                            assertLeftValue[keyNumber] = await jsonParamTips.getValue(envVarTips, param, pathVariable, header, body, response.headers, response.cookieObj, response.data, unitTestId, batch_uuid);
                        } catch (error) {
                            console.log(error);
                            errorMessage = error.message;
                            breakFlg = true;
                            break;
                        }
        
                        jsonParamTips.setContent(assertRight);
                        try {
                            assertRightValue[keyNumber] = await jsonParamTips.getValue(envVarTips, param, pathVariable, header, body, response.headers, response.cookieObj, response.data, unitTestId, batch_uuid);
                        } catch (error) {
                            console.error(error);
                            errorMessage = error.message;
                            breakFlg = true;
                            break;
                        }
                    }

                    if (typeof assertLeftValue[keyNumber] === "number") {
                        assertLeftValue[keyNumber] = assertLeftValue[keyNumber].toString();
                    } else if (typeof assertLeftValue[keyNumber] === "boolean") {
                        assertLeftValue[keyNumber] = assertLeftValue[keyNumber] ? "true" : "false";
                    }

                    if (typeof assertRightValue[keyNumber] === "number") {
                        assertRightValue[keyNumber] = assertRightValue[keyNumber].toString();
                    } else if (typeof assertRightValue[keyNumber] === "boolean") {
                        assertRightValue[keyNumber] = assertRightValue[keyNumber] ? "true" : "false";
                    }

                    if (assertOperator.trim() === "==") {
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

        let requestHistoryId = await addRequestHistory(
            env, project, requestUri, method, iteratorId,
            header, body, pathVariable, param, file, 
            content, response?.headers, response?.cookieObj, 
            isResponseJson, isResponseHtml, isResponsePic, isResponseFile);

        await saveStepResultFunc(stepUuid, requestHistoryId, singleCostTime, assertLeftValue, assertRightValue, breakFlg);

        progressCb(batch_uuid, stepUuid);

        //遇到错误结束
        if (breakFlg) {
            success = UNITTEST_RESULT_FAILURE;
            break;
        }
    }

    try {
        for (let cleanNode of cleanNodes) {
            let project = cleanNode[field_clean_prj];
            let sql = cleanNode[field_clean_sql];
            let sqlParams = cleanNode[field_clean_sql_params];

            jsonParamTips.setProject(project);
            let envVarTips = getEnvVarTipsFunc(project);

            let parsed_sql_params = [];
            for (let _sql_param of sqlParams) {
                jsonParamTips.setContent(_sql_param);
                try {
                    let _parsed_value = await jsonParamTips.getValue(envVarTips, 
                        {}, {}, {}, {}, {}, {}, {}, unitTestId, batch_uuid);
                    parsed_sql_params.push(_parsed_value);
                } catch (error) {
                    console.error(error);
                }
            }
            await dbExecuteFunc(project, sql, parsed_sql_params);
        }
    } catch (err) {
        console.error("数据库执行失败", err);
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
    unitTestStep[request_history_response_header] = historyRecord[request_history_response_header];
    unitTestStep[request_history_response_cookie] = historyRecord[request_history_response_cookie];
    unitTestStep[request_history_response_content] = historyRecord[request_history_response_content];
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

export async function copyFromProjectToIterator(iteratorId : string, unittest_uuid : string) {
    await sendTeamMessage(UNITTES_PROJECT_REMOVE_URL, {iteratorId, unittestId: unittest_uuid});
}

/**
 * 导出到迭代
 * @param iteratorId 
 * @param unittest_uuid 
 * @param device 
 * @returns 
 */
export async function copyFromIteratorToProject(iteratorId : string, unittest_uuid : string) {
    await sendTeamMessage(UNITTES_PROJECT_SAVE_URL, {iteratorId, unittestId: unittest_uuid});
}

async function iteratorBodyObject(
    envVarTips : any, param : any, pathVariable : any, header : any,
	body : any, 
	contentType : string, 
	jsonParamTips : JsonParamTips,
    file : any,
    unitTestId : string, batch_uuid : string,
    format : any
) {
	if (Object.keys(body).length > 0) {
		for (let _key in body) {
            let isJsonString = false;
            let isArray = false;
            let isFile = false;
            if (format != null && format.hasOwnProperty(_key)) {
                if (format[_key][TABLE_FIELD_TYPE].toLowerCase() === INPUTTYPE_FILE.toLowerCase()) {
                    isFile = true;
                } else if (format[_key][TABLE_FIELD_TYPE].toLowerCase() === DataTypeJsonObject.toLowerCase()) {
                    isJsonString = true;
                }
            }
            if (isJsonString && getType(body[_key]) === "String") {
                body[_key] = JSON.parse(body[_key]);
            }
            if (getType(body[_key]) === "Array") {
                isArray = true;
                body[_key] = body[_key][0];
            }
			if (getType(body[_key]) === "Object" && !isFile) {
				await iteratorBodyObject(
                    envVarTips, param, pathVariable, header,
                    body[_key], contentType, jsonParamTips, file,
                    unitTestId, batch_uuid,
                    null
                );
			} else {
				if (contentType === CONTENT_TYPE_FORMDATA) {
					//文件类型取 blob 格式的数据
					if (isFile) {
						file[_key] = cloneDeep(body[_key]);
						//移除 body
						delete body[_key];
					} else {
						jsonParamTips.setContent(body[_key]);
						try {
							body[_key] = await jsonParamTips.getValue(envVarTips, param, pathVariable, header, body, {}, {}, {}, unitTestId, batch_uuid);
						} catch (error) {
							console.error(error);
							let errorMessage = error.message;
							let result : any = {};
							result.error = errorMessage;
							result.success = UNITTEST_RESULT_FAILURE;
							return result;
						}
					}
				} else {
					jsonParamTips.setContent(body[_key]);
					try {
						body[_key] = await jsonParamTips.getValue(envVarTips, param, pathVariable, header, body, {}, {}, {}, unitTestId, batch_uuid);
					} catch (error) {
						console.error("_key", body[_key], error);
						let result : any = {};
						result.error = error.message;
						result.success = UNITTEST_RESULT_FAILURE;
						return result;
					}
				}
			}
            if (isArray) {
                body[_key] = [body[_key]];
            }
            if (isJsonString) {
                body[_key] = JSON.stringify(body[_key]);
            }
		}
	}
	
	let result : any = {};
	result.error = null;
	result.success = null;
	return result;
}