import { Component, ReactNode } from 'react';
import { AutoComplete, Select, Space, Input, Button, Modal, Form } from 'antd';
import { CalculatorOutlined } from '@ant-design/icons';
import { connect } from 'react-redux';
import JsonView from 'react-json-view';
import { cloneDeep } from 'lodash';

import JsonParamTips from '@clazz/JsonParamTips';
import { cleanJson } from '@rutil/json';
import { getType } from '@rutil/index';
import { isStringEmpty } from '@rutil/index';
import {
    UNITTEST_STEP_PROJECT_CURRENT,
    UNITTEST_STEP_CURRENT,
    UNITTEST_STEP_HEADER,
    UNITTEST_STEP_BODY,
    UNITTEST_STEP_PARAM,
    UNITTEST_STEP_PATH_VARIABLE,
    UNITTEST_STEP_RESPONSE,
    UNITTEST_STEP_RESPONSE_HEADER,
    UNITTEST_STEP_RESPONSE_COOKIE,
    UNITTEST_DATASOURCE_TYPE_REF,
    UNITTEST_DATASOURCE_TYPE_ENV,
    UNITTEST_STEP_POINTED,
    UNITTEST_STEP_PROJECT_POINTED,
} from '@conf/unittest';
import { 
    TABLE_UNITTEST_FIELDS, 
    TABLE_UNITTEST_STEPS_FIELDS,
    TABLE_VERSION_ITERATION_REQUEST_FIELDS,
} from '@conf/db';
import {
    DataTypeJsonObject,
} from '@conf/global_config';
import { 
    TABLE_FIELD_TYPE, 
    retShortJsonContent,
    shortJsonContent,
    parseJsonToFilledTable
} from '@rutil/json';
import { 
    getUnitTestRequests, getVersionIteratorRequest,
} from '@act/version_iterator_requests';
import { 
    getIterationUnitTests
} from '@act/unittest';
import { getProjectRequest } from '@act/project_request';
import { langTrans } from '@lang/i18n';

let unittest_uuid = TABLE_UNITTEST_FIELDS.FIELD_UUID;
let unittest_step_uuid = TABLE_UNITTEST_STEPS_FIELDS.FIELD_UUID;
let unittest_step_prj = TABLE_UNITTEST_STEPS_FIELDS.FIELD_MICRO_SERVICE_LABEL;
let unittest_step_uri = TABLE_UNITTEST_STEPS_FIELDS.FIELD_URI;
let unittest_step_method = TABLE_UNITTEST_STEPS_FIELDS.FIELD_REQUEST_METHOD;
let unittest_step_title = TABLE_UNITTEST_STEPS_FIELDS.FIELD_TITLE;

let iteration_request_iteration_uuid = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_ITERATOR_UUID;
let iteration_request_method = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_REQUEST_METHOD;
let iteration_request_header = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_REQUEST_HEADER;
let iteration_request_param = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_REQUEST_PARAM;
let iteration_request_path_variable = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_REQUEST_PATH_VARIABLE;
let iteration_request_body = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_REQUEST_BODY;
let iteration_request_response_content = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_RESPONSE_CONTENT;
let iteration_request_response_header = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_RESPONSE_HEAD;
let iteration_request_response_cookie = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_RESPONSE_COOKIE;

class StepExpressionBuilderBox extends Component {

    private paramTips : JsonParamTips;

    constructor(props) {
        super(props);

        let content = props.value;

        this.paramTips  = new JsonParamTips(props.iteratorId, props.unitTestUuid, props.clientType);
        this.paramTips.setProject(props.project);
        this.paramTips.setContent(content);

        this.state = {
            loadeadFlg: false,
            responseTips: [],
            assertPrev: this.paramTips.getAssertPrev(),
            initializeAssertPrev: this.paramTips.getAssertPrev(),
            loaded: false,
            stepsSelect: [],
            prjSelect:[],
            dataSourceType: this.paramTips.getDataSourceType(),
            initializeDataSourceType: this.paramTips.getDataSourceType(),
            selectedStep: this.paramTips.getSelectedStep(),
            initializeSelectedStep: this.paramTips.getSelectedStep(),
            selectedProject: this.paramTips.getSelectedProject(),
            selectedDataSource: this.paramTips.getSelectedDataSource(),
            initializeSelectedDataSource: this.paramTips.getSelectedDataSource(),
            steps: [],
            dataSource: {},
            initializeValue: content,
            cbContent: content,
            openFlg: false,
        };

    }

    async componentDidMount() {
        if (!this.props.unittest[this.props.iteratorId]) {
            await getIterationUnitTests(
                this.props.clientType, 
                this.props.iteratorId, 
                null, null, this.props.dispatch
            );
            this.setState({loadeadFlg: true});
        } else {
            this.setState({loadeadFlg: true});
        }
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        if (prevState.prjSelect.length === 0 && !isStringEmpty(nextProps.project)) {
            let prjSelect = [];
            let item = {};
            item.label = langTrans("expression builder project");
            item.value = UNITTEST_STEP_PROJECT_CURRENT;
            prjSelect.push(item);
            for (let prjItem of nextProps.prjs) {
                if (prjItem.value === nextProps.project) {
                    continue;
                }
                let item = {};
                item.label = prjItem.label;
                item.value = UNITTEST_STEP_PROJECT_POINTED + prjItem.value;
                prjSelect.push(item);
            }
            return { prjSelect };
        }
        if (prevState.stepsSelect.length === 0 && prevState.loadeadFlg) {
            let stepsSelect = [];
            let item = {};
            item.label = langTrans("expression builder step");
            item.value = UNITTEST_STEP_CURRENT;
            stepsSelect.push(item);
            let steps = nextProps.unittest[nextProps.iteratorId].find(row => row[unittest_uuid] === nextProps.unitTestUuid).children;
            for (let step of steps) {
                //有效的其他步骤
                if (isStringEmpty(nextProps.unitTestStepUuid) || nextProps.unitTestStepUuid !== step[unittest_step_uuid]) {
                    let item = {};
                    item.label = step[unittest_step_title];
                    item.value = UNITTEST_STEP_POINTED + step[unittest_step_uuid];
                    stepsSelect.push(item);
                }
            }
            return { stepsSelect, steps };
        }
        return { loaded : true }
    }

    componentDidUpdate() {
        if (this.state.loaded && this.state.dataSourceType === UNITTEST_DATASOURCE_TYPE_REF && Object.keys(this.state.dataSource).length === 0) {
            if (this.state.selectedStep === UNITTEST_STEP_CURRENT) {
                let selectedDataSource = this.state.selectedDataSource;
                let dataSource = {};
                if (selectedDataSource === UNITTEST_STEP_HEADER) {
                    dataSource = this.props.stepHeaderData;
                }
                if (selectedDataSource === UNITTEST_STEP_BODY) {
                    dataSource = this.props.stepBodyData;
                }
                if (selectedDataSource === UNITTEST_STEP_PARAM) {
                    dataSource = this.props.stepParamData;
                }
                if (selectedDataSource === UNITTEST_STEP_PATH_VARIABLE) {
                    dataSource = this.props.stepPathVariableData;
                }
                if (selectedDataSource === UNITTEST_STEP_RESPONSE) {
                    dataSource = this.props.stepResponseContentData;
                }
                if (selectedDataSource === UNITTEST_STEP_RESPONSE_HEADER) {
                    dataSource = this.props.stepResponseHeaderData;
                }
                if (selectedDataSource === UNITTEST_STEP_RESPONSE_COOKIE) {
                    dataSource = this.props.stepResponseCookieData;
                }
                this.handleDataSourceCallback(dataSource);
            } else {
                let selectedStepId = this.state.selectedStep.replace(UNITTEST_STEP_POINTED, "");
                let step = this.state.steps.find(row => row[unittest_step_uuid] === selectedStepId);
                if (step === undefined) return;
                getUnitTestRequests(
                    this.props.clientType, 
                    step[unittest_step_prj], 
                    this.props.iteratorId, 
                    step[unittest_step_uri]
                ).then(async requests => {
                    let request = requests.find(row => row[iteration_request_method] === step[unittest_step_method]);
                    if (isStringEmpty(request[iteration_request_iteration_uuid])) {
                        request = await getProjectRequest(this.props.clientType, step[unittest_step_prj], step[unittest_step_method], step[unittest_step_uri]);
                    } else {
                        request = await getVersionIteratorRequest(this.props.clientType, request[iteration_request_iteration_uuid], step[unittest_step_prj], step[unittest_step_method], step[unittest_step_uri]);
                    }

                    let selectedDataSource = this.state.selectedDataSource;
                    let dataSource = {};
                    if (selectedDataSource === UNITTEST_STEP_HEADER) {
                        dataSource = request[iteration_request_header];
                    }
                    if (selectedDataSource === UNITTEST_STEP_BODY) {
                        let format = request[iteration_request_body];
                        let body = cleanJson(format);
                        if (Object.keys(body).length > 0) {
                            for (let _key in body) {
                                let isJsonString = false;
                                if (format[_key][TABLE_FIELD_TYPE].toLowerCase() === DataTypeJsonObject.toLowerCase()) {
                                    isJsonString = true;
                                }

                                if (isJsonString && getType(body[_key]) === "String") {
                                    body[_key] = retShortJsonContent(JSON.parse(body[_key]));
                                }
                            }
                        }
                        let shortRequestBodyJsonObject = {};
                        shortJsonContent(shortRequestBodyJsonObject, body);
                        let formRequestBodyData = {};
                        parseJsonToFilledTable(formRequestBodyData, shortRequestBodyJsonObject, {});
                        dataSource = formRequestBodyData;
                    }
                    if (selectedDataSource === UNITTEST_STEP_PARAM) {
                        dataSource = request[iteration_request_param];
                    }
                    if (selectedDataSource === UNITTEST_STEP_PATH_VARIABLE) {
                        dataSource = request[iteration_request_path_variable];
                    }
                    if (selectedDataSource === UNITTEST_STEP_RESPONSE) {
                        dataSource = request[iteration_request_response_content];
                    }
                    if (selectedDataSource === UNITTEST_STEP_RESPONSE_HEADER) {
                        dataSource = request[iteration_request_response_header];
                    }
                    if (selectedDataSource === UNITTEST_STEP_RESPONSE_COOKIE) {
                        dataSource = request[iteration_request_response_cookie];
                    }
                    this.handleDataSourceCallback(dataSource);
                });
            }
        }
    }

    setProject = (prj: string) => {
        this.paramTips.setSelectedProject(prj);
        this.setState({selectedProject: prj, responseTips: [], assertPrev: this.state.initializeAssertPrev, dataSource: {},})
    }

    setAssertPrev = (value : string) => {
        this.setState({assertPrev: value});
    }

    setAssertOptions = (text) => {
        this.paramTips.getTips(text, responseTips => {
            this.setState({ responseTips })
        });
    }

    setSelectedAssertPrev = (text) => {
        this.setState({responseTips: [], assertPrev: text});
    }

    handleDataSourceCallback = (dataSource) => {
        if (dataSource !== undefined && Object.keys(dataSource).length > 0) {
            this.setState({dataSource})
            this.paramTips.setDataSourceJson(dataSource);
        }
    }

    handleModalConfirm = () => {
        let cbContent = "";
        if (this.state.dataSourceType === UNITTEST_DATASOURCE_TYPE_REF) {
            cbContent = "{{" + this.state.selectedStep + "." + this.state.selectedDataSource + "." + this.state.assertPrev + "}}";
        } else if (this.state.dataSourceType === UNITTEST_DATASOURCE_TYPE_ENV) {
            if (this.state.assertPrev.indexOf("{{") === 0 && this.state.assertPrev.indexOf("}}") > 0) {
                let assertPrev = cloneDeep(this.state.assertPrev);
                let realAssertPrev = assertPrev.substring(2, assertPrev.length - 2);
                if (realAssertPrev.indexOf("$") === 0 || this.state.selectedProject === UNITTEST_STEP_PROJECT_CURRENT) {
                    cbContent = "{{" + realAssertPrev + "}}";
                } else {
                    cbContent = "{{" + this.state.selectedProject + "." + realAssertPrev + "}}";
                }
            } else {
                cbContent = this.state.assertPrev;
            }
        }
        this.setState({
            dataSourceType: this.state.initializeDataSourceType,
            cbContent,
            openFlg: false,
            responseTips: [], 
            assertPrev: this.state.initializeAssertPrev, 
            dataSource: {},
        });
        this.props.cb(cbContent);
    }

    handleModalCancel = () => {
        this.setState({
            dataSourceType: this.state.initializeDataSourceType,
            cbContent: this.state.initializeValue,
            openFlg: false,
            responseTips: [], 
            assertPrev: this.state.initializeAssertPrev, 
            dataSource: {},
        });
    }

    render() : ReactNode {
        return (
            <Space wrap>
                <Input style={{width:this.props.width}} 
                    addonAfter={<Button disabled={!this.props.enableFlag} onClick={()=>this.setState({openFlg: true})} type='text' icon={<CalculatorOutlined />} />} 
                    value={this.state.cbContent} readOnly />
                <Modal
                    title={langTrans("expression builder title")}
                    open={this.state.openFlg}
                    onOk={this.handleModalConfirm}
                    onCancel={this.handleModalCancel}
                    width={500}
                >
                    <Form layout="vertical">
                        <Form.Item>
                            <Select 
                                disabled={!this.props.enableFlag}
                                style={{width: 445}}
                                placeholder={langTrans("expression builder datasource")}
                                value={ this.state.dataSourceType }
                                onChange={value => {
                                    this.setState({dataSourceType: value, responseTips: [], assertPrev: this.state.initializeAssertPrev, dataSource: {}});
                                    this.paramTips.setDataSourceType(value);
                                }}
                            >
                                <Select.Option value={ UNITTEST_DATASOURCE_TYPE_REF }>{langTrans("expression builder datasource select1")}</Select.Option>
                                <Select.Option value={ UNITTEST_DATASOURCE_TYPE_ENV }>{langTrans("expression builder datasource select2")}</Select.Option>
                            </Select>
                        </Form.Item>
                        {this.state.dataSourceType === UNITTEST_DATASOURCE_TYPE_REF ? 
                        <>
                            <Form.Item>
                                <Select 
                                    style={{width: 445}}
                                    value={ this.state.selectedStep }
                                    onChange={value => this.setState({selectedStep: value, responseTips: [], assertPrev: this.state.initializeAssertPrev, dataSource: {},})}
                                    options={ this.state.stepsSelect }
                                />
                            </Form.Item>
                            <Form.Item>
                                <Select 
                                    style={{width: 445}}
                                    value={ this.state.selectedDataSource }
                                    onChange={value => this.setState({selectedDataSource: value, responseTips: [], assertPrev: this.state.initializeAssertPrev, dataSource: {}}) }
                                >
                                    <Select.Option value={ UNITTEST_STEP_HEADER }>header</Select.Option>
                                    <Select.Option value={ UNITTEST_STEP_PATH_VARIABLE }>uri param</Select.Option>
                                    <Select.Option value={ UNITTEST_STEP_BODY }>body</Select.Option>
                                    <Select.Option value={ UNITTEST_STEP_PARAM }>param</Select.Option>
                                    <Select.Option value={ UNITTEST_STEP_RESPONSE }>responseContent</Select.Option>
                                    <Select.Option value={ UNITTEST_STEP_RESPONSE_HEADER }>responseHeader</Select.Option>
                                    <Select.Option value={ UNITTEST_STEP_RESPONSE_COOKIE }>responseCookie</Select.Option>
                                </Select>
                            </Form.Item>
                        </>
                        : null}
                        {this.state.dataSourceType === UNITTEST_DATASOURCE_TYPE_ENV ? 
                        <Form.Item>
                            <Select 
                                style={{width: 445}}
                                value={ this.state.selectedProject }
                                onChange={ this.setProject }
                                options={ this.state.prjSelect }
                            />
                        </Form.Item>
                        : null}
                        <Form.Item>
                            <AutoComplete 
                                placeholder={langTrans("expression builder syntax")}
                                disabled={!this.props.enableFlag}
                                style={{width: 445}}
                                allowClear 
                                value={ this.state.assertPrev }
                                onSearch={this.setAssertOptions}
                                options={ this.state.responseTips }
                                onChange={ this.setAssertPrev }
                                onSelect={this.setSelectedAssertPrev}
                            />
                        </Form.Item>
                        <Form.Item
                                label={langTrans("expression builder demo")}
                            >
                            <JsonView 
                                src={cleanJson(this.state.dataSource)}   
                                name={ false }
                                theme={ "bright" }
                                collapsed={false}  
                                indentWidth={4}  
                                iconStyle="triangle"
                                enableClipboard={true}
                                displayObjectSize={false}
                                displayDataTypes={false}
                                sortKeys={true}
                                collapseStringsAfterLength={40}  />
                        </Form.Item>
                    </Form>
                </Modal>
            </Space>
        )
    }
}

function mapStateToProps (state) {
    return {
        unittest: state.unittest.list,
        prjs: state.prj.list,
        teamId: state.device.teamId,
        clientType: state.device.clientType,
    }
}
      
export default connect(mapStateToProps)(StepExpressionBuilderBox);