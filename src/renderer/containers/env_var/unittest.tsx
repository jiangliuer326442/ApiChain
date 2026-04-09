import { Component, ReactNode } from 'react';
import { connect } from 'react-redux';
import { 
  Breadcrumb, Layout, Form, Select,
  Flex, Space, Button, Popconfirm, Table,
  Typography, AutoComplete, Input
} from "antd";
import { EditOutlined, DeleteOutlined, CloseSquareFilled } from '@ant-design/icons';

import { isStringEmpty, getdayjs } from '@rutil/index';

import { 
  TABLE_UNITTEST_FIELDS,
  TABLE_ENV_VAR_FIELDS,
  UNAME,
} from '@conf/db';
import { getWikiEnv } from '@conf/url';
import { ENV_LIST_ROUTE } from '@conf/routers';
import { 
  SHOW_ADD_PROPERTY_MODEL, 
  SHOW_EDIT_PROPERTY_MODEL,
  GET_ENV_VALS
} from '@conf/redux';

import { getEnvs } from '@act/env';
import { getProjectSingleUnittest, getIteratorSingleUnittest } from '@act/unittest';
import { getUnittestKeys } from '@act/keys';
import {
  delUnittestEnvValues,
  getUnittestEnvValuesByPage,
} from '@act/env_value';

import AddEnvVarComponent from '@comp/env_var/add_env_var';
import { langTrans } from '@lang/i18n';
import { cloneDeep } from 'lodash';

const { Header, Content, Footer } = Layout;
const { Text, Link } = Typography;

let unittest_projects = TABLE_UNITTEST_FIELDS.FIELD_PROJECTS;

let pname = TABLE_ENV_VAR_FIELDS.FIELD_PARAM_NAME;
let pvar = TABLE_ENV_VAR_FIELDS.FIELD_PARAM_VAR;
let premark = TABLE_ENV_VAR_FIELDS.FIELD_PARAM_REMARK;
let encryptFlg = TABLE_ENV_VAR_FIELDS.FIELD_ENCRYPTFLG;
let env_var_ctime = TABLE_ENV_VAR_FIELDS.FIELD_CTIME;

class EnvVar extends Component {

  constructor(props) {
    super(props);

    let iteratorId = isStringEmpty(props.match.params.iteratorId) ? "" : props.match.params.iteratorId;
    let unittestId = props.match.params.unittestId;
    let project = isStringEmpty(props.match.params.prj) ? "" : props.match.params.prj;

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
                {((this.state.prj && record.source === "unittest_prj") || (!this.state.prj && record.source === "unittest")) ? 
                <Popconfirm
                  title={langTrans("envvar unittest del title")}
                  description={langTrans("envvar unittest del desc")}
                  onConfirm={async e => {
                    await delUnittestEnvValues(
                      this.props.clientType, 
                      this.props.teamId,
                      this.state.unittestId, 
                      this.state.prj, 
                      this.props.env, 
                      record[pname], 
                    );
                    this.getEnvValueData(
                      this.state.iteratorId,
                      this.state.prj, 
                      this.state.unittestId, 
                      this.props.env, 
                      ""
                    );
                  }}
                  okText={langTrans("envvar unittest del sure")}
                  cancelText={langTrans("envvar unittest del cancel")}
                >
                  <Button danger type="link" icon={<DeleteOutlined />} />
                </Popconfirm> : null}
              </Space>
            )
          },
        }
      ],
      iteratorId,
      unittestId,
      unittest: {},
      tips: [],
      pkeys: [],
      prj: project,
      listDatas: [],
      pagination: {
        current: 1,
        pageSize: 10,
      },
    }
  }
  
  async componentDidMount() {
    let unittest;
    if (!isStringEmpty(this.state.iteratorId)) {
      //拿迭代单侧
      unittest = await getIteratorSingleUnittest(this.props.clientType, this.state.unittestId, this.state.iteratorId, this.props.env)
    } else {
      unittest = await getProjectSingleUnittest(this.props.clientType, this.state.unittestId, this.props.teamId, this.state.prj, this.props.env)
    }
    this.setState({ unittest });
    this.getEnvValueData(this.state.iteratorId, this.state.prj, this.state.unittestId, this.props.env, "");
    if(this.props.envs.length === 0) {
      getEnvs(this.props.clientType, this.props.dispatch);
    }
  }

    async componentWillReceiveProps(nextProps) {
      let unittestId = nextProps.match.params.unittestId;
      let project = nextProps.match.params.prj;
      if (this.state.unittestId !== unittestId || this.state.project !== project) {
          this.setState( { 
            unittestId,
            prj: project,
            pkeys: [],
            listDatas: [],
            pagination: {
              current: 1,
              pageSize: 10,
            },
          });
      }
    }

    setEnvironmentChange = (value: string) => {
      this.props.dispatch({
        type: GET_ENV_VALS,
        prj: this.state.prj,
        env: value,
        iterator: this.state.iteratorId,
        unittest: this.state.unittestId
      });
      this.getEnvValueData(this.state.iteratorId, this.state.prj, this.state.unittestId, value, "");
    }

    setPName = (value: string) => {
      this.getEnvValueData(this.state.iteratorId, this.state.prj, this.state.unittestId, this.props.env, value);
    }
  
    addPropertiesClick = () => {
      this.props.dispatch({
          type: SHOW_ADD_PROPERTY_MODEL,
          open: true,
          iteration: this.state.iteratorId,
          unittest: this.state.unittestId,
          prj: this.state.prj,
      });
    }
  
    editPropertiesClick = (record) => {
      this.props.dispatch({
          type: SHOW_EDIT_PROPERTY_MODEL,
          open: true,
          iteration: this.state.iteratorId,
          unittest: this.state.unittestId,
          prj: this.state.prj,
          pname: record[pname],
          pvalue: record[pvar],
          premark: record[premark],
          encryptFlg: record[encryptFlg],
          source: record.source
      });
    }

    getEnvValueData = async (iteratorId: string, prj: string, unittestId: string, env: string, paramName: string) => {
      let pkeys = await getUnittestKeys(this.props.clientType, this.props.teamId, unittestId, iteratorId, prj);
      if(!isStringEmpty(env)) {
        let pagination = cloneDeep(this.state.pagination);
        let listDatas = await getUnittestEnvValuesByPage(unittestId, iteratorId, prj, env, paramName, this.props.clientType, pagination);
        this.setState({
          prj, 
          listDatas, 
          pagination,
          pkeys: !paramName ? pkeys : [],
        });
      }
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
                      >
                          <Input />
                      </AutoComplete>
                  </Form.Item>
              </Form>
              <Button  style={{ margin: '16px 0' }} type="primary" onClick={this.addPropertiesClick} disabled={ isStringEmpty(this.props.env) }>添加环境变量</Button>
              <AddEnvVarComponent 
                env={this.props.env}
                cb={()=>{
                  this.getEnvValueData(this.state.iteratorId, this.state.prj, this.state.unittestId, this.props.env, "");
                }} />
            </Flex>
            <Table 
              dataSource={this.state.listDatas} 
              rowKey={(record) => record[pname]}
              columns={this.state.listColumn} 
              pagination={this.state.pagination}
              onChange={ async (pagination, filters, sorter) => {
                this.state.pagination = pagination;
                this.getEnvValueData(this.state.iteratorId, this.state.prj, this.state.unittestId, this.props.env, "");
              }}
            />
          </Content>
          <Footer style={{ textAlign: 'center' }}>
          ApiChain ©{new Date().getFullYear()} Created by Mustafa Fang
          </Footer>
        </>
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