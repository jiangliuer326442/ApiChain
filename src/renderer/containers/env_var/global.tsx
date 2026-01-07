import { Component, ReactNode } from 'react';
import { connect } from 'react-redux';
import { 
  Breadcrumb, Layout, Form, Select,
  Flex, Space, Button, Popconfirm, Table,
  Typography, AutoComplete, Input, message
} from "antd";
import { EditOutlined, DeleteOutlined, CloseSquareFilled } from '@ant-design/icons';
import { cloneDeep } from 'lodash';

import { isStringEmpty, getdayjs } from '@rutil/index';
import { GET_ENV_VALS } from '@conf/redux';
import AddEnvVarComponent from '@comp/env_var/add_env_var';
import { TABLE_ENV_VAR_FIELDS, UNAME } from '@conf/db';
import { ENV_LIST_ROUTE } from '@conf/routers';
import { getWikiEnv } from '@conf/url';
import { SHOW_ADD_PROPERTY_MODEL, SHOW_EDIT_PROPERTY_MODEL } from '@conf/redux';

import { getEnvs } from '@act/env';
import { 
  getGlobalEnvValuesByPage, 
  delGlobalEnvValues,
  batchCopyGlobalEnvValues,
} from '@act/env_value';
import { getGlobalKeys } from '@act/keys';

import { langTrans } from '@lang/i18n';

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
        pkeys: [],
        env: "",
        copiedKeys: [],
      }
    }
  
    componentDidMount(): void {
      this.getEnvValueData(this.state.env ? this.state.env : this.props.env, "");
      if (this.props.envs.length === 0) {
        getEnvs(this.props.clientType, this.props.dispatch);
      }
    }

    setEnvironmentChange = (value: string) => {
      this.props.dispatch({
        type: GET_ENV_VALS,
        prj: "",
        env: value,
        iterator: "",
        unittest: ""
      });
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
      let pkeys = await getGlobalKeys(this.props.clientType);
      if(!isStringEmpty(env)) {
        let pagination = cloneDeep(this.state.pagination);
        let datas = await getGlobalEnvValuesByPage(env, paramName, this.props.clientType, pagination);
        this.setState({
          listDatas: datas, 
          pagination,
          pkeys: !paramName ? pkeys : [],
        });
      }
    }

    setCopiedKeys = copiedKeys => {
      this.setState({copiedKeys});
    }
  
    render() : ReactNode {
      let currentEnv = this.state.env ? this.state.env : this.props.env;
      let isEmptyEnv = isStringEmpty(currentEnv);
      return (
        <Layout>
          <Header style={{ padding: 0 }}>
            {langTrans("envvar global title")} <Text type="secondary"><Link href={getWikiEnv()}>{langTrans("envvar global doc")}</Link></Text>
          </Header>
          <Content style={{ padding: '0 16px' }}>
            <Breadcrumb style={{ margin: '16px 0' }} items={[
              { title: langTrans("envvar global bread1") }, 
              { title: langTrans("envvar global bread2") },
              { title: langTrans("envvar global bread3") }
            ]} />
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
                      <Button type="link" href={"#" + ENV_LIST_ROUTE}>{langTrans("envvar prj add env")}</Button>
                      }
                  </Form.Item>
                  <Form.Item style={{paddingBottom: 20}} label={langTrans("envvar select tip2")}>
                      <AutoComplete 
                          allowClear={{ clearIcon: <CloseSquareFilled /> }} 
                          options={this.state.pkeys.map(item => ({
                            value: item,
                            label: item
                          }))} 
                          filterOption={(inputValue, option) =>
                            (inputValue && option!.value.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1) || (!inputValue)
                          }
                          onSelect={this.setPName}
                          onClear={()=>this.setPName("")}
                          showSearch
                      >
                          <Input />
                      </AutoComplete>
                  </Form.Item>
                  <Form.Item label={langTrans("envvar select tip3")}>
                    <Select
                        onChange={ async value => {
                          if (this.state.copiedKeys.length === 0) return;
                          if (isStringEmpty(value)) return;
                          await batchCopyGlobalEnvValues(this.props.clientType, this.props.teamId, (this.state.env ? this.state.env : this.props.env), value, this.state.copiedKeys);
                          this.state.copiedKeys = [];
                          message.success(langTrans("envvar global copy success"));
                          this.setEnvironmentChange(value);
                        }}
                        style={{ width: 120 }}
                        options={this.props.envs
                          .filter(item => item.value != (this.state.env ? this.state.env : this.props.env))
                          .map(item => {
                            return {value: item.value, label: item.label}
                          })
                        }
                        allowClear
                    />
                  </Form.Item>
                </Form>
              <Button  
                style={{ margin: '16px 0' }} type="primary" 
                onClick={this.addPropertiesClick} 
                disabled={ isEmptyEnv }>
                  {isEmptyEnv ? langTrans("envvar global add before check") : langTrans("envvar global add")}
              </Button>
              <AddEnvVarComponent cb={()=>{
                this.getEnvValueData(this.state.env ? this.state.env : this.props.env, "");
              }} />
            </Flex>
            <Table style={{marginTop: 25}} 
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
          ApiChain ©{new Date().getFullYear()} Created by Mustafa Fang
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