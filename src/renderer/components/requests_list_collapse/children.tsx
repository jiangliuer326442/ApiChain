import { Component, ReactNode } from 'react';
import { 
    Button,
    Dropdown,
    Flex, 
    Form, 
    InputNumber, 
    Popconfirm,
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
} from '@act/project_request';
import {
    batchSetProjectRequestFold
} from '@act/project_folders';
import {
    getFolderIteratorRequests
} from '@act/version_iterator_requests';
import { langTrans } from '@lang/i18n';
import FolderSelector from "@comp/folders";
import { TABLE_PROJECT_REQUEST_FIELDS } from '@conf/db';

let project_request_uri = TABLE_PROJECT_REQUEST_FIELDS.FIELD_URI;
let project_request_title = TABLE_PROJECT_REQUEST_FIELDS.FIELD_TITLE;
let project_request_method = TABLE_PROJECT_REQUEST_FIELDS.FIELD_REQUEST_METHOD;
let project_request_sort = TABLE_PROJECT_REQUEST_FIELDS.FIELD_SORT;
let project_request_prj = TABLE_PROJECT_REQUEST_FIELDS.FIELD_PROJECT_LABEL;

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
        listDatas: [],
        selectedFolder: "",
        iteratorId: "",
        prj: "",
        folders: [],
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
            this.props.folders.length != prevProps.folders.length
        ) {
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

    setApiSort = async (prj : string, method : string, uri : string, sort : number) => {
        setProjectRequestSort(prj, method, uri, sort, () => {
            
        });
    }

    setSelectedApi = newSelectedRowKeys => {
        this.setState({selectedApi: newSelectedRowKeys});
    }

    getDatas = async (pagination) => {
        let folders = this.props.folders.filter(row => row.value !== this.props.folder);
        if (this.props.folder.indexOf(FoldSourcePrj) === 0) {
            let folder  = this.props.folder.substring(FoldSourcePrj.length);
            let prj = this.props.metadata;
            let datas = await getFolderProjectRequests(this.props.clientType, prj, folder, this.props.filterTitle, this.props.filterUri, pagination);
            this.setState({listDatas: datas, pagination, prj, folders});
        } else if (this.props.folder.indexOf(FoldSourceIterator) === 0) {
            let folder  = this.props.folder.substring(FoldSourceIterator.length);
            let iteratorId = this.props.metadata.split("$$")[0];
            let prj = this.props.metadata.split("$$")[1];
            let datas = await getFolderIteratorRequests(this.props.clientType, iteratorId, prj, folder, pagination);
            this.setState({listDatas: datas, pagination, iteratorId, prj, folders});
        }
    }

    render() : ReactNode {
        return (
            <Flex vertical>
                <Form layout="inline" style={{marginBottom: 16}}>
                    <Form.Item label={langTrans("prj doc operator3")}>
                        <FolderSelector 
                            versionIterator={ this.state.iteratorId }
                            prj={ this.state.prj }
                            value={ this.state.selectedFolder }
                            setValue={ async value => {
                                if (value === undefined) return;
                                if (this.state.selectedApi.length === 0) return;
                                let folderName = "";
                                if (this.props.folder.indexOf(FoldSourcePrj) === 0) {
                                    let prj = this.props.metadata;
                                    folderName = value.substring(FoldSourcePrj.length);
                                    await batchSetProjectRequestFold(this.props.clientType, this.props.teamId, prj, this.state.selectedApi, folderName);
                                }
                                this.setState({selectedFolder: value})
                                let pagination = cloneDeep(this.state.pagination);
                                this.getDatas(pagination);
                            } }
                            refreshFolders={ async () => {
                                this.props.refreshCallback();
                            }}
                            folders={ this.state.folders }
                        />
                    </Form.Item>
                </Form>
                <Table 
                    rowKey={(record) => record[project_request_method] + "$$" + record[project_request_uri]}
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
    }
}

export default connect(mapStateToProps)(RequestListCollapseChildren);