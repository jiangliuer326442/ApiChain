import { Component, ReactNode } from 'react';
import { connect } from 'react-redux';
import { Breadcrumb, Layout, Flex, ConfigProvider, FloatButton, Collapse, Popconfirm, InputNumber, Descriptions, Form, Tooltip, Select, Divider, Table, message, Input, Space, Button } from "antd";
import { EyeOutlined, DeleteOutlined, FileTextOutlined } from '@ant-design/icons';
import { TinyColor } from '@ctrl/tinycolor';
import type { FormProps } from 'antd';
import { encode } from 'base-64';

import { 
    TABLE_VERSION_ITERATION_REQUEST_FIELDS, 
    TABLE_VERSION_ITERATION_FIELDS, 
    TABLE_MICRO_SERVICE_FIELDS,
    UNAME,
} from '../../../config/db';
import { getdayjs, isStringEmpty } from '../../util';
import MarkdownView from '../../components/markdown/show';
import { getPrjs } from '../../actions/project';
import { getVersionIterator, getOpenVersionIteratorsByPrj } from '../../actions/version_iterator';
import { 
    getVersionIteratorFolders, 
    delVersionIteratorFolder 
} from '../../actions/version_iterator_folders';
import { 
    getVersionIteratorRequestsByProject, 
    delVersionIteratorRequest, 
    setVersionIterationRequestSort,
    batchMoveIteratorRequest,
    batchSetProjectRequestFold,
} from '../../actions/version_iterator_requests';
import { cloneDeep } from 'lodash';

const { Header, Content, Footer } = Layout;

type FieldType = {
    prj?: string;
    folder?: string,
    title?: string;
    uri?: string;
};

const colorsAddRequestApi = ['#fc6076', '#ff9a44', '#ef9d43', '#e75516'];
const colorsSendRequestApi = ['#6253e1', '#04befe'];
const getHoverColors = (colors: string[]) =>
    colors.map((color) => new TinyColor(color).lighten(5).toString());
const getActiveColors = (colors: string[]) =>
    colors.map((color) => new TinyColor(color).darken(5).toString());

let version_iterator_uuid = TABLE_VERSION_ITERATION_FIELDS.FIELD_UUID;
let version_iterator_title = TABLE_VERSION_ITERATION_FIELDS.FIELD_NAME;
let iteration_request_sort = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_SORT;
let version_iterator_prjs = TABLE_VERSION_ITERATION_FIELDS.FIELD_PROJECTS;
let version_iterator_content = TABLE_VERSION_ITERATION_FIELDS.FIELD_CONTENT;
let version_iterator_openflg = TABLE_VERSION_ITERATION_FIELDS.FIELD_OPENFLG;
let version_iterator_ctime = TABLE_VERSION_ITERATION_FIELDS.FIELD_CTIME;

let iteration_request_fold = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_FOLD;
let iteration_request_prj = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_MICRO_SERVICE_LABEL;
let iteration_request_method = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_REQUEST_METHOD;
let iteration_request_uri = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_URI;
let iteration_request_title = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_TITLE;

let prj_label = TABLE_MICRO_SERVICE_FIELDS.FIELD_LABEL;
let prj_remark = TABLE_MICRO_SERVICE_FIELDS.FIELD_REMARK;

class RequestListVersion extends Component {

    constructor(props) {
        super(props);
        let iteratorId = this.props.match.params.id;
        this.state = {
            iteratorId,
            versionIteration: {},
            requestsJsxDividered: {},
            listColumn: [
                {
                    title: '接口地址',
                    dataIndex: iteration_request_uri,
                    render: (uri) => { 
                        if (uri.length > 50) {
                            return <Tooltip title={ uri } placement='right'>
                                {"..." + uri.substring(uri.length - 50, uri.length)}
                                </Tooltip>;
                        } else {
                            return uri;
                        }
                    }
                },
                {
                    title: '接口说明',
                    dataIndex: iteration_request_title,
                },
                {
                    title: '排序',
                    dataIndex: iteration_request_sort,
                    render: (sort, record) => {
                        let prj = record[iteration_request_prj];
                        let method = record[iteration_request_method];
                        let uri = record[iteration_request_uri];
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
                        let url = "#/version_iterator_request/" + this.state.iteratorId + "/" + record[iteration_request_prj] + "/" + record[iteration_request_method] + "/" + encode(record[iteration_request_uri]);
                        return (
                            <Space size="middle">
                                <Button type="link" icon={<EyeOutlined />} href={ url } />
                                { this.state.versionIteration[version_iterator_openflg] === 1 ? 
                                <Popconfirm
                                    title="删除api"
                                    description="确定删除该 api 吗？"
                                    onConfirm={e => {
                                        delVersionIteratorRequest(record, ()=>{
                                            this.onFinish({});
                                        });
                                    }}
                                    okText="确定"
                                    cancelText="取消"
                                >
                                    <Button danger type="link" icon={<DeleteOutlined />} />
                                </Popconfirm>
                                : null}
                            </Space>
                        );
                    },
                }
            ],
            formReadyFlg: false,
            folders: [],
            prj: "",
            folder: null,
            movedRequests: [],
        }
    }

    async componentWillReceiveProps(nextProps) {
        let iteratorId = nextProps.match.params.id;
        if (this.state.iteratorId !== iteratorId) {
            let versionIteration = await getVersionIterator(iteratorId);
            this.setState( { iteratorId, versionIteration }, () => this.onFinish({}) );
        }
    }

    componentDidMount() {
        if(this.props.prjs.length === 0) {
            getPrjs(this.props.dispatch);
        }
        this.onFinish({});
        getVersionIterator(this.state.iteratorId).then(versionIteration => this.setState( { versionIteration, formReadyFlg : true } ));
    }

    setApiSort = async (prj : string, method : string, uri : string, sort : number) => {
        setVersionIterationRequestSort(this.state.iteratorId, prj, method, uri, sort, () => {
            this.onFinish({
                prj: this.state.prj,
                folder: this.state.folder,
            });
        });
    }

    setMovedRequests = newMovedRequestKeys => {
        this.state.movedRequests = newMovedRequestKeys;
        this.onFinish({
            prj: this.state.prj,
            folder: this.state.folder,
        });
    }

    onFinish: FormProps<FieldType>['onFinish'] = async (values) => {
        let prj = values?.prj;
        let title = values?.title;
        let uri = values?.uri;
        let folder = values?.folder;
        let version_iteration_requests = await getVersionIteratorRequestsByProject(this.state.iteratorId, prj, folder, title, uri);
        let requestsDividered : any = {};
        let requestsJsxDividered : any = {};
        
        for(let version_iteration_request of version_iteration_requests ) {
            version_iteration_request.key = version_iteration_request[iteration_request_method] + "$$" + version_iteration_request[iteration_request_uri];
            let prj = version_iteration_request[iteration_request_prj];
            if (!(prj in requestsDividered)) {
                requestsDividered[prj] = {};
                requestsJsxDividered[prj] = [];
                let versionIterators = (await getOpenVersionIteratorsByPrj(prj))
                .filter(item => item[version_iterator_uuid] != this.state.iteratorId)
                .map(item => {
                    return {value: item[version_iterator_uuid], label: item[version_iterator_title]}
                });
                requestsJsxDividered[prj]['__iterators'] = versionIterators;
                requestsJsxDividered[prj]['__requests'] = [];
                let folders = await getVersionIteratorFolders(this.state.iteratorId, prj);
                let oldFolders = this.state.folders;
                oldFolders[prj] = folders;
            }
            let fold = version_iteration_request[iteration_request_fold];
            if (!(fold in requestsDividered[prj])) {
                requestsDividered[prj][fold] = [];

                let foldJsx = {};
                foldJsx.key = fold;
                foldJsx.label = "/" + fold;
                foldJsx.children = (<Table 
                    rowSelection={{selectedRowKeys: this.state.movedRequests, onChange: this.setMovedRequests}}
                    dataSource={requestsDividered[prj][fold]} 
                    columns={this.state.listColumn} 
                />);
                foldJsx.extra = ((!isStringEmpty(fold) && this.state.versionIteration[version_iterator_openflg] === 1) ? (
                <DeleteOutlined onClick={event => {
                    delVersionIteratorFolder(this.state.iteratorId, prj, fold, async ()=>{
                        message.success("删除文件夹成功");
                        let folders = await getVersionIteratorFolders(this.state.iteratorId, prj);
                        let oldFolders = this.state.folders;
                        oldFolders[prj] = folders;
                        this.setState({folders: cloneDeep(this.state.folders)});
                        this.onFinish({});
                    });
                    event.stopPropagation();
                }} />) : null);

                requestsJsxDividered[prj]['__requests'].push(foldJsx);
            }
            requestsDividered[prj][fold].push(version_iteration_request);
        }
        for (let _prj in requestsJsxDividered) {
            for (let requestJsxDividered of requestsJsxDividered[_prj]) {
                let fold = requestJsxDividered.key;
                requestJsxDividered.label = "/" + fold + "（" + requestsDividered[_prj][fold].length + "）";
            }
        }
        this.setState({
            requestsJsxDividered,
            prj,
            folder
        });
    }

    render() : ReactNode {

        return (
            <Layout>
                <Header style={{ padding: 0 }}>
                    迭代接口列表
                </Header>
                {this.state.formReadyFlg ?
                <Content style={{ padding: '0 16px' }}>
                    <Breadcrumb style={{ margin: '16px 0' }} items={[
                        { title: '迭代' }, 
                        { title: '接口列表' }
                    ]} />
                    <Flex vertical gap="middle">
                        <Flex>
                            <Descriptions column={2} title="迭代信息" items={ [
                                {
                                    key: version_iterator_title,
                                    label: '迭代名称',
                                    children: this.state.versionIteration[version_iterator_title],
                                },
                                {
                                    key: version_iterator_openflg,
                                    label: '迭代状态',
                                    children: this.state.versionIteration[version_iterator_openflg] === 1 ? "进行中" : "已结束",
                                },
                                {
                                    key: UNAME,
                                    label: '创建人',
                                    children: this.state.versionIteration[UNAME],
                                },
                                {
                                    key: version_iterator_ctime,
                                    label: '创建时间',
                                    children: getdayjs(this.state.versionIteration[version_iterator_ctime]).format("YYYY-MM-DD"),
                                },
                                ] } />
                        </Flex>
                        <Flex justify="flex-start" align="center" gap="middle">
                            <Form 
                                layout="inline"
                                onFinish={ this.onFinish } 
                                initialValues={ { prj: this.state.prj } }
                                autoComplete="off"
                            >
                                <Form.Item<FieldType> style={{paddingBottom: 20}} label="接口地址" name="uri" rules={[{ required: false }]}>
                                    <Input />
                                </Form.Item>

                                <Form.Item<FieldType> label="接口说明" name="title" rules={[{ required: false }]}>
                                    <Input />
                                </Form.Item>

                                <Form.Item<FieldType> label="选择项目" name="prj" rules={[{ required:  false }]}>
                                    <Select
                                        style={{ width: 180 }}
                                        options={this.state.versionIteration[version_iterator_prjs].map(item => {
                                            return {value: item, label: this.props.prjs.find(row => row[prj_label] === item) ? this.props.prjs.find(row => row[prj_label] === item)[prj_remark] : ""}
                                        })}
                                        onChange={ async value => {
                                            this.setState({ prj: value });
                                        } }
                                    />
                                </Form.Item>                           

                                <Form.Item<FieldType> label="选择文件夹" name="folder" rules={[{ required:  false }]}>
                                    <Select
                                        style={{ width: 180 }}
                                        options={ this.state.folders[this.state.prj] }
                                    />
                                </Form.Item>

                                <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
                                    <Button htmlType="submit">
                                        搜索
                                    </Button>
                                </Form.Item>
                            </Form>
                            <Flex vertical justify="flex-start" align="center" gap="middle">
                                <ConfigProvider
                                    theme={{
                                        components: {
                                        Button: {
                                            colorPrimary: `linear-gradient(90deg,  ${colorsAddRequestApi.join(', ')})`,
                                            colorPrimaryHover: `linear-gradient(90deg, ${getHoverColors(colorsAddRequestApi).join(', ')})`,
                                            colorPrimaryActive: `linear-gradient(90deg, ${getActiveColors(colorsAddRequestApi).join(', ')})`,
                                            lineWidth: 0,
                                        },
                                        },
                                    }}
                                    >
                                    <Button type="primary" href={'#/interator_add_request/' + this.state.iteratorId} size="large">
                                        新增接口
                                    </Button>
                                </ConfigProvider>

                                <ConfigProvider
                                    theme={{
                                        components: {
                                        Button: {
                                            colorPrimary: `linear-gradient(135deg,  ${colorsSendRequestApi.join(', ')})`,
                                            colorPrimaryHover: `linear-gradient(135deg, ${getHoverColors(colorsSendRequestApi).join(', ')})`,
                                            colorPrimaryActive: `linear-gradient(135deg, ${getActiveColors(colorsSendRequestApi).join(', ')})`,
                                            lineWidth: 0,
                                        },
                                        },
                                    }}
                                    >
                                    <Button type="primary" href={'#/internet_request_send_by_iterator/' + this.state.iteratorId} size="large">
                                        发起请求
                                    </Button>
                                </ConfigProvider>

                            </Flex>
                        </Flex>
                        {Object.keys(this.state.requestsJsxDividered).map(prj => (
                            (this.props.prjs.length > 0 && this.props.prjs.find(row => row[prj_label] === prj) ? 
                                <Flex vertical key={prj}>
                                    <Divider orientation="left">
                                        <p>{ "项目：" + (this.props.prjs.length > 0 ? this.props.prjs.find(row => row[prj_label] === prj)[prj_remark] : "") }</p >
                                    </Divider>
                                    <Form layout="inline">
                                        <Form.Item label="移动到迭代">
                                            <Select
                                                style={{minWidth: 130}}
                                                onChange={ value => {
                                                    batchMoveIteratorRequest(this.state.iteratorId, prj, this.state.movedRequests, value, () => {
                                                        this.state.movedRequests = [];
                                                        message.success("移动迭代成功");
                                                        this.onFinish({
                                                            prj: this.state.prj,
                                                            folder: this.state.folder,
                                                        });
                                                    });
                                                }}
                                                options={ this.state.requestsJsxDividered[prj]['__iterators'] }
                                            />
                                        </Form.Item>
                                        <Form.Item label="移动到文件夹">
                                            <Select
                                                style={{minWidth: 130}}
                                                onChange={ async value => {
                                                    await batchSetProjectRequestFold(this.state.iteratorId, prj, this.state.movedRequests, value);
                                                    this.state.movedRequests = [];
                                                    this.onFinish({
                                                        title: this.state.title, 
                                                        uri: this.state.uri
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
                                                options={ this.state.folders[prj] }
                                            />
                                        </Form.Item>
                                    </Form>
                                    <Collapse items={this.state.requestsJsxDividered[prj]['__requests']} />
                                </Flex>
                            : null)
                        ))}
                        <Flex vertical gap={"middle"}>
                            <Flex>
                                <Divider>迭代说明</Divider>
                            </Flex>
                            <MarkdownView showNav={ true } content={ this.state.versionIteration[version_iterator_content] } show={ this.state.formReadyFlg } />
                        </Flex> 
                    </Flex>
                    <FloatButton 
                        icon={<FileTextOutlined />}
                        description="迭代文档"
                        shape="square"
                        style={{right: 24, width: 60}}
                        onClick={() => window.location.href = "#/version_iterator_doc/" + this.state.iteratorId} />
                </Content>
                : null}
                <Footer style={{ textAlign: 'center' }}>
                ApiChain ©{new Date().getFullYear()} Created by 方海亮
                </Footer>
            </Layout>
        );
    }
}
    
function mapStateToProps (state) {
    return {
        prjs: state.prj.list
    }
}
      
export default connect(mapStateToProps)(RequestListVersion);