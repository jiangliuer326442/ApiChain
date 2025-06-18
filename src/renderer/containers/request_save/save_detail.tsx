import { Component, ReactNode } from 'react';
import { connect } from 'react-redux';
import { 
    Descriptions, 
    Breadcrumb, 
    Checkbox,
    Flex, 
    Layout, 
    Tabs, 
    Form, 
    message, 
    Button, 
    Input, 
    Divider, 
    Select 
} from "antd";
import { cloneDeep } from 'lodash';
import { decode } from 'base-64';
import JsonView from 'react-json-view';

import { langTrans } from '@lang/i18n';
import {
    isStringEmpty, getdayjs
} from '@rutil/index';
import {
    TABLE_FIELD_NAME,
    TABLE_FIELD_TYPE,
    TABLE_FIELD_VALUE,
    TABLE_FIELD_TYPE_REF,
    genHash,
} from '@rutil/json';
import { ENV_VALUE_API_HOST } from "@conf/envKeys";
import {
    TABLE_VERSION_ITERATION_REQUEST_FIELDS,
    TABLE_PROJECT_REQUEST_FIELDS,
    UNAME
} from '@conf/db';
import {
    REQUEST_METHOD_GET,
    REQUEST_METHOD_POST,
} from '@conf/global_config';
import JsonSaveTableComponent from "@comp/request_save/json_save_table";
import FolderSelector from "@comp/folders/index";
import { getPrjs } from '@act/project';
import { addJsonFragement } from '@act/request_save';
import { 
    getIteratorFolders
} from '@act/version_iterator_folders';
import {
    getProjectFolders
} from '@act/project_folders';
import { editVersionIteratorRequest, getVersionIteratorRequest } from '@act/version_iterator_requests';
import { editProjectRequest, getProjectRequest } from '@act/project_request';
import { getVersionIterators } from '@act/version_iterator';

const { TextArea } = Input;
const { Header, Content, Footer } = Layout;

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
let iteration_response_export_docFlg = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_EXPORT_DOCFLG;

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

class RequestSaveContainer extends Component {

    constructor(props) {
        super(props);
        let iterator = props.match.params.iteratorId ? props.match.params.iteratorId : "";
        let type = iterator ? "iterator" : "project";
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
            isExportDoc: false,
            formRequestHeadData: {},
            formRequestBodyData: {},
            formRequestParamData: {},
            formRequestPathVariableData: {},
            stopFlg : true,
            showFlg : false,
            versionIterator: iterator,
            versionIterationName: "",
            selectedFolder: "",
            cname: "",
            ctime: 0,
            folders: [],
            type,
        }
    }

    async componentDidMount() {
        if(this.props.prjs.length === 0) {
            getPrjs(this.props.clientType, this.props.dispatch);
        }
        if (this.state.type === "project") {
            let folders = await getProjectFolders(this.props.clientType, this.state.prj, null, null);
            let record = await getProjectRequest(this.props.clientType, this.state.prj, this.state.initRequestMethod, this.state.initRequestUri);
            if (record === null) {
                return;
            }
            this.setState({
                showFlg: true,
                folders,
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
            let folders = await getIteratorFolders(this.props.clientType, this.state.versionIterator, this.state.prj);
            let versionIterationName = (await getVersionIterators(this.props.clientType)).get(this.state.versionIterator);
            let record = await getVersionIteratorRequest(
                this.props.clientType, 
                this.state.versionIterator, 
                this.state.prj, 
                this.state.initRequestMethod, 
                this.state.initRequestUri
            );
            this.setState({
                showFlg: true,
                folders,
                title: record[iteration_request_title],
                description: record[iteration_request_desc],
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
                isExportDoc: record[iteration_response_export_docFlg] ? true : false,
                versionIterationName
            });
        }
    }

    handleSetVersionIterator = async (value) => {
        this.state.versionIterator = value;
        if (this.props.folders[this.state.versionIterator] === undefined) {
            let folders = await getIteratorFolders(this.props.clientType, value, this.state.prj);
            this.setState({folders})
        }
    }

    handleSave = async () => {
        if (isStringEmpty(this.state.prj)){
            message.error(langTrans("request save check7"));
            return;
        }
        if (isStringEmpty(this.state.title)){
            message.error(langTrans("request save check8"));
            return;
        }

        let whitekeys : Array<any> = [];
        let formResponseDataCopy = cloneDeep(this.state.formResponseData);

        while(true) {
            this.state.stopFlg = true;
            this.parseJsonToStruct(whitekeys, [], "", formResponseDataCopy, formResponseDataCopy);
            if(this.state.stopFlg) break;
        }
        if (this.state.type === "project"){
            await editProjectRequest(
                this.props.clientType, this.props.teamId,
                this.state.initRequestMethod, this.state.initRequestUri, 
                this.state.prj, this.state.requestMethod, this.state.requestUri,
                this.state.title, this.state.description, this.state.selectedFolder, 
                this.state.formRequestHeadData, this.state.formRequestBodyData, this.state.formRequestParamData, this.state.formRequestPathVariableData, 
                this.state.formResponseData, this.state.formResponseHeadData, this.state.formResponseCookieData
            );
            message.success(langTrans("request save check9"));
            this.props.history.push("/project_requests/" + this.state.prj);
        } else {
            await editVersionIteratorRequest(
                this.props.clientType, this.props.teamId,
                this.state.initRequestMethod, this.state.initRequestUri, 
                this.state.versionIterator, this.state.prj, this.state.requestMethod, this.state.requestUri,
                this.state.title, this.state.description, this.state.selectedFolder, 
                this.state.formRequestHeadData, this.state.formRequestBodyData, this.state.formRequestParamData, this.state.formRequestPathVariableData, 
                this.state.formResponseData, this.state.formResponseHeadData, this.state.formResponseCookieData, this.state.isExportDoc
            );
            this.setState({initRequestMethod: this.state.requestMethod, initRequestUri: this.state.requestUri});
            message.success(langTrans("request save check9"));
            this.props.history.push("/version_iterator_requests/" + this.state.versionIterator);
        }
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
                label: langTrans("network tab1"),
                children: <JsonSaveTableComponent readOnly={true} object={this.state.formRequestPathVariableData} cb={obj=>this.setState({formRequestPathVariableData: obj})} />,
            },
            {
                key: 'params',
                label: langTrans("network tab2"),
                children: <JsonSaveTableComponent readOnly={true} object={this.state.formRequestParamData} cb={obj=>this.setState({formRequestParamData: obj})} />,
            },
            {
                key: 'headers',
                label: langTrans("network tab3"),
                children: <JsonSaveTableComponent readOnly={true} object={this.state.formRequestHeadData} cb={obj=>this.setState({formRequestHeadData: obj})} />,
            },
            {
                key: 'body',
                label: langTrans("network tab4"),
                children: <JsonSaveTableComponent readOnly={true} object={this.state.formRequestBodyData} cb={obj=>this.setState({formRequestBodyData: obj})} />,
            },
        ];
    }

    render() : ReactNode {
        return (
            <Layout>
                <Header style={{ padding: 0 }}>
                    { isStringEmpty(this.state.versionIterator) ? langTrans("request detail title2") : langTrans("request detail title") }
                </Header>
                {this.state.showFlg ? 
                <Content style={{ padding: '0 16px' }}>
                    <Breadcrumb style={{ margin: '16px 0' }} items={[
                        { title: (isStringEmpty(this.state.versionIterator) ? langTrans("request detail bread4") : langTrans("request detail bread1") ) }, 
                        { title: langTrans("request detail bread2") }, 
                        { title: langTrans("request detail bread3") }
                    ]} />
                    <Flex vertical gap="middle">
                        <Flex align="center">
                            <Descriptions 
                                column={2}
                                items={ [
                                {
                                    key: 'iterator',
                                    label: langTrans("request detail desc1"),
                                    children: isStringEmpty(this.state.versionIterationName) ? langTrans("request detail no versioniteration") : this.state.versionIterationName,
                                },
                                {
                                    key: 'prj',
                                    label: langTrans("request detail desc2"),
                                    children: this.props.prjs.find(row => row.value === this.state.prj) ? this.props.prjs.find(row => row.value === this.state.prj).label : "",
                                },
                                {
                                    key: UNAME,
                                    label: langTrans("request detail desc3"),
                                    children: this.state.cname,
                                },
                                {
                                    key: iteration_request_iteration_ctime,
                                    label: langTrans("request detail desc4"),
                                    children: getdayjs(this.state.ctime).format("YYYY-MM-DD"),
                                },
                                ] } />
                        </Flex>
                        <Form layout="inline">
                            <Form.Item label={langTrans("request save select4")}>
                                <Input value={this.state.title} onChange={event=>this.setState({title: event.target.value})} placeholder={langTrans("prj doc table field2")} />
                            </Form.Item>
                            <Form.Item label={langTrans("unittest add form2")}>
                                <FolderSelector 
                                    versionIterator={ this.state.versionIterator }
                                    prj={ this.state.prj }
                                    value={ this.state.selectedFolder }
                                    setValue={ value => this.setState({selectedFolder: value}) }
                                    refreshFolders={ async () => {
                                        let folders = await getVersionIteratorFolders(this.state.versionIterator, this.state.prj);
                                        this.setState({folders, selectedFolder: ""})
                                    }}
                                    folders={ this.state.folders }
                                />
                            </Form.Item>
                            {!isStringEmpty(this.state.versionIterator) ? 
                                <Form.Item label={langTrans("request save checkbox1")}>
                                    <Checkbox checked={this.state.isExportDoc} onChange={e => this.setState({isExportDoc: e.target.checked})} />
                                </Form.Item>
                            : null}
                        </Form>
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
                                size='large' 
                                type="primary" 
                                onClick={ this.handleSave }
                                style={{borderRadius: 0}} 
                                >{langTrans("request save btn")}</Button>
                        </Flex>
                        <TextArea placeholder={langTrans("request save desc")} value={this.state.description} onChange={event=>this.setState({description: event.target.value})} autoSize />
                        <Tabs defaultActiveKey={ this.state.requestMethod === REQUEST_METHOD_POST ? "body" : "params" } items={ this.getNavs() } />
                        {this.state.formResponseHeadData != null && Object.keys(this.state.formResponseHeadData).length > 0 ? 
                        <>
                            <Divider orientation="left">{langTrans("request save response header")}</Divider>
                            <Flex>
                                <JsonSaveTableComponent readOnly={ true } object={this.state.formResponseHeadData} cb={obj=>this.setState({formResponseHeadData: obj})} />
                            </Flex>
                        </>
                        : null }
                        {this.state.formResponseCookieData != null && Object.keys(this.state.formResponseCookieData).length > 0 ? 
                        <>
                            <Divider orientation="left">{langTrans("request save response cookie")}</Divider>
                            <Flex>
                                <JsonSaveTableComponent readOnly={ true } object={this.state.formResponseCookieData} cb={obj=>this.setState({formResponseCookieData: obj})} />
                            </Flex>
                        </>
                        : null }
                        {this.state.isResponseJson ? 
                        <>
                            <Divider orientation="left">{langTrans("request save response content")}</Divider>
                            <Flex>
                                <JsonSaveTableComponent readOnly={ true } object={this.state.formResponseData} cb={obj=>this.setState({formResponseData: obj})} />
                            </Flex>
                        </>
                        : null}
                        <Divider orientation="left">{langTrans("doc response demo")}</Divider>
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
        teamId: state.device.teamId,
        clientType: state.device.clientType,
    }
}
  
export default connect(mapStateToProps)(RequestSaveContainer);