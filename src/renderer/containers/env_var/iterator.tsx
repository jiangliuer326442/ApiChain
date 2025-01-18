import { Component, ReactNode } from 'react';
import { connect } from 'react-redux';
import { 
  Breadcrumb, Layout, Form, Select,
  Flex, Space, Button, Popconfirm, Table,
  Typography, AutoComplete, Input, Checkbox, message
} from "antd";
import { EditOutlined, DeleteOutlined, CloseSquareFilled } from '@ant-design/icons';

import { isStringEmpty, getdayjs } from '@rutil/index';
import RequestSendTips from '@clazz/RequestSendTips';
import AddEnvVarComponent from '@comp/env_var/add_env_var';
import { 
  TABLE_ENV_VAR_FIELDS, 
  TABLE_VERSION_ITERATION_FIELDS,
  TABLE_MICRO_SERVICE_FIELDS, UNAME,
} from '@conf/db';
import { 
  ENV_LIST_ROUTE 
} from '@conf/routers';
import { 
  SHOW_ADD_PROPERTY_MODEL, 
  SHOW_EDIT_PROPERTY_MODEL 
} from '@conf/redux';
import { 
  getEnvs 
} from '@act/env';
import { 
  getEnvValues, 
  delEnvValue,
  batchCopyEnvVales,
  batchMoveIteratorEnvValue,
} from '@act/env_value';
import { 
  getVersionIterator, getOpenVersionIterators
} from '@act/version_iterator';

const { Header, Content, Footer } = Layout;
const { Text } = Typography;

let pname = TABLE_ENV_VAR_FIELDS.FIELD_PARAM_NAME;
let pvar = TABLE_ENV_VAR_FIELDS.FIELD_PARAM_VAR;
let premark = TABLE_ENV_VAR_FIELDS.FIELD_PARAM_REMARK;
let env_var_ctime = TABLE_ENV_VAR_FIELDS.FIELD_CTIME;

let prj_label = TABLE_MICRO_SERVICE_FIELDS.FIELD_LABEL;
let prj_remark = TABLE_MICRO_SERVICE_FIELDS.FIELD_REMARK;

let version_iterator_prjs = TABLE_VERSION_ITERATION_FIELDS.FIELD_PROJECTS;
let version_iterator_uuid = TABLE_VERSION_ITERATION_FIELDS.FIELD_UUID;
let version_iterator_title = TABLE_VERSION_ITERATION_FIELDS.FIELD_NAME;

class EnvVar extends Component {

  constructor(props) {
    super(props);

    let iteratorId = props.match.params.iteratorId;

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
                      delEnvValue(this.state.prj, (this.state.env ? this.state.env : this.props.env), this.state.iterator, "", record, ()=>{
                        this.getEnvValueData(
                          this.state.prj, 
                          this.state.iterator, 
                          (this.state.env ? this.state.env : this.props.env), 
                          ""
                        );
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
      iterator: iteratorId,
      versionIteration: {}, //当前迭代信息
      versionIterators: [], //所有迭代列表
      tips: [],
      pkeys: [],
      env: "",
      prj: "",
      copiedKeys: [],
      showCurrent: true,
      list: [],
    }
  }
  
    async componentDidMount(): void {
      this.getEnvValueData(this.state.prj, this.state.iterator, this.state.env ? this.state.env : this.props.env, "");
      let versionIteration = await getVersionIterator(this.state.iterator);
      let versionIterations = await this.getMovedIteratos();
      this.setState({ versionIterators: versionIterations, versionIteration });
      if (this.props.envs.length === 0) {
        getEnvs(this.props.dispatch);
      }
    }

    async componentWillReceiveProps(nextProps) {
      let iteratorId = nextProps.match.params.iteratorId;
      if (this.state.iterator !== iteratorId) {
        this.state.iterator = iteratorId;
        this.getEnvValueData(this.state.prj, this.state.iterator, this.state.env ? this.state.env : this.props.env, "");
        let versionIteration = await getVersionIterator(iteratorId);
        let versionIterations = await this.getMovedIteratos();
        this.setState({ versionIterators: versionIterations, versionIteration });
        this.setState( { versionIteration });
      }
    }

    getMovedIteratos = async () => {
      let versionIterators = (await getOpenVersionIterators())
      .filter(item => item[version_iterator_uuid] != this.state.iterator)
      .map(item => {
          return {value: item[version_iterator_uuid], label: item[version_iterator_title]}
      });
      return versionIterators;
    }

    setEnvironmentChange = (value: string) => {
      this.setState({env: value});
      this.getEnvValueData(this.state.prj, this.state.iterator, value, "");
    }

    setPName = (value: string) => {
      this.getEnvValueData(this.state.prj, this.state.iterator, this.state.env ? this.state.env : this.props.env, value);
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

    getEnvValueData = async (prj: string, iterator: string, env: string, paramName: string) => {
      let requestSendTip = new RequestSendTips();
      requestSendTip.init(prj, "", iterator, "", this.props.dispatch, env_vars => {});
      requestSendTip.getTips(envKeys => {
        let tips = [];
        for(let envKey of envKeys) {
          tips.push( {value: envKey} );
        }
        this.setState( { prj, tips } );
      });
      if(!isStringEmpty(env)) {
        let envVars = await getEnvValues(prj, env, iterator, "", paramName, this.props.dispatch, envVars => {});
        if (this.state.showCurrent) {
          envVars = envVars.filter(envVar => envVar['allow_del'])
        }
        envVars.map(envVar => {
          envVar.key = envVar[pname];
        });
        let extend = [];
        if (!paramName) {
          extend = {pkeys: envVars.map(item => ({ value: item[pname] }))};
        }
        let newState = Object.assign({}, { list: envVars }, extend);
        this.setState(newState);
      }
    }
    
    setCopiedKeys = copiedKeys => {
      this.setState({copiedKeys});
    }
  
    render() : ReactNode {
      return (
        <Layout>
          <Header style={{ padding: 0 }}>
            迭代环境变量配置
          </Header>
          <Content style={{ padding: '0 16px' }}>
            <Breadcrumb style={{ margin: '16px 0' }} items={[{ title: '迭代' }, { title: '环境变量' }]} />
            <Flex justify="space-between" align="center" style={{marginBottom: 18}}>
              <Form layout="inline">
                  <Form.Item label="选择项目">
                      <Select
                          style={{ width: 180 }}
                          options={this.state.versionIteration[version_iterator_prjs] ? this.state.versionIteration[version_iterator_prjs].map(item => {
                              return {value: item, label: this.props.prjs.find(row => row[prj_label] === item) ? this.props.prjs.find(row => row[prj_label] === item)[prj_remark] : ""}
                          }) : []}
                          onChange={ value => this.getEnvValueData(value, this.state.iterator, this.state.env ? this.state.env : this.props.env, "")}
                      />
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
                          await batchCopyEnvVales(
                            this.state.prj, 
                            (this.state.env ? this.state.env : this.props.env), this.state.iterator, "", this.state.copiedKeys, value);
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
                  <Form.Item label="移动到迭代">
                      <Select allowClear
                          style={{minWidth: 130}}
                          onChange={ newIterator => {
                            if (isStringEmpty(newIterator)) {
                              return;
                            }
                            batchMoveIteratorEnvValue(
                              this.state.prj, 
                              (this.state.env ? this.state.env : this.props.env), 
                              this.state.iterator, this.state.copiedKeys, newIterator, () => {
                                this.state.selectedUnittests = [];
                                message.success("移动迭代成功");
                                this.getEnvValueData(this.state.prj, this.state.iterator, (this.state.env ? this.state.env : this.props.env), "");
                              });
                          }}
                          options={ this.state.versionIterators }
                      />
                  </Form.Item>
                  <Form.Item>
                    <Checkbox checked={this.state.showCurrent} onChange={e => {
                      this.state.showCurrent = e.target.checked;
                      this.getEnvValueData(
                        this.state.prj, 
                        this.state.iterator, 
                        (this.state.env ? this.state.env : this.props.env), 
                        ""
                      );
                    }}>
                      仅展示当前
                    </Checkbox>
                  </Form.Item>
              </Form>
              <Button  style={{ margin: '16px 0' }} type="primary" onClick={this.addPropertiesClick} disabled={ isStringEmpty(this.state.env ? this.state.env : this.props.env) }>添加环境变量</Button>
              <AddEnvVarComponent tips={this.state.tips} cb={()=>{
                this.getEnvValueData(this.state.prj, this.state.iterator, this.state.env ? this.state.env : this.props.env, "");
              }} />
            </Flex>
            <Table 
              rowSelection={{selectedRowKeys: this.state.copiedKeys, onChange: this.setCopiedKeys}}
              dataSource={this.state.list} 
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
      env: state.env_var.env,
      prjs: state.prj.list,
      device : state.device,
      envs: state.env.list,
  }
}

export default connect(mapStateToProps)(EnvVar);