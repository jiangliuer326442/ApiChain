import { Component, ReactNode } from 'react';
import { connect } from 'react-redux';
import { 
  Breadcrumb, Layout,
  Flex, Space, Button, Popconfirm,
  Table, message
} from "antd";
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';

import { 
  TABLE_USER_NAME, TABLE_USER_FIELDS,
  TABLE_MICRO_SERVICE_NAME, TABLE_MICRO_SERVICE_FIELDS,
  TABLE_PROJECT_REQUEST_NAME, TABLE_PROJECT_REQUEST_FIELDS,
  TABLE_ENV_NAME, TABLE_ENV_FIELDS,
  TABLE_ENV_KEY_NAME, TABLE_ENV_KEY_FIELDS,
  TABLE_ENV_VAR_NAME, TABLE_ENV_VAR_FIELDS,
} from '../../../config/db';
import {
  ChannelsDbStr,
  ChannelsDbProjectExportStr,
  ChannelsDbProjectExportResultStr,
  ChannelsDbProjectImportStr,
  ChannelsDbProjectImportResultStr,
} from '../../../config/channel';
import { getUser } from '../../actions/user';
import { getPrjs, delPrj } from '../../actions/project';
import { SHOW_ADD_PRJ_MODEL, SHOW_EDIT_PRJ_MODEL } from '../../../config/redux';
import AddPrjComponent from '../../components/prj/add_prj';

var _ = require('lodash');

const { Header, Content, Footer } = Layout;

let env_label = TABLE_ENV_FIELDS.FIELD_LABEL;

let env_key_prj = TABLE_ENV_KEY_FIELDS.FIELD_MICRO_SERVICE_LABEL;
let env_key_pname = TABLE_ENV_KEY_FIELDS.FIELD_PARAM_NAME;

let field_uid = TABLE_USER_FIELDS.FIELD_UID;

let prj_label = TABLE_MICRO_SERVICE_FIELDS.FIELD_LABEL;
let prj_remark = TABLE_MICRO_SERVICE_FIELDS.FIELD_REMARK;

let project_request_project = TABLE_PROJECT_REQUEST_FIELDS.FIELD_PROJECT_LABEL;
let project_request_method = TABLE_PROJECT_REQUEST_FIELDS.FIELD_REQUEST_METHOD;
let project_request_uri = TABLE_PROJECT_REQUEST_FIELDS.FIELD_URI;

let env_key_micro_service = TABLE_ENV_KEY_FIELDS.FIELD_MICRO_SERVICE_LABEL;

let env_var_env = TABLE_ENV_VAR_FIELDS.FIELD_ENV_LABEL;
let env_var_micro_service = TABLE_ENV_VAR_FIELDS.FIELD_MICRO_SERVICE_LABEL;
let env_var_iteration = TABLE_ENV_VAR_FIELDS.FIELD_ITERATION;
let env_var_unittest = TABLE_ENV_VAR_FIELDS.FIELD_UNITTEST;
let env_var_pname = TABLE_ENV_VAR_FIELDS.FIELD_PARAM_NAME;

class Project extends Component {

    constructor(props) {
      super(props);
      this.state = {
        listColumn: [],
        selectedProjects: [],
      }
    }
  
    componentDidMount(): void {
      getPrjs(this.props.dispatch);
      this.setListColumn();
    }

    importProjectDocs = async () => {
      let response = await this.readFileToExportProjects();
      let jsonObject = JSON.parse(response.jsonString);
      if (jsonObject.appVersion !== this.props.appVersion) {
        message.error("导入项目文件的版本（" + sonObject.appVersion + "）与当前应用的版本（" + this.props.appVersion + "）不一致");
        return;
      }
      let tuid = jsonObject.uid;
      let datas = jsonObject.db;

      window.db.transaction('rw',
        window.db[TABLE_USER_NAME],
        window.db[TABLE_MICRO_SERVICE_NAME], 
        window.db[TABLE_PROJECT_REQUEST_NAME], 
        window.db[TABLE_ENV_KEY_NAME], 
        window.db[TABLE_ENV_VAR_NAME], 
        window.db[TABLE_ENV_NAME],
        async () => {
          let users = datas[TABLE_USER_NAME];
          for (let _user of users) {
            let _uid = _user[field_uid];
            //自己跳过
            if (_uid === this.props.uid) {
              continue;
            }
            //对方直接接收
            if (_uid === tuid) {
              await window.db[TABLE_USER_NAME].put(_user);
              continue;
            }
            //其他人不存在则添加
            let queryUser = await getUser(_uid);
            if (queryUser === null) {
              await window.db[TABLE_USER_NAME].put(_user);
            }
          }

          let projects = datas[TABLE_MICRO_SERVICE_NAME];
          for (let _project of projects) {
            //没创建过的项目进行创建
            let prj = await window.db[TABLE_MICRO_SERVICE_NAME]
            .where(prj_label).equals(_project[prj_label])
            .first();
        
            if (prj !== undefined) {
              continue;
            }
            await window.db[TABLE_MICRO_SERVICE_NAME].put(_project);
          }

          let requests = datas[TABLE_PROJECT_REQUEST_NAME];
          for (let _request of requests) {
            let project = _request[project_request_project];
            let method = _request[project_request_method];
            let uri = _request[project_request_uri];

            let project_request = await window.db[TABLE_PROJECT_REQUEST_NAME]
            .where([ project_request_project, project_request_method, project_request_uri ])
            .equals([ project, method, uri ])
            .first();
            if (project_request !== undefined) {
              continue;
            }
            await window.db[TABLE_PROJECT_REQUEST_NAME].put(_request);
          }

          let envs = datas[TABLE_ENV_NAME];
          for (let _env of envs) {
            //没创建过的环境进行创建
            let env = await window.db[TABLE_ENV_NAME]
            .where(env_label).equals(_env[env_label])
            .first();
        
            if (env !== undefined) {
              continue;
            }
            await window.db[TABLE_ENV_NAME].put(_env);
          }

          let keys = datas[TABLE_ENV_KEY_NAME];
          for (let _key of keys) {
            let prj = _key[env_key_prj];
            let pname = _key[env_key_pname];

            let env_key = await window.db[TABLE_ENV_KEY_NAME]
            .where([ env_key_prj, env_key_pname ])
            .equals([prj, pname])
            .first();
            if (env_key !== undefined) {
              continue;
            }
            await window.db[TABLE_ENV_KEY_NAME].put(_key);
          }

          let vars = datas[TABLE_ENV_VAR_NAME];
          for (let _var of vars) {
            let env = _var[env_var_env];
            let prj = _var[env_var_micro_service];
            let iterator = _var[env_var_iteration];
            let unittest = _var[env_var_unittest];
            let pname = _var[env_var_pname];

            let envVarItem = await db[TABLE_ENV_VAR_NAME]
            .where('[' + env_var_env + '+' + env_var_micro_service + '+' + env_var_iteration + '+' + env_var_unittest + '+' + env_var_pname + ']')
            .equals([env, prj, iterator, unittest, pname])
            .first();
            if (envVarItem !== undefined) {
              continue;
            }
            await window.db[TABLE_ENV_VAR_NAME].put(_var);
          }
        }
      );
      let projectNum = datas[TABLE_MICRO_SERVICE_NAME].length;
      message.success("成功导入 " + projectNum + " 个项目");
      getPrjs(this.props.dispatch);
    }

    exportProjectDocs = () => {
      if (this.state.selectedProjects.length === 0) {
        message.error("请选择需要导出的项目");
        return;
      }

      window.db.transaction('rw',
        window.db[TABLE_USER_NAME],
        window.db[TABLE_MICRO_SERVICE_NAME], 
        window.db[TABLE_PROJECT_REQUEST_NAME], 
        window.db[TABLE_ENV_KEY_NAME], 
        window.db[TABLE_ENV_VAR_NAME], 
        window.db[TABLE_ENV_NAME],
      async () => {
        let json : any = {};

        json["uid"] = this.props.uid;
        json["appVersion"] = this.props.appVersion;

        let db : any = {};

        let users = await window.db[TABLE_USER_NAME]
        .toArray();
        db[TABLE_USER_NAME] = users;

        db[TABLE_MICRO_SERVICE_NAME] = [];
        db[TABLE_PROJECT_REQUEST_NAME] = [];
        db[TABLE_ENV_KEY_NAME] = [];
        db[TABLE_ENV_VAR_NAME] = [];
  
        let envs = await window.db[TABLE_ENV_NAME]
        .toArray();
        db[TABLE_ENV_NAME] = envs;
  
        for(let selectedPrj of this.state.selectedProjects) {
          let prj = await window.db[TABLE_MICRO_SERVICE_NAME]
          .where(prj_label).equals(selectedPrj)
          .first();
          db[TABLE_MICRO_SERVICE_NAME].push(prj);
  
          let prjRequests = await window.db[TABLE_PROJECT_REQUEST_NAME]
          .where(project_request_project).equals(selectedPrj)
          .toArray();
          db[TABLE_PROJECT_REQUEST_NAME] = [
            ...db[TABLE_PROJECT_REQUEST_NAME], 
            ...prjRequests
          ];
  
          let prjKeys = await window.db[TABLE_ENV_KEY_NAME]
          .where(env_key_micro_service).equals(selectedPrj)
          .toArray();
          db[TABLE_ENV_KEY_NAME] = [
            ...db[TABLE_ENV_KEY_NAME],
            ...prjKeys
          ]
  
          let prjEnvVars = await window.db[TABLE_ENV_VAR_NAME]
          .where([env_var_micro_service, env_var_iteration, env_var_unittest])
          .equals([selectedPrj, "", ""])
          .toArray();
          db[TABLE_ENV_VAR_NAME] = [
            ...db[TABLE_ENV_VAR_NAME],
            ...prjEnvVars
          ]
        }
        json["db"] = db;
  
        let response = await this.saveExportProjectsToFile(JSON.stringify(json));
        this.setState({selectedProjects : []});
        message.success("选中项目导出成功，文件位置：" + response.fileLocation);
      });
    }

    readFileToExportProjects = () => {
      return new Promise((resolve, reject) => {

        let messageSendListener = window.electron.ipcRenderer.on(ChannelsDbStr, (action, jsonString) => {
          if (action === ChannelsDbProjectImportResultStr) {
              messageSendListener();
              resolve({ jsonString });
          }
        });

        window.electron.ipcRenderer.sendMessage(ChannelsDbStr, ChannelsDbProjectImportStr);
      });
    }

    saveExportProjectsToFile = (jsonString : string) => {
      return new Promise((resolve, reject) => {

        let messageSendListener = window.electron.ipcRenderer.on(ChannelsDbStr, (action, fileLocation) => {
          if (action === ChannelsDbProjectExportResultStr) {
              messageSendListener();
              resolve({ fileLocation });
          }
        });

        window.electron.ipcRenderer.sendMessage(ChannelsDbStr, ChannelsDbProjectExportStr, this.state.selectedProjects, jsonString);
      });
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

    setSelectedProjects = newSelectedRowKeys => {
      this.setState({ selectedProjects: newSelectedRowKeys });
    }

    render() : ReactNode {
      return (
        <Layout>
          <Header style={{ padding: 0 }}>
            项目配置
          </Header>
          <Content style={{ margin: '0 16px' }}>
            <AddPrjComponent />
            <Breadcrumb style={{ margin: '16px 0' }} items={[{ title: '设置' }, { title: '微服务' }]} />
            <Flex vertical>
              <Flex justify="space-between" align="center">
                <Flex>
                  <Button onClick={this.exportProjectDocs} color="primary">
                    导出选中项目到文档
                  </Button>
                  <Button type="link" onClick={this.importProjectDocs}>
                    从文档导入
                  </Button>
                </Flex>
                <Button  style={{ margin: '16px 0' }} type="primary" onClick={this.addPrjClick}>添加微服务</Button>
              </Flex>
              <Table 
                rowSelection={{selectedRowKeys: this.state.selectedProjects, onChange: this.setSelectedProjects}}
                dataSource={this.props.listDatas} 
                columns={this.state.listColumn} />
            </Flex>
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
      uid: state.device.uuid,
      appVersion: state.device.appVersion,
      listColumn: state.prj.projectListColumn,
      listDatas: state.prj.list,
    }
}

export default connect(mapStateToProps)(Project);