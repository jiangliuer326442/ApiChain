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
import { TABLE_ENV_VAR_FIELDS, UNAME } from '@conf/db';
import { ENV_VALUE_API_HOST } from '@conf/envKeys';
import { ENV_LIST_ROUTE } from '@conf/routers';
import { GET_ENV_VALS } from '@conf/redux';
import { getWikiEnv } from '@conf/url';
import { SHOW_ADD_PROPERTY_MODEL, SHOW_EDIT_PROPERTY_MODEL } from '@conf/redux';
import { getEnvs } from '@act/env';
import { 
  getPrjEnvValuesByPage, 
  addEnvValues,
  delPrjEnvValues,
  batchCopyProjectEnvValues,
} from '@act/env_value';
import {
  getProjectKeys
} from '@act/keys';
import AddEnvVarComponent from '@comp/env_var/add_env_var';
import { langTrans } from '@lang/i18n';

const { Header, Content, Footer } = Layout;
const { Link, Text } = Typography;

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
          title: langTrans("envvar prj table1"),
          dataIndex: pname,
          width: 100,
          render: (value) => {
            return (
              <Text copyable={{text: value}}>{ value }</Text>
            );
          }
        },
        {
          title: langTrans("envvar prj table2"),
          dataIndex: pvar,
          width: 205,
          render: (value) => {
            return (
              <Text copyable={{text: value}}>{ value }</Text>
            );
          }
        },
        {
          title: langTrans("envvar prj table3"),
          dataIndex: premark,
          width: 150,
        },
        {
          title: langTrans("envvar prj table4"),
          dataIndex: UNAME,
          width: 100,
          ellipsis: true,
        },
        {
            title: langTrans("envvar prj table5"),
            dataIndex: env_var_ctime,
            width: 120,
            render: (time) => { return getdayjs(time).format("YYYY-MM-DD") },
        },
        {
          title: langTrans("envvar prj table6"),
          key: 'operater',
          width: 100,
          render: (_, record) => {
            if (record.source !== 'prj') {
              this.state.disabledKeys.push(record[pname]);
            }
            return (
              <Space size="small">
                <Button type="link" icon={<EditOutlined />} onClick={()=>this.editPropertiesClick(record)} />
                {(record.source === 'prj' && record[pname] !== ENV_VALUE_API_HOST) ? 
                <Popconfirm
                  title={langTrans("envvar prj del title")}
                  description={langTrans("envvar prj del desc")}
                  onConfirm={async e => {
                      await delPrjEnvValues(this.state.prj, (this.state.env ? this.state.env : this.props.env), record[pname], this.props.clientType, this.props.teamId);
                      this.getEnvValueData(this.state.prj, this.state.env ? this.state.env : this.props.env, "");
                  }}
                  okText={langTrans("envvar prj del sure")}
                  cancelText={langTrans("envvar prj del cancel")}
                >
                  <Button danger type="link" icon={<DeleteOutlined />} />
                </Popconfirm> : null}
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
      prj: this.props.match.params.prj,
      tips: [],
      pkeys: [],
      env: "",
      copiedKeys: [],
      disabledKeys: [],
    }
  }
  
  componentDidMount(): void {
    this.getEnvValueData(this.state.prj, this.state.env ? this.state.env : this.props.env, "");
    if(this.props.envs.length === 0) {
      getEnvs(this.props.clientType, this.props.dispatch);
    }
  }

  async componentWillReceiveProps(nextProps) {
    let nextPrj = nextProps.match.params.prj;
    if (this.state.prj !== nextPrj) {
      this.setState({
        listDatas:[],
        pagination: {
          current: 1,
          pageSize: 10,
        },
        tips: [],
        pkeys: [],
        copiedKeys: [],
        disabledKeys: [],
      });
      this.getEnvValueData(nextPrj, this.state.env ? this.state.env : this.props.env, "");
    }
  }

    setEnvironmentChange = (value: string) => {
      this.props.dispatch({
        type: GET_ENV_VALS,
        prj: this.state.prj,
        env: value,
        iterator: "",
        unittest: ""
      });
      this.setState({env: value});
      this.getEnvValueData(this.state.prj, value, "");
    }

    setPName = (value: string) => {
      this.getEnvValueData(this.state.prj, this.state.env ? this.state.env : this.props.env, value);
    }
  
    addPropertiesClick = () => {
      this.props.dispatch({
          type: SHOW_ADD_PROPERTY_MODEL,
          open: true,
          prj: this.state.prj
      });
    }
  
    editPropertiesClick = (record) => {
      this.props.dispatch({
          type: SHOW_EDIT_PROPERTY_MODEL,
          open: true,
          prj: this.state.prj,
          pname: record[pname],
          pvalue: record[pvar],
          premark: record[premark],
      });
    }

    getEnvValueData = async (prj: string, env: string, paramName: string) => {
      let pkeys = await getProjectKeys(this.props.clientType, prj);
      if(!isStringEmpty(env)) {
        let pagination = cloneDeep(this.state.pagination);
        let listDatas = await getPrjEnvValuesByPage(prj, env, paramName, this.props.clientType, pagination);
        this.setState({
          prj, 
          listDatas, 
          pagination,
          pkeys: !paramName ? pkeys : [],
        });

        let hasApiHost = false;
        for (let item of listDatas) {
          if(item[pname] === ENV_VALUE_API_HOST) {
            hasApiHost = true;
            break;
          }
        }
        if(!hasApiHost) {
          await addEnvValues(this.props.clientType, this.props.teamId, prj, env, "", "", 
            ENV_VALUE_API_HOST, "", langTrans("envvar prj api"), this.props.device);
          listDatas = await getPrjEnvValuesByPage(prj, env, paramName, this.props.clientType, pagination);
          this.setState({listDatas, pagination});
        }
      }
    }
    
    setCopiedKeys = copiedKeys => {
      let handledCopiedKeys = copiedKeys.filter(key => !this.state.disabledKeys.includes(key));
      this.setState({copiedKeys: handledCopiedKeys});
    }
  
    render() : ReactNode {
      return (
        <Layout>
          <Header style={{ padding: 0 }}>
            {langTrans("envvar prj title")} <Text type="secondary"><Link href={getWikiEnv()}>{langTrans("envvar prj doc")}</Link></Text>
          </Header>
          <Content style={{ padding: '0 16px' }}>
            <Breadcrumb style={{ margin: '16px 0' }} items={[
              { title: langTrans("envvar prj bread1") }, 
              { title: this.props.prjs.find(row => row.value === this.state.prj) ? this.props.prjs.find(row => row.value === this.state.prj).label : "" },
              { title: langTrans("envvar prj bread2") }
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
                      >
                          <Input />
                      </AutoComplete>
                  </Form.Item>
                  <Form.Item label={langTrans("envvar select tip3")}>
                    <Select
                        onChange={ async value => {
                          if (this.state.copiedKeys.length === 0) return;
                          if (isStringEmpty(value)) return;
                          await batchCopyProjectEnvValues(
                            this.props.clientType, 
                            this.props.teamId, 
                            this.state.prj, 
                            (this.state.env ? this.state.env : this.props.env), 
                            value, 
                            this.state.copiedKeys
                          );
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
              <Button  style={{ margin: '16px 0' }} type="primary" onClick={this.addPropertiesClick} disabled={ isStringEmpty(this.state.env ? this.state.env : this.props.env) }>{langTrans("envvar global add")}</Button>
              <AddEnvVarComponent cb={()=>{
                this.getEnvValueData(this.state.prj, this.state.env ? this.state.env : this.props.env, "");
              }}  />
            </Flex>
            <Table style={{marginTop: 25}}
              rowSelection={{selectedRowKeys: this.state.copiedKeys, onChange: this.setCopiedKeys}}
              dataSource={this.state.listDatas} 
              rowKey={(record) => record[pname]}
              columns={this.state.listColumn} 
              pagination={this.state.pagination}
              onChange={ async (pagination, filters, sorter) => {
                this.state.pagination = pagination;
                this.getEnvValueData(this.state.prj, this.state.env ? this.state.env : this.props.env, "");
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
      prjs: state.prj.list,
      device : state.device,
      envs: state.env.list,
      teamId: state.device.teamId,
      clientType: state.device.clientType,
  }
}

export default connect(mapStateToProps)(EnvVar);