import { Component, ReactNode } from 'react';
import { connect } from 'react-redux';
import { 
    Layout, Breadcrumb, Form, Select, Space, 
    Tabs, Input, InputNumber, Divider, Table,
    Button, message
} from 'antd';
import { PlusOutlined, MinusOutlined } from '@ant-design/icons';
import { cloneDeep } from 'lodash';

import { 
    TABLE_FIELD_NAME,
    TABLE_FIELD_VALUE,
    buildJsonString
} from '@rutil/json';
import { isStringEmpty } from '@rutil/index';
import {
    REQUEST_METHOD_POST,
} from '@conf/global_config';
import { ASSERT_TYPE_API, ASSERT_TYPE_DB } from '@conf/unittest'
import {
    TABLE_UNITTEST_FIELDS,
    TABLE_UNITTEST_TEMPLATE_FIELDS,
    TABLE_VERSION_ITERATION_REQUEST_FIELDS,
    TABLE_UNITTEST_STEPS_FIELDS,
    TABLE_UNITTEST_TEMPLATE_STEPS_FIELDS,
    TABLE_UNITTEST_STEP_ASSERT_FIELDS,
    TABLE_UNITTEST_TEMPLATE_STEP_ASSERT_FIELDS,
} from '@conf/db';
import RequestSendTips from '@clazz/RequestSendTips';
import { getUnitTestRequests, getVersionIteratorRequest } from '@act/version_iterator_requests';
import { getProjectRequest } from '@act/project_request';
import { 
    getIterationUnitTests,
} from '@act/unittest';
import {
    getUnitTests,
    getIterator,
    editUnitTestTemplateStep,
} from '@act/unittest_template';
import {
    addUnitTestStep,
    editUnitTestStep,
} from '@act/unittest_step';
import RequestPathVariableFormTable from "@comp/unittest_step/request_path_variable_form_table";
import RequestParamFormTable from "@comp/unittest_step/request_param_form_table";
import RequestHeadFormTable from "@comp/unittest_step/request_head_form_table";
import RequestBodyFormTable from "@comp/unittest_step/request_body_form_table";
import StepExpressionBuilderBox from "@comp/unittest_step/step_expression_builder_box";
import { langTrans, langFormat } from '@lang/i18n';

const { Header, Content, Footer } = Layout;

const { TextArea } = Input

let unittest_uuid = TABLE_UNITTEST_FIELDS.FIELD_UUID;
let unittest_title = TABLE_UNITTEST_FIELDS.FIELD_TITLE;

let unittest_template_uuid = TABLE_UNITTEST_TEMPLATE_FIELDS.FIELD_UUID;
let unittest_template_title = TABLE_UNITTEST_TEMPLATE_FIELDS.FIELD_TITLE;

let iteration_request_method = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_REQUEST_METHOD;
let iteration_request_title = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_TITLE;
let iteration_request_uri = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_URI;
let iteration_request_header = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_REQUEST_HEADER;
let iteration_request_body = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_REQUEST_BODY;
let iteration_request_param = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_REQUEST_PARAM;
let iteration_request_path_variable = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_REQUEST_PATH_VARIABLE;
let iteration_request_json_flg = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_JSONFLG;
let iteration_response_header = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_RESPONSE_HEAD;
let iteration_response_cookie = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_RESPONSE_COOKIE;
let iteration_response_content = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_RESPONSE_CONTENT;

let unittest_step_uuid = TABLE_UNITTEST_STEPS_FIELDS.FIELD_UUID;
let unittest_step_prj = TABLE_UNITTEST_STEPS_FIELDS.FIELD_MICRO_SERVICE_LABEL;
let unittest_step_method = TABLE_UNITTEST_STEPS_FIELDS.FIELD_REQUEST_METHOD;
let unittest_step_uri = TABLE_UNITTEST_STEPS_FIELDS.FIELD_URI;
let unittest_step_title = TABLE_UNITTEST_STEPS_FIELDS.FIELD_TITLE;
let unittest_step_continue = TABLE_UNITTEST_STEPS_FIELDS.FIELD_CONTINUE;
let unittest_step_wait_seconds = TABLE_UNITTEST_STEPS_FIELDS.FIELD_WAIT_SECONDS;
let unittest_step_sort = TABLE_UNITTEST_STEPS_FIELDS.FIELD_SORT;
let unittest_step_request_param = TABLE_UNITTEST_STEPS_FIELDS.FIELD_REQUEST_PARAM;
let unittest_step_request_path_variable = TABLE_UNITTEST_STEPS_FIELDS.FIELD_REQUEST_PATH_VARIABLE;
let unittest_step_request_head = TABLE_UNITTEST_STEPS_FIELDS.FIELD_REQUEST_HEADER;
let unittest_step_request_body = TABLE_UNITTEST_STEPS_FIELDS.FIELD_REQUEST_BODY;

let unittest_step_assert_uuid = TABLE_UNITTEST_STEP_ASSERT_FIELDS.FIELD_UUID;
let unittest_step_assert_title = TABLE_UNITTEST_STEP_ASSERT_FIELDS.FIELD_TITLE;
let unittest_step_assert_type = TABLE_UNITTEST_STEP_ASSERT_FIELDS.FIELD_TYPE;
let unittest_step_assert_sql = TABLE_UNITTEST_STEP_ASSERT_FIELDS.FIELD_SQL;
let unittest_step_assert_sql_params = TABLE_UNITTEST_STEP_ASSERT_FIELDS.FIELD_SQL_PARAMS;
let unittest_step_assert_left = TABLE_UNITTEST_STEP_ASSERT_FIELDS.FIELD_ASSERT_LEFT;
let unittest_step_assert_operator = TABLE_UNITTEST_STEP_ASSERT_FIELDS.FIELD_ASSERT_OPERATOR;
let unittest_step_assert_right = TABLE_UNITTEST_STEP_ASSERT_FIELDS.FIELD_ASSERT_RIGHT;

let unittest_template_step_uuid = TABLE_UNITTEST_TEMPLATE_STEPS_FIELDS.FIELD_UUID;
let unittest_template_step_prj = TABLE_UNITTEST_TEMPLATE_STEPS_FIELDS.FIELD_MICRO_SERVICE_LABEL;
let unittest_template_step_method = TABLE_UNITTEST_TEMPLATE_STEPS_FIELDS.FIELD_REQUEST_METHOD;
let unittest_template_step_uri = TABLE_UNITTEST_TEMPLATE_STEPS_FIELDS.FIELD_URI;
let unittest_template_step_title = TABLE_UNITTEST_TEMPLATE_STEPS_FIELDS.FIELD_TITLE;
let unittest_template_step_continue = TABLE_UNITTEST_TEMPLATE_STEPS_FIELDS.FIELD_CONTINUE;
let unittest_template_step_wait_seconds = TABLE_UNITTEST_TEMPLATE_STEPS_FIELDS.FIELD_WAIT_SECONDS;
let unittest_template_step_sort = TABLE_UNITTEST_TEMPLATE_STEPS_FIELDS.FIELD_SORT;
let unittest_template_step_request_param = TABLE_UNITTEST_TEMPLATE_STEPS_FIELDS.FIELD_REQUEST_PARAM;
let unittest_template_step_request_path_variable = TABLE_UNITTEST_TEMPLATE_STEPS_FIELDS.FIELD_REQUEST_PATH_VARIABLE;
let unittest_template_step_request_head = TABLE_UNITTEST_TEMPLATE_STEPS_FIELDS.FIELD_REQUEST_HEADER;
let unittest_template_step_request_body = TABLE_UNITTEST_TEMPLATE_STEPS_FIELDS.FIELD_REQUEST_BODY;

let unittest_template_step_assert_uuid = TABLE_UNITTEST_TEMPLATE_STEP_ASSERT_FIELDS.FIELD_UUID;
let unittest_template_step_assert_title = TABLE_UNITTEST_TEMPLATE_STEP_ASSERT_FIELDS.FIELD_TITLE;
let unittest_template_step_assert_type = TABLE_UNITTEST_TEMPLATE_STEP_ASSERT_FIELDS.FIELD_TYPE;
let unittest_template_step_assert_sql = TABLE_UNITTEST_TEMPLATE_STEP_ASSERT_FIELDS.FIELD_SQL;
let unittest_template_step_assert_sql_params = TABLE_UNITTEST_TEMPLATE_STEP_ASSERT_FIELDS.FIELD_SQL_PARAMS;
let unittest_template_step_assert_left = TABLE_UNITTEST_TEMPLATE_STEP_ASSERT_FIELDS.FIELD_ASSERT_LEFT;
let unittest_template_step_assert_operator = TABLE_UNITTEST_TEMPLATE_STEP_ASSERT_FIELDS.FIELD_ASSERT_OPERATOR;
let unittest_template_step_assert_right = TABLE_UNITTEST_TEMPLATE_STEP_ASSERT_FIELDS.FIELD_ASSERT_RIGHT;

class UnittestStepContainer extends Component {

    constructor(props) {
        super(props);
        let iteratorId = props.match.params.iteratorId ? props.match.params.iteratorId : "";
        let unitTestUuid = props.match.params.unitTestUuid;
        let unitTestStepUuid = props.match.params.unitTestStepUuid;

        let cUnitTest = {};
        let method = "";
        let uri = "";
        let prj = "";
        let title = "";
        let assertLength = 1;
        let assertTitle = [null];
        let assertType = [ASSERT_TYPE_API];
        let assertUuidArr = [""]
        let assertSql = [""];
        let assertSqlParams = [[]];
        let assertPrev = [""];
        let assertOperator = [" == "];
        let assertAfter = [""];
        let sort = 0;
        let continueEnable = "1";
        let waitSeconds = 60;
        let requestParam = {};
        let jsonFlg = false;
        let requestPathVariable = {};
        let requestHead = {};
        let requestBody = {};

        let responseContent = {};
        let responseHeader = {};
        let responseCookie = {};


        let prjsSelectector = props.projects.map(_prj => ({label: _prj.label, value: _prj.value + "$$" + _prj.label}));

        if (iteratorId) {
            if (this.props.unittest[iteratorId]) {
                cUnitTest = this.getCurrentUnitTest1(props.unittest, iteratorId, unitTestUuid);

                if (!isStringEmpty(unitTestStepUuid)) {
                    let cUnitTestStep = cUnitTest.children.find(row => row[unittest_step_uuid] === unitTestStepUuid);
                    prj = cUnitTestStep[unittest_step_prj];
                    method = cUnitTestStep[unittest_step_method];
                    uri = cUnitTestStep[unittest_step_uri];
                    title = cUnitTestStep[unittest_step_title];
                    sort = cUnitTestStep[unittest_step_sort];
                    continueEnable = cUnitTestStep[unittest_step_continue] == 0 ? "0" : "" +cUnitTestStep[unittest_step_continue];
                    waitSeconds = cUnitTestStep[unittest_step_wait_seconds];
                    jsonFlg = cUnitTestStep[iteration_request_json_flg];
                    requestParam = cUnitTestStep[unittest_step_request_param];
                    requestPathVariable = cUnitTestStep[unittest_step_request_path_variable] ? cUnitTestStep[unittest_step_request_path_variable] : {};
                    requestHead = cUnitTestStep[unittest_step_request_head];
                    requestBody = cUnitTestStep[unittest_step_request_body];
    
                    let assertList = cUnitTestStep.asserts;
                    assertLength = assertList.length;
                    if (assertLength > 0) {
                        assertTitle = [];
                        assertType = [];
                        assertUuidArr = [];
                        assertSql = [];
                        assertSqlParams = [];
                        assertPrev = [];
                        assertOperator = [];
                        assertAfter = [];
                        for (let _assert of assertList) {
                            assertUuidArr.push(_assert[unittest_step_assert_uuid]);
                            assertTitle.push(_assert[unittest_step_assert_title]);
                            assertType.push(isStringEmpty(_assert[unittest_step_assert_type]) ? ASSERT_TYPE_API : _assert[unittest_step_assert_type]);
                            assertSql.push(isStringEmpty(_assert[unittest_step_assert_sql]) ? "" : _assert[unittest_step_assert_sql]);
                            assertSqlParams.push(_assert[unittest_step_assert_sql_params] == undefined ? [] : _assert[unittest_step_assert_sql_params]);
                            assertPrev.push(_assert[unittest_step_assert_left]);
                            assertOperator.push(_assert[unittest_step_assert_operator]);
                            assertAfter.push(_assert[unittest_step_assert_right]);
                        }
                    }
                } else {
                    sort = cUnitTest.children.length + 1
                }
            }
        } else if (!isStringEmpty(unitTestStepUuid)) {
            cUnitTest = this.getCurrentUnitTest2(props.unittest, unitTestUuid);
            let cUnitTestStep = cUnitTest.children.find(row => row[unittest_template_step_uuid] === unitTestStepUuid);
            prj = cUnitTestStep[unittest_template_step_prj];
            method = cUnitTestStep[unittest_template_step_method];
            uri = cUnitTestStep[unittest_template_step_uri];
            title = cUnitTestStep[unittest_template_step_title];
            sort = cUnitTestStep[unittest_template_step_sort];
            continueEnable = cUnitTestStep[unittest_template_step_continue] == 0 ? "0" : "" +cUnitTestStep[unittest_template_step_continue];
            waitSeconds = cUnitTestStep[unittest_template_step_wait_seconds];
            requestParam = cUnitTestStep[unittest_template_step_request_param];
            requestPathVariable = cUnitTestStep[unittest_template_step_request_path_variable] ? cUnitTestStep[unittest_template_step_request_path_variable] : {};
            requestHead = cUnitTestStep[unittest_template_step_request_head];
            requestBody = cUnitTestStep[unittest_template_step_request_body];

            let assertList = cUnitTestStep.asserts;
            assertLength = assertList.length;
            if (assertLength > 0) {
                assertTitle = [];
                assertType = [];
                assertUuidArr = [];
                assertSql = [];
                assertSqlParams = [];
                assertPrev = [];
                assertOperator = [];
                assertAfter = [];
                for (let _assert of assertList) {
                    assertUuidArr.push(_assert[unittest_template_step_assert_uuid]);
                    assertTitle.push(_assert[unittest_template_step_assert_title]);
                    assertType.push(isStringEmpty(_assert[unittest_template_step_assert_type]) ? ASSERT_TYPE_API : _assert[unittest_template_step_assert_type]);
                    assertSql.push(isStringEmpty(_assert[unittest_template_step_assert_sql]) ? "" : _assert[unittest_template_step_assert_sql]);
                    assertSqlParams.push(_assert[unittest_template_step_assert_sql_params] == undefined ? [] : _assert[unittest_template_step_assert_sql_params]);
                    assertPrev.push(_assert[unittest_template_step_assert_left]);
                    assertOperator.push(_assert[unittest_template_step_assert_operator]);
                    assertAfter.push(_assert[unittest_template_step_assert_right]);
                }
            }
        }

        this.state = {
            fakeIterator: iteratorId,
            iteratorId,
            unitTestUuid,
            unitTestStepUuid,
            unitTest: cUnitTest,
            prjsSelectector,
            urisSelector: [],
            requests: [],
            request: {},
            formRequestHeadData: {},
            requestHead,
            formRequestBodyData: {},
            requestBody,
            formRequestParamData: {},
            requestParam,
            formRequestPathVariableData: {},
            requestPathVariable,
            prj,
            method,
            uri,
            title,
            tips: [],
            responseContent,
            responseHeader,
            responseCookie,
            continueEnable,
            waitSeconds,
            sort,
            jsonFlg,
            paramTips: [],
            assertTitle,
            assertType,
            assertSql,
            assertSqlParams,
            assertSqlParamsTable: this.buildAssertSqlParamsTable(assertSqlParams),
            assertPrev,
            assertOperator,
            assertAfter,
            assertLength,
            assertUuidArr,
            sqlParamColumns: [
                {
                    title: langTrans("network table1"),
                    dataIndex: TABLE_FIELD_NAME,
                },
                {
                    title: langTrans("network table4"),
                    dataIndex: TABLE_FIELD_VALUE,
                    render: (data, row) => {
                        if (this.state.iteratorId || this.state.fakeIterator) {
                            let [i, j] = row.key.split("_");
                            return (
                                <StepExpressionBuilderBox
                                    enableFlag={Object.keys(this.state.request).length > 0}
                                    stepPathVariableData={this.state.formRequestPathVariableData}
                                    stepHeaderData={this.state.formRequestHeadData}
                                    stepBodyData={this.state.formRequestBodyData}
                                    stepParamData={this.state.formRequestParamData}
                                    stepResponseContentData={this.state.responseContent}
                                    stepResponseHeaderData={this.state.responseHeader}
                                    stepResponseCookieData={this.state.responseCookie}
                                    value={data}
                                    cb={value => {
                                        let assertSqlParams = this.state.assertSqlParams[i];
                                        assertSqlParams[j] = value;
                                        let assertSqlParamsRow = this.state.assertSqlParamsTable[i];
                                        assertSqlParamsRow[j][TABLE_FIELD_VALUE] = value
                                        this.setState({
                                            assertSqlParams: cloneDeep(this.state.assertSqlParams),
                                            assertSqlParamsTable: cloneDeep(this.state.assertSqlParamsTable)
                                        });
                                    }}
                                    width={ 288 }
                                    sourceId={ "7" }
                                    iteratorId={ this.state.iteratorId}
                                    fakeIterator={ this.state.fakeIterator}
                                    unitTestUuid={ this.state.unitTestUuid}
                                    unitTestStepUuid={ this.state.unitTestStepUuid}
                                    project={ this.state.prj}
                                />
                            );
                        } else {
                            return null;
                        }
                    }
                },
            ],
        }
        this.requestSendTip = new RequestSendTips();
        if (!isStringEmpty(prj)) {
            this.requestSendTip.init("iterator", prj, iteratorId, "", props.clientType);
        }
    }

    async componentDidMount() {
        if (this.state.iteratorId && !this.props.unittest[this.state.iteratorId]) {
            await getIterationUnitTests(this.props.clientType, this.state.iteratorId, null, null, this.props.dispatch);
        }
        if (!this.state.iteratorId && !this.props.unittest["__template__"]) {
            await getUnitTests(this.props.clientType, this.props.dispatch);
        }
        if (!isStringEmpty(this.state.unitTestStepUuid)) {
            this.initMethodUri2(this.state.method, this.state.uri);
        }
    }

    getCurrentUnitTest1 = (unitTest, iteratorId, unitTestUuid) => {
        let cUnitTest = null;
        for (let _unitTest of unitTest[iteratorId]) {
            if (_unitTest[unittest_uuid] === unitTestUuid) {
                cUnitTest = _unitTest;
                break;
            }
        }
        return cUnitTest;
    }

    getCurrentUnitTest2 = (unitTest, unitTestUuid) => {
        let cUnitTest = null;
        for (let _unitTest of unitTest["__template__"]) {
            if (_unitTest[unittest_template_uuid] === unitTestUuid) {
                cUnitTest = _unitTest;
                break;
            }
        }
        return cUnitTest;
    }

    handleRequestUri = value => {
        let arr = value.split("$$");
        let method = arr[0];
        let uri = arr[1];
        this.setState({
            uri: value,
            request: {}, 
            method: "", 
            formRequestHeadData:{}, 
            formRequestBodyData:{}, 
            formRequestParamData:{}, 
            formRequestPathVariableData:{},
            requestHead:{}, 
            requestBody:{}, 
            requestParam:{}, 
            requestPathVariable:{},
            assertLength:1,
            title: "", 
            responseContent:{}, 
            responseHeader:{}, 
            responseCookie:{},
            jsonFlg: false,
            paramTips: []
        }, ()=>{
            this.initMethodUri(method, uri);
        })
    }

    initMethodUri2 = async (method, uri) => {
        let fakeIterator = this.state.iteratorId;
        let prj = this.state.prj.includes("$$") ? this.state.prj.split("$$")[0] : this.state.prj;
        let request;
        if (isStringEmpty(this.state.iteratorId)) {
            request = await getProjectRequest(this.props.clientType, prj, method, uri);
        } else {
            request = await getVersionIteratorRequest(this.props.clientType, this.state.iteratorId, prj, method, uri);
        }
        if (request == null) {
            request = await getProjectRequest(this.props.clientType, prj, method, uri);
        }
        if (request == null) {
            fakeIterator = await getIterator(this.state.unitTestUuid);
            if (fakeIterator) {
                request = await getVersionIteratorRequest(this.props.clientType, fakeIterator, prj, method, uri);
            }
        }
        
        let formRequestHeadData = request[iteration_request_header];
        for (let _key in this.state.requestHead) {
            if (formRequestHeadData[_key] === undefined) return;
            formRequestHeadData[_key][TABLE_FIELD_VALUE] = this.state.requestHead[_key];
        }

        let formRequestBodyData = request[iteration_request_body];
        for (let _key in this.state.requestBody) {
            if (formRequestBodyData[_key] === undefined) return;
            formRequestBodyData[_key][TABLE_FIELD_VALUE] = this.state.requestBody[_key];
        }

        let formRequestParamData = request[iteration_request_param];
        for (let _key in this.state.requestParam) {
            if (formRequestParamData[_key] === undefined) return;
            formRequestParamData[_key][TABLE_FIELD_VALUE] = this.state.requestParam[_key];
        }

        let formRequestPathVariableData = request[iteration_request_path_variable];
        for (let _key in this.state.requestPathVariable) {
            if (formRequestPathVariableData[_key] === undefined) return;
            formRequestPathVariableData[_key][TABLE_FIELD_VALUE] = this.state.requestPathVariable[_key];
        }

        let responseContent = request[iteration_response_content];
        let responseHeader = request[iteration_response_header];
        let responseCookie = request[iteration_response_cookie];

        let envKeys = await this.requestSendTip.getTips();
        this.setState({ 
            fakeIterator,
            request, method, 
            formRequestHeadData, 
            formRequestBodyData, 
            formRequestParamData, 
            formRequestPathVariableData,
            responseContent, 
            responseHeader, 
            responseCookie,
            paramTips: envKeys
        });
    }

    initMethodUri = async (method, uri) => {
        let prj = this.state.prj.includes("$$") ? this.state.prj.split("$$")[0] : this.state.prj;
        let request;
        if (isStringEmpty(this.state.iteratorId)) {
            request = await getProjectRequest(this.props.clientType, prj, method, uri);
        } else {
            request = await getVersionIteratorRequest(this.props.clientType, this.state.iteratorId, prj, method, uri);
        }
        if (request == null) {
            request = await getProjectRequest(this.props.clientType, prj, method, uri);
        }
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

        let envKeys = await this.requestSendTip.getTips();
        this.setState({ 
            request, method, 
            formRequestHeadData, 
            formRequestBodyData, 
            formRequestParamData, 
            formRequestPathVariableData,
            requestHead, 
            requestBody, 
            requestParam, 
            requestPathVariable,
            assertLength,
            title, 
            responseContent, 
            responseHeader, 
            responseCookie,
            jsonFlg,
            paramTips: envKeys
        });
    }

    initPrj = (iteratorId, prj) => {
        getUnitTestRequests(
            this.props.clientType, 
            this.props.isAiSupport,
            prj, 
            iteratorId, 
            ""
        ).then(requests => {
            let urisSelector = [];
            for (let request of requests) {
                let label = request[iteration_request_title] + " | " + request[iteration_request_uri];
                let item = {};
                item.value = this.buildApiSelectValue(request[iteration_request_method], request[iteration_request_uri], label);
                item.label = label;
                urisSelector.push(item);
            }
            this.setState( {urisSelector, requests}, ()=>{
                if (!isStringEmpty(this.state.method) && !isStringEmpty(this.state.uri)) {
                    this.initMethodUri(this.state.method, this.state.uri);
                }
            } );
        });
        this.requestSendTip.init("iterator", prj, iteratorId, "", this.props.clientType);
    }

    buildApiSelectValue = (method : string, uri : string, label : string) : string => {
        return method + "$$" + uri + "$$" + label;
    }

    handleRequestProject = originPrj => {
        let prj = originPrj.split("$$")[0];
        this.setState( {urisSelector : [], prj, uri: ""} );
        this.initPrj(this.state.iteratorId, prj);
    }
    
    addAssert = () => {

        let assertTitle = cloneDeep(this.state.assertTitle);
        let assertPrev = cloneDeep(this.state.assertPrev);
        let assertType = cloneDeep(this.state.assertType);
        let assertSql = cloneDeep(this.state.assertSql);
        let assertSqlParams = cloneDeep(this.state.assertSqlParams);
        let assertOperator = cloneDeep(this.state.assertOperator);
        let assertAfter = cloneDeep(this.state.assertAfter);
        let assertLength = this.state.assertLength;
        assertTitle.push(null);
        assertType.push(ASSERT_TYPE_API);
        assertSql.push("");
        assertSqlParams.push([]);
        assertPrev.push(" ");
        assertOperator.push(" == ");
        assertAfter.push(" ");
        assertLength += 1;
        this.setState({
            assertTitle,
            assertSql,
            assertType,
            assertSqlParams,
            assertOperator,
            assertLength,
            assertPrev,
            assertAfter
        });
    }

    subAssert = () => {
        let assertPrev = cloneDeep(this.state.assertPrev);
        let assertAfter = cloneDeep(this.state.assertAfter);
        let assertLength = this.state.assertLength;
        let assertType = cloneDeep(this.state.assertType);
        let assertSql = cloneDeep(this.state.assertSql);
        let assertSqlParams = cloneDeep(this.state.assertSqlParams);
        if (assertLength > 1) {
            assertPrev.pop();
            assertAfter.pop();
            assertType.pop();
            assertSql.pop();
            assertSqlParams.pop();
            assertLength -= 1;
            this.setState({
                assertLength,
                assertType,
                assertSql,
                assertSqlParams,
                assertPrev,
                assertAfter
            });
        }
    }

    handleSqlBlur = (index: number) => {
        const assertSqlParamArr = cloneDeep(this.state.assertSqlParams);
        let assertSql = this.state.assertSql[index];
        let assertSqlParams = assertSqlParamArr[index];
        if (isStringEmpty(assertSql)) {
            assertSqlParams = [];
            assertSqlParamArr[index] = assertSqlParams;
        } else {
            assertSqlParams = Array((assertSql.match(/\?/g) || []).length).fill('');
            assertSqlParamArr[index] = assertSqlParams;
        }
        const assertSqlParamsTable = this.buildAssertSqlParamsTable(assertSqlParamArr);
        this.setState({
            assertSqlParamsTable,
            assertSqlParams: assertSqlParamArr
        });
    }

    buildAssertSqlParamsTable = (assertSqlParamArr) => {
        let list = [];
        for (let i = 0; i < assertSqlParamArr.length; i++) {
            let assertSqlParams = assertSqlParamArr[i];
            let item = [];
            if (assertSqlParams.length > 0) {
                for (let j = 0; j < assertSqlParams.length; j++) {
                    let item2 : any = {};
                    item2.key = i + "_" + j;
                    item2[TABLE_FIELD_NAME] = langFormat("unittest step db param", {
                        "index": (j + 1)
                    });
                    item2[TABLE_FIELD_VALUE] = assertSqlParams[j];
                    item.push(item2);
                }
            }
            list.push(item);
        }
        return cloneDeep(list);
    }

    getNavs() {
        return [
            {
                key: 'uri',
                label: langTrans("network tab1"),
                children: <RequestPathVariableFormTable 
                      object={this.state.formRequestPathVariableData} 
                      tips={this.state.paramTips} 
                      cb={obj=>this.setState({requestPathVariable: obj})}
                      enableFlag={Object.keys(this.state.request).length > 0}
                      stepHeaderData={this.state.formRequestHeadData}
                      stepBodyData={this.state.formRequestBodyData}
                      stepParamData={this.state.formRequestParamData}
                      stepPathVariableData={this.state.formRequestPathVariableData}
                      stepResponseContentData={this.state.responseContent}
                      stepResponseHeaderData={this.state.responseHeader}
                      stepResponseCookieData={this.state.responseCookie}
                      iteratorId={ this.state.iteratorId}
                      fakeIterator={ this.state.fakeIterator}
                      unitTestUuid={this.state.unitTestUuid}
                      unitTestStepUuid={this.state.unitTestStepUuid}
                      project={this.state.prj}
                  />,
            },
            {
              key: 'params',
              label: langTrans("network tab2"),
              children: <RequestParamFormTable 
                    object={this.state.formRequestParamData} 
                    tips={this.state.paramTips} 
                    cb={obj=>this.setState({requestParam: obj})}
                    enableFlag={Object.keys(this.state.request).length > 0}
                    stepHeaderData={this.state.formRequestHeadData}
                    stepBodyData={this.state.formRequestBodyData}
                    stepParamData={this.state.formRequestParamData}
                    stepPathVariableData={this.state.formRequestPathVariableData}
                    stepResponseContentData={this.state.responseContent}
                    stepResponseHeaderData={this.state.responseHeader}
                    stepResponseCookieData={this.state.responseCookie}
                    iteratorId={ this.state.iteratorId}
                    fakeIterator={ this.state.fakeIterator}
                    unitTestUuid={this.state.unitTestUuid}
                    unitTestStepUuid={this.state.unitTestStepUuid}
                    project={this.state.prj}
                />,
            },
            {
              key: 'headers',
              label: langTrans("network tab3"),
              children: <RequestHeadFormTable 
                    object={this.state.formRequestHeadData} 
                    tips={this.state.paramTips} 
                    cb={obj=>this.setState({requestHead: obj})} 
                    enableFlag={Object.keys(this.state.request).length > 0}
                    stepHeaderData={this.state.formRequestHeadData}
                    stepBodyData={this.state.formRequestBodyData}
                    stepParamData={this.state.formRequestParamData}
                    stepPathVariableData={this.state.formRequestPathVariableData}
                    stepResponseContentData={this.state.responseContent}
                    stepResponseHeaderData={this.state.responseHeader}
                    stepResponseCookieData={this.state.responseCookie}
                    iteratorId={ this.state.iteratorId}
                    fakeIterator={ this.state.fakeIterator}
                    unitTestUuid={this.state.unitTestUuid}
                    unitTestStepUuid={this.state.unitTestStepUuid}
                    project={this.state.prj}
                />,
            },
            {
              key: 'body',
              label: langTrans("network tab4"),
              children: <RequestBodyFormTable 
                    object={this.state.formRequestBodyData} 
                    tips={this.state.paramTips} 
                    cb={obj=>this.setState({requestBody: obj})} 
                    enableFlag={Object.keys(this.state.request).length > 0}
                    stepHeaderData={this.state.formRequestHeadData}
                    stepBodyData={this.state.formRequestBodyData}
                    stepParamData={this.state.formRequestParamData}
                    stepPathVariableData={this.state.formRequestPathVariableData}
                    stepResponseContentData={this.state.responseContent}
                    stepResponseHeaderData={this.state.responseHeader}
                    stepResponseCookieData={this.state.responseCookie}
                    iteratorId={ this.state.iteratorId}
                    fakeIterator={ this.state.fakeIterator}
                    unitTestUuid={this.state.unitTestUuid}
                    unitTestStepUuid={this.state.unitTestStepUuid}
                    project={this.state.prj}
                />,
            },
        ];
    }

    onFinish = (values) => {
        if (isStringEmpty(this.state.uri)) {
            message.error(langTrans("step add check1"));
            return;
        }
        if (isStringEmpty(this.state.title)) {
            message.error(langTrans("step add check2"));
            return;
        }
        if (this.state.sort <= 0) {
            message.error(langTrans("step add check3"));
            return;
        }
        if (this.state.waitSeconds < 0) {
            message.error(langTrans("step add check4"));
            return;
        }
        let assertLength = this.state.assertLength;
        for (let i = 0; i < assertLength; i++) {
            if (isStringEmpty(this.state.assertTitle[i])) {
                message.error(langTrans("step add check5"));
                return;
            }

            if (isStringEmpty(this.state.assertPrev[i])) {
                message.error(langTrans("step add check6"));
                return;
            }

            if (isStringEmpty(this.state.assertOperator[i])) {
                message.error(langTrans("step add check7"));
                return;
            }

            if (isStringEmpty(this.state.assertAfter[i])) {
                message.error(langTrans("step add check8"));
                return;
            }
        }
        let prj = this.state.prj.includes("$$") ? this.state.prj.split("$$")[0] : this.state.prj;
        let uri = this.state.uri.includes("$$") ? this.state.uri.split("$$")[1] : this.state.uri;
        if (isStringEmpty(this.state.iteratorId)) {
            editUnitTestTemplateStep(
                this.state.unitTestUuid,this.state.unitTestStepUuid, 
                this.state.title,
                this.state.requestHead, this.state.requestParam, this.state.requestPathVariable, this.state.requestBody,
                this.state.assertTitle, 
                this.state.assertType, this.state.assertSql, this.state.assertSqlParams,
                this.state.assertPrev, this.state.assertOperator, this.state.assertAfter,
                this.state.sort, this.state.continueEnable, this.state.waitSeconds
            );
        } else {
            if (isStringEmpty(this.state.unitTestStepUuid)) {
                addUnitTestStep(
                    this.props.clientType,
                    this.state.iteratorId, this.state.unitTestUuid,
                    this.state.title, prj, this.state.method, uri,
                    this.state.requestHead, this.state.requestParam, this.state.requestPathVariable, this.state.requestBody,
                    this.state.assertTitle, 
                    this.state.assertType, this.state.assertSql, this.state.assertSqlParams,
                    this.state.assertPrev, this.state.assertOperator, this.state.assertAfter,
                    this.state.sort, this.state.continueEnable, this.state.waitSeconds
                );
            } else {
                editUnitTestStep(
                    this.state.iteratorId, this.state.unitTestUuid,this.state.unitTestStepUuid, 
                    this.state.title,
                    this.state.requestHead, this.state.requestParam, this.state.requestPathVariable, this.state.requestBody,
                    this.state.assertTitle, 
                    this.state.assertType, this.state.assertSql, this.state.assertSqlParams,
                    this.state.assertPrev, this.state.assertOperator, this.state.assertAfter,
                    this.state.sort, this.state.continueEnable, this.state.waitSeconds
                );
            }
        }
    }

    render() : ReactNode {
        return (
            <Layout>
                <Header style={{ padding: 0 }}>
                    {langTrans("step add title")}
                </Header>
                <Content style={{ padding: '0 16px' }}>
                    <Breadcrumb style={{ margin: '16px 0' }} items={[
                        { title: langTrans("step add title") },
                        { title: <a href={ '#/version_iterator_tests/' + this.state.iteratorId }>{ this.state.unitTest[unittest_title] }</a > }, 
                        { title: isStringEmpty(this.state.unitTestStepUuid) ? langTrans("step bread add") : langTrans("step bread edit") }
                    ]} />
                    <div
                        style={{
                            padding: 24,
                            minHeight: 360,
                        }}
                    >
                        <Form
                            style={{ maxWidth: 700 }}
                            labelCol={{ span: 4 }} 
                            wrapperCol={{ span: 20 }}
                            onFinish={this.onFinish}
                            autoComplete="off"
                        >
                            <Form.Item
                                label={langTrans("step add form1")}
                            >
                                <Space size="middle" wrap>
                                    <Select
                                        showSearch={ true }
                                        disabled={!isStringEmpty(this.state.unitTestStepUuid)}
                                        value={this.state.prj}
                                        style={{ width: 174 }}
                                        options={ this.state.prjsSelectector }
                                        onChange={ this.handleRequestProject }
                                    />
                                    <Select showSearch
                                        disabled={!isStringEmpty(this.state.unitTestStepUuid)}
                                        value={this.state.uri}
                                        style={{ width: 328 }}
                                        options={ this.state.urisSelector }
                                        onChange={ this.handleRequestUri }
                                    />
                                </Space>
                            </Form.Item>
                            <Form.Item
                                label={langTrans("step add form2")}
                            >
                                <Input value={this.state.title} onChange={event=>this.setState({title: event.target.value})} />
                            </Form.Item>

                            <Form.Item
                                label={langTrans("step add form3")}
                            >
                                <Space size="middle" wrap>
                                    <Select
                                        value={this.state.continueEnable}
                                        style={{ width: 174 }}
                                        onChange={ value => this.setState({continueEnable: value}) }
                                    >
                                        <Select.Option value="2">{langTrans("step add triggle1")}</Select.Option>
                                        <Select.Option value="1">{langTrans("step add triggle2")}</Select.Option>
                                        <Select.Option value="0">{langTrans("step add triggle3")}</Select.Option>
                                    </Select>
                                    {this.state.continueEnable === "2" ? <InputNumber addonBefore={langTrans("step add triggle4")} addonAfter={langTrans("step add triggle5")} min={1} value={this.state.waitSeconds} onChange={waitSeconds=>this.setState({waitSeconds})} /> : null}
                                </Space>
                            </Form.Item>
                            <Form.Item
                                label={langTrans("step add form4")}
                            >
                                <InputNumber value={this.state.sort} onChange={sort=>this.setState({sort})} />
                            </Form.Item>
                            {(Object.keys(this.state.request).length > 0 && (this.state.iteratorId || this.state.fakeIterator)) ? 
                            <Tabs defaultActiveKey={ this.state.method === REQUEST_METHOD_POST ? "body" : "param" } items={ this.getNavs() } /> 
                            : null}
                            {this.state.assertLength > 0 &&
                            <>
                                <Divider>
                                    <Space size={"middle"}>
                                        <Button shape="circle" onClick={this.addAssert} icon={<PlusOutlined />} />
                                        {langTrans("step add assert title")}
                                        <Button shape="circle" onClick={this.subAssert} icon={<MinusOutlined />} />
                                    </Space>
                                </Divider>
                                {Array.from({ length: this.state.assertLength }, (_, i) => (
                                <Form.Item key={i}
                                    label={langTrans("step add assert title") + (i+1)}
                                    style={{marginTop: 24}}
                                >
                                    <Space direction='vertical' size={"middle"}>
                                        <Input 
                                            placeholder={langTrans("step add assert tip1")}
                                            style={{width: 500}}
                                            value={this.state.assertTitle[i]} onChange={event => {
                                                let assertTitle = cloneDeep(this.state.assertTitle);
                                                assertTitle[i] = event.target.value;
                                                this.setState({assertTitle});
                                            }} 
                                        />
                                        <Select
                                            value={this.state.assertType[i]}
                                            style={{width: 500}}
                                            onChange={ value => {
                                                let assertType = cloneDeep(this.state.assertType);
                                                assertType[i] = value;
                                                this.setState({assertType});
                                            } }
                                        >
                                            <Select.Option value={ASSERT_TYPE_API}>{ langTrans("unittest step db type1") }</Select.Option>
                                            <Select.Option value={ASSERT_TYPE_DB}>{ langTrans("unittest step db type2") }</Select.Option>
                                        </Select>

                                    { this.state.assertType[i] === ASSERT_TYPE_DB && <>
                                        <TextArea 
                                            placeholder={ langTrans("unittest step db sql") }
                                            value={this.state.assertSql[i]}
                                            onChange={event => {
                                                let assertSql = cloneDeep(this.state.assertSql);
                                                assertSql[i] = event.target.value;
                                                this.setState({assertSql});
                                            }}
                                            onBlur={event => this.handleSqlBlur(i)}
                                            style={{width: 500}}
                                        /> 
                                        <Table
                                            style={{width : "100%"}}
                                            columns={this.state.sqlParamColumns}
                                            dataSource={this.state.assertSqlParamsTable[i]}
                                            pagination={ false }
                                        />
                                        <>
                                            {(isStringEmpty(this.state.unitTestStepUuid) || !isStringEmpty(this.state.assertPrev[i])) && 
                                            <Input value={this.state.assertPrev[i]} onChange={event => {
                                                let assertPrev = cloneDeep(this.state.assertPrev);
                                                assertPrev[i] = event.target.value;
                                                this.setState({assertPrev});
                                            }} />
                                            }
                                            <Select 
                                                style={{width: 75}}
                                                value={ this.state.assertOperator[i] }
                                                onChange={ value => {
                                                    let assertOperator = cloneDeep(this.state.assertOperator);
                                                    assertOperator[i] = value;
                                                    this.setState({assertOperator});
                                                } }>
                                                <Select.Option value={ " == " }>==</Select.Option>
                                                <Select.Option value={ " !== " }>!==</Select.Option>
                                            </Select>
                                            {(isStringEmpty(this.state.unitTestStepUuid) || !isStringEmpty(this.state.assertAfter[i])) && (this.state.iteratorId || this.state.fakeIterator) && 
                                            <StepExpressionBuilderBox
                                                enableFlag={Object.keys(this.state.request).length > 0}
                                                stepHeaderData={this.state.formRequestHeadData}
                                                stepBodyData={this.state.formRequestBodyData}
                                                stepParamData={this.state.formRequestParamData}
                                                stepPathVariableData={this.state.formRequestPathVariableData}
                                                stepResponseContentData={this.state.responseContent}
                                                stepResponseHeaderData={this.state.responseHeader}
                                                stepResponseCookieData={this.state.responseCookie}
                                                value={this.state.assertAfter[i]}
                                                cb={text => {
                                                    let assertAfter = cloneDeep(this.state.assertAfter);
                                                    assertAfter[i] = text;
                                                    this.setState({assertAfter});
                                                }}
                                                width={500}
                                                sourceId={ "8" }
                                                iteratorId={ this.state.iteratorId}
                                                fakeIterator={ this.state.fakeIterator}
                                                unitTestUuid={this.state.unitTestUuid}
                                                unitTestStepUuid={this.state.unitTestStepUuid}
                                                project={this.state.prj}
                                            />
                                            }
                                        </>
                                    </>}
                                    { this.state.assertType[i] == ASSERT_TYPE_API && <>
                                        {
                                        (isStringEmpty(this.state.unitTestStepUuid) || !isStringEmpty(this.state.assertPrev[i])) 
                                        && 
                                        (this.state.iteratorId || this.state.fakeIterator) && this.state.prj && 
                                        <StepExpressionBuilderBox
                                            enableFlag={Object.keys(this.state.request).length > 0}
                                            stepHeaderData={this.state.formRequestHeadData}
                                            stepBodyData={this.state.formRequestBodyData}
                                            stepParamData={this.state.formRequestParamData}
                                            stepPathVariableData={this.state.formRequestPathVariableData}
                                            stepResponseContentData={this.state.responseContent}
                                            stepResponseHeaderData={this.state.responseHeader}
                                            stepResponseCookieData={this.state.responseCookie}
                                            value={this.state.assertPrev[i]}
                                            cb={text => {
                                                let assertPrev = cloneDeep(this.state.assertPrev);
                                                assertPrev[i] = text;
                                                this.setState({assertPrev});
                                            }}
                                            width={500}
                                            sourceId={ "9" }
                                            iteratorId={ this.state.iteratorId}
                                            fakeIterator={ this.state.fakeIterator}
                                            unitTestUuid={this.state.unitTestUuid}
                                            unitTestStepUuid={this.state.unitTestStepUuid}
                                            project={this.state.prj}
                                        />
                                        }
                                        <Select 
                                            style={{width: 75}}
                                            value={ this.state.assertOperator[i] }
                                            onChange={ value => {
                                                let assertOperator = cloneDeep(this.state.assertOperator);
                                                assertOperator[i] = value;
                                                this.setState({assertOperator});
                                            } }>
                                            <Select.Option value={ " == " }>==</Select.Option>
                                            <Select.Option value={ " !== " }>!==</Select.Option>
                                        </Select>
                                        {(isStringEmpty(this.state.unitTestStepUuid) || !isStringEmpty(this.state.assertAfter[i])) && (this.state.iteratorId || this.state.fakeIterator) && this.state.prj && 
                                        <StepExpressionBuilderBox
                                            enableFlag={Object.keys(this.state.request).length > 0}
                                            stepHeaderData={this.state.formRequestHeadData}
                                            stepBodyData={this.state.formRequestBodyData}
                                            stepParamData={this.state.formRequestParamData}
                                            stepPathVariableData={this.state.formRequestPathVariableData}
                                            stepResponseContentData={this.state.responseContent}
                                            stepResponseHeaderData={this.state.responseHeader}
                                            stepResponseCookieData={this.state.responseCookie}
                                            value={this.state.assertAfter[i]}
                                            cb={text => {
                                                let assertAfter = cloneDeep(this.state.assertAfter);
                                                assertAfter[i] = text;
                                                this.setState({assertAfter});
                                            }}
                                            width={500}
                                            sourceId={ "10" }
                                            iteratorId={ this.state.iteratorId}
                                            fakeIterator={ this.state.fakeIterator}
                                            unitTestUuid={this.state.unitTestUuid}
                                            unitTestStepUuid={this.state.unitTestStepUuid}
                                            project={this.state.prj}
                                        />
                                        }
                                    </> }
                                    </Space>
                                </Form.Item>
                                ))}
                            </>
                            }
                            <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
                                <Button type="primary" htmlType="submit">
                                    {isStringEmpty(this.state.unitTestStepUuid) ? langTrans("step btn add") : langTrans("step btn edit")}
                                </Button>
                            </Form.Item>
                        </Form>
                    </div>
                </Content>
                <Footer style={{ textAlign: 'center' }}>
                ApiChain ©{new Date().getFullYear()} Created by Mustafa Fang
                </Footer>
            </Layout>
        )
    }

}

function mapStateToProps (state) {
    return {
        device : state.device,
        unittest: state.unittest.list,
        projects: state.prj.list,
        teamId: state.device.teamId,
        clientType: state.device.clientType,
        isAiSupport: state.device.isAiSupport
    }
}
      
export default connect(mapStateToProps)(UnittestStepContainer);