
import { 
    TABLE_FIELD_VALUE,
    buildJsonString
} from '@rutil/json';

import {
    TABLE_VERSION_ITERATION_REQUEST_FIELDS,
} from '@conf/db';

let iteration_request_title = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_TITLE;
let iteration_request_header = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_REQUEST_HEADER;
let iteration_request_body = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_REQUEST_BODY;
let iteration_request_param = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_REQUEST_PARAM;
let iteration_request_path_variable = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_REQUEST_PATH_VARIABLE;
let iteration_request_json_flg = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_JSONFLG;
let iteration_response_header = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_RESPONSE_HEAD;
let iteration_response_cookie = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_RESPONSE_COOKIE;
let iteration_response_content = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_RESPONSE_CONTENT;

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