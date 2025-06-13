import { Component, ReactNode } from 'react';
import { connect } from 'react-redux';
import { 
  Breadcrumb, Layout,
  Flex, Space, Button, Popconfirm,
  Table
} from "antd";
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { cloneDeep } from 'lodash';

import { TABLE_ENV_FIELDS } from '@conf/db';
import { SHOW_ADD_ENV_MODEL, SHOW_EDIT_ENV_MODEL } from '@conf/redux';
import AddEnvComponent from '@comp/env/add_env';
import { langTrans } from '@lang/i18n';
import { getEnvsByPage, delEnv } from '@act/env';
import { isStringEmpty } from '@rutil/index';

const { Header, Content, Footer } = Layout;

let env_label = TABLE_ENV_FIELDS.FIELD_LABEL;
let env_remark = TABLE_ENV_FIELDS.FIELD_REMARK;
let request_device = TABLE_ENV_FIELDS.FIELD_REQUEST_DEVICE;

class Env extends Component {

  constructor(props) {
    super(props);
    this.state = {
      listColumn: [],
      listDatas: [],
      pagination: {
        current: 1,
        pageSize: 10,
      },
    }
  }

  async componentDidMount(): Promise<void> {
    this.setListColumn();
    let pagination = cloneDeep(this.state.pagination);
    let datas = await getEnvsByPage(this.props.clientType, pagination);
    this.setState({listDatas: datas, pagination});
  }

  setListColumn = () => {
    let listColumn = cloneDeep(this.props.listColumn);
    listColumn.push({
      title: langTrans("env table5"),
      key: 'operater',
      render: (_, record) => {
        return (
          <Space size="middle">
            <Button type="link" icon={<EditOutlined />} onClick={()=>this.editEnvClick(record)} />
            <Popconfirm
              title={langTrans("env del title")}
              description={langTrans("env del desc")}
              onConfirm={async e => {
                  await delEnv(this.props.clientType, this.props.teamId, record);
                  let pagination = cloneDeep(this.state.pagination);
                  let datas = await getEnvsByPage(this.props.clientType, pagination);
                  this.setState({listDatas: datas, pagination});
              }}
              okText={langTrans("env del sure")}
              cancelText={langTrans("env del cancel")}
            >
              <Button danger type="link" icon={<DeleteOutlined />} />
            </Popconfirm>
          </Space>
        )
      },
    });
    this.setState({listColumn});
  }

  addEnvClick = () => {
    this.props.dispatch({
        type: SHOW_ADD_ENV_MODEL,
        open: true
    });
  }

  editEnvClick = (record) => {
    this.props.dispatch({
        type: SHOW_EDIT_ENV_MODEL,
        open: true,
        env: record[env_label],
        remark: record[env_remark],
        requestDevice: record[request_device] == undefined ? 0 : record[request_device],
    });
  }

  render() : ReactNode {
    return (
      <Layout>
        <Header style={{ padding: 0 }}>
          {langTrans("env title")}
        </Header>
        <Content style={{ padding: '0 16px' }}>
            <Flex justify="space-between" align="center">
                <Breadcrumb style={{ margin: '16px 0' }} items={[{ title: langTrans("env bread1")}, { title: langTrans("env bread2") }]} />
                <Button  style={{ margin: '16px 0' }} type="primary" onClick={this.addEnvClick}>{langTrans("env add")}</Button>
                <AddEnvComponent cb={async () => {
                  let pagination = cloneDeep(this.state.pagination);
                  let datas = await getEnvsByPage(this.props.clientType, pagination);
                  this.setState({listDatas: datas, pagination});
                }} />
            </Flex>
            <Table 
              dataSource={this.state.listDatas} 
              rowKey={(record) => record.label}
              columns={this.state.listColumn} 
              pagination={this.state.pagination}
              onChange={ async (pagination, filters, sorter) => {
                let datas = await getEnvsByPage(this.props.clientType, pagination);
                this.setState({listDatas: datas, pagination});
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
      teamId: state.device.teamId,
      listColumn: state.env.envListColumn,
      clientType: state.device.clientType,
    }
}

export default connect(mapStateToProps)(Env);