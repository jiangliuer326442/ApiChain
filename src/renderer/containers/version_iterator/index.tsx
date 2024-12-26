import { Component, ReactNode } from 'react';
import { connect } from 'react-redux';
import { 
  EyeOutlined, 
  EditOutlined, 
  DeleteOutlined,
  FileMarkdownOutlined
} from '@ant-design/icons';
import { 
  Breadcrumb, Layout, Space,
  Flex, Button, Table, Popconfirm,
} from "antd";

import { VERSION_ITERATOR_ADD_ROUTE } from "../../../config/routers";
import { TABLE_VERSION_ITERATION_FIELDS, TABLE_MICRO_SERVICE_FIELDS } from '../../../config/db';
import { 
  getVersionIterators, 
  delVersionIterator 
} from "../../actions/version_iterator";
import VersionIteratorSwitch from '../../components/version_iterator/switch';

const { Header, Content, Footer } = Layout;

let prj_label = TABLE_MICRO_SERVICE_FIELDS.FIELD_LABEL;
let prj_remark = TABLE_MICRO_SERVICE_FIELDS.FIELD_REMARK;

let version_iterator_uuid = TABLE_VERSION_ITERATION_FIELDS.FIELD_UUID;
let version_iterator_title = TABLE_VERSION_ITERATION_FIELDS.FIELD_NAME;
let version_iterator_prjects = TABLE_VERSION_ITERATION_FIELDS.FIELD_PROJECTS;
let version_iterator_openflg = TABLE_VERSION_ITERATION_FIELDS.FIELD_OPENFLG;

class VersionIterator extends Component {

    constructor(props) {
      super(props);
      this.state = {
        listColumn: [
          {
              title: '迭代名称',
              dataIndex: version_iterator_title,
          },
          {
            title: '关联项目',
            dataIndex: version_iterator_prjects,
            width: 200,
            render: (projects) => {
              return projects.
                filter(_prj => this.props.projects.find(row => row[prj_label] === _prj)).
                map(_prj => this.props.projects.find(row => row[prj_label] === _prj)[prj_remark]).
                join(" , ");
            },
          },
          {
            title: '迭代状态',
            dataIndex: version_iterator_openflg,
            width: 90,
            render: (status, row) => {
              return <VersionIteratorSwitch defaultChecked={status} uuid={row[version_iterator_uuid]} />
            },
          },
          {
            title: '操作',
            key: 'operater',
            width: 100,
            render: (_, record) => {
              return (
                <Space size="middle">
                  <Button type="link" icon={record[version_iterator_openflg] === 0 ? <EyeOutlined /> : <EditOutlined />} href={"#/version_iterator/" + record[version_iterator_uuid]} />
                  { record[version_iterator_openflg] === 1 ? 
                  <Popconfirm
                  title="删除迭代"
                  description="删除迭代将导致该迭代下的接口作废，确定删除吗？"
                  onConfirm={e => {
                      delVersionIterator(record, ()=>{
                          getVersionIterators(this.props.dispatch);
                      });
                  }}
                  okText="删除"
                  cancelText="取消"
                >
                  <Button danger type="link" icon={<DeleteOutlined />} />
                </Popconfirm>
                  : 
                  <Button danger type="link" icon={<FileMarkdownOutlined />} href={"#/version_iterator_requests/" + record[version_iterator_uuid] } />
                }
                </Space>
              )
            },
          }
      ]
      }
    }

    componentDidMount(): void {
      getVersionIterators(this.props.dispatch);
    }

    render() : ReactNode {
        return (
          <Layout>
            <Header style={{ padding: 0 }}>
              版本迭代
            </Header>
            <Content style={{ padding: '0 16px' }}>
                <Flex justify="space-between" align="center">
                    <Breadcrumb style={{ margin: '16px 0' }} items={[{ title: '设置' }, { title: '迭代管理' }]} />
                    <Button  style={{ margin: '16px 0' }} type="primary" href={"#" + VERSION_ITERATOR_ADD_ROUTE}>新增迭代</Button>
                </Flex>
                <Table dataSource={this.props.listDatas} columns={this.state.listColumn} />
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
      listDatas: state.version_iterator.list,
      projects: state.prj.list,
    }
}

export default connect(mapStateToProps)(VersionIterator);