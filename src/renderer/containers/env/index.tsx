import { Component, ReactNode } from 'react';
import { connect } from 'react-redux';
import { 
  Breadcrumb, Layout,
  Flex, Space, Button, Popconfirm,
  Table
} from "antd";
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { cloneDeep } from 'lodash';

import { TABLE_ENV_FIELDS } from '../../../config/db';
import { getEnvs, delEnv } from '../../actions/env';
import { SHOW_ADD_ENV_MODEL, SHOW_EDIT_ENV_MODEL } from '../../../config/redux';
import AddEnvComponent from '../../components/env/add_env';

const { Header, Content, Footer } = Layout;

let env_label = TABLE_ENV_FIELDS.FIELD_LABEL;
let env_remark = TABLE_ENV_FIELDS.FIELD_REMARK;

class Env extends Component {

  constructor(props) {
    super(props);
    this.state = {
      listColumn: []
    }
  }

  componentDidMount(): void {
    getEnvs(this.props.dispatch);
    this.setListColumn();
  }

  setListColumn = () => {
    let listColumn = cloneDeep(this.props.listColumn);
    listColumn.push({
      title: '操作',
      key: 'operater',
      render: (_, record) => {
        return (
          <Space size="middle">
            <Button type="link" icon={<EditOutlined />} onClick={()=>this.editEnvClick(record)} />
            <Popconfirm
              title="删除服务器环境"
              description="确定删除该服务器环境吗？"
              onConfirm={e => {
                  delEnv(record, ()=>{
                    getEnvs(this.props.dispatch);
                  });
              }}
              okText="删除"
              cancelText="取消"
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
    });
  }

  render() : ReactNode {
    return (
      <Layout>
        <Header style={{ padding: 0 }}>
          开发环境配置
        </Header>
        <Content style={{ margin: '0 16px' }}>
            <Flex justify="space-between" align="center">
                <Breadcrumb style={{ margin: '16px 0' }} items={[{ title: '设置' }, { title: '开发环境' }]} />
                <Button  style={{ margin: '16px 0' }} type="primary" onClick={this.addEnvClick}>新增环境</Button>
                <AddEnvComponent />
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
        listColumn: state.env.envListColumn,
        listDatas: state.env.list,
    }
}

export default connect(mapStateToProps)(Env);