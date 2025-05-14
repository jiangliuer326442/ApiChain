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
import { cloneDeep } from 'lodash';

import VersionIteratorSwitch from '@comp/version_iterator/switch';
import { VERSION_ITERATOR_ADD_ROUTE } from "@conf/routers";
import { TABLE_VERSION_ITERATION_FIELDS, TABLE_MICRO_SERVICE_FIELDS } from '@conf/db';
import { 
  getOpenVersionIterators,
  getVersionIteratorsByPage, 
  delVersionIterator 
} from "@act/version_iterator";
import { langTrans } from '@lang/i18n';

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
              title: langTrans("iterator table1"),
              dataIndex: version_iterator_title,
          },
          {
            title: langTrans("iterator table2"),
            dataIndex: version_iterator_prjects,
            width: 200,
            render: (projects) => {
              return projects.
                filter(_prj => this.props.projects.find(row => row.value === _prj)).
                map(_prj => this.props.projects.find(row => row.value === _prj).label).
                join(" , ");
            },
          },
          {
            title: langTrans("iterator table3"),
            dataIndex: version_iterator_openflg,
            width: 90,
            render: (status, row) => {
              return <VersionIteratorSwitch defaultChecked={status} uuid={row[version_iterator_uuid]} cb={async ()=>{
                getOpenVersionIterators(this.props.dispatch);
                let pagination = cloneDeep(this.state.pagination);
                let listDatas = await getVersionIteratorsByPage(this.props.clientType, pagination)
                this.setState({listDatas, pagination});
              }} />
            },
          },
          {
            title: langTrans("iterator table4"),
            key: 'operater',
            width: 100,
            render: (_, record) => {
              return (
                <Space size="middle">
                  <Button type="link" icon={record[version_iterator_openflg] === 0 ? <EyeOutlined /> : <EditOutlined />} href={"#/version_iterator/" + record[version_iterator_uuid]} />
                  { record[version_iterator_openflg] === 1 ? 
                  <Popconfirm
                  title={langTrans("iterator del title")}
                  description={langTrans("iterator del desc")}
                  onConfirm={e => {
                      delVersionIterator(record, async ()=>{
                        let pagination = cloneDeep(this.state.pagination);
                        let listDatas = await getVersionIteratorsByPage(this.props.clientType, pagination)
                        this.setState({listDatas});
                      });
                  }}
                  okText={langTrans("iterator del sure")}
                  cancelText={langTrans("iterator del cancel")}
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
        ],
        listDatas: [],
        pagination: {
          current: 1,
          pageSize: 10,
        },
      }
    }

    async componentDidMount() {
      let pagination = cloneDeep(this.state.pagination);
      let listDatas = await getVersionIteratorsByPage(this.props.clientType, pagination)
      this.setState({listDatas, pagination});
    }

    render() : ReactNode {
        return (
          <Layout>
            <Header style={{ padding: 0 }}>
              {langTrans("iterator title")}
            </Header>
            <Content style={{ padding: '0 16px' }}>
                <Flex justify="space-between" align="center">
                    <Breadcrumb style={{ margin: '16px 0' }} items={[{ title: langTrans("iterator bread1") }, { title: langTrans("iterator bread2") }]} />
                    <Button  style={{ margin: '16px 0' }} type="primary" href={"#" + VERSION_ITERATOR_ADD_ROUTE}>{langTrans("iterator add")}</Button>
                </Flex>
                <Table 
                  dataSource={this.state.listDatas} 
                  rowKey={(record) => record.uuid}
                  columns={this.state.listColumn} 
                  pagination={this.state.pagination}
                  onChange={ async (pagination, filters, sorter) => {
                    let listDatas = await getVersionIteratorsByPage(this.props.clientType, pagination)
                    this.setState({listDatas, pagination});
                  }} />
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
      projects: state.prj.list,
      teamId: state.device.teamId,
      clientType: state.device.clientType,
    }
}

export default connect(mapStateToProps)(VersionIterator);