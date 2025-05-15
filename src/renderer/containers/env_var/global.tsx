import { Component, ReactNode } from 'react';
import { connect } from 'react-redux';
import { 
  Breadcrumb, Layout, Form, Select,
  Flex, Space, Button, Popconfirm, Table,
  Typography, AutoComplete, Input, message
} from "antd";
import { EditOutlined, DeleteOutlined, CloseSquareFilled } from '@ant-design/icons';

import { isStringEmpty, getdayjs } from '@rutil/index';
import RequestSendTips from '@clazz/RequestSendTips';
import AddEnvVarComponent from '@comp/env_var/add_env_var';
import { TABLE_ENV_VAR_FIELDS, UNAME } from '@conf/db';
import { ENV_LIST_ROUTE } from '@conf/routers';
import { getWikiEnv } from '@conf/url';
import { SHOW_ADD_PROPERTY_MODEL, SHOW_EDIT_PROPERTY_MODEL } from '@conf/redux';
import { getEnvs } from '@act/env';
import { 
  getGlobalEnvValuesByPage, 
  delGlobalEnvValues,
  batchCopyEnvVales,
} from '@act/env_value';
import { langTrans } from '@lang/i18n';
import { cloneDeep } from 'lodash';

const { Header, Content, Footer } = Layout;
const { Text, Link } = Typography;

let pname = TABLE_ENV_VAR_FIELDS.FIELD_PARAM_NAME;
let pvar = TABLE_ENV_VAR_FIELDS.FIELD_PARAM_VAR;
let premark = TABLE_ENV_VAR_FIELDS.FIELD_PARAM_REMARK;
let env_var_ctime = TABLE_ENV_VAR_FIELDS.FIELD_CTIME;

class EnvVar extends Component {

    constructor(props) {
      super(props);
      this.state = {
        listColumn: [
          {
            title: langTrans("envvar global table1"),
            dataIndex: pname,
            width: 100,
            render: (value) => {
              return (
                <Text copyable={{text: value}}>{ value }</Text>
              );
            }
          },
          {
            title: langTrans("envvar global table2"),
            dataIndex: pvar,
            render: (value) => {
              return (
                <Text copyable={{text: value}}>{ value }</Text>
              );
            }
          },
          {
            title: langTrans("envvar global table3"),
            dataIndex: premark,
            width: 150,
          },
          {
            title: langTrans("envvar global table4"),
            dataIndex: UNAME,
            width: 100,
            ellipsis: true,
          },
          {
              title: langTrans("envvar global table5"),
              dataIndex: env_var_ctime,
              width: 120,
              render: (time) => { return getdayjs(time).format("YYYY-MM-DD") },
          },
          {
            title: langTrans("envvar global table6"),
            key: 'operater',
            width: 100,
            render: (_, record) => {
              return (
                <Space size="small">
                  <Button type="link" icon={<EditOutlined />} onClick={()=>this.editPropertiesClick(record)} />
                  <Popconfirm
                    title={langTrans("envvar global del title")}
                    description={langTrans("envvar global del desc")}
                    onConfirm={async e => {
                      await delGlobalEnvValues((this.state.env ? this.state.env : this.props.env), record[pname], this.props.clientType, this.props.teamId);
                      this.getEnvValueData((this.state.env ? this.state.env : this.props.env), "")
                    }}
                    okText={langTrans("envvar global del sure")}
                    cancelText={langTrans("envvar global del cancel")}
                  >
                    <Button danger type="link" icon={<DeleteOutlined />} />
                  </Popconfirm>
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
        tips: [],
        pkeys: [],
        env: "",
        copiedKeys: [],
      }
    }
  
    componentDidMount(): void {
      this.getEnvValueData(this.state.env ? this.state.env : this.props.env, "");
      if(this.props.envs.length === 0) {
        getEnvs(this.props.clientType, this.props.dispatch);
      }
    }

    setEnvironmentChange = (value: string) => {
      this.setState({env: value});
      this.getEnvValueData(value, "");
    }

    setPName = (value: string) => {
      this.getEnvValueData(this.state.env ? this.state.env : this.props.env, value);
    }
  
    addPropertiesClick = () => {
      this.props.dispatch({
          type: SHOW_ADD_PROPERTY_MODEL,
          open: true
      });
    }
  
    editPropertiesClick = (record) => {
      this.props.dispatch({
          type: SHOW_EDIT_PROPERTY_MODEL,
          open: true,
          pname: record[pname],
          pvalue: record[pvar],
          premark: record[premark],
      });
    }

    getEnvValueData = async (env: string, paramName: string) => {
      let requestSendTip = new RequestSendTips();
      requestSendTip.init("", "", "", "", this.props.dispatch, env_vars => {});
      requestSendTip.getTips(envKeys => {
        let tips = [];
        for(let envKey of envKeys) {
          tips.push( {value: envKey} );
        }
        this.setState( { tips } );
      });
      if(!isStringEmpty(env)) {
        let pagination = cloneDeep(this.state.pagination);
        let datas = await getGlobalEnvValuesByPage(env, paramName, this.props.clientType, pagination);
        this.setState({listDatas: datas, pagination});
        if (!paramName) {
          this.setState({pkeys: datas.map(item => ({ value: item[pname] }))});
        }
      }
    }

    setCopiedKeys = copiedKeys => {
      this.setState({copiedKeys});
    }
  
    render() : ReactNode {
      return (
        <Layout>
          <Header style={{ padding: 0 }}>
            {langTrans("envvar global title")} <Text type="secondary"><Link href={getWikiEnv()}>{langTrans("envvar global doc")}</Link></Text>
          </Header>
          <Content style={{ padding: '0 16px' }}>
            <Breadcrumb style={{ margin: '16px 0' }} items={[{ title: langTrans("envvar global bread1") }, { title: langTrans("envvar global bread2") }]} />
            <Flex justify="space-between" align="center">
              <Form layout="inline">
                  <Form.Item label={langTrans("envvar select tip1")}>
                      {this.props.envs.length > 0 ?
                      <Select
                        value={ this.state.env ? this.state.env : this.props.env }
                        onChange={this.setEnvironmentChange}
                        style={{ width: 120 }}
                        options={this.props.envs}
                      />
                      :
                      <Button type="link" href={"#" + ENV_LIST_ROUTE}>添加服务器环境</Button>
                      }
                  </Form.Item>
                  <Form.Item style={{paddingBottom: 20}} label={langTrans("envvar select tip2")}>
                      <AutoComplete 
                          allowClear={{ clearIcon: <CloseSquareFilled /> }} 
                          options={this.state.pkeys} 
                          filterOption={(inputValue, option) =>
                            (inputValue && option!.value.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1) || (!inputValue)
                          }
                          onSelect={this.setPName}
                          onClear={()=>this.setPName("")}
                      >
                          <Input />
                      </AutoComplete>
                  </Form.Item>
                  <Form.Item label={langTrans("envvar select tip3")}>
                    <Select
                        onChange={ async value => {
                          if (this.state.copiedKeys.length === 0) return;
                          await batchCopyEnvVales("", (this.state.env ? this.state.env : this.props.env), "", "", this.state.copiedKeys, value);
                          this.state.copiedKeys = [];
                          message.success("环境变量拷贝成功");
                          this.setEnvironmentChange(value);
                        }}
                        style={{ width: 120 }}
                        options={this.props.envs
                          .filter(item => item.label != (this.state.env ? this.state.env : this.props.env))
                          .map(item => {
                            return {value: item.label, label: item.remark}
                          })
                        }
                        allowClear
                    />
                  </Form.Item>
                </Form>
              <Button  style={{ margin: '16px 0' }} type="primary" onClick={this.addPropertiesClick} disabled={ isStringEmpty(this.state.env ? this.state.env : this.props.env) }>{langTrans("envvar global add")}</Button>
              <AddEnvVarComponent tips={this.state.tips} cb={()=>{
                this.getEnvValueData(this.state.env ? this.state.env : this.props.env, "");
              }} />
            </Flex>
            <Table 
              rowSelection={{selectedRowKeys: this.state.copiedKeys, onChange: this.setCopiedKeys}}
              dataSource={this.state.listDatas} 
              rowKey={(record) => record[pname]}
              columns={this.state.listColumn} 
              pagination={this.state.pagination}
              onChange={ async (pagination, filters, sorter) => {
                this.state.pagination = pagination;
                this.getEnvValueData(this.state.env ? this.state.env : this.props.env, "");
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
      env: state.env_var.env,
      device : state.device,
      envs: state.env.list,
      teamId: state.device.teamId,
      clientType: state.device.clientType,
  }
}

export default connect(mapStateToProps)(EnvVar);