import { Component, ReactNode } from 'react';
import { connect } from 'react-redux';
import { Breadcrumb, Layout, Flex, Divider, Collapse, Select, Tooltip, Popconfirm, InputNumber, Form, Table, message, Input, AutoComplete, Space, Button } from "antd";
import { EyeOutlined, DeleteOutlined, CloseSquareFilled } from '@ant-design/icons';
import type { FormProps } from 'antd';
import { encode } from 'base-64';

import { TABLE_PROJECT_REQUEST_FIELDS, TABLE_ENV_VAR_FIELDS } from '../../../config/db';
import { ENV_VALUE_API_HOST } from '../../../config/envKeys';
import { CONTENT_TYPE_FORMDATA, CONTENT_TYPE_URLENCODE } from '../../../config/contentType';
import {
    ChannelsPostmanStr, ChannelsPostmanInStr, ChannelsPostmanOutStr,
    REQUEST_METHOD_POST, REQUEST_METHOD_GET, CONTENT_TYPE
} from '../../../config/global_config';
import { isStringEmpty } from '../../util';
import { getHostRight } from '../../util/uri';
import { 
    TABLE_FIELD_REMARK, TABLE_FIELD_TYPE, TABLE_FIELD_VALUE,
    shortJsonContent, genHash, iteratorGenHash, parseJsonToTable,
} from '../../util/json';
import { getVarsByKey } from '../../actions/env_value';
import { 
    addVersionIteratorFolder,
    getVersionIteratorFolders, 
    delVersionIteratorFolder 
} from '../../actions/version_iterator_folders';
import { 
    getProjectRequests, 
    delProjectRequest, 
    addProjectRequest,
    setProjectRequestSort,
    batchSetProjectRequestFold,
} from '../../actions/project_request';

const { Header, Content, Footer } = Layout;

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
                    title: '接口地址',
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
                    title: '接口说明',
                    dataIndex: project_request_title,
                },
                {
                    title: '排序',
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
                    title: '操作',
                    key: 'operater',
                    render: (_, record) => {
                        let url = "#/version_iterator_request/" + record[project_request_prj] + "/" + record[project_request_method] + "/" + encode(record[project_request_uri]);
                        return (
                            <Space size="middle">
                                <Button type="link" icon={<EyeOutlined />} href={ url } />
                                <Popconfirm
                                    title="删除api"
                                    description="确定删除该 api 吗？"
                                    onConfirm={e => {
                                        delProjectRequest(record, ()=>{
                                            this.onFinish({
                                                title: this.state.title, 
                                                uri: this.state.uri
                                            });
                                        });
                                    }}
                                    okText="确定"
                                    cancelText="取消"
                                >
                                    <Button danger type="link" icon={<DeleteOutlined />} />
                                </Popconfirm>
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

    componentDidUpdate(prevProps) {
        if (prevProps.match.params.id !== this.props.match.params.id) {
            getVersionIteratorFolders("", this.props.match.params.id, folders => this.setState({folders}));
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

    componentDidMount() {
        let that = this;
        getVersionIteratorFolders("", this.state.projectLabel, folders => this.setState({ folders }));
        that.onFinish({});

        window.electron.ipcRenderer.on(ChannelsPostmanStr, async (action, projectName, postmanContent) => {
            if (action === ChannelsPostmanOutStr && this.state.projectLabel === projectName) {
                await this.parsePostman(JSON.parse(postmanContent as string));
                message.success("导入 postman 成功");
                that.onFinish({
                    title: that.state.title, 
                    uri: that.state.uri
                });
            }
        });
    }

    parsePostman = async (postmanObj : object) => {
        let schema = postmanObj.info.schema;
        let schemaLeft = schema.substring(0, schema.lastIndexOf('/'));
        let schemaVersion = parseFloat(schemaLeft.substring(schemaLeft.lastIndexOf("/") + 2));
        if (schemaVersion >= 2 && schemaVersion < 3) {
            const envVarItems = await getVarsByKey(this.state.projectLabel, ENV_VALUE_API_HOST);
            let replaceHost = "";
            for(let envVar of envVarItems) {
                replaceHost = getHostRight(envVar[env_var_pvalue]) + "/";
            }
            for(let line of postmanObj.item){
                let title = line.name;
                let uri = getHostRight(line.request.url);
                // if (line.request.url === "{{base_url}}/ResourceUpgrade/mgr/downloadSelf.json") {
                //     console.debug(uri);
                // }
                if (uri.indexOf(replaceHost) === 0) {
                    uri = uri.substring(replaceHost.length);
                }
                // if (line.request.url === "{{base_url}}/ResourceUpgrade/mgr/downloadSelf.json") {
                //     console.debug(getHostRight(line.request.url).indexOf(replaceHost));
                //     console.debug(uri);
                // }
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
                if(line.request.body.mode === "formdata") {
                    for (let _bodyItem of line.request.body.formdata) {
                        let bodyItem : any = {};
                        bodyItem[TABLE_FIELD_REMARK] = _bodyItem.description;
                        bodyItem[TABLE_FIELD_TYPE] = _bodyItem.type === "text" ? "String" : "Number";
                        bodyItem[TABLE_FIELD_VALUE] = _bodyItem.value;
                        body[_bodyItem.key] = bodyItem;
                    }
                }
                let param = {};
                let response_demo = "";
                if (line.response.length > 0) {
                    response_demo = line.response[0].body;
                }
                this.loadPostmanData(title, uri, method, header, param, body, response_demo);
            }
        } else {
            message.error("不支持的 postman 文件版本");
        }
    }

    loadPostmanData = async (title : string, uri : string, method : string, header : object, param : object, body : object, response_demo_str : string) => {
        let headerHash = genHash(header);
        let bodyHash = genHash(body);
        let paramHash = genHash(param);
        let shortResponseJsonObject = {};
        let formResponseData = {};
        let responseHash = "";
        // console.debug(title, uri, response_demo_str);
        if (!isStringEmpty(response_demo_str)) {
            shortJsonContent(shortResponseJsonObject, JSON.parse(response_demo_str));
            responseHash = iteratorGenHash(shortResponseJsonObject);
            parseJsonToTable(formResponseData, shortResponseJsonObject);
        }

        await addProjectRequest(this.state.projectLabel, method, uri, title, "", 
        header, headerHash, body, bodyHash, param, paramHash, formResponseData, responseHash, JSON.stringify(shortResponseJsonObject),
        true, false, this.props.device);
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
                    <Form layout="inline">
                        <Form.Item label="移动到文件夹">
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
                        delVersionIteratorFolder("", this.state.projectLabel, fold, ()=>{
                            message.success("删除文件夹成功");
                            getVersionIteratorFolders("", this.state.projectLabel, folders => {
                                this.onFinish({
                                    title: this.state.title, 
                                    uri: this.state.uri,
                                    folders
                                });
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
        addVersionIteratorFolder("", this.state.projectLabel, folderName, this.props.device, ()=>{
            getVersionIteratorFolders("", this.state.projectLabel, folders => {
                this.onFinish({
                    folders,
                    title: this.state.title, 
                    uri: this.state.uri
                });
            });
        });
    }

    render() : ReactNode {
        return (
            <Layout>
                <Header style={{ padding: 0 }}>
                    项目接口列表
                </Header>
                <Content style={{ margin: '0 16px' }}>
                    <Breadcrumb style={{ margin: '16px 0' }} items={[
                        { title: '项目' }, 
                        { title: '接口列表' }
                    ]} />
                    <Flex vertical gap="middle">
                        <Flex justify="flex-start" align="center" gap="middle">
                            <Form 
                                layout="inline"
                                onFinish={ this.onFinish } 
                                initialValues={ {} }
                                autoComplete="off"
                            >
                                <Form.Item<FieldType> style={{paddingBottom: 20}} label="接口地址" name="uri" rules={[{ required: false }]}>
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

                                <Form.Item<FieldType> label="接口说明" name="title" rules={[{ required: false }]}>
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
                                        搜索
                                    </Button>
                                </Form.Item>

                                <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
                                    <Button type="link" danger onClick={()=>{window.electron.ipcRenderer.sendMessage(ChannelsPostmanStr, ChannelsPostmanInStr, this.state.projectLabel)}}>
                                        从 PostMan 导入
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