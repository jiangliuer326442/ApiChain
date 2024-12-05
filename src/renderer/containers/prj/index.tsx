import { Component, ReactNode } from 'react';
import { connect } from 'react-redux';
import { 
  Breadcrumb, Layout,
  Flex, Space, Button, Popconfirm,
  Table
} from "antd";
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';

import { TABLE_MICRO_SERVICE_FIELDS } from '../../../config/db';
import { getPrjs, delPrj } from '../../actions/project';
import { SHOW_ADD_PRJ_MODEL, SHOW_EDIT_PRJ_MODEL } from '../../../config/redux';
import AddPrjComponent from '../../components/prj/add_prj';

var _ = require('lodash');

const { Header, Content, Footer } = Layout;

let prj_label = TABLE_MICRO_SERVICE_FIELDS.FIELD_LABEL;
let prj_remark = TABLE_MICRO_SERVICE_FIELDS.FIELD_REMARK;

class Project extends Component {

    constructor(props) {
      super(props);
      this.state = {
        listColumn: []
      }
    }
  
    componentDidMount(): void {
      getPrjs(this.props.dispatch);
      this.setListColumn();
    }
  
    setListColumn = () => {
      let listColumn = _.cloneDeep(this.props.listColumn);
      listColumn.push({
        title: '操作',
        key: 'operater',
        render: (_, record) => {
          return (
            <Space size="middle">
              <Button type="link" icon={<EditOutlined />} onClick={()=>this.editPrjClick(record)} />
              <Popconfirm
                title="删除微服务"
                description="确定删除该微服务吗？"
                onConfirm={e => {
                    delPrj(record, ()=>{
                      getPrjs(this.props.dispatch);
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
  
    addPrjClick = () => {
      this.props.dispatch({
          type: SHOW_ADD_PRJ_MODEL,
          open: true
      });
    }
  
    editPrjClick = (record) => {
      this.props.dispatch({
          type: SHOW_EDIT_PRJ_MODEL,
          open: true,
          prj: record[prj_label],
          remark: record[prj_remark],
      });
    }
  
    render() : ReactNode {
      return (
        <Layout>
          <Header style={{ padding: 0 }}>
            项目/微服务配置
          </Header>
          <Content style={{ margin: '0 16px' }}>
              <Flex justify="space-between" align="center">
                  <Breadcrumb style={{ margin: '16px 0' }} items={[{ title: '设置' }, { title: '微服务' }]} />
                  <Button  style={{ margin: '16px 0' }} type="primary" onClick={this.addPrjClick}>添加微服务</Button>
                  <AddPrjComponent />
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
        listColumn: state.prj.projectListColumn,
        listDatas: state.prj.list,
    }
}

export default connect(mapStateToProps)(Project);