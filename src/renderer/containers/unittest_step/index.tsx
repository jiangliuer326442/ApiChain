import { Component, ReactNode } from 'react';
import { connect } from 'react-redux';
import { 
    Layout, Breadcrumb, Form, Select, Space, 
    Tabs, Input, InputNumber, Divider,
    Button, message
} from 'antd';
import { PlusOutlined, MinusOutlined } from '@ant-design/icons';
import { cloneDeep } from 'lodash';

import { 
    TABLE_FIELD_VALUE,
    buildJsonString
} from '@rutil/json';
import { isStringEmpty } from '@rutil/index';
import {
    REQUEST_METHOD_POST,
} from '@conf/global_config';
import {
    TABLE_UNITTEST_FIELDS,
    TABLE_VERSION_ITERATION_REQUEST_FIELDS,
    TABLE_UNITTEST_STEPS_FIELDS,
    TABLE_UNITTEST_STEP_ASSERT_FIELDS,
} from '@conf/db';
import RequestSendTips from '@clazz/RequestSendTips';
import { getUnitTestRequests, getVersionIteratorRequest } from '@act/version_iterator_requests';
import { getProjectRequest } from '@act/project_request';
import { 
    getIterationUnitTests,
    addUnitTestStep,
    editUnitTestStep,
    getUnitTestStepAsserts,
} from '@act/unittest';
import RequestPathVariableFormTable from "@comp/unittest_step/request_path_variable_form_table";
import RequestParamFormTable from "@comp/unittest_step/request_param_form_table";
import RequestHeadFormTable from "@comp/unittest_step/request_head_form_table";
import RequestBodyFormTable from "@comp/unittest_step/request_body_form_table";
import StepExpressionBuilderBox from "@comp/unittest_step/step_expression_builder_box";
import { langTrans } from '@lang/i18n';

const { Header, Content, Footer } = Layout;

let unittest_uuid = TABLE_UNITTEST_FIELDS.FIELD_UUID;
let unittest_title = TABLE_UNITTEST_FIELDS.FIELD_TITLE;

let iteration_request_iteration_uuid = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_ITERATOR_UUID;
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
let unittest_step_assert_left = TABLE_UNITTEST_STEP_ASSERT_FIELDS.FIELD_ASSERT_LEFT;
let unittest_step_assert_operator = TABLE_UNITTEST_STEP_ASSERT_FIELDS.FIELD_ASSERT_OPERATOR;
let unittest_step_assert_right = TABLE_UNITTEST_STEP_ASSERT_FIELDS.FIELD_ASSERT_RIGHT;

class UnittestStepContainer extends Component {

    constructor(props) {
        super(props);
        let iteratorId = props.match.params.iteratorId;
        let unitTestUuid = props.match.params.unitTestUuid;
        let unitTestStepUuid = props.match.params.unitTestStepUuid;

        let cUnitTest = {};
        let method = "";
        let uri = "";
        let prj = "";
        let title = "";
        let assertLength = 1;
        let assertTitle = [null];
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

        let prjsSelectector = this.props.projects.map(_prj => ({label: _prj.label, value: _prj.value + "$$" + _prj.label}));

        if (this.props.unittest[iteratorId]) {
            for (let unitTest of this.props.unittest[iteratorId]) {
                if (unitTest[unittest_uuid] === unitTestUuid) {
                    cUnitTest = unitTest;
                }
            }

            if (!isStringEmpty(unitTestStepUuid)) {
                let cUnitTestStep = cUnitTest.children.find(row => row[unittest_step_uuid] === unitTestStepUuid);
                prj = cUnitTestStep[unittest_step_prj];
                method = cUnitTestStep[unittest_step_method];
                uri = cUnitTestStep[unittest_step_uri];
                title = cUnitTestStep[unittest_step_title];
                sort = cUnitTestStep[unittest_step_sort];
                continueEnable = cUnitTestStep[unittest_step_continue] == 0 ? "0" : cUnitTestStep[unittest_step_continue];
                waitSeconds = cUnitTestStep[unittest_step_wait_seconds];
                requestParam = cUnitTestStep[unittest_step_request_param];
                requestPathVariable = cUnitTestStep[unittest_step_request_path_variable] ? cUnitTestStep[unittest_step_request_path_variable] : {};
                requestHead = cUnitTestStep[unittest_step_request_head];
                requestBody = cUnitTestStep[unittest_step_request_body];
            } else {
                sort = cUnitTest.children.length + 1
            }
        }

        this.state = {
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
            responseContent: {},
            responseHeader: {},
            responseCookie: {},
            continueEnable,
            waitSeconds,
            sort,
            jsonFlg,
            paramTips: [],
            assertTitle,
            assertPrev,
            assertOperator,
            assertAfter,
            assertLength,
            assertUuidArr: [],
        }
        this.requestSendTip = new RequestSendTips();
        if (!isStringEmpty(prj)) {
            this.initPrj(iteratorId, prj, props.dispatch);
        }
    }

    componentDidMount(): void {
        if (!this.props.unittest[this.state.iteratorId]) {
            getIterationUnitTests(this.props.clientType, this.state.iteratorId, null, null, this.props.dispatch);
        }
        if (!isStringEmpty(this.state.unitTestStepUuid)) {
            getUnitTestStepAsserts(this.state.iteratorId, this.state.unitTestUuid, this.state.unitTestStepUuid).then(unitTestAsserts => {
                let assertLength = unitTestAsserts.length;
                let assertTitle = [];
                let assertPrev = [];
                let assertOperator = [];
                let assertAfter = [];
                let assertUuidArr = [];
                for (let _index in unitTestAsserts) {
                    let unitTestAssertItem = unitTestAsserts[_index];
                    assertUuidArr.push(unitTestAssertItem[unittest_step_assert_uuid]);
                    assertTitle.push(unitTestAssertItem[unittest_step_assert_title]);
                    assertPrev.push(unitTestAssertItem[unittest_step_assert_left]);
                    assertOperator.push(unitTestAssertItem[unittest_step_assert_operator]);
                    assertAfter.push(unitTestAssertItem[unittest_step_assert_right]);
                }
                this.setState({assertUuidArr, assertLength, assertTitle, assertPrev, assertOperator, assertAfter});
            });
        }
    }

    handleRequestUri = value => {
        let arr = value.split("$$");
        let method = arr[0];
        let uri = arr[1];
        this.initMethodUri(method, uri);
    }

    initMethodUri = async (method, uri) => {
        let request = this.state.requests.find(row => row[iteration_request_method] === method && row[iteration_request_uri] === uri);
        if (isStringEmpty(request[iteration_request_iteration_uuid])) {
            request = await getProjectRequest(this.props.clientType, this.state.prj, method, uri);
        } else {
            request = await getVersionIteratorRequest(this.props.clientType, request[iteration_request_iteration_uuid], this.state.prj, method, uri);
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

        let requestHead : any;
        if (Object.keys(this.state.requestHead).length === 0){
            requestHead = {};
            for (let _key in formRequestHeadData) {
                requestHead[_key] = formRequestHeadData[_key][TABLE_FIELD_VALUE];
            }
        } else {
            requestHead = this.state.requestHead;
            for (let _key in requestHead) {
                formRequestHeadData[_key][TABLE_FIELD_VALUE] = requestHead[_key];
            }
        }

        let requestBody : any;
        if (Object.keys(this.state.requestBody).length === 0){
            let buildJsonStringRet = await buildJsonString(formRequestBodyData);
            requestBody = buildJsonStringRet.returnObject;
        } else {
            requestBody = this.state.requestBody;
            for (let _key in requestBody) {
                if (!(_key in formRequestBodyData)) continue;
                formRequestBodyData[_key][TABLE_FIELD_VALUE] = requestBody[_key];
            }
        }

        let requestParam : any;
        if (Object.keys(this.state.requestParam).length === 0){
            requestParam = {};
            for (let _key in formRequestParamData) {
                requestParam[_key] = formRequestParamData[_key][TABLE_FIELD_VALUE];
            }
        } else {
            requestParam = this.state.requestParam;
            for (let _key in requestParam) {
                formRequestParamData[_key][TABLE_FIELD_VALUE] = requestParam[_key];
            }
        }
        let requestPathVariable : any;
        if (Object.keys(this.state.requestPathVariable).length === 0){
            requestPathVariable = {};
            for (let _key in formRequestPathVariableData) {
                requestPathVariable[_key] = formRequestPathVariableData[_key][TABLE_FIELD_VALUE];
            }
        } else {
            requestPathVariable = this.state.requestPathVariable;
            for (let _key in requestPathVariable) {
                formRequestPathVariableData[_key][TABLE_FIELD_VALUE] = requestPathVariable[_key];
            }
        }
        let responseContent = request[iteration_response_content];
        let responseHeader = request[iteration_response_header];
        let responseCookie = request[iteration_response_cookie];
        let title = request[iteration_request_title];

        let envKeys = await this.requestSendTip.getTips();
        this.setState({ 
            request, method, uri, 
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

    initPrj = (iteratorId, prj, dispatch) => {
        getUnitTestRequests(
            this.props.clientType, 
            prj, 
            iteratorId, 
            ""
        ).then(requests => {
            let urisSelector = [];
            for (let request of requests) {
                let item = {};
                item.value = this.buildApiSelectValue(request[iteration_request_method], request[iteration_request_uri]);
                item.label = request[iteration_request_title] + " | " + request[iteration_request_uri];
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

    buildApiSelectValue = (method : string, uri : string) : string => {
        return method + "$$" + uri;
    }

    handleRequestProject = originPrj => {
        let prj = originPrj.split("$$")[0];
        this.setState( {urisSelector : [], prj, uri: ""} );
        this.initPrj(this.state.iteratorId, prj, this.props.dispatch);
    }
    
    addAssert = () => {

        let assertTitle = cloneDeep(this.state.assertTitle);
        let assertPrev = cloneDeep(this.state.assertPrev);
        let assertOperator = cloneDeep(this.state.assertOperator);
        let assertAfter = cloneDeep(this.state.assertAfter);
        let assertLength = this.state.assertLength;
        assertTitle.push(null);
        assertPrev.push("占位断言左侧表达式");
        assertOperator.push(" == ");
        assertAfter.push("占位断言右侧表达式");
        assertLength += 1;
        this.setState({
            assertTitle,
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
        if (assertLength > 1) {
            assertPrev.pop();
            assertAfter.pop();
            assertLength -= 1;
            this.setState({
                assertLength,
                assertPrev,
                assertAfter
            });
        }
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
                      iteratorId={this.state.iteratorId}
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
                    iteratorId={this.state.iteratorId}
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
                    iteratorId={this.state.iteratorId}
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
                    iteratorId={this.state.iteratorId}
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
        if (isStringEmpty(this.state.unitTestStepUuid)) {
            addUnitTestStep(
                this.state.iteratorId, this.state.unitTestUuid,
                this.state.title, this.state.prj, this.state.method, this.state.uri,
                this.state.requestHead, this.state.requestParam, this.state.requestPathVariable, this.state.requestBody,
                this.state.assertTitle, this.state.assertPrev, this.state.assertOperator, this.state.assertAfter,
                this.state.sort, this.state.continueEnable, this.state.waitSeconds,
                this.props.device, ()=>{
                    this.props.history.goBack();
                }
            );
        } else {
            editUnitTestStep(this.state.unitTestStepUuid, this.state.title,
                this.state.requestHead, this.state.requestParam, this.state.requestPathVariable, this.state.requestBody,
                this.state.assertTitle, this.state.assertPrev, this.state.assertOperator, this.state.assertAfter,
                this.state.assertUuidArr, 
                this.state.sort, this.state.continueEnable, this.state.waitSeconds,
                this.props.device, ()=>{
                    this.props.history.goBack();
                }
            );
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
                            style={{ maxWidth: 600 }}
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
                                        value={this.state.method && this.state.uri ? this.buildApiSelectValue(this.state.method, this.state.uri) : null}
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
                            {Object.keys(this.state.request).length > 0 ? 
                            <Tabs defaultActiveKey={ this.state.method === REQUEST_METHOD_POST ? "body" : "param" } items={ this.getNavs() } /> 
                            : null}
                            {this.state.assertLength > 0 ? 
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
                                    <Space wrap>
                                        <Input 
                                            placeholder={langTrans("step add assert tip1")}
                                            style={{width: 500}}
                                            value={this.state.assertTitle[i]} onChange={event => {
                                                let assertTitle = cloneDeep(this.state.assertTitle);
                                                assertTitle[i] = event.target.value;
                                                this.setState({assertTitle});
                                            }} 
                                        />
                                        {(isStringEmpty(this.state.unitTestStepUuid) || !isStringEmpty(this.state.assertPrev[i])) ? 
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
                                            iteratorId={this.state.iteratorId}
                                            unitTestUuid={this.state.unitTestUuid}
                                            unitTestStepUuid={this.state.unitTestStepUuid}
                                            project={this.state.prj}
                                        />
                                        : null}
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
                                        {(isStringEmpty(this.state.unitTestStepUuid) || !isStringEmpty(this.state.assertAfter[i])) ? 
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
                                            iteratorId={this.state.iteratorId}
                                            unitTestUuid={this.state.unitTestUuid}
                                            unitTestStepUuid={this.state.unitTestStepUuid}
                                            project={this.state.prj}
                                        />
                                        : null}
                                    </Space>
                                </Form.Item>
                                ))}
                            </>
                             : null}
                            <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
                                <Button type="primary" htmlType="submit">
                                    {isStringEmpty(this.state.unitTestStepUuid) ? langTrans("step btn add") : langTrans("step btn edit")}
                                </Button>
                            </Form.Item>
                        </Form>
                    </div>
                </Content>
                <Footer style={{ textAlign: 'center' }}>
                ApiChain ©{new Date().getFullYear()} Created by 方海亮
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
    }
}
      
export default connect(mapStateToProps)(UnittestStepContainer);