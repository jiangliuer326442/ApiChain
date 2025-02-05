import { Component, ReactNode } from 'react';
import { connect } from 'react-redux';
import { 
    Breadcrumb, 
    Layout, 
    Flex, 
    Divider, 
    Collapse, 
    Select, 
    Tooltip, 
    Typography,
    Popconfirm, 
    InputNumber, 
    Form, 
    Table, 
    message, 
    Input, 
    AutoComplete, 
    Space, 
    Button,
    Dropdown
} from "antd";
import { 
    EyeOutlined, 
    DeleteOutlined, 
    SendOutlined, 
    CloseSquareFilled, 
    MoreOutlined 
} from '@ant-design/icons';
import type { FormProps } from 'antd';
import { encode } from 'base-64';

import { 
    TABLE_PROJECT_REQUEST_FIELDS, 
    TABLE_ENV_VAR_FIELDS 
} from '@conf/db';
import { getWikiProject } from '@conf/url';
import { 
    ENV_VALUE_API_HOST 
} from '@conf/envKeys';
import { 
    CONTENT_TYPE_FORMDATA, 
    CONTENT_TYPE_JSON, 
    CONTENT_TYPE_URLENCODE 
} from '@conf/contentType';
import { 
    REQUEST_METHOD_POST, 
    REQUEST_METHOD_GET, 
    CONTENT_TYPE 
} from '@conf/global_config';
import {
    ChannelsPostmanStr, 
    ChannelsPostmanInStr, 
    ChannelsPostmanOutStr,
} from '@conf/channel';
import { 
    getType, 
    isStringEmpty 
} from '@rutil/index';
import { 
    getHostRight 
} from '@rutil/uri';
import { 
    TABLE_FIELD_REMARK, 
    TABLE_FIELD_TYPE, 
    TABLE_FIELD_VALUE,
    shortJsonContent, 
    genHash, 
    iteratorGenHash, 
    parseJsonToTable,
    iteratorBodyGenHash, 
    parseJsonToFilledTable
} from '@rutil/json';
import { getVarsByKey } from '@act/env_value';
import { 
    addVersionIteratorFolder,
    getVersionIteratorFolders, 
    delVersionIteratorFolder 
} from '@act/version_iterator_folders';
import { 
    getProjectRequests, 
    delProjectRequest, 
    addProjectRequest,
    setProjectRequestSort,
    batchSetProjectRequestFold,
} from '@act/project_request';
import { langTrans } from '@lang/i18n';

const { Header, Content, Footer } = Layout;
const { Text, Link } = Typography;

type FieldType = {
    folder?: string,
    title?: string;
    uri?: string;
};

let project_request_sort = TABLE_PROJECT_REQUEST_FIELDS.FIELD_SORT;
let project_request_fold = TABLE_PROJECT_REQUEST_FIELDS.FIELD_FOLD;
let project_request_prj = TABLE_PROJECT_REQUEST_FIELDS.FIELD_PROJECT_LABEL;
let project_request_method = TABLE_PROJECT_REQUEST_FIELDS.FIELD_REQUEST_METHOD;
let project_request_uri = TABLE_PROJECT_REQUEST_FIELDS.FIELD_URI;
let project_request_title = TABLE_PROJECT_REQUEST_FIELDS.FIELD_TITLE;

let env_var_pvalue = TABLE_ENV_VAR_FIELDS.FIELD_PARAM_VAR;

class RequestListProject extends Component {

    constructor(props) {
        super(props);
        let projectLabel = this.props.match.params.id;
        this.state = {
            projectLabel,
            requestsJsxDividered: {},
            listColumn: [
                {
                    title: langTrans("prj doc table field1"),
                    dataIndex: project_request_uri,
                    render: (uri) => { 
                        if (uri.length > 50) {
                            return <Tooltip title={ uri } placement='right'>{ "..." + uri.substring(uri.length - 50, uri.length) }</Tooltip>;
                        } else {
                            return uri;
                        }
                    }
                },
                {
                    title: langTrans("prj doc table field2"),
                    dataIndex: project_request_title,
                },
                {
                    title: langTrans("prj doc table field3"),
                    dataIndex: project_request_sort,
                    render: (sort, record) => {
                        let prj = record[project_request_prj];
                        let method = record[project_request_method];
                        let uri = record[project_request_uri];
                        if (sort === undefined) {
                            return <InputNumber style={{width: 65}} value={0} onBlur={event => this.setApiSort(prj, method, uri, event.target.value)} />;
                        } else {
                            return <InputNumber style={{width: 65}} value={sort} onBlur={event => this.setApiSort(prj, method, uri, event.target.value)} />;
                        }
                    }
                },
                {
                    title: langTrans("prj doc table field4"),
                    key: 'operater',
                    render: (_, record) => {
                        let sendRequestUrl = "#/internet_request_send_by_api/" + record[project_request_prj] + "/" + record[project_request_method] + "/" + encode(record[project_request_uri]);
                        let docDetailUrl = "#/version_iterator_request/" + record[project_request_prj] + "/" + record[project_request_method] + "/" + encode(record[project_request_uri]);
                        return (
                            <Space size="middle">
                                <Tooltip title={langTrans("prj doc table act1")}>
                                    <Button type="link" icon={<SendOutlined />} href={ sendRequestUrl } />
                                </Tooltip>
                                <Tooltip title={langTrans("prj doc table act2")}>
                                    <Button type="link" icon={<EyeOutlined />} href={ docDetailUrl } />
                                </Tooltip>
                                <Dropdown menu={this.getMore(record)}>
                                    <Button type="text" icon={<MoreOutlined />} />
                                </Dropdown>
                            </Space>
                        );
                    },
                }
            ],
            title: "",
            uri: "",
            selectedApi: [],
            optionsUri: [],
            optionsTitle: [],
            folders: []
        }
    }

    async componentDidUpdate(prevProps) {
        if (prevProps.match.params.id !== this.props.match.params.id) {
            this.state.folders = await getVersionIteratorFolders("", this.props.match.params.id);
            this.onFinish({})
        }
    }

    static getDerivedStateFromProps(props, state) {
        let projectLabel = props.match.params.id;
        if (state.projectLabel !== projectLabel) {
            return {
                projectLabel,
            }
        }
        return null;
    }

    async componentDidMount() {
        this.state.folders = await getVersionIteratorFolders("", this.state.projectLabel);
        this.onFinish({});
    }

    uploadPostMan = () => {
        return new Promise((resolve, reject) => {

            let postmanSendListener = window.electron.ipcRenderer.on(ChannelsPostmanStr, async (action, projectName, postmanContent) => {
                if (action === ChannelsPostmanOutStr && this.state.projectLabel === projectName) {
                    postmanSendListener();
                    resolve({postmanContent});
                }
            });

            window.electron.ipcRenderer.sendMessage(ChannelsPostmanStr, ChannelsPostmanInStr, this.state.projectLabel);
        });
    }

    parsePostman = async (replaceHost : string, postmanObj : object) => {
        let schema = postmanObj.info.schema;
        let schemaLeft = schema.substring(0, schema.lastIndexOf('/'));
        let schemaVersion = parseFloat(schemaLeft.substring(schemaLeft.lastIndexOf("/") + 2));
        if (schemaVersion >= 2 && schemaVersion < 3) {
            for(let line of postmanObj.item){
                let title = line.name;
                let uri = getHostRight(getType(line.request.url) === "String" ? line.request.url : line.request.url.raw);
                if (uri.indexOf(replaceHost) === 0) {
                    uri = uri.substring(replaceHost.length);
                }
                let method = line.request.method;
                if (method === REQUEST_METHOD_POST) {
                    method = REQUEST_METHOD_POST;
                } else {
                    method = REQUEST_METHOD_GET;
                }
                let header : any = {};
                if(line.request.body.mode === "formdata") {
                    let headerItem : any = {};
                    headerItem[TABLE_FIELD_REMARK] = "";
                    headerItem[TABLE_FIELD_TYPE] = "String";
                    headerItem[TABLE_FIELD_VALUE] = CONTENT_TYPE_FORMDATA;
                    header[CONTENT_TYPE] = headerItem;
                } else if(line.request.body.mode === "raw") {
                    let headerItem : any = {};
                    headerItem[TABLE_FIELD_REMARK] = "";
                    headerItem[TABLE_FIELD_TYPE] = "String";
                    headerItem[TABLE_FIELD_VALUE] = CONTENT_TYPE_JSON;
                    header[CONTENT_TYPE] = headerItem;
                } else {
                    let headerItem : any = {};
                    headerItem[TABLE_FIELD_REMARK] = "";
                    headerItem[TABLE_FIELD_TYPE] = "String";
                    headerItem[TABLE_FIELD_VALUE] = CONTENT_TYPE_URLENCODE;
                    header[CONTENT_TYPE] = headerItem;
                }
                for(let _header of line.request.header) {
                    let headerItem : any = {};
                    headerItem[TABLE_FIELD_REMARK] = _header.description;
                    headerItem[TABLE_FIELD_TYPE] = "String";
                    headerItem[TABLE_FIELD_VALUE] = _header.value;
                    header[_header.key] = headerItem;
                }
                let body : any = {};
                if (line.request.body.mode === "formdata") {
                    for (let _bodyItem of line.request.body.formdata) {
                        let bodyItem : any = {};
                        bodyItem[TABLE_FIELD_REMARK] = _bodyItem.description;
                        bodyItem[TABLE_FIELD_TYPE] = _bodyItem.type === "text" ? "String" : "Number";
                        bodyItem[TABLE_FIELD_VALUE] = _bodyItem.value;
                        body[_bodyItem.key] = bodyItem;
                    }
                } else if (line.request.body.mode === "raw") {
                    method = REQUEST_METHOD_POST;
                    let responseBody = JSON.parse(line.request.body.raw);
                    let shortRequestBodyJsonObject = {};
                    shortJsonContent(shortRequestBodyJsonObject, responseBody);
                    let formRequestBodyData = {};
                    parseJsonToFilledTable(formRequestBodyData, shortRequestBodyJsonObject, {});
                    body = formRequestBodyData;
                }
                let param = {};
                let response_demo = "";
                if (line.response.length > 0) {
                    response_demo = line.response[0].body;
                }
                this.loadPostmanData(title, uri, method, header, param, body, response_demo);
            }
            return true;
        } else {
            message.error(langTrans("prj doc postman1"));
            return false;
        }
    }

    loadPostmanData = async (title : string, uri : string, method : string, header : object, param : object, body : object, response_demo_str : string) => {
        let headerHash = genHash(header)
        let bodyHash = iteratorBodyGenHash(body, {});
        let paramHash = genHash(param);
        let shortResponseJsonObject = {};
        let formResponseData = {};
        let responseHash = "";

        if (!isStringEmpty(response_demo_str)) {
            shortJsonContent(shortResponseJsonObject, JSON.parse(response_demo_str));
            responseHash = iteratorGenHash(shortResponseJsonObject);
            parseJsonToTable(formResponseData, shortResponseJsonObject);
        }

        await addProjectRequest(this.state.projectLabel, method, uri, title, "", "", 
        header, headerHash, body, bodyHash, param, paramHash, {}, "",
        formResponseData, {}, {}, responseHash, JSON.stringify(shortResponseJsonObject),
        true, false, false, false, this.props.device);
    }

    onFinish: FormProps<FieldType>['onFinish'] = async (values) => {
        let title = values.title;
        let uri = values.uri;
        let folder = values.folder;
        let project_requests = await getProjectRequests(this.state.projectLabel, folder, title, uri);
        let requestsDividered : any = {};
        let requestsJsxDividered = [];
        let optionsUri = [];
        let optionsTitle = [];
        
        for(let project_request of project_requests ) {
            project_request.key = project_request[project_request_method] + "$$" + project_request[project_request_uri];
            let fold = project_request[project_request_fold];
            if (!(fold in requestsDividered)) {
                requestsDividered[fold] = [];

                let foldJsx = {};
                foldJsx.key = fold;
                foldJsx.children = (
                <Flex vertical>
                    <Form layout="inline" style={{marginBottom: 16}}>
                        <Form.Item label={langTrans("prj doc operator3")}>
                            <Select
                                style={{minWidth: 130}}
                                onChange={ value => {
                                    batchSetProjectRequestFold(this.state.projectLabel, this.state.selectedApi, value, () => {
                                        this.state.selectedApi = [];
                                        this.onFinish({
                                            title: this.state.title, 
                                            uri: this.state.uri
                                        });
                                    });
                                } }
                                dropdownRender={(menu) => (
                                    <>
                                        {menu}
                                        <Divider style={{ margin: '8px 0' }} />
                                        <Input
                                            placeholder="回车新建文件夹"
                                            onKeyDown={e => {
                                                if (e.key === 'Enter') {
                                                    this.handleCreateFolder(e.target.value);
                                                    e.target.value = ""
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
                    <Table 
                        rowSelection={{selectedRowKeys: this.state.selectedApi, onChange: this.setSelectedApi}}
                        dataSource={ requestsDividered[fold] } 
                        columns={this.state.listColumn} 
                    />
                </Flex>);
                foldJsx.extra = (!isStringEmpty(fold) ? (
                    <DeleteOutlined onClick={event => {
                        delVersionIteratorFolder("", this.state.projectLabel, fold, async ()=>{
                            message.success("删除文件夹成功");
                            let folders = await getVersionIteratorFolders("", this.state.projectLabel);
                            this.onFinish({
                                title: this.state.title, 
                                uri: this.state.uri,
                                folders
                            });
                        });
                        event.stopPropagation();
                    }} />
                ) : null);    

                requestsJsxDividered.push(foldJsx);
            }
            requestsDividered[fold].push(project_request);
            optionsUri.push({value : project_request[project_request_uri]});
            optionsTitle.push({value : project_request[project_request_title]});
        }
        if (this.state.optionsUri.length === 0) {
            this.setState({ optionsUri, optionsTitle });
        }
        for (let requestJsxDividered of requestsJsxDividered) {
            let fold = requestJsxDividered.key;
            requestJsxDividered.label = "/" + fold + "（" + requestsDividered[fold].length + "）";
        }
        this.setState({
            title,
            uri,
            requestsJsxDividered,
        });
    }

    setApiSort = async (prj : string, method : string, uri : string, sort : number) => {
        setProjectRequestSort(prj, method, uri, sort, () => {
            this.onFinish({
                title: this.state.title, 
                uri: this.state.uri
            });
        });
    }

    setSelectedApi = newSelectedRowKeys => {
        this.state.selectedApi = newSelectedRowKeys;
        this.onFinish({
            title: this.state.title, 
            uri: this.state.uri
        });
    }

    handleCreateFolder = (folderName : string) => {
        addVersionIteratorFolder("", this.state.projectLabel, folderName, this.props.device, async ()=>{
            let folders = await getVersionIteratorFolders("", this.state.projectLabel);
            this.onFinish({
                folders,
                title: this.state.title, 
                uri: this.state.uri
            });
        });
    }

    getMore = (record : any) : MenuProps => {
        return {'items': [{
            key: "1",
            danger: true,
            label: 
            <Popconfirm
                title={langTrans("prj doc del title")}
                description={langTrans("prj doc del desc")}
                onConfirm={e => {
                    delProjectRequest(record, ()=>{
                        this.onFinish({
                            title: this.state.title, 
                            uri: this.state.uri
                        });
                    });
                }}
                okText={langTrans("prj doc del sure")}
                cancelText={langTrans("prj doc del cancel")}
            >
                <Button danger type="link" icon={<DeleteOutlined />} />
            </Popconfirm>,
        }]};
    }

    render() : ReactNode {
        return (
            <Layout>
                <Header style={{ padding: 0 }}>
                    {langTrans("prj doc title")} <Text type="secondary"><Link href={getWikiProject()}>{langTrans("prj doc link")}</Link></Text>
                </Header>
                <Content style={{ padding: '0 16px' }}>
                    <Breadcrumb style={{ margin: '16px 0' }} items={[
                        { title: langTrans("prj doc bread1") }, 
                        { title: langTrans("prj doc bread2") }
                    ]} />
                    <Flex vertical gap="middle">
                        <Flex justify="flex-start" align="center" gap="middle">
                            <Form 
                                layout="inline"
                                onFinish={ this.onFinish } 
                                initialValues={ {} }
                                autoComplete="off"
                            >
                                <Form.Item<FieldType> style={{paddingBottom: 20}} label={langTrans("prj doc operator1")} name="uri" rules={[{ required: false }]}>
                                    <AutoComplete 
                                        allowClear={{ clearIcon: <CloseSquareFilled /> }} 
                                        options={this.state.optionsUri} 
                                        filterOption={(inputValue, option) =>
                                            option!.value.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1
                                        }
                                    >
                                        <Input />
                                    </AutoComplete>
                                </Form.Item>

                                <Form.Item<FieldType> label={langTrans("prj doc operator2")} name="title" rules={[{ required: false }]}>
                                    <AutoComplete 
                                        allowClear={{ clearIcon: <CloseSquareFilled /> }} 
                                        options={this.state.optionsTitle} 
                                        filterOption={(inputValue, option) =>
                                            option!.value.indexOf(inputValue.toUpperCase()) !== -1
                                        }
                                    >
                                        <Input />
                                    </AutoComplete>
                                </Form.Item>

                                <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
                                    <Button type="primary" htmlType="submit">
                                        {langTrans("prj doc btn")}
                                    </Button>
                                </Form.Item>

                                <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
                                    <Button type="link" danger onClick={async ()=>{
                                        const envVarItems = await getVarsByKey(this.state.projectLabel, ENV_VALUE_API_HOST);
                                        let replaceHost = "";
                                        for(let envVar of envVarItems) {
                                            replaceHost = getHostRight(envVar[env_var_pvalue]) + "/";
                                        }
                                        if (isStringEmpty(replaceHost)) {
                                            message.error("当前项目环境变量未设置 " + ENV_VALUE_API_HOST + " 的值");
                                            return;
                                        }

                                        let response = await this.uploadPostMan();
                                        let postmanContent = response.postmanContent;
                                        let result = await this.parsePostman(replaceHost, JSON.parse(postmanContent as string));
                                        if (result) {
                                            message.success(langTrans("prj doc postman2"));
                                            this.onFinish({});
                                        }
                                    }}>
                                        {langTrans("prj doc import")}
                                    </Button>
                                </Form.Item>
                            </Form>
                        </Flex>
                        <Flex>
                            <div style={ { width: "100%" } }>
                                <Collapse items={this.state.requestsJsxDividered} />
                            </div>
                        </Flex>
                    </Flex>
                </Content>
                <Footer style={{ textAlign: 'center' }}>
                ApiChain ©{new Date().getFullYear()} Created by 方海亮
                </Footer>
            </Layout>
        );
    }
}
    
function mapStateToProps (state) {
    return {
        device: state.device,
    }
}
      
export default connect(mapStateToProps)(RequestListProject);