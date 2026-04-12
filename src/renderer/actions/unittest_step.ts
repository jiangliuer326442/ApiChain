
import { v4 as uuidv4 } from 'uuid';

import { 
    TABLE_FIELD_VALUE,
    buildJsonString
} from '@rutil/json';

import {
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
    versionIteratorId : string, unitTestUuid : string, unittest_step_uuid : string, 
    title : string,
    header: object, param: object, pathVariable: object, body: object,
    assertTitleArr: Array<string>, 
    assertTypeArr: Array<String>, assertSqlArr: Array<string>, assertSqlParamArr: Array<any>,
    assertPrevArr: Array<string>, assertOperatorArr: Array<string>, assertAfterArr: Array<string>, 
    sort: number, continueEnable: string, waitSeconds: number) {

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

export async function addUnitTestStep(
    clientType : string, 
    versionIteratorId : string, unitTestUuid : string, 
    title : string, project : string, method: string, uri : string,
    header: object, param: object, pathVariable: object, body: object,
    assertTitleArr: Array<string>, 
    assertTypeArr: Array<String>, assertSqlArr: Array<string>, assertSqlParamArr: Array<any>,
    assertPrevArr: Array<string>, assertOperatorArr: Array<string>, assertAfterArr: Array<string>,
    sort: number, continueEnable: string, waitSeconds: number) {

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
}

export async function delUnitTestStep(iteratorId : string, unittestUuid : string, unittestStepUuid : string) {
    await sendTeamMessage(UNITTES_ITERATION_STEP_DEL_URL, {
        iterator : iteratorId, unittest : unittestUuid, step : unittestStepUuid
    });
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