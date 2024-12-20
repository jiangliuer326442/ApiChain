import { Component, ReactNode } from 'react';
import { connect } from 'react-redux';
import { Descriptions, Breadcrumb, Flex, Layout, Tabs, Form, message, Button, Input, Divider, Select } from "antd";
import { cloneDeep } from 'lodash';
import { decode, encode } from 'base-64';
import JsonView from 'react-json-view';

import {
    isStringEmpty, getdayjs
} from '../../util';
import {
    TABLE_FIELD_NAME,
    TABLE_FIELD_TYPE,
    TABLE_FIELD_VALUE,
    TABLE_FIELD_TYPE_REF,
    genHash,
} from '../../util/json';
import { ENV_VALUE_API_HOST } from "../../../config/envKeys";
import { 
    TABLE_VERSION_ITERATION_FIELDS,
    TABLE_VERSION_ITERATION_REQUEST_FIELDS,
    TABLE_MICRO_SERVICE_FIELDS,
    TABLE_PROJECT_REQUEST_FIELDS,
    UNAME
} from '../../../config/db';
import {
    REQUEST_METHOD_GET,
    REQUEST_METHOD_POST,
} from '../../../config/global_config';
import { getPrjs } from '../../actions/project';
import { addJsonFragement } from '../../actions/request_save';
import { 
    addVersionIteratorFolder,
    getVersionIteratorFolders 
} from '../../actions/version_iterator_folders';
import { editVersionIteratorRequest, getVersionIteratorRequest } from '../../actions/version_iterator_requests';
import { editProjectRequest, getProjectRequest } from '../../actions/project_request';
import JsonSaveTableComponent from "../../components/request_save/json_save_table";

const { TextArea } = Input;
const { Header, Content, Footer } = Layout;

let version_iterator_uuid = TABLE_VERSION_ITERATION_FIELDS.FIELD_UUID;
let version_iterator_name = TABLE_VERSION_ITERATION_FIELDS.FIELD_NAME;

let iteration_request_jsonFlg = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_JSONFLG;
let iteration_request_htmlFlg = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_HTMLFLG;
let iteration_request_picFlg = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_PICFLG;
let iteration_request_fileFlg = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_FILEFLG;
let iteration_request_header = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_REQUEST_HEADER;
let iteration_request_body = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_REQUEST_BODY;
let iteration_request_param = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_REQUEST_PARAM;
let iteration_request_path_variable = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_REQUEST_PATH_VARIABLE;
let iteration_request_fold = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_FOLD;
let iteration_response_content = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_RESPONSE_CONTENT;
let iteration_response_head = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_RESPONSE_HEAD;
let iteration_response_cookie = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_RESPONSE_COOKIE;
let iteration_request_title = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_TITLE;
let iteration_request_desc = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_DESC;
let iteration_request_iteration_uuid = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_ITERATOR_UUID;
let iteration_request_iteration_ctime = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_CTIME;
let iteration_response_demo = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_RESPONSE_DEMO;

let project_request_title = TABLE_PROJECT_REQUEST_FIELDS.FIELD_TITLE;
let project_request_desc = TABLE_PROJECT_REQUEST_FIELDS.FIELD_DESC;
let project_request_fold = TABLE_PROJECT_REQUEST_FIELDS.FIELD_FOLD;
let project_request_header = TABLE_PROJECT_REQUEST_FIELDS.FIELD_REQUEST_HEADER;
let project_request_body = TABLE_PROJECT_REQUEST_FIELDS.FIELD_REQUEST_BODY;
let project_request_param = TABLE_PROJECT_REQUEST_FIELDS.FIELD_REQUEST_PARAM;
let project_request_path_variable = TABLE_PROJECT_REQUEST_FIELDS.FIELD_REQUEST_PATH_VARIABLE;
let project_request_response_content = TABLE_PROJECT_REQUEST_FIELDS.FIELD_RESPONSE_CONTENT;
let project_request_response_head = TABLE_PROJECT_REQUEST_FIELDS.FIELD_RESPONSE_HEAD;
let project_request_response_cookie = TABLE_PROJECT_REQUEST_FIELDS.FIELD_RESPONSE_COOKIE;
let project_request_response_demo = TABLE_PROJECT_REQUEST_FIELDS.FIELD_RESPONSE_DEMO;
let project_request_jsonFlg = TABLE_PROJECT_REQUEST_FIELDS.FIELD_JSONFLG;
let project_request_htmlFlg = TABLE_PROJECT_REQUEST_FIELDS.FIELD_HTMLFLG;
let project_request_picFlg = TABLE_PROJECT_REQUEST_FIELDS.FIELD_PICFLG;
let project_request_fileFlg = TABLE_PROJECT_REQUEST_FIELDS.FIELD_FILEFLG;
let project_request_ctime = TABLE_PROJECT_REQUEST_FIELDS.FIELD_CTIME;

let prj_label = TABLE_MICRO_SERVICE_FIELDS.FIELD_LABEL;
let prj_remark = TABLE_MICRO_SERVICE_FIELDS.FIELD_REMARK;

class RequestSaveContainer extends Component {

    constructor(props) {
        super(props);
        this.state = {
            prj : props.match.params.prj,
            title : "",
            description: "",
            requestHost: "",
            initRequestUri: decode(props.match.params.uri),
            initRequestMethod: props.match.params.method,
            requestUri: decode(props.match.params.uri),
            requestMethod: props.match.params.method,
            responseDemo: "",
            formResponseData: {},
            formResponseHeadData: {},
            formResponseCookieData: {},
            isResponseJson: false,
            isResponseHtml: false,
            isResponsePic: false,
            isResponseFile: false,
            formRequestHeadData: {},
            formRequestBodyData: {},
            formRequestParamData: {},
            formRequestPathVariableData: {},
            stopFlg : true,
            showFlg : false,
            versionIterator: props.match.params.iteratorId ? props.match.params.iteratorId : "",
            selectedFolder: "",
            folderName: "",
            cname: "",
            ctime: 0,
            folders: [],
        }
    }

    async componentDidMount() {
        if(this.props.prjs.length === 0) {
            getPrjs(this.props.dispatch);
        }

        let folders = await getVersionIteratorFolders(this.state.versionIterator, this.state.prj);
        this.setState({folders})

        if (isStringEmpty(this.state.versionIterator)) {
            let record = await getProjectRequest(this.state.prj, this.state.initRequestMethod, this.state.initRequestUri);
            if (record === null) {
                return;
            }
            this.setState({
                showFlg: true,
                title: record[project_request_title],
                description: record[project_request_desc],
                selectedFolder: record[project_request_fold],
                isResponseJson: record[project_request_jsonFlg],
                isResponseHtml: record[project_request_htmlFlg],
                isResponsePic: record[project_request_picFlg],
                isResponseFile: record[project_request_fileFlg],
                formRequestHeadData: record[project_request_header],
                formRequestBodyData: record[project_request_body],
                formRequestParamData: record[project_request_param],
                formRequestPathVariableData: record[project_request_path_variable],
                formResponseData: record[project_request_response_content],
                formResponseHeadData: record[project_request_response_head],
                formResponseCookieData: record[project_request_response_cookie],
                responseDemo: record[project_request_response_demo],
                cname: record[UNAME],
                ctime: record[project_request_ctime],
            });
        } else {
            let record = await getVersionIteratorRequest(this.state.versionIterator, this.state.prj, this.state.initRequestMethod, this.state.initRequestUri);
            this.setState({
                showFlg: true,
                title: record[iteration_request_title],
                description: record[iteration_request_desc],
                versionIterator: record[iteration_request_iteration_uuid],
                selectedFolder: record[iteration_request_fold],
                isResponseJson: record[iteration_request_jsonFlg],
                isResponseHtml: record[iteration_request_htmlFlg],
                isResponsePic: record[iteration_request_picFlg],
                isResponseFile: record[iteration_request_fileFlg],
                formRequestHeadData: record[iteration_request_header],
                formRequestBodyData: record[iteration_request_body],
                formRequestParamData: record[iteration_request_param],
                formRequestPathVariableData: record[iteration_request_path_variable],
                formResponseData: record[iteration_response_content],
                formResponseHeadData: record[iteration_response_head],
                formResponseCookieData: record[iteration_response_cookie],
                responseDemo: record[iteration_response_demo],
                cname: record[UNAME],
                ctime: record[iteration_request_iteration_ctime],
            });
        }
    }

    handleSetVersionIterator = async (value) => {
        this.state.versionIterator = value;
        if (this.props.folders[this.state.versionIterator] === undefined) {
            let folders = await getVersionIteratorFolders(value, this.state.prj, folders => this.setState({folders}));
            this.setState({folders})
        }
    }

    handleCreateFolder = () => {
        addVersionIteratorFolder(this.state.versionIterator, this.state.prj, this.state.folderName, this.props.device, async () => {
            this.setState({folderName: ""});
            let folders = await getVersionIteratorFolders(this.state.versionIterator, this.state.prj);
            this.setState({folders})
        });
    }

    handleSave = async () => {
        if (isStringEmpty(this.state.prj)){
            message.error("请选择涉及的项目");
            return;
        }
        if (isStringEmpty(this.state.title)){
            message.error("请填写接口说明");
            return;
        }

        let whitekeys : Array<any> = [];
        let formResponseDataCopy = cloneDeep(this.state.formResponseData);

        while(true) {
            this.state.stopFlg = true;
            this.parseJsonToStruct(whitekeys, [], "", formResponseDataCopy, formResponseDataCopy);
            if(this.state.stopFlg) break;
        }
        if (isStringEmpty(this.state.versionIterator)){
            await editProjectRequest(this.state.prj, this.state.requestMethod, this.state.requestUri,
                this.state.title, this.state.description, this.state.selectedFolder, 
                this.state.formRequestHeadData, this.state.formRequestBodyData, this.state.formRequestParamData, this.state.formRequestPathVariableData, 
                this.state.formResponseData, this.state.formResponseHeadData, this.state.formResponseCookieData
            );
        } else {
            await editVersionIteratorRequest(
                this.state.initRequestMethod, this.state.initRequestUri, 
                this.state.versionIterator, this.state.prj, this.state.requestMethod, this.state.requestUri,
                this.state.title, this.state.description, this.state.selectedFolder, 
                this.state.formRequestHeadData, this.state.formRequestBodyData, this.state.formRequestParamData, this.state.formRequestPathVariableData, 
                this.state.formResponseData, this.state.formResponseHeadData, this.state.formResponseCookieData
            );
            this.setState({initRequestMethod: this.state.requestMethod, initRequestUri: this.state.requestUri});
        }
        message.success("修改成功");
    }

    parseJsonToStruct = (whiteKeys : Array<any>, parentKeys : Array<string>, parentKey : string, parseJsonToTableResultCopy : object, content : object) => {
        let isPrimimaryObject = true;
        for(let key in content) {
            let type = content[key][TABLE_FIELD_TYPE];
            if ((type === "Object" || type === "Array") && !whiteKeys.includes(key)) {
                this.state.stopFlg = false;
                parentKeys.push(key);
                this.parseJsonToStruct(whiteKeys, parentKeys, key, parseJsonToTableResultCopy, content[key]);
                parentKeys.pop();
                isPrimimaryObject = false;
            }
        }
        if (isPrimimaryObject){
            whiteKeys.push(parentKey);
            this.handlePrimimaryObject(parentKeys, parentKey, parseJsonToTableResultCopy, content);
        }
    }

    handlePrimimaryObject = (parentKeys : Array<string>, parentKey : string, parseJsonToTableResultCopy : object, content : object) : void => {
        let hash = genHash(content);
        let newObject = {};
        newObject[TABLE_FIELD_NAME] = parentKey + "@" + hash;
        newObject[TABLE_FIELD_VALUE] = content;
        addJsonFragement(newObject);

        let replaceObj = parseJsonToTableResultCopy;
        let i = 0;
        for(let _key of parentKeys) {
            i ++;
            if ( i === parentKeys.length ) {
                replaceObj[_key] = {};
                replaceObj[_key][TABLE_FIELD_NAME] = parentKey + "@" + hash;
                replaceObj[_key][TABLE_FIELD_TYPE] = TABLE_FIELD_TYPE_REF;
            }
            replaceObj = replaceObj[_key];
        }
    }

    getNavs() {
        return [
            {
                key: 'uri',
                label: '路径变量',
                children: <JsonSaveTableComponent readOnly={true} object={this.state.formRequestPathVariableData} cb={obj=>this.setState({formRequestPathVariableData: obj})} />,
            },
            {
                key: 'params',
                label: '参数',
                children: <JsonSaveTableComponent readOnly={true} object={this.state.formRequestParamData} cb={obj=>this.setState({formRequestParamData: obj})} />,
            },
            {
                key: 'headers',
                label: '头部',
                children: <JsonSaveTableComponent readOnly={true} object={this.state.formRequestHeadData} cb={obj=>this.setState({formRequestHeadData: obj})} />,
            },
            {
                key: 'body',
                label: '主体',
                children: <JsonSaveTableComponent readOnly={true} object={this.state.formRequestBodyData} cb={obj=>this.setState({formRequestBodyData: obj})} />,
            },
        ];
    }

    render() : ReactNode {
        return (
            <Layout>
                <Header style={{ padding: 0 }}>
                    { isStringEmpty(this.state.versionIterator) ? "项目接口详情" : "迭代接口详情" }
                </Header>
                {this.state.showFlg ? 
                <Content style={{ margin: '0 16px' }}>
                    <Breadcrumb style={{ margin: '16px 0' }} items={[
                        { title: (isStringEmpty(this.state.versionIterator) ? "项目" : "迭代" ) }, 
                        { title: 'api' }, 
                        { title: '明细' }
                    ]} />
                    <Flex vertical gap="middle">
                        <Flex align="center">
                            <Descriptions 
                                column={2}
                                items={ [
                                {
                                    key: 'iterator',
                                    label: '迭代',
                                    children: this.props.versionIterators.find(row => row[version_iterator_uuid] === this.state.versionIterator) ? this.props.versionIterators.find(row => row[version_iterator_uuid] === this.state.versionIterator)[version_iterator_name] : "不属于任何迭代",
                                },
                                {
                                    key: 'prj',
                                    label: '项目',
                                    children: this.props.prjs.find(row => row[prj_label] === this.state.prj) ? this.props.prjs.find(row => row[prj_label] === this.state.prj)[prj_remark] : "",
                                },
                                {
                                    key: UNAME,
                                    label: '创建人',
                                    children: this.state.cname,
                                },
                                {
                                    key: iteration_request_iteration_ctime,
                                    label: '创建时间',
                                    children: getdayjs(this.state.ctime).format("YYYY-MM-DD"),
                                },
                                ] } />
                        </Flex>
                        <Flex justify="space-between" gap="middle">
                            <Form layout="inline">
                                <Form.Item label="标题">
                                    <Input value={this.state.title} onChange={event=>this.setState({title: event.target.value})} placeholder='接口说明' />
                                </Form.Item>
                                <Form.Item label="选择文件夹">
                                    <Select
                                        style={{minWidth: 130}}
                                        value={ this.state.selectedFolder }
                                        onChange={ value => this.setState({selectedFolder: value}) }
                                        dropdownRender={(menu) => (
                                            <>
                                                {menu}
                                                <Divider style={{ margin: '8px 0' }} />
                                                <Input
                                                    placeholder="回车新建文件夹"
                                                    onChange={e => { this.setState({ folderName: e.target.value }) }}
                                                    value={ this.state.folderName }
                                                    onKeyDown={e => {
                                                        if (e.key === 'Enter') {
                                                            this.handleCreateFolder();
                                                        }
                                                        e.stopPropagation()
                                                    }}
                                                />
                                            </>
                                        )}
                                        options={ this.state.folders }
                                    />
                                </Form.Item>
                            </Form>
                            <Button 
                                size='large' 
                                type="primary" 
                                onClick={ this.handleSave }
                                style={ { background: "#3b3b3b", color: "rgba(255, 255, 255, 0.5)"} }
                                >修改api</Button>
                        </Flex>
                        <Flex>
                            <Select 
                                style={{borderRadius: 0, width: 118}} 
                                size='large' 
                                onChange={value => this.setState({requestMethod: value})}
                                value={ this.state.requestMethod }>
                                <Select.Option value={ REQUEST_METHOD_POST }>{ REQUEST_METHOD_POST }</Select.Option>
                                <Select.Option value={ REQUEST_METHOD_GET }>{ REQUEST_METHOD_GET }</Select.Option>
                            </Select>
                            <Input 
                                style={{borderRadius: 0}} 
                                prefix={ isStringEmpty(this.state.requestHost) ? "{{" + ENV_VALUE_API_HOST + "}}" : this.state.requestHost } 
                                value={ this.state.requestUri }
                                onChange={ event => this.setState({requestUri: event.target.value}) }
                                size='large' />
                            <Button 
                                disabled={this.state.initRequestMethod !== this.state.requestMethod || this.state.initRequestUri !== this.state.requestUri}
                                size='large' 
                                type="primary" 
                                style={{borderRadius: 0}} 
                                href={this.state.versionIterator ? "#/internet_request_send_by_api/" + this.state.versionIterator + "/" + this.state.prj + "/" + this.state.initRequestMethod + "/" + encode(this.state.initRequestUri) : "#/internet_request_send_by_api/" + this.state.prj + "/" + this.state.initRequestMethod + "/" + encode(this.state.initRequestUri)}
                                >发送请求</Button>
                        </Flex>
                        <TextArea placeholder="接口说明" value={this.state.description} onChange={event=>this.setState({description: event.target.value})} autoSize />
                        <Tabs defaultActiveKey={ this.state.requestMethod === REQUEST_METHOD_POST ? "body" : "params" } items={ this.getNavs() } />
                        {this.state.formResponseHeadData != null && Object.keys(this.state.formResponseHeadData).length > 0 ? 
                        <>
                            <Divider orientation="left">响应Head</Divider>
                            <Flex>
                                <JsonSaveTableComponent readOnly={ true } object={this.state.formResponseHeadData} cb={obj=>this.setState({formResponseHeadData: obj})} />
                            </Flex>
                        </>
                        : null }
                        {this.state.formResponseCookieData != null && Object.keys(this.state.formResponseCookieData).length > 0 ? 
                        <>
                            <Divider orientation="left">响应Cookie</Divider>
                            <Flex>
                                <JsonSaveTableComponent readOnly={ true } object={this.state.formResponseCookieData} cb={obj=>this.setState({formResponseCookieData: obj})} />
                            </Flex>
                        </>
                        : null }
                        {this.state.isResponseJson ? 
                        <>
                            <Divider orientation="left">响应Content</Divider>
                            <Flex>
                                <JsonSaveTableComponent readOnly={ true } object={this.state.formResponseData} cb={obj=>this.setState({formResponseData: obj})} />
                            </Flex>
                        </>
                        : null}
                        <Divider orientation="left">响应示例</Divider>
                        <Flex style={ {
                            minHeight: 136,
                            overflowY: this.state.isResponsePic ? "auto":"scroll",
                            marginLeft: 55,
                        } }>
                        { this.state.isResponseJson ? 
                            <JsonView 
                            src={JSON.parse(this.state.responseDemo)}   
                            name="response"
                            theme={ "bright" }
                            collapsed={false}  
                            indentWidth={4}  
                            iconStyle="triangle"
                            enableClipboard={true}
                            displayObjectSize={false}
                            displayDataTypes={false}
                            sortKeys={true}
                            collapseStringsAfterLength={40}  />
                        : null}
                        { this.state.isResponsePic ? 
                            <img style={{maxHeight: 100}} src={this.state.responseDemo} />
                        : null}
                        {this.state.isResponseHtml ? 
                            <TextArea
                                value={this.state.responseDemo}
                                readOnly={ true }
                                autoSize={{ minRows: 5 }}
                            />
                        : null}
                        {this.state.isResponseFile ? 
                            <Flex style={ {
                                height: 26,
                                width: "100%",
                                alignItems: "center",
                                justifyContent: "center",
                                } }>
                                    { this.state.responseDemo }
                            </Flex> 
                        : null}
                        </Flex>
                    </Flex>
                </Content>
                : null}
                <Footer style={{ textAlign: 'center' }}>
                ApiChain ©{new Date().getFullYear()} Created by 方海亮
                </Footer>
            </Layout>
        )
    }
}

function mapStateToProps (state) {
    return {
        prjs: state.prj.list,
        device : state.device,
        versionIterators : state['version_iterator'].list,
    }
}
  
export default connect(mapStateToProps)(RequestSaveContainer);