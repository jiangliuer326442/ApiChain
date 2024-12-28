import { Component, ReactNode } from 'react';
import { connect } from 'react-redux';
import { 
  Breadcrumb, Layout, Form, Select,
  Flex, Space, Button, Popconfirm, Table,
  Typography, AutoComplete, Input, message
} from "antd";
import { EditOutlined, DeleteOutlined, CloseSquareFilled } from '@ant-design/icons';

import { isStringEmpty, getdayjs } from '../../util';
import { TABLE_ENV_VAR_FIELDS, TABLE_MICRO_SERVICE_FIELDS, UNAME } from '../../../config/db';
import { ENV_VALUE_API_HOST } from '../../../config/envKeys';
import { ENV_LIST_ROUTE } from '../../../config/routers';
import { SHOW_ADD_PROPERTY_MODEL, SHOW_EDIT_PROPERTY_MODEL } from '../../../config/redux';
import { getEnvs } from '../../actions/env';
import { 
  getEnvValues, 
  addEnvValues,
  delEnvValue,
  batchCopyEnvVales,
} from '../../actions/env_value';
import RequestSendTips from '../../classes/RequestSendTips';
import AddEnvVarComponent from '../../components/env_var/add_env_var';

const { Header, Content, Footer } = Layout;
const { Text } = Typography;

let pname = TABLE_ENV_VAR_FIELDS.FIELD_PARAM_NAME;
let pvar = TABLE_ENV_VAR_FIELDS.FIELD_PARAM_VAR;
let premark = TABLE_ENV_VAR_FIELDS.FIELD_PARAM_REMARK;
let env_var_ctime = TABLE_ENV_VAR_FIELDS.FIELD_CTIME;

let prj_label = TABLE_MICRO_SERVICE_FIELDS.FIELD_LABEL;
let prj_remark = TABLE_MICRO_SERVICE_FIELDS.FIELD_REMARK;

class EnvVar extends Component {

  constructor(props) {
    super(props);
    this.state = {
      listColumn: [
        {
          title: '参数名称',
          dataIndex: pname,
          width: 100,
          render: (value) => {
            return (
              <Text copyable={{text: value}}>{ value }</Text>
            );
          }
        },
        {
          title: '参数值',
          dataIndex: pvar,
          width: 205,
          render: (value) => {
            return (
              <Text copyable={{text: value}}>{ value }</Text>
            );
          }
        },
        {
          title: '备注',
          dataIndex: premark,
          width: 150,
        },
        {
          title: '创建人',
          dataIndex: UNAME,
          width: 100,
          ellipsis: true,
        },
        {
            title: '创建时间',
            dataIndex: env_var_ctime,
            width: 120,
            render: (time) => { return getdayjs(time).format("YYYY-MM-DD") },
        },
        {
          title: '操作',
          key: 'operater',
          width: 100,
          render: (_, record) => {
            return (
              <Space size="small">
                <Button type="link" icon={<EditOutlined />} onClick={()=>this.editPropertiesClick(record)} />
                {(record['allow_del'] === false ) ? null : 
                <Popconfirm
                  title="环境变量"
                  description="确定删除该环境变量吗？"
                  onConfirm={e => {
                      delEnvValue(this.state.prj, (this.state.env ? this.state.env : this.props.env), "", "", record, ()=>{
                        getEnvValues(this.state.prj, (this.state.env ? this.state.env : this.props.env), "", "", "", this.props.dispatch, env_vars=>{});
                      });
                  }}
                  okText="删除"
                  cancelText="取消"
                >
                  <Button danger type="link" icon={<DeleteOutlined />} />
                </Popconfirm>}
              </Space>
            )
          },
        }
      ],
      prj: this.props.match.params.prj,
      tips: [],
      pkeys: [],
      env: "",
      copiedKeys: [],
    }
  }
  
  componentDidMount(): void {
    this.getEnvValueData(this.state.prj, this.state.env ? this.state.env : this.props.env, "");
    if(this.props.envs.length === 0) {
      getEnvs(this.props.dispatch);
    }
  }

  async componentWillReceiveProps(nextProps) {
    let nextPrj = nextProps.match.params.prj;
    if (this.state.prj !== nextPrj) {
      this.getEnvValueData(nextPrj, this.state.env ? this.state.env : this.props.env, "");
    }
  }

    setEnvironmentChange = (value: string) => {
      this.setState({env: value});
      this.getEnvValueData(this.state.prj, value, "");
    }

    setPName = (value: string) => {
      this.getEnvValueData(this.state.prj, this.state.env ? this.state.env : this.props.env, value);
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

    getEnvValueData = (prj: string, env: string, paramName: string) => {
      let requestSendTip = new RequestSendTips();
      requestSendTip.init(prj, "", "", "", this.props.dispatch, env_vars => {});
      requestSendTip.getTips(envKeys => {
        let tips = [];
        for(let envKey of envKeys) {
          tips.push( {value: envKey} );
        }
        this.setState( { prj, tips } );
      });
      if(!isStringEmpty(env)) {
        getEnvValues(prj, env, "", "", paramName, this.props.dispatch, env_vars => {
          console.debug("env_vars", env_vars);
          if (!paramName) {
            this.setState({pkeys: env_vars.map(item => ({ value: item[pname] }))});
          }
          let hasApiHost = false;
          for (let env_var of env_vars) {
            if(env_var[pname] === ENV_VALUE_API_HOST) {
              hasApiHost = true;
              break;
            }
          }
          if(!hasApiHost) {
            addEnvValues(prj, env, "", "", ENV_VALUE_API_HOST, "", this.props.device, ()=>{
              getEnvValues(prj, env, "", "", "", this.props.dispatch, env_vars => {});
            });
          }
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
            项目环境变量配置
          </Header>
          <Content style={{ padding: '0 16px' }}>
            <Breadcrumb style={{ margin: '16px 0' }} items={[{ title: '项目' }, { title: '环境变量' }]} />
            <Flex justify="space-between" align="center">
              <Form layout="inline">
                  <Form.Item label="项目">
                      {this.props.prjs.find(row => row[prj_label] === this.state.prj) ? this.props.prjs.find(row => row[prj_label] === this.state.prj)[prj_remark] : ""}
                  </Form.Item>
                  <Form.Item label="选择环境">
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
                  <Form.Item style={{paddingBottom: 20}} label="参数">
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
                  <Form.Item label="拷贝到环境">
                    <Select
                        onChange={ async value => {
                          if (this.state.copiedKeys.length === 0) return;
                          await batchCopyEnvVales(this.state.prj, (this.state.env ? this.state.env : this.props.env), "", "", this.state.copiedKeys, value);
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
        </Layout>
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