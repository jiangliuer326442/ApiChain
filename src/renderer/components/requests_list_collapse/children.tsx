import { Component, ReactNode } from 'react';
import { 
    Button,
    Dropdown,
    Flex, 
    Form, 
    InputNumber, 
    Popconfirm,
    Select,
    Space, 
    Table,
    Tooltip, 
} from 'antd';
import {
    EyeOutlined, 
    DeleteOutlined,
    SendOutlined, 
    MoreOutlined 
} from '@ant-design/icons';
import { encode } from 'base-64';
import { cloneDeep } from 'lodash';
import { connect } from 'react-redux';

import { FoldSourceIterator, FoldSourcePrj } from '@conf/global_config';
import {
    getFolderProjectRequests,
    setProjectRequestSort,
    batchMoveProjectRequestPrj,
    delProjectRequest,
} from '@act/project_request';
import {
    batchSetProjectRequestFold
} from '@act/project_folders';
import {
    getFolderIteratorRequests,
    delVersionIteratorRequest,
    setVersionIterationRequestSort,
    batchMoveIteratorRequest,
} from '@act/version_iterator_requests';
import {
    batchSetIteratorRequestFold
} from '@act/version_iterator_folders';
import { langTrans } from '@lang/i18n';
import FolderSelector from "@comp/folders";
import { TABLE_PROJECT_REQUEST_FIELDS, TABLE_VERSION_ITERATION_REQUEST_FIELDS, TABLE_VERSION_ITERATION_FIELDS } from '@conf/db';

let project_request_uri = TABLE_PROJECT_REQUEST_FIELDS.FIELD_URI;
let project_request_title = TABLE_PROJECT_REQUEST_FIELDS.FIELD_TITLE;
let project_request_method = TABLE_PROJECT_REQUEST_FIELDS.FIELD_REQUEST_METHOD;
let project_request_sort = TABLE_PROJECT_REQUEST_FIELDS.FIELD_SORT;
let project_request_prj = TABLE_PROJECT_REQUEST_FIELDS.FIELD_PROJECT_LABEL;

let iteration_request_uri = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_URI;
let iteration_request_title = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_TITLE;
let iteration_request_method = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_REQUEST_METHOD;
let iteration_request_sort = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_SORT;
let iteration_request_prj = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_MICRO_SERVICE_LABEL;

let version_iterator_uuid = TABLE_VERSION_ITERATION_FIELDS.FIELD_UUID;
let version_iterator_title = TABLE_VERSION_ITERATION_FIELDS.FIELD_NAME;

class RequestListCollapseChildren extends Component {

    constructor(props) {
      super(props);
      this.state = {
        selectedApi: [],
        pagination: {
          current: 1,
          pageSize: 10,
        },
        listColumn: [
            {
                title: langTrans("prj doc table field1"),
                dataIndex: props.type === "prj" ? project_request_uri : iteration_request_uri,
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
                dataIndex: props.type === "prj" ? project_request_title : iteration_request_title,
            },
            {
                title: langTrans("prj doc table field3"),
                dataIndex: props.type === "prj" ? project_request_sort : iteration_request_sort,
                render: (sort, record) => {
                    let method;
                    let uri;
                    if (this.props.type === "prj") {
                        method = record[project_request_method];
                        uri = record[project_request_uri];
                    } else if (this.props.type === "iterator") {
                        method = record[iteration_request_method];
                        uri = record[iteration_request_uri];
                    }
                    if (sort === undefined || Number.isNaN(sort)) {
                        sort = 0;
                    } else {
                        sort = Number(sort);
                    }
                    return <InputNumber style={{width: 65}} value={ sort } onBlur={event => this.setApiSort(method, uri, Number(event.target.value))} />;
                }
            },
            {
                title: langTrans("prj doc table field4"),
                key: 'operater',
                render: (_, record) => {
                    let sendRequestUrl;
                    let docDetailUrl;
                    if (this.props.type === "prj") {
                        sendRequestUrl = "#/internet_request_send_by_api/" + record[project_request_prj] + "/" + record[project_request_method] + "/" + encode(record[project_request_uri]);
                        docDetailUrl = "#/version_iterator_request/" + record[project_request_prj] + "/" + record[project_request_method] + "/" + encode(record[project_request_uri]);
                    } else if (this.props.type === "iterator") {
                        sendRequestUrl = "#/internet_request_send_by_api/" + this.props.metadata.split("$$")[0] + "/" + record[iteration_request_prj] + "/" + record[iteration_request_method] + "/" + encode(record[iteration_request_uri]);
                        docDetailUrl = "#/version_iterator_request/" + this.props.metadata.split("$$")[0] + "/" + record[iteration_request_prj] + "/" + record[iteration_request_method] + "/" + encode(record[iteration_request_uri]);
                    }
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
        listDatas: [],
        selectedFolder: null,
        movedPrj: "",
        movedIterator: "",
      }
    }

    componentDidMount() {
        let pagination = cloneDeep(this.state.pagination);
        this.getDatas(pagination);
    }

    async componentDidUpdate(prevProps) { 
        if (
            this.props.filterTitle != prevProps.filterTitle
            || 
            this.props.filterUri != prevProps.filterUri
            ||
            this.props.metadata !== prevProps.metadata
        ) {
            this.setState({selectedApi: [], selectedFolder: null, movedPrj: "", movedIterator: ""})
            let pagination = cloneDeep(this.state.pagination);
            this.getDatas(pagination);
        }
    }

    getMore = (record : any) => {
        return {'items': [{
            key: "1",
            danger: true,
            label: 
            <Popconfirm
                title={langTrans("prj doc del title")}
                description={langTrans("prj doc del desc")}
                onConfirm={async e => {
                    if (this.props.type === "prj") {
                        await delProjectRequest(this.props.clientType, this.props.teamId, record);
                    } else if (this.props.type === "iterator") {
                        let iteratorId = this.props.metadata.split("$$")[0];
                        await delVersionIteratorRequest(this.props.clientType, this.props.teamId, iteratorId, record);
                    }
                    let pagination = cloneDeep(this.state.pagination);
                    this.getDatas(pagination);
                }}
                okText={langTrans("prj doc del sure")}
                cancelText={langTrans("prj doc del cancel")}
            >
                <Button danger type="link" icon={<DeleteOutlined />} />
            </Popconfirm>,
        }]};
    }

    setApiSort = async (method : string, uri : string, sort : number) => {
        if (this.props.type === "prj") {
            let prj = this.props.metadata;
            await setProjectRequestSort(this.props.clientType, this.props.teamId, prj, method, uri, sort);
        } else if (this.props.type === "iterator") {
            let iteratorId = this.props.metadata.split("$$")[0];
            let prj = this.props.metadata.split("$$")[1];
            await setVersionIterationRequestSort(this.props.clientType, this.props.teamId, iteratorId, prj, method, uri, sort);
        }
        let pagination = cloneDeep(this.state.pagination);
        this.getDatas(pagination);
    }

    moveApiPrj = async (newPrj) => {
        let prj = this.props.metadata;
        if (newPrj === undefined) {
            this.setState({movedPrj: ""})
            return;
        }
        if (this.state.selectedApi.length === 0) return;
        await batchMoveProjectRequestPrj(this.props.clientType, this.props.teamId, prj, this.state.selectedApi, newPrj, this.props.device);
        this.setState({movedPrj: newPrj})
        let pagination = cloneDeep(this.state.pagination);
        this.getDatas(pagination);
    }

    moveApiIterator = async (newIterator) => { 
        let iteratorId = this.props.metadata.split("$$")[0];
        let prj = this.props.metadata.split("$$")[1];
        if (newIterator === undefined) {
            this.setState({movedIterator: ""})
            return;
        }
        if (this.state.selectedApi.length === 0) return;
        await batchMoveIteratorRequest(
            this.props.clientType, 
            this.props.teamId, 
            iteratorId, 
            prj, 
            this.state.selectedApi, 
            newIterator, 
            this.props.device
        )
        this.setState({movedIterator: newIterator})
        let pagination = cloneDeep(this.state.pagination);
        this.getDatas(pagination);
    }

    setSelectedApi = newSelectedRowKeys => {
        this.setState({selectedApi: newSelectedRowKeys});
    }

    getDatas = async (pagination) => {
        if (this.props.type === "prj") {
            let folder  = this.props.folder.substring(FoldSourcePrj.length);
            let prj = this.props.metadata;
            let datas = await getFolderProjectRequests(this.props.clientType, prj, folder, this.props.filterTitle, this.props.filterUri, pagination);
            this.setState({listDatas: datas, pagination, prj});
        } else if (this.props.type === "iterator") {
            let folder  = this.props.folder.substring(FoldSourceIterator.length);
            let iteratorId = this.props.metadata.split("$$")[0];
            let prj = this.props.metadata.split("$$")[1];
            let datas = await getFolderIteratorRequests(this.props.clientType, iteratorId, prj, folder, this.props.filterTitle, this.props.filterUri, pagination);
            this.setState({listDatas: datas, pagination, iteratorId, prj});
        }
    }

    render() : ReactNode {
        return (
            <Flex vertical>
                <Form layout="inline" style={{marginBottom: 16}}>
                    <Form.Item label={langTrans("prj doc operator3")}>
                        <FolderSelector 
                            type={this.props.type}
                            metadata={this.props.metadata}
                            value={ this.state.selectedFolder }
                            setValue={ async value => {
                                if (value === undefined) {
                                    this.setState({selectedFolder: null})
                                    return;
                                }
                                if (this.state.selectedApi.length === 0) return;
                                let folderName = "";
                                if (this.props.type === "prj") {
                                    let prj = this.props.metadata;
                                    folderName = value.substring(FoldSourcePrj.length);
                                    await batchSetProjectRequestFold(this.props.clientType, this.props.teamId, prj, this.state.selectedApi, folderName);
                                } else if (this.props.type === "iterator") {
                                    let iteratorId = this.props.metadata.split("$$")[0];
                                    let prj = this.props.metadata.split("$$")[1];
                                    folderName = value.substring(FoldSourceIterator.length);
                                    await batchSetIteratorRequestFold(this.props.clientType, this.props.teamId, iteratorId, prj, this.state.selectedApi, folderName);
                                }
                                this.setState({selectedFolder: value})
                                let pagination = cloneDeep(this.state.pagination);
                                this.getDatas(pagination);
                                if (this.props.type === "iterator") {
                                    this.props.refreshCallback();
                                }
                            } }
                            refreshFolders={ async () => {
                                this.props.refreshCallback();
                            }}
                            folders={ this.props.folders.filter(row => row.value !== this.props.folder) }
                        />
                    </Form.Item>
                {this.props.type === "prj" ? 
                    <Form.Item label={ langTrans("prj doc operator4") }>
                        <Select 
                            showSearch
                            allowClear
                            value={this.state.movedPrj}
                            style={ {minWidth: 260} }
                            options={ this.props.prjs.filter(item => item.value !== this.props.metadata) }
                            onChange={ this.moveApiPrj }
                        />
                    </Form.Item>
                : null}
                {this.props.type === "iterator" ? 
                    <Form.Item label={ langTrans("version doc operator3") }>
                        <Select 
                            showSearch
                            allowClear
                            value={this.state.movedIterator}
                            style={{minWidth: 260}}
                            options={this.props.iterators.map(item => ({
                                value: item[version_iterator_uuid],
                                label: item[version_iterator_title]
                            }))
                            .filter(item => item.value !== this.props.metadata.split("$$")[0]) }
                            onChange={ this.moveApiIterator }
                        />
                    </Form.Item>
                : null}
                </Form>
                <Table 
                    rowKey={(record) => this.props.type === "prj" ? 
                        (record[project_request_method] + "$$" + record[project_request_uri]) : 
                        (record[iteration_request_method] + "$$" + record[iteration_request_uri])}
                    rowSelection={{selectedRowKeys: this.state.selectedApi, onChange: this.setSelectedApi}}
                    dataSource={this.state.listDatas} 
                    pagination={this.state.pagination}
                    columns={this.state.listColumn}
                    onChange={ (pagination, filters, sorter) => {
                        this.getDatas(pagination);
                    }}
                />
            </Flex>
        )
    }
}

function mapStateToProps (state) {
    return {
      teamId: state.device.teamId,
      clientType: state.device.clientType,
      prjs: state.prj.list,
      iterators: state.version_iterator.list,
      device : state.device,
    }
}

export default connect(mapStateToProps)(RequestListCollapseChildren);