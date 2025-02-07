import { Component, ReactNode } from 'react';
import { connect } from 'react-redux';
import { 
  Breadcrumb, Layout, Form, Select,
  Flex, Space, Button, Popconfirm, Table,
  Typography, AutoComplete, Input, message
} from "antd";
import { EditOutlined, DeleteOutlined, CloseSquareFilled } from '@ant-design/icons';

import { isStringEmpty, getdayjs } from '@rutil/index';

import { 
  TABLE_UNITTEST_FIELDS,
  TABLE_ENV_VAR_FIELDS, 
  TABLE_VERSION_ITERATION_FIELDS,
  TABLE_MICRO_SERVICE_FIELDS,
  UNAME,
} from '@conf/db';
import { getWikiEnv } from '@conf/url';
import { ENV_LIST_ROUTE } from '@conf/routers';
import { SHOW_ADD_PROPERTY_MODEL, SHOW_EDIT_PROPERTY_MODEL } from '@conf/redux';

import { getEnvs } from '@act/env';
import { getSingleUnittest } from '@act/unittest';
import { 
  getEnvValues, 
  delEnvValue,
  batchCopyEnvVales,
} from '@act/env_value';

import RequestSendTips from '@clazz/RequestSendTips';
import AddEnvVarComponent from '@comp/env_var/add_env_var';
import { langTrans } from '@lang/i18n';

const { Header, Content, Footer } = Layout;
const { Text, Link } = Typography;

let unittest_projects = TABLE_UNITTEST_FIELDS.FIELD_PROJECTS;

let pname = TABLE_ENV_VAR_FIELDS.FIELD_PARAM_NAME;
let pvar = TABLE_ENV_VAR_FIELDS.FIELD_PARAM_VAR;
let premark = TABLE_ENV_VAR_FIELDS.FIELD_PARAM_REMARK;
let env_var_ctime = TABLE_ENV_VAR_FIELDS.FIELD_CTIME;

let prj_label = TABLE_MICRO_SERVICE_FIELDS.FIELD_LABEL;
let prj_remark = TABLE_MICRO_SERVICE_FIELDS.FIELD_REMARK;

let version_iterator_prjs = TABLE_VERSION_ITERATION_FIELDS.FIELD_PROJECTS;

class EnvVar extends Component {

  constructor(props) {
    super(props);

    let unittestId = props.match.params.unittestId;
    let project = props.match.params.prj;

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
            return (
              <Space size="small">
                <Button type="link" icon={<EditOutlined />} onClick={()=>this.editPropertiesClick(record)} />
                {(record['allow_del'] === false ) ? null : 
                <Popconfirm
                  title={langTrans("envvar unittest del title")}
                  description={langTrans("envvar unittest del desc")}
                  onConfirm={e => {
                      delEnvValue(this.state.prj, (this.state.env ? this.state.env : this.props.env), "", this.state.unittestId, record, ()=>{
                        getEnvValues(this.state.prj, (this.state.env ? this.state.env : this.props.env), "", this.state.unittestId, "", this.props.dispatch, env_vars=>{});
                      });
                  }}
                  okText={langTrans("envvar unittest del sure")}
                  cancelText={langTrans("envvar unittest del cancel")}
                >
                  <Button danger type="link" icon={<DeleteOutlined />} />
                </Popconfirm>}
              </Space>
            )
          },
        }
      ],
      unittestId,
      unittest: {},
      tips: [],
      pkeys: [],
      env: "",
      prj: project,
      copiedKeys: [],
    }
  }
  
  async componentDidMount() {
    let env = this.state.env ? this.state.env : this.props.env;
    let unitest = await getSingleUnittest(this.state.unittestId, env, "");
    this.setState({ unittest: unitest });
    this.getEnvValueData(this.state.prj, this.state.unittestId, env, "");
    if(this.props.envs.length === 0) {
      getEnvs(this.props.dispatch);
    }
  }

    async componentWillReceiveProps(nextProps) {
      let unittestId = nextProps.match.params.unittestId;
      if (this.state.unittestId !== unittestId) {
          this.setState( { unittestId });
      }
    }

    setEnvironmentChange = (value: string) => {
      this.setState({env: value});
      this.getEnvValueData(this.state.prj, this.state.unittestId, value, "");
    }

    setPName = (value: string) => {
      this.getEnvValueData(this.state.prj, this.state.unittestId, this.state.env ? this.state.env : this.props.env, value);
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

    getEnvValueData = (prj: string, unittestId: string, env: string, paramName: string) => {
      let requestSendTip = new RequestSendTips();
      requestSendTip.init(prj, "", "", unittestId, this.props.dispatch, env_vars => {});
      requestSendTip.getTips(envKeys => {
        let tips = [];
        for(let envKey of envKeys) {
          tips.push( {value: envKey} );
        }
        this.setState( { prj, tips } );
      });
      if(!isStringEmpty(env)) {
        getEnvValues(prj, env, "", unittestId, paramName, this.props.dispatch, env_vars => {
          if (!paramName) {
            this.setState({pkeys: env_vars.map(item => ({ value: item[pname] }))});
          }
        });
      }
    }

    setCopiedKeys = copiedKeys => {
      this.setState({copiedKeys});
    }
  
    render() : ReactNode {
      return (
        <>
          <Header style={{ padding: 0 }}>
            {langTrans("envvar unittest title")} <Text type="secondary"><Link href={getWikiEnv()}>{langTrans("envvar unittest link")}</Link></Text>
          </Header>
          <Content style={{ padding: '0 16px' }}>
            <Breadcrumb style={{ margin: '16px 0' }} items={[{ title: langTrans("envvar unittest bread1") }, { title: langTrans("envvar unittest bread2") }]} />
            <Flex justify="space-between" align="center">
              <Form layout="inline">
                  <Form.Item label={langTrans("envvar select tip4")}>
                      <Select
                          style={{ width: 180 }}
                          options={this.state.unittest[unittest_projects] ? this.state.unittest[unittest_projects].map(item => {
                              return {value: item, label: this.props.prjs.find(row => row[prj_label] === item) ? this.props.prjs.find(row => row[prj_label] === item)[prj_remark] : ""}
                          }) : []}
                          onChange={ value => this.getEnvValueData(value, this.state.unittestId, this.state.env ? this.state.env : this.props.env, "")}
                      />
                  </Form.Item>  
                  <Form.Item label={langTrans("envvar select tip1")}>
                      {this.props.envs.length > 0 ?
                      <Select
                        value={ this.state.env ? this.state.env : this.props.env }
                        onChange={this.setEnvironmentChange}
                        style={{ width: 120 }}
                        options={this.props.envs.map(item => {
                          return {value: item.label, label: item.remark}
                        })}
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
                          await batchCopyEnvVales(this.state.prj, (this.state.env ? this.state.env : this.props.env), "", this.state.unittest, this.state.copiedKeys, value);
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
              <Button  style={{ margin: '16px 0' }} type="primary" onClick={this.addPropertiesClick} disabled={ isStringEmpty(this.state.env ? this.state.env : this.props.env) }>添加环境变量</Button>
              <AddEnvVarComponent tips={this.state.tips} />
            </Flex>
            <Table 
              rowSelection={{selectedRowKeys: this.state.copiedKeys, onChange: this.setCopiedKeys}}
              dataSource={this.props.listDatas} 
              columns={this.state.listColumn} 
              />
          </Content>
          <Footer style={{ textAlign: 'center' }}>
          ApiChain ©{new Date().getFullYear()} Created by 方海亮
          </Footer>
        </>
      );
    }
}

function mapStateToProps (state) {
  return {
      listDatas: state.env_var.list,
      env: state.env_var.env,
      prjs: state.prj.list,
      device : state.device,
      envs: state.env.list,
  }
}

export default connect(mapStateToProps)(EnvVar);