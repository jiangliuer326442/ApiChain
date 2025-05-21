import { Component, ReactNode } from 'react';
import { connect } from 'react-redux';
import { 
  Breadcrumb, Layout, Form, Select,
  Flex, Space, Button, Popconfirm, Table,
  Typography, AutoComplete, Input, Checkbox, message
} from "antd";
import { EditOutlined, DeleteOutlined, CloseSquareFilled } from '@ant-design/icons';
import { cloneDeep } from 'lodash';

import { isStringEmpty, getdayjs } from '@rutil/index';
import RequestSendTips from '@clazz/RequestSendTips';
import AddEnvVarComponent from '@comp/env_var/add_env_var';
import { getWikiEnv } from '@conf/url';
import { 
  TABLE_ENV_VAR_FIELDS, 
  TABLE_VERSION_ITERATION_FIELDS,
  UNAME,
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
  getIteratorEnvValuesByPage, 
  delIterationEnvValues,
  batchCopyEnvVales,
  batchMoveIteratorEnvValue,
} from '@act/env_value';
import { 
  getRemoteVersionIterator, getOpenVersionIterators
} from '@act/version_iterator';
import { langTrans } from '@lang/i18n';

const { Header, Content, Footer } = Layout;
const { Text, Link } = Typography;

let pname = TABLE_ENV_VAR_FIELDS.FIELD_PARAM_NAME;
let pvar = TABLE_ENV_VAR_FIELDS.FIELD_PARAM_VAR;
let premark = TABLE_ENV_VAR_FIELDS.FIELD_PARAM_REMARK;
let env_var_ctime = TABLE_ENV_VAR_FIELDS.FIELD_CTIME;

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
            console.log("record", record);
            return (
              <Space size="small">
                <Button type="link" icon={<EditOutlined />} onClick={()=>this.editPropertiesClick(record)} />
                {((this.state.prj && record.source === "iterator_prj") || (!this.state.prj && record.source === "iterator")) ? 
                <Popconfirm
                  title={langTrans("envvar iterator del title")}
                  description={langTrans("envvar iterator del desc")}
                  onConfirm={async e => {
                    await delIterationEnvValues(
                      this.state.iterator, 
                      this.state.prj, 
                      (this.state.env ? this.state.env : this.props.env), 
                      record[pname], 
                      this.props.clientType, 
                      this.props.teamId
                    );
                    this.getEnvValueData(
                      this.state.prj, 
                      this.state.iterator, 
                      (this.state.env ? this.state.env : this.props.env), 
                      ""
                    );
                  }}
                  okText={langTrans("envvar iterator del sure")}
                  cancelText={langTrans("envvar iterator del cancel")}
                >
                  <Button danger type="link" icon={<DeleteOutlined />} />
                </Popconfirm> : null}
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
      listDatas: [],
      pagination: {
        current: 1,
        pageSize: 10,
      },
    }
  }
  
    async componentDidMount(): void {
      this.getEnvValueData(this.state.prj, this.state.iterator, this.state.env ? this.state.env : this.props.env, "");
      let versionIteration = await getRemoteVersionIterator(this.props.clientType, this.state.iterator);
      let versionIterations = await this.getMovedIteratos();
      this.setState({ versionIterators: versionIterations, versionIteration });
      if (this.props.envs.length === 0) {
        getEnvs(this.props.clientType, this.props.dispatch);
      }
    }

    async componentWillReceiveProps(nextProps) {
      let iteratorId = nextProps.match.params.iteratorId;
      if (this.state.iterator !== iteratorId) {
        this.state.iterator = iteratorId;
        this.getEnvValueData(this.state.prj, this.state.iterator, this.state.env ? this.state.env : this.props.env, "");
        let versionIteration = await getRemoteVersionIterator(this.props.clientType, iteratorId);
        let versionIterations = await this.getMovedIteratos();
        this.setState({ versionIterators: versionIterations, versionIteration });
        this.setState( { versionIteration });
      }
    }

    getMovedIteratos = async () => {
      let versionIterators = (await getOpenVersionIterators(this.props.clientType, this.props.dispatch))
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
          open: true,
          iterator: this.state.iterator,
          prj: this.state.prj,
      });
    }
  
    editPropertiesClick = (record) => {
      this.props.dispatch({
          type: SHOW_EDIT_PROPERTY_MODEL,
          open: true,
          iterator: this.state.iterator,
          prj: this.state.prj,
          pname: record[pname],
          pvalue: record[pvar],
          premark: record[premark],
      });
    }

    getEnvValueData = async (prj: string, iterator: string, env: string, paramName: string) => {
      let requestSendTip = new RequestSendTips();
      requestSendTip.initIterator(prj, iterator, this.props.clientType, this.props.dispatch);
      requestSendTip.getTips(envKeys => {
        let tips = [];
        for(let envKey of envKeys) {
          tips.push( {value: envKey} );
        }
        this.setState( { prj, tips } );
      });
      if(!isStringEmpty(env)) {
        let pagination = cloneDeep(this.state.pagination);
        let envVars = await getIteratorEnvValuesByPage(iterator, prj, env, paramName, this.props.clientType, pagination);
        if (this.state.showCurrent) {
          envVars = envVars.filter(envVar => (envVar.source === "iterator_prj" || envVar.source === "iterator"));
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
            {langTrans("envvar iterator title")} <Text type="secondary"><Link href={getWikiEnv()}>{langTrans("envvar iterator link")}</Link></Text>
          </Header>
          <Content style={{ padding: '0 16px' }}>
            <Breadcrumb style={{ margin: '16px 0' }} items={[{ title: langTrans("envvar iterator bread1") }, { title: langTrans("envvar iterator bread2") }]} />
            <Flex justify="space-between" align="center" style={{marginBottom: 18}}>
              <Form layout="inline">
                  <Form.Item label={langTrans("envvar select tip4")}>
                      <Select
                          allowClear
                          style={{ width: 180 }}
                          options={(this.state.versionIteration[version_iterator_prjs] && this.props.prjs.length > 0) ? this.state.versionIteration[version_iterator_prjs].map(item => {
                              return {value: item, label: this.props.prjs.find(row => row.value === item) ? this.props.prjs.find(row => row.value === item).label : ""}
                          }) : []}
                          onChange={ value => {
                            if (value === undefined) value = "";
                            this.getEnvValueData(value, this.state.iterator, this.state.env ? this.state.env : this.props.env, "")
                          }}
                      />
                  </Form.Item>  
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
                  <Form.Item label={langTrans("envvar select tip5")}>
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
                      {langTrans("envvar filter")}
                    </Checkbox>
                  </Form.Item>
              </Form>
              <Button  style={{ margin: '16px 0' }} type="primary" onClick={this.addPropertiesClick} disabled={ isStringEmpty(this.state.env ? this.state.env : this.props.env) }>{langTrans("envvar global add")}</Button>
              <AddEnvVarComponent tips={this.state.tips} cb={()=>{
                this.getEnvValueData(this.state.prj, this.state.iterator, this.state.env ? this.state.env : this.props.env, "");
              }} />
            </Flex>
            <Table 
              rowSelection={{selectedRowKeys: this.state.copiedKeys, onChange: this.setCopiedKeys}}
              dataSource={this.state.list} 
              rowKey={(record) => record[pname]}
              columns={this.state.listColumn} 
              pagination={this.state.pagination}
              onChange={ async (pagination, filters, sorter) => {
                this.state.pagination = pagination;
                this.getEnvValueData(this.state.iterator, this.state.prj, this.state.env ? this.state.env : this.props.env, "");
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
      clientType: state.device.clientType,
  }
}

export default connect(mapStateToProps)(EnvVar);