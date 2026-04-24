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
import MarkdownView from '@comp/markdown/show';
import AddEnvVarComponent from '@comp/env_var/add_env_var';
import { getEnvVarDoc } from '@conf/doc';
import { TABLE_ENV_VAR_FIELDS, UNAME } from '@conf/db';
import { ENV_LIST_ROUTE } from '@conf/routers';
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
const { Text } = Typography;

let pname = TABLE_ENV_VAR_FIELDS.FIELD_PARAM_NAME;
let pvar = TABLE_ENV_VAR_FIELDS.FIELD_PARAM_VAR;
let premark = TABLE_ENV_VAR_FIELDS.FIELD_PARAM_REMARK;
let encryptFlg = TABLE_ENV_VAR_FIELDS.FIELD_ENCRYPTFLG;
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
            render: (value, record) => {
              if (record[encryptFlg] !== undefined && record[encryptFlg] == 1) {
                return "******";
              } else {
                return (
                  <Text copyable={{text: value}}>{ value }</Text>
                );
              }
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
                      await delGlobalEnvValues((this.props.env), record[pname], this.props.clientType, this.props.teamId);
                      this.getEnvValueData((this.props.env), "", "")
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
        copiedKeys: [],
      }
    }
  
    componentDidMount(): void {
      this.getEnvValueData(this.props.env, "", "");
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
      this.getEnvValueData(value, "", "");
    }

    setPName = (value: string) => {
      this.getEnvValueData(this.props.env, value, "");
    }
  
    searchRemark = (event) => {
      let remark = event.target.value.trim();
      if (isStringEmpty(remark)) {
        this.getEnvValueData(this.props.env, "", "");
      } else {
        this.getEnvValueData(this.props.env, "", remark);
      }
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
          encryptFlg: record[encryptFlg],
      });
    }

    getEnvValueData = async (env: string, paramName: string, paramRemark: string) => {
      let pkeys = await getGlobalKeys(this.props.clientType);
      if(!isStringEmpty(env)) {
        let pagination = cloneDeep(this.state.pagination);
        let datas = await getGlobalEnvValuesByPage(env, paramName, paramRemark, this.props.clientType, pagination);
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
      return (
        <Layout>
          <Header style={{ padding: 0 }}>
            {langTrans("envvar global title")}
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
                        value={ this.props.env }
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
                  <Form.Item style={{paddingBottom: 20}} label={langTrans("envvar global table3")}>
                      <Input 
                        onPressEnter={this.searchRemark}
                      />
                  </Form.Item>
                  <Form.Item label={langTrans("envvar select tip3")}>
                    <Select
                        onChange={ async value => {
                          if (this.state.copiedKeys.length === 0) return;
                          if (isStringEmpty(value)) return;
                          await batchCopyGlobalEnvValues(this.props.clientType, this.props.teamId, this.props.env, value, this.state.copiedKeys);
                          this.state.copiedKeys = [];
                          message.success(langTrans("envvar global copy success"));
                          this.setEnvironmentChange(value);
                        }}
                        style={{ width: 120 }}
                        options={this.props.envs
                          .filter(item => item.value != (this.state.env ? this.state.env : this.props.env))
                        }
                        allowClear
                    />
                  </Form.Item>
                </Form>
              <Button  
                style={{ margin: '16px 0' }} type="primary" 
                onClick={this.addPropertiesClick} 
                disabled={ isStringEmpty(this.props.env) }>
                  {isStringEmpty(this.props.env) ? langTrans("envvar global add before check") : langTrans("envvar global add")}
              </Button>
              <AddEnvVarComponent 
                env={this.props.env}
                cb={()=>{
                  this.getEnvValueData(this.props.env, "", "");
                }} 
                />
            </Flex>
          {this.state.listDatas.length > 0 ? 
            <Table style={{marginTop: 25}} 
              rowSelection={{selectedRowKeys: this.state.copiedKeys, onChange: this.setCopiedKeys}}
              dataSource={this.state.listDatas} 
              rowKey={(record) => record[pname]}
              columns={this.state.listColumn} 
              pagination={this.state.pagination}
              onChange={ async (pagination) => {
                this.state.pagination = pagination;
                this.getEnvValueData(this.props.env, "", "");
              }} />
          : 
            <MarkdownView 
              content={ getEnvVarDoc() } 
            />
          }
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