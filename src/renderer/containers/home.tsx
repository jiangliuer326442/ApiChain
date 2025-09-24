import { Component, ReactNode } from 'react';
import { connect } from 'react-redux';
import { encode } from 'base-64';
import { 
  Alert,
  Breadcrumb,
  Table,
  Flex,
  Select, 
  Input,
  Tooltip, 
  Typography, 
  Layout, 
  Card,
  Space, 
  Row,
  Col,
  Button
} from "antd";
import { 
  EyeOutlined, 
  SendOutlined, 
} from '@ant-design/icons';

import { 
  LAST_SHOWTEAM_TIME,
  IS_AUTO_UPGRADE 
} from '@conf/storage';
import {
  ChannelsAutoUpgradeStr, 
  ChannelsAutoUpgradeCheckStr, 
  ChannelsVipStr,
  ChannelsVipCloseCkCodeStr,
} from '@conf/channel';
import { getProjectUrl } from '@conf/url';
import {
  TABLE_VERSION_ITERATION_REQUEST_NAME,
  TABLE_USER_FIELDS,
  TABLE_PROJECT_REQUEST_NAME,
  TABLE_VERSION_ITERATION_FIELDS,
  TABLE_PROJECT_REQUEST_FIELDS,
  TABLE_VERSION_ITERATION_REQUEST_FIELDS,
} from '@conf/db';
import { CLIENT_TYPE_SINGLE, CLIENT_TYPE_TEAM } from '@conf/team';
import { SET_DEVICE_INFO } from '@conf/redux';
import {
  SYNC_TABLES
} from '@conf/global_config';
import {
  TEAM_DB_SYNC_URL
} from '@conf/team';
import { 
  getdayjs,
  isStringEmpty,
  substr,
  getStartParams,
  getNowdayjs,
} from '@rutil/index';
import { addUser, getUser, setUserName as ac_setUserName, setUserCountryLangIp } from '@act/user';
import { getOpenVersionIteratorsByPrj } from '@act/version_iterator';
import { sendTeamMessage } from '@act/message';
import ChatBox from '@comp/chat_box/index'
import PayMemberModel from '@comp/topup/member';
import TeamModel from '@comp/team';
import { langFormat, langTrans } from '@lang/i18n';

const { Header, Content, Footer } = Layout;
const { Title, Text, Link } = Typography;

const db_field_uname = TABLE_USER_FIELDS.FIELD_UNAME;

let iterator_uuid = TABLE_VERSION_ITERATION_FIELDS.FIELD_UUID;

let project_request_project = TABLE_PROJECT_REQUEST_FIELDS.FIELD_PROJECT_LABEL;
let project_request_uri = TABLE_PROJECT_REQUEST_FIELDS.FIELD_URI;
let project_request_title = TABLE_PROJECT_REQUEST_FIELDS.FIELD_TITLE;
let project_request_method = TABLE_PROJECT_REQUEST_FIELDS.FIELD_REQUEST_METHOD;
let project_request_desc = TABLE_PROJECT_REQUEST_FIELDS.FIELD_DESC;
let project_request_delFlg = TABLE_PROJECT_REQUEST_FIELDS.FIELD_DELFLG;

let iteration_request_delFlg = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_DELFLG;
let iteration_request_project = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_MICRO_SERVICE_LABEL;
let iteration_request_iteration_uuid = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_ITERATOR_UUID;
let iteration_request_title = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_TITLE;
let iteration_request_method = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_REQUEST_METHOD;
let iteration_request_desc = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_DESC;
let iteration_request_uri = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_URI;

let argsObject = getStartParams();
let uuid = argsObject.uuid;

class Home extends Component {

  constructor(props) {
    super(props);
    this.state = {
      projectUrl: getProjectUrl(),
      user: {
        "uname": argsObject.uname,
        "register_time": 0,
      },
      showPay: false,
      showPayWriteOff: false,
      showTeam: false,
      teamType: "create",
      searchPrj: "",
      searchKeywords: "",
      searchResult: [],
      listColumn: [
        {
          title: langTrans("prj doc table field5"),
          dataIndex: "project",
          render: (_prj) => { 
            return this.props.projects.find(row => row.value === _prj).label;
          }
        },
        {
            title: langTrans("prj doc table field1"),
            dataIndex: "uri",
            render: (uri) => { 
                if (uri.length > 50) {
                    return <Tooltip title={ uri } placement='right'>{ "..." + uri.substring(uri.length - 50, uri.length) }</Tooltip>;
                } else {
                    return uri;
                }
            }
        },
        {
            title: langTrans("prj doc table field2"),
            dataIndex: "title",
        },
        {
            title: langTrans("prj doc table field4"),
            key: 'operater',
            render: (_, record) => {
              let sendRequestUrl;
              let docDetailUrl;
              if (isStringEmpty(record['iterator'])) {
                sendRequestUrl = "#/internet_request_send_by_api/" + record.project + "/" + record.method + "/" + encode(record.uri);
                docDetailUrl = "#/version_iterator_request/" + record.project + "/" + record.method + "/" + encode(record.uri);
              } else {
                docDetailUrl = "#/version_iterator_request/" + record.iterator + "/" + record.project + "/" + record.method + "/" + encode(record.uri);
                sendRequestUrl = "#/internet_request_send_by_api/" + record.iterator + "/" + record.project + "/" + record.method + "/" + encode(record.uri);
              }
              return (
                <Space size="middle">
                    <Tooltip title={langTrans("prj doc table act1")}>
                        <Button type="link" icon={<SendOutlined />} href={ sendRequestUrl } />
                    </Tooltip>
                    <Tooltip title={langTrans("prj doc table act2")}>
                        <Button type="link" icon={<EyeOutlined />} href={ docDetailUrl } />
                    </Tooltip>
                </Space>
              );
            },
        }
      ],
      closeShowPay: false,
    }
  }

  async componentDidMount() {
      let showTeam = this.props.clientType === CLIENT_TYPE_SINGLE;
      if (showTeam && !isStringEmpty(localStorage.getItem(LAST_SHOWTEAM_TIME)) && (getNowdayjs().unix() - parseInt(localStorage.getItem(LAST_SHOWTEAM_TIME))) < 43200 ) {
        showTeam = false;
      }
      if (showTeam) {
        localStorage.setItem(LAST_SHOWTEAM_TIME, getNowdayjs().unix() + "");
      }
      let checkAutoUpgrade = localStorage.getItem(IS_AUTO_UPGRADE);
      checkAutoUpgrade = checkAutoUpgrade == null ? 1 : checkAutoUpgrade;
      if (checkAutoUpgrade == 1) {
        this.checkForUpgrade();
      }

      let uname = argsObject.uname;
      let ip = argsObject.ip;
      let userCountry = argsObject.userCountry;
      let userLang = argsObject.userLang;

      let user = null;
      if (!isStringEmpty(uuid)) {
          user = await getUser(this.props.clientType, uuid);
      }
      if (user === null) {
          await addUser(uuid, uname, ip, userCountry, userLang);
          user = await getUser(this.props.clientType, uuid);
      } else {
          await setUserCountryLangIp(this.props.clientType, this.props.teamId, uuid, userCountry, userLang, ip);
      }
      this.setState({user, showTeam})

      //延迟两秒，团队模式同步数据
      setTimeout(async () => {
        if (this.props.clientType === CLIENT_TYPE_TEAM) {
          let syncObjects = {};
          const tableNames = window.db.tables.map(table => table.name).filter(name => SYNC_TABLES.includes(name));
          for (const tableName of tableNames) {
            const table = window.db.table(tableName);
        
            // 获取所有记录
            const records = await table.filter(item => item.upload_flg === 0).toArray();
            if (records.length > 0) {
              syncObjects[tableName] = records;
            }
          }
          if (Object.keys(syncObjects).length > 0) {
            await sendTeamMessage(TEAM_DB_SYNC_URL, {dbJson: JSON.stringify(syncObjects)})
            for (const tableName in syncObjects) {
              const table = window.db.table(tableName);
              for (const record of syncObjects[tableName]) {
                record.upload_flg = 1;
                record.team_id = this.props.teamId;
                await table.put(record);
              }
            }
          }
        }
      }, 2000);
  }

  showCkCode = (e) => {
    if (!this.state.closeShowPay) {
      this.setState({showPayWriteOff: true})
    }
  }

  closeShowPay = (e) => {
    window.electron.ipcRenderer.sendMessage(ChannelsVipStr, ChannelsVipCloseCkCodeStr);
    this.props.dispatch({
      type: SET_DEVICE_INFO,
      showCkCode : false,
  });
    this.state.closeShowPay = true;
  }

  setUserName = async (newUserName) => {
    await ac_setUserName(this.props.teamId, this.props.clientType, this.props.uid, newUserName);
    let user = await getUser(this.props.clientType, this.props.uid);
    this.setState({ user });
  }

  checkForUpgrade = () => {
    window.electron.ipcRenderer.sendMessage(ChannelsAutoUpgradeStr, ChannelsAutoUpgradeCheckStr);
  }

  handleSearchProject = originPrj => {
    if (isStringEmpty(originPrj)) {
      this.setState( {searchPrj : ""} );
    } else {
      let prj = originPrj.split("$$")[0];
      this.setState( {searchPrj : prj} );
    }
 }

  handleSearch = async () => {
    let version_iteration_requests = [];
    let project_requests = [];
    let iterators;
    let uriSet = new Set();
    if (isStringEmpty(this.state.searchPrj)) {
      iterators = this.props.versionIterators;
    } else {
      iterators = await getOpenVersionIteratorsByPrj(this.props.clientType, this.state.searchPrj);
    }
    if (iterators.length > 0) {
      for(let _iteraotr of iterators) {
        let _iteratorUuid = _iteraotr[iterator_uuid];
        let _temp_arr = await window.db[TABLE_VERSION_ITERATION_REQUEST_NAME]
          .where([ iteration_request_delFlg, iteration_request_iteration_uuid ])
          .equals([ 0, _iteratorUuid ])
          .filter(row => {
            if (row[iteration_request_title].indexOf(this.state.searchKeywords) >= 0) {
                return true;
            }
            if (
              !isStringEmpty(row[iteration_request_desc]) 
                && 
              row[iteration_request_desc].indexOf(this.state.searchKeywords) >= 0
            ) {
              return true;
            }
            if (row[iteration_request_uri].indexOf(this.state.searchKeywords) >= 0) {
              return true;
            }
            return false;
          })
          .toArray();
        version_iteration_requests = version_iteration_requests.concat(_temp_arr);
      }
    }
    let prjLabels = [];
    if (isStringEmpty(this.state.searchPrj)) {
      for (let _project of this.props.projects) {
        let _projectLabel = _project.value;
        prjLabels.push(_projectLabel);
      }
    } else {
      prjLabels.push(this.state.searchPrj);
    }
    for (let _prjLable of prjLabels) {
      let _temp_arr = await window.db[TABLE_PROJECT_REQUEST_NAME]
      .where([ project_request_delFlg, project_request_project ])
      .equals([ 0, _prjLable ])
      .filter(row => {
        if (row[project_request_title].indexOf(this.state.searchKeywords) >= 0) {
          return true;
        }
        if (!isStringEmpty(row[project_request_desc]) && row[project_request_desc].indexOf(this.state.searchKeywords) >= 0) {
          return true;
        }
        if (row[project_request_uri].indexOf(this.state.searchKeywords) >= 0) {
          return true;
        }
        return false;
      })
      .reverse()
      .toArray();
      project_requests = project_requests.concat(_temp_arr);
    }
    let result = [];
    for (let _version_iterator_request of version_iteration_requests) {
      let _url = _version_iterator_request[iteration_request_uri];
      uriSet.add(_url);
      let item = {};
      item.method = _version_iterator_request[iteration_request_method];
      item.title = _version_iterator_request[iteration_request_title];
      item.project = _version_iterator_request[iteration_request_project];
      item.uri = _url;
      item.iterator = _version_iterator_request[iteration_request_iteration_uuid];
      item.key = item.method + "$$" + item.uri;
      result.push(item);
    }
    for (let _project_request of project_requests) {
      let _url = _project_request[project_request_uri];
      if (uriSet.has(_url)) {
        continue;
      }
      let item = {};
      item.method = _project_request[project_request_method];
      item.title = _project_request[project_request_title];
      item.project = _project_request[project_request_project];
      item.uri = _url;
      item.iterator = "";
      item.key = item.method + "$$" + item.uri;
      result.push(item);
    }
    this.setState({searchResult: result});
  }

  render() : ReactNode {
    return (
      <Layout>
          <Header style={{ padding: 0 }}>
            {this.props.vipFlg ? 
            <>
              {langTrans("member welcome")}
              <Text editable={{onChange: this.setUserName}}>{substr(this.state.user[db_field_uname], 15)}</Text>
              {langTrans("welcome") + langFormat("member expired", {"date": getdayjs(this.props.expireTime).format("YYYY-MM-DD")})}
              <Button type='link' onClick={() => this.setState({showPay: true})}>{langTrans("member renew")}</Button>
            </> 
            :
            <>
              <Text editable={{onChange: this.setUserName}}>{this.state.user[db_field_uname]}</Text>
              {langTrans("welcome")}
            </>
            } 
          </Header>
          <Content style={{ padding: '0 16px'}}>

            {(this.props.showCkCode && this.props.ckCodeType === "member") ? <Alert 
              message={langTrans("member checkout tips")}
              type="warning" 
              closable 
              onClose={this.closeShowPay} 
              onClick={this.showCkCode}
            /> : null}

            <PayMemberModel 
              showPay={this.state.showPay} 
              showPayWriteOff={this.state.showPayWriteOff} 
              payMethod={this.props.payMethod}
              payParam={this.props.payParam}
              cb={showPay => this.setState({showPay, showPayWriteOff: showPay})} 
              />
            {this.state.showTeam ? 
            <TeamModel 
              showTeam={this.state.showTeam} 
              teamType={this.state.teamType}
              uname={this.state.user[db_field_uname]}
              cb={showTeam => this.setState({showTeam})} /> 
            : null}
            <Breadcrumb
              style={{ margin: '16px 0' }}
              items={ this.props.clientType === CLIENT_TYPE_SINGLE ? [
                {
                  title: langTrans("team topup form1 select1"),
                  onClick: e => {
                    this.setState({showTeam: true})
                  }
                }
              ] :  [
                {
                  title: langTrans("team topup form1 select2"),
                  onClick: e => {
                    this.setState({
                      showTeam: true,
                      teamType: "create",
                    })
                  }
                }, 
                { 
                  title: this.props.teamName,
                  onClick: e => {
                    this.setState({
                      showTeam: true,
                      teamType: "join",
                    })
                  }
                }
              ]}
            />
            <Flex vertical>
              {this.props.clientType === CLIENT_TYPE_TEAM ?
              <ChatBox />
              : 
              (isStringEmpty(this.props.iterator) ? null :
              <>      
                <Title level={1}>
                  {langTrans("quick link title")}
                </Title>      
                <Row gutter={16}>        
                  <Col span={6}>          
                    <Card title={langTrans("quick link3")} bordered={false}>            
                      <Button type="primary" onClick={()=> this.props.history.push("/internet_request_send_by_iterator/" + this.props.iterator)} block>{ langTrans("quick link4") }</Button>          
                    </Card>        
                  </Col>     
                  <Col span={6}>          
                    <Card title={langTrans("quick link2")} bordered={false}>            
                      <Button type="primary" onClick={()=> this.props.history.push("/version_iterator_requests/" + this.props.iterator)} block>{ langTrans("quick link4") }</Button>          
                    </Card>
                  </Col>  
                  <Col span={6}>          
                    <Card title={langTrans("quick link5")} bordered={false}>            
                      <Button type="primary" onClick={()=> this.props.history.push("/version_iterator_tests/" + this.props.iterator)} block>{ langTrans("quick link4") }</Button>          
                    </Card>
                  </Col>
                  <Col span={6}>          
                    <Card title={langTrans("quick link1")} bordered={false}>            
                      <Button type="primary" onClick={()=> this.props.history.push("/version_iterator/" + this.props.iterator)} block>{ langTrans("quick link4") }</Button>          
                    </Card>
                  </Col>  
                </Row>    
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '40vh', overflow: 'hidden' }}>
                <Flex style={{ width: '60%', height: '40px' }} justify="center" align="center">
                  <Select
                    showSearch
                    allowClear
                    size='large'
                    style={{ height: '100%', width: 260 }} 
                    placeholder={ langTrans("search global prj") }
                    optionFilterProp="children"
                    filterOption={(input, option) =>
                      (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                    }
                    options={this.props.projects.map(_prj => ({label: _prj.label, value: _prj.value + "$$" + _prj.label}))}
                    onChange={ this.handleSearchProject }
                  />
                  <Input 
                    size='large' 
                    allowClear
                    style={{ width: '100%', height: '100%' }} 
                    onChange={ event => {
                      if (isStringEmpty(event.target.value)) {
                        this.setState({searchResult: []});
                      }
                      this.setState({searchKeywords: event.target.value})
                    }}
                    placeholder={ langTrans("search global keywords") }
                    onPressEnter={e => this.handleSearch()} />
                  <Button 
                    size='large' 
                    type="primary" 
                    disabled={isStringEmpty(this.state.searchKeywords)}
                    onClick={ this.handleSearch }
                    style={{borderRadius: 0}} 
                  >
                    { langTrans("search global button") }
                  </Button>
                </Flex>
              </div>
              {this.state.searchResult.length > 0 ? 
              <Table 
                dataSource={ this.state.searchResult } 
                columns={this.state.listColumn} 
              />
              : null}
              </>
              )
              }
            </Flex>
          </Content>
          <Footer style={{ textAlign: 'center' }}>
          <Link href={ this.state.projectUrl }>{ this.props.appName }</Link> ©{new Date().getFullYear()} Created by 方海亮
          </Footer>
        </Layout>
    );
  }
}

function mapStateToProps (state) {
  return {
    iterator: state.env_var.iterator,
    uid: state.device.uuid,
    appName: state.device.appName,
    vipFlg: state.device.vipFlg,
    showCkCode: state.device.showCkCode,
    ckCodeType: state.device.ckCodeType,
    payMethod: state.device.payMethod,
    payParam: state.device.payParam,
    expireTime: state.device.expireTime,
    projects: state.prj.list,
    versionIterators : state['version_iterator'].list,
    teamName: state.device.teamName,
    clientType: state.device.clientType,
    teamId: state.device.teamId,
  }
}

export default connect(mapStateToProps)(Home);