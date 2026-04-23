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
  Dropdown,
  Row,
  Col,
  Button
} from "antd";
import { 
  EyeOutlined, 
  SendOutlined, 
  GlobalOutlined,
} from '@ant-design/icons';
import { v4 as uuidv4 } from 'uuid';
import md5 from 'js-md5';

import { 
  LAST_SHOWTEAM_TIME, 
  GUIDE_SHOW_FLG,
  GUIDE_DB_PWD,
  GUIDE_DB_PORT,
} from '@conf/storage';
import {
  ChannelsAutoUpgradeStr, 
  ChannelsAutoUpgradeCheckStr, 
  ChannelsVipStr,
  ChannelsVipCkCodeStr,
  ChannelsVipCloseCkCodeStr,
  ChannelsLangStr,
  ChannelsLangSet,
} from '@conf/channel';
import { 
  getProjectUrl, 
  getWikiAiAssistant,
  getDbDownloadUrl,
} from '@conf/url';
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
import { langSupport } from '@conf/global_config'
import { getLang, langFormat, langTrans } from '@lang/i18n';
import MarkdownView from '@comp/markdown/show';
import { 
  getdayjs,
  isStringEmpty,
  substr,
  getStartParams,
  getNowdayjs,
  getDevRandomPort,
} from '@rutil/index';
import { addUser, getUser, setUserName as ac_setUserName, setUserCountryLangIp } from '@act/user';
import { getOpenVersionIteratorsByPrj } from '@act/version_iterator';
import ChatBox from '@comp/chat_box/index'
import PayMemberModel from '@comp/topup/member';
import TeamModel from '@comp/team';

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


    let dbPwd;
    if (isStringEmpty(localStorage.getItem(GUIDE_DB_PWD))) {
      dbPwd = md5(uuidv4() as string);
      localStorage.setItem(GUIDE_DB_PWD, dbPwd);
    } else {
      dbPwd = localStorage.getItem(GUIDE_DB_PWD);
    }

    let dbPort;
    if (isStringEmpty(localStorage.getItem(GUIDE_DB_PORT))) {
      dbPort = getDevRandomPort();
      localStorage.setItem(GUIDE_DB_PORT, dbPort);
    } else {
      dbPort = localStorage.getItem(GUIDE_DB_PORT);
    }

    this.state = {
      projectUrl: getProjectUrl(),
      user: {
        "uname": argsObject.uname,
        "register_time": 0,
      },
      showPay: false,
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
      startupGuide: localStorage.getItem(GUIDE_SHOW_FLG) ? localStorage.getItem(GUIDE_SHOW_FLG) : 0,
      dbPwd,
      dbPort,
      dbUser: "root",
      dbName: "apichain",
      closeShowPay: false,
      lang: getLang(),
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
      this.checkForUpgrade();

      let uname = argsObject.uname;
      let ip = argsObject.ip;
      let userCountry = argsObject.userCountry;
      let preferLang = argsObject.preferLang;

      let user = null;
      if (!isStringEmpty(uuid)) {
          user = await getUser(this.props.clientType, uuid);
      }
      if (user === null) {
          await addUser(uuid, uname, ip, userCountry, preferLang);
          user = await getUser(this.props.clientType, uuid);
      } else {
          await setUserCountryLangIp(this.props.clientType, this.props.teamId, uuid, userCountry, preferLang, ip);
      }
      this.setState({user, showTeam})
  }

  handleCkCode = (e) => {
    if (!this.state.closeShowPay) {
      //发消息生成核销码
      window.electron.ipcRenderer.sendMessage(ChannelsVipStr, ChannelsVipCkCodeStr);
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
    const markdownContentZhCn = `
## 🚀 开启 ApiChain 体验之旅
 
### 💡 为什么选择 ApiChain？
 
在日常研发与测试中，你是否常被以下痛点折磨？
 
1. **文档割裂**：迭代开发时的接口文档与项目整体文档难以统一，合并全靠手动，极易遗漏。
 
2. **用例一次性**：验证迭代功能的测试用例，因为数据写死，跑完一次就作废，无法反复执行。
 
3. **断言太浅**：接口返回成功的 Code 码就真没问题了吗？底层数据库数据可能早已脏乱差，仅校验返回值根本无法保证正确性。
 
4. **回归盲盒**：程序员改了新功能，却把旧功能搞坏，改动影响范围全靠猜，回归测试两眼一抹黑，线上事故频发。
 
ApiChain 直击以上痛点，为你提供**“定义-测试-回归”**的一体化闭环体验：
 
- **迭代文档自动归并**：迭代内独立维护文档，上线后一键按微服务合并至项目，彻底告别文档割裂。
 
- **用例随心反复执行**：内置随机字符串、时间戳等函数，无需手动修改数据，迭代用例想跑多少次就跑多少次。
 
- **接口与数据库双重断言**：不仅能校验返回值，更能直连数据库校验实际数据变更，并自动清理脏数据，把隐患扼杀在摇篮。
 
- **精准拦截回归风险**：将迭代用例导出至项目，一键执行项目级回归测试，让改动影响范围一目了然，为线上安全兜底。
 
### 🎯 本指南适用人群
 
- **后端/前端/测试工程师**：渴望用一款工具彻底解决接口文档统一与深度自动化测试的痛点。
 
- **技术极客与效率控**：对 ApiChain 的创新玩法感兴趣，想第一时间亲身体验。
 
---
 
## 🛠️ 体验之旅：四步玩转 ApiChain
 
为了让你在最短时间内感受 ApiChain 解决痛点的魅力，请跟随以下步骤完成部署与实战。
 
### 第一步：搭建数据底座（准备 MySQL）
 
你需要一个 MySQL 8.x 数据库。如果尚未安装，可通过以下 Docker 脚本极速启动（⚠️ 生产环境请务必做好权限隔离与持久化配置）：
 
\`\`\`shell
docker pull mysql:8.0
 
docker run --name mysql-container -p ${this.state.dbPort}:3306 -e MYSQL_ROOT_PASSWORD=${this.state.dbPwd} -d mysql:8.0
\`\`\`
 
启动后，请记录以下环境变量信息，后续将频繁使用：
 
- \`DB_HOST\`（主机地址，如 ${argsObject.ip}）
- \`DB_PORT\`（端口，如 ${this.state.dbPort}
- \`DB_USER\`（用户名，如 ${this.state.dbUser}）
- \`DB_PASS\`（密码，如 ${this.state.dbPwd}）
- \`DB_NAME\`（数据库名，如 ${this.state.dbName}）
 
> 💡 **提示**：提供的数据库账号需具备建表、改表及数据增删改查权限。如遇连接报错 \`Public Key Retrieval is not allowed\`，请将驱动属性中的 \`allowPublicKeyRetrieval\` 修改为 \`true\`。
 
接着，请手动创建数据库并导入测试数据：
 
1. 执行 SQL：\`create database ${this.state.dbName};\`
2. 下载测试数据脚本并导入：[点此下载 SQL 文件](${getDbDownloadUrl()})
 
### 第二步：启动核心引擎
 
准备好数据库后，修改以下命令中的数据库连接参数，一键启动本地 Runner 服务：
 
\`\`\`bash
docker volume create apichain_cache_data;
docker pull ${(IS_CHINA_BUILD || this.props.userCountry === 'CN') ? "registry.cn-shanghai.aliyuncs.com/apichain/runner" : "jiangliuer326442/apichain-runner"}:${this.props.defaultRunnerVersion};
docker run -d \\
-p 6588:6588 \\
-e DB_HOST=${argsObject.ip} \\
-e DB_PORT=${this.state.dbPort} \\
-e DB_USER=${this.state.dbUser} \\
-e DB_PASS=${this.state.dbPwd} \\
-e DB_NAME=${this.state.dbName} \\
-e DEPLOY_COUNTRY=${this.props.userCountry} \\
-e APICHAIN_SUPER_UID=${this.props.uid} \\
-v apichain_cache_data:/opt/cache \\
--name apichain-runner \\
${(IS_CHINA_BUILD || this.props.userCountry === 'CN') ? "registry.cn-shanghai.aliyuncs.com/apichain/runner" : "jiangliuer326442/apichain-runner"}:${this.props.defaultRunnerVersion}
\`\`\`
 
### 第三步：客户端连接 Runner
 
1. 打开 ApiChain 客户端，点击右上角切换至你熟悉的语言。
2. 点击**单机版**，选择**联网版**。
3. 填写服务器地址（如 \`http://${argsObject.ip}:6588\`），点击**检测**确保网络畅通。
4. 选择**加入团队** -> 选择 **runner开发者** 团队 -> 点击**加入**。
5. 🎉 因为你使用了超管 UID 启动，无需审批直接入团！重启 ApiChain 即可正式开启体验。
 
### 第四步：核心功能漫游
 
入团后，建议按照以下路径探索产品核心逻辑：
 
1. **亮明身份**：点击顶部昵称旁的编辑按钮，修改你在团队内的称呼。
 
2. **配置开发环境**：进入 \`设置 - 开发环境\`，这里是接口请求与自动化测试的变量数据源（同 Runner 下团队共享）。
 
3. 查看项目与迭代：
 
   - \`设置 - 项目\`：团队微服务列表。
   - \`设置 - 版本迭代\`：开发周期管理。每个迭代可记录文档链接、上线分支、数据库配置等信息。
 
4. **接口文档与调试**：进入 \`项目 - 文档\`，按文件夹分类查看所有接口详情，并可直接发送请求调试。
 
5. **项目环境配置**：进入 \`项目 - 设置\`，配置不同环境下的接口地址与数据库信息（数据库密码加密存储，用于后续断言与脏数据清理）。
 
------
 
## 🎯 实战演练：直击四大痛点
 
为了让你切实体验 ApiChain 如何解决核心痛点，我们准备了以下实战环节。首先，我们需要补全项目的数据库连接配置，这是实现**数据库深度校验**的前提。
 
### 1. 修正项目数据库连接（铺垫痛点3：数据库校验）
 
前往 \`项目菜单 - runner运行器 - 设置\`，选择**本地环境**，填写以下信息：
 
- **域名**：Runner 的访问地址，以 \`/\` 结尾（如 \`http://${argsObject.ip}:6588/\`）
 
- **前缀**：接口公共路径（此项目为空）
 
- **数据库信息**：依次填入主机、端口、用户名、密码（加密保存）、名称（与第一步一致）
 
- 请求与执行端：
 
  - \`api请求发送端\`：选择“当前设备”从客户端发请求，或选“团队runner”解决封闭网络问题。
  - \`数据库连接发送端\`：选择“当前设备”从客户端执行SQL，或选“团队runner”穿透网络限制。
 
- 点击底部**修改**按钮保存。
 
### 2. 运行项目单测（解决痛点4：告别回归盲盒）
 
进入 \`项目菜单 - runner运行器 - 单测\`，勾选 **入团流程** 用例，选择**本地环境**并点击**执行用例**：
 
- 🌟 **体验重点**：这是一个涵盖注册、申请、审批、权限变更等13个步骤的完整生命周期闭环。后面步骤依赖前面步骤的传参，且由随机数据作为初始触发条件。执行完成后，你能清晰看到每一步的入参、返回值及多重断言结果，精准拦截任何因改动引发的连锁风险。
- 🛠️ **继续体验**：依次勾选 **开发环境管理** / **项目测试** / **版本迭代** / **环境变量测试**，体验不同场景下的项目级回归测试。
 
### 3. 执行迭代单测（解决痛点1、2、3：文档归并+反复执行+深度校验）
 
1. 在**迭代**菜单找到**环境变量**迭代。
2. **痛点1解决**：点击**文档**菜单，这里是迭代开发的接口。体验一下：当迭代上线完成，关闭这个迭代时，这些接口会自动按微服务合并到项目中，彻底告别文档手动合并的痛苦！
3. **痛点2解决**：点击**单测**菜单，执行**环境变量测试**用例。因为使用了随机初始数据，你可以反复执行，再也不用担心数据冲突导致用例作废。
4. **痛点3解决**：在用例执行过程中，仔细查看每个步骤的断言！它不仅校验了接口返回的 Code 码，更直连数据库校验了全局、项目、迭代三级环境变量实际数据的相互影响。真正的数据级断言，让隐患无所遁形！
 
------
 
## 🌟 更多盲盒等你开启
 
以上只是 ApiChain 的冰山一角！现在，你可以自由点击其他菜单，探索示例项目中更多强大的配置与功能，感受前所未有的接口管理与测试流畅度。祝你体验愉快！
`;
    const markdownContentZhTw = `
## 🚀 開啟 ApiChain 體驗之旅
### 💡 為什麼選擇 ApiChain？
在日常研發與測試中，你是否常被以下痛點折磨？
1. **文件割裂**：迭代開發時的介面文件與專案整體文件難以統一，合併全靠手動，極易遺漏。
2. **用例一次性**：驗證迭代功能的測試用例，因為數據寫死，跑完一次就作廢，無法反覆執行。
3. **斷言太淺**：介面返回成功的 Code 碼就真沒問題了嗎？底層資料庫數據可能早已髒亂差，僅校驗返回值根本無法保證正確性。
4. **回歸盲盒**：程式設計師改了新功能，卻把舊功能搞壞，改動影響範圍全靠猜，回歸測試兩眼一抹黑，線上事故頻發。
ApiChain 直擊以上痛點，為你提供**「定義-測試-回歸」**的一體化閉環體驗：
- **迭代文件自動歸併**：迭代內獨立維護文件，上線後一鍵按微服務合併至專案，徹底告別文件割裂。
- **用例隨心反覆執行**：內建隨機字串、時間戳等函數，無需手動修改數據，迭代用例想跑多少次就跑多少次。
- **介面與資料庫雙重斷言**：不僅能校驗返回值，更能直連資料庫校驗實際數據變更，並自動清理髒數據，把隱患扼殺在搖籃。
- **精準攔截回歸風險**：將迭代用例匯出至專案，一鍵執行專案級回歸測試，讓改動影響範圍一目了然，為線上安全兜底。
### 🎯 本指南適用人群
- **後端/前端/測試工程師**：渴望用一款工具徹底解決介面文件統一與深度自動化測試的痛點。
- **技術極客與效率控**：對 ApiChain 的創新玩法感興趣，想第一時間親身體驗。
---
## 🛠️ 體驗之旅：四步玩轉 ApiChain
為了讓你在最短時間內感受 ApiChain 解決痛點的魅力，請跟隨以下步驟完成部署與實戰。
### 第一步：搭建數據底座（準備 MySQL）
你需要一個 MySQL 8.x 資料庫。如果尚未安裝，可透過以下 Docker 腳本極速啟動（⚠️ 生產環境請務必做好權限隔離與持久化配置）：
\`\`\`shell
docker pull mysql:8.0
docker run --name mysql-container -p ${this.state.dbPort}:3306 -e MYSQL_ROOT_PASSWORD=${this.state.dbPwd} -d mysql:8.0
\`\`\`
啟動後，請記錄以下環境變數資訊，後續將頻繁使用：
- \`DB_HOST\`（主機地址，如 ${argsObject.ip}）
- \`DB_PORT\`（端口，如 ${this.state.dbPort}
- \`DB_USER\`（使用者名稱，如 ${this.state.dbUser}）
- \`DB_PASS\`（密碼，如 ${this.state.dbPwd}）
- \`DB_NAME\`（資料庫名稱，如 ${this.state.dbName}）
> 💡 **提示**：提供的資料庫帳號需具備建表、改表及數據增刪改查權限。如遇連線報錯 \`Public Key Retrieval is not allowed\`，請將驅動屬性中的 \`allowPublicKeyRetrieval\` 修改為 \`true\`。
接著，請手動建立資料庫並匯入測試數據：
1. 執行 SQL：\`create database ${this.state.dbName};\`
2. 下載測試數據腳本並匯入：[點此下載 SQL 檔案](${getDbDownloadUrl()})
### 第二步：啟動核心引擎
準備好資料庫後，修改以下命令中的資料庫連線參數，一鍵啟動本地 Runner 服務：
\`\`\`bash
docker volume create apichain_cache_data;
docker pull ${(IS_CHINA_BUILD || this.props.userCountry === 'CN') ? "registry.cn-shanghai.aliyuncs.com/apichain/runner" : "jiangliuer326442/apichain-runner"}:${this.props.defaultRunnerVersion};
docker run -d \\
-p 6588:6588 \\
-e DB_HOST=${argsObject.ip} \\
-e DB_PORT=${this.state.dbPort} \\
-e DB_USER=${this.state.dbUser} \\
-e DB_PASS=${this.state.dbPwd} \\
-e DB_NAME=${this.state.dbName} \\
-e DEPLOY_COUNTRY=${this.props.userCountry} \\
-e APICHAIN_SUPER_UID=${this.props.uid} \\
-v apichain_cache_data:/opt/cache \\
--name apichain-runner \\
${(IS_CHINA_BUILD || this.props.userCountry === 'CN') ? "registry.cn-shanghai.aliyuncs.com/apichain/runner" : "jiangliuer326442/apichain-runner"}:${this.props.defaultRunnerVersion}
\`\`\`
### 第三步：客戶端連線 Runner
1. 打開 ApiChain 客戶端，點擊右上角切換至你熟悉的語言。
2. 點擊**單機版**，選擇**聯網版**。
3. 填寫伺服器地址（如 \`http://${argsObject.ip}:6588\`），點擊**檢測**確保網路暢通。
4. 選擇**加入團隊** -> 選擇 **runner開發者** 團隊 -> 點擊**加入**。
5. 🎉 因為你使用了超級管理員 UID 啟動，無需審批直接入團！重啟 ApiChain 即可正式開啟體驗。
### 第四步：核心功能漫遊
入團後，建議按照以下路徑探索產品核心邏輯：
1. **亮明身份**：點擊頂部暱稱旁的編輯按鈕，修改你在團隊內的稱呼。
2. **配置開發環境**：進入 \`設定 - 開發環境\`，這裡是介面請求與自動化測試的變數數據源（同 Runner 下團隊共享）。
3. 查看專案與迭代：
   - \`設定 - 專案\`：團隊微服務列表。
   - \`設定 - 版本迭代\`：開發週期管理。每個迭代可記錄文件連結、上線分支、資料庫配置等資訊。
4. **介面文件與除錯**：進入 \`專案 - 文件\`，按資料夾分類查看所有介面詳情，並可直接發送請求除錯。
5. **專案環境配置**：進入 \`專案 - 設定\`，配置不同環境下的介面地址與資料庫資訊（資料庫密碼加密儲存，用於後續斷言與髒數據清理）。
------
## 🎯 實戰演練：直擊四大痛點
為了讓你切實體驗 ApiChain 如何解決核心痛點，我們準備了以下實戰環節。首先，我們需要補全專案的資料庫連線配置，這是實現**資料庫深度校驗**的前提。
### 1. 修正專案資料庫連線（鋪墊痛點3：資料庫校驗）
前往 \`專案選單 - runner執行器 - 設定\`，選擇**本地環境**，填寫以下資訊：
- **域名**：Runner 的存取地址，以 \`/\` 結尾（如 \`http://${argsObject.ip}:6588/\`）
- **前綴**：介面公共路徑（此專案為空）
- **資料庫資訊**：依次填入主機、端口、使用者名稱、密碼（加密儲存）、名稱（與第一步一致）
- 請求與執行端：
  - \`api請求發送端\`：選擇“當前設備”從客戶端發請求，或選“團隊runner”解決封閉網路問題。
  - \`資料庫連線發送端\`：選擇“當前設備”從客戶端執行SQL，或選“團隊runner”穿透網路限制。
- 點擊底部**修改**按鈕儲存。
### 2. 執行專案單測（解決痛點4：告別回歸盲盒）
進入 \`專案選單 - runner執行器 - 單測\`，勾選 **入團流程** 用例，選擇**本地環境**並點擊**執行用例**：
- 🌟 **體驗重點**：這是一個涵蓋註冊、申請、審批、權限變更等13個步驟的完整生命週期閉環。後面步驟依賴前面步驟的傳參，且由隨機數據作為初始觸發條件。執行完成後，你能清晰看到每一步的入參、返回值及多重斷言結果，精準攔截任何因改動引發的連鎖風險。
- 🛠️ **繼續體驗**：依次勾選 **開發環境管理** / **專案測試** / **版本迭代** / **環境變數測試**，體驗不同場景下的專案級回歸測試。
### 3. 執行迭代單測（解決痛點1、2、3：文件歸併+反覆執行+深度校驗）
1. 在**迭代**選單找到**環境變數**迭代。
2. **痛點1解決**：點擊**文件**選單，這裡是迭代開發的介面。體驗一下：當迭代上線完成，關閉這個迭代時，這些介面會自動按微服務合併到專案中，徹底告別文件手動合併的痛苦！
3. **痛點2解決**：點擊**單測**選單，執行**環境變數測試**用例。因為使用了隨機初始數據，你可以反覆執行，再也不用擔心數據衝突導致用例作廢。
4. **痛點3解決**：在用例執行過程中，仔細查看每個步驟的斷言！它不僅校驗了介面返回的 Code 碼，更直連資料庫校驗了全域、專案、迭代三級環境變數實際數據的相互影響。真正的數據級斷言，讓隱患無所遁形！
------
## 🌟 更多盲盒等你開啟
以上只是 ApiChain 的冰山一角！現在，你可以自由點擊其他選單，探索範例專案中更多強大的配置與功能，感受前所未有的介面管理與測試流暢度。祝你體驗愉快！
	`;
    const markdownContentEn = `
## 🚀 Start Your ApiChain Journey
### 💡 Why Choose ApiChain?
In daily R&D and testing, are you often tortured by the following pain points?
1. **Fragmented Docs**: API docs during iterative development are hard to unify with overall project docs. Merging is entirely manual and prone to omissions.
2. **One-off Test Cases**: Test cases for validating iterative features become invalid after one run because of hardcoded data, making them impossible to reuse.
3. **Shallow Assertions**: Does a successful API status code really mean everything is fine? The underlying database might already be corrupted. Simply validating the response value cannot guarantee correctness.
4. **Regression Blind Boxes**: Programmers add new features but break old ones. The scope of impact is pure guesswork, regression testing is a shot in the dark, and production incidents happen frequently.
ApiChain directly tackles these pain points, providing you with an integrated closed-loop experience of **"Define - Test - Regression"**:
- **Automatic Iteration Doc Merging**: Maintain docs independently within iterations. Upon release, merge them into the project by microservice with one click. Say goodbye to fragmented docs forever.
- **Execute Test Cases Freely**: Built-in functions like random strings and timestamps mean no manual data modification is needed. Run iteration test cases as many times as you want.
- **Dual Assertions for APIs and Databases**: Not only validates response values but also connects directly to the database to validate actual data changes and automatically cleans up dirty data, nipping hidden dangers in the bud.
- **Precisely Intercept Regression Risks**: Export iteration cases to the project and execute project-level regression tests with one click. Make the scope of impact clear and safeguard your production environment.
### 🎯 Who is this guide for?
- **Backend/Frontend/Test Engineers**: Eager to solve the pain points of unified API documentation and deep automated testing with a single tool.
- **Tech Geeks and Efficiency Enthusiasts**: Interested in the innovative features of ApiChain and wanting to experience it firsthand.
---
## 🛠️ The Journey: Master ApiChain in Four Steps
To let you experience the charm of how ApiChain solves pain points in the shortest time, please follow these steps to complete the deployment and hands-on practice.
### Step 1: Build the Data Foundation (Prepare MySQL)
You need a MySQL 8.x database. If not installed yet, you can quickly start one using the following Docker script (⚠️ For production environments, ensure proper permission isolation and persistent configuration):
\`\`\`shell
docker pull mysql:8.0
docker run --name mysql-container -p ${this.state.dbPort}:3306 -e MYSQL_ROOT_PASSWORD=${this.state.dbPwd} -d mysql:8.0
\`\`\`
After starting, please note the following environment variables, which will be used frequently later:
- \`DB_HOST\` (Host address, e.g., ${argsObject.ip})
- \`DB_PORT\` (Port, e.g., ${this.state.dbPort}
- \`DB_USER\` (Username, e.g., ${this.state.dbUser})
- \`DB_PASS\` (Password, e.g., ${this.state.dbPwd})
- \`DB_NAME\` (Database name, e.g., ${this.state.dbName})
> 💡 **Tip**: The provided database account needs permissions for creating/modifying tables and CRUD operations. If you encounter a connection error \`Public Key Retrieval is not allowed\`, please change \`allowPublicKeyRetrieval\` to \`true\` in the driver properties.
Next, manually create the database and import the test data:
1. Execute SQL: \`create database ${this.state.dbName};\`
2. Download the test data script and import it: [Click here to download the SQL file](${getDbDownloadUrl()})
### Step 2: Start the Core Engine (Runner)
Once the database is ready, modify the database connection parameters in the following command to start the local Runner service with one click:
\`\`\`bash
docker volume create apichain_cache_data;
docker pull ${(IS_CHINA_BUILD || this.props.userCountry === 'CN') ? "registry.cn-shanghai.aliyuncs.com/apichain/runner" : "jiangliuer326442/apichain-runner"}:${this.props.defaultRunnerVersion};
docker run -d \\
-p 6588:6588 \\
-e DB_HOST=${argsObject.ip} \\
-e DB_PORT=${this.state.dbPort} \\
-e DB_USER=${this.state.dbUser} \\
-e DB_PASS=${this.state.dbPwd} \\
-e DB_NAME=${this.state.dbName} \\
-e DEPLOY_COUNTRY=${this.props.userCountry} \\
-e APICHAIN_SUPER_UID=${this.props.uid} \\
-v apichain_cache_data:/opt/cache \\
--name apichain-runner \\
${(IS_CHINA_BUILD || this.props.userCountry === 'CN') ? "registry.cn-shanghai.aliyuncs.com/apichain/runner" : "jiangliuer326442/apichain-runner"}:${this.props.defaultRunnerVersion}
\`\`\`
### Step 3: Connect the Client to the Runner
1. Open the ApiChain client and click the top right corner to switch to your preferred language.
2. Click **Standalone**, then select **Networked**.
3. Fill in the server address (e.g., \`http://${argsObject.ip}:6588\`), and click **Check** to ensure the network is connected.
4. Select **Join Team** -> Select the **runner developers** team -> Click **Join**.
5. 🎉 Because you started with the super admin UID, you join the team directly without approval! Restart ApiChain to officially start your experience.
### Step 4: Core Feature Tour
After joining the team, we recommend exploring the core logic of the product following this path:
1. **Identify Yourself**: Click the edit button next to your nickname at the top to change your display name within the team.
2. **Configure Dev Environment**: Go to \`Settings - Dev Environment\`. This is the variable data source for API requests and automated testing (shared across the team under the same Runner).
3. View Projects and Iterations:
   - \`Settings - Projects\`: Team microservices list.
   - \`Settings - Iterations\`: Development cycle management. Each iteration can record doc links, release branches, database configurations, etc.
4. **API Documentation & Debugging**: Go to \`Project - Docs\`, view all API details categorized by folders, and send requests directly for debugging.
5. **Project Environment Config**: Go to \`Project - Settings\` to configure API addresses and database info for different environments (database passwords are stored encrypted, used for subsequent assertions and dirty data cleanup).
------
## 🎯 Practical Exercise: Hitting the Four Pain Points
To let you tangibly experience how ApiChain solves core pain points, we have prepared the following hands-on session. First, we need to complete the project's database connection configuration, which is the prerequisite for **Deep Database Validation**.
### 1. Modify Project Database Connection (Setup for Pain Point 3: Database Validation)
Go to \`Project Menu - Runner - Settings\`, select **Local Environment**, and fill in the following information:
- **Domain**: Runner access address, ending with \`/\` (e.g., \`http://${argsObject.ip}:6588/\`)
- **Prefix**: API common path (empty for this project)
- **Database Info**: Fill in Host, Port, Username, Password (encrypted), and Name sequentially (same as Step 1)
- Request & Execution Endpoints:
  - \`API Request Sender\`: Select "Current Device" to send requests from the client, or "Team Runner" to solve closed network issues.
  - \`Database Connection Sender\`: Select "Current Device" to execute SQL from the client, or "Team Runner" to penetrate network restrictions.
- Click the **Modify** button at the bottom to save.
### 2. Run Project Unit Tests (Solving Pain Point 4: Goodbye Regression Blind Boxes)
Go to \`Project Menu - Runner - Unit Tests\`, check the **Onboarding Process** case, select **Local Environment**, and click **Execute Case**:
- 🌟 **Experience Focus**: This is a complete lifecycle closed-loop covering 13 steps including registration, application, approval, and permission changes. Subsequent steps depend on the parameters passed from previous steps, and random data acts as the initial trigger. After execution, you can clearly see the input parameters, return values, and multiple assertion results of each step, precisely intercepting any chain risks caused by changes.
- 🛠️ **Continue Exploring**: Check **Dev Environment Management** / **Project Test** / **Version Iteration** / **Environment Variable Test** in sequence to experience project-level regression testing in different scenarios.
### 3. Execute Iteration Unit Tests (Solving Pain Points 1, 2, 3: Doc Merging + Repeated Execution + Deep Validation)
1. Find the **Environment Variables** iteration in the **Iteration** menu.
2. **Pain Point 1 Solved**: Click the **Docs** menu; these are the APIs for iterative development. Experience this: when the iteration goes live and you close it, these APIs will automatically merge into the project by microservice, completely ending the pain of manual doc merging!
3. **Pain Point 2 Solved**: Click the **Unit Tests** menu and execute the **Environment Variable Test** case. Because random initial data is used, you can execute it repeatedly without worrying about test cases becoming invalid due to data conflicts.
4. **Pain Point 3 Solved**: During the case execution, carefully check the assertions for each step! It not only validates the API return code but also connects directly to the database to validate the mutual influence of actual data across global, project, and iteration three-level environment variables. True data-level assertions leave hidden dangers nowhere to hide!
------
## 🌟 More Blind Boxes Waiting for You
The above is just the tip of the ApiChain iceberg! Now, you can freely click other menus to explore more powerful configurations and features in the example project, and experience unprecedented smoothness in API management and testing. Enjoy your experience!
	`;
    let markdownContent;
    if (this.state.lang == "zh-CN") {
      markdownContent = markdownContentZhCn;
    } else if (this.state.lang == "zh-TW") {
      markdownContent = markdownContentZhTw;
    } else {
      markdownContent = markdownContentEn;
    }

    return (
      <Layout>
          <Header 
            style={{
              display: 'flex',
              justifyContent: 'space-between', // 左右分开
              alignItems: 'center',
              padding: '0 24px',
            }}
          >
            {this.props.vipFlg ? 
            <div style={{
              display: "flex",
              alignItems: "center"
            }}>
              {langTrans("member welcome")}
              <Text editable={{onChange: this.setUserName}}>{substr(this.state.user[db_field_uname], 15)}</Text>
              {langTrans("welcome") + langFormat("member expired", {"date": getdayjs(this.props.expireTime).format("YYYY-MM-DD")})}
              <Button type='link' onClick={() => this.setState({showPay: true})}>{langTrans("member renew")}</Button>
            </div> 
            :
            <div style={{
              display: "flex",
              alignItems: "center"
            }}>
              <Text editable={{onChange: this.setUserName}}>{this.state.user[db_field_uname]}</Text>
              {langTrans("welcome")}
              <Button type='link' onClick={() => this.setState({showPay: true})}>{langTrans("member buy")}</Button>
            </div>
            } 
            <Dropdown 
              menu={
                {
                  "items": Object.entries(langSupport).map(([key, label]) => ({label, key})),
                  "onClick": (event) => {
                    let newLang = event.key;
                    this.setState({lang: newLang});
                    window.electron.ipcRenderer.sendMessage(ChannelsLangStr, ChannelsLangSet, newLang);
                  },
                }
              } 
              trigger={['click']}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  cursor: 'pointer',
                }}
              >
                <GlobalOutlined style={{ marginRight: 6 }} />
                {
                  langSupport[this.state.lang]
                }
              </div>
            </Dropdown>
          </Header>
          <Content style={{ padding: '0 16px'}}>

            {(this.props.showCkCode && this.props.ckCodeType === "member") ? <Alert 
              message={langTrans("member checkout tips")}
              type="warning" 
              closable 
              onClose={this.closeShowPay} 
              onClick={this.handleCkCode}
            /> : null}

            <PayMemberModel 
              showPay={this.state.showPay}
              payMethod={this.props.payMethod}
              cb={showPay => this.setState({showPay})} 
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
            {(this.props.clientType === CLIENT_TYPE_TEAM && this.state.startupGuide == 1) ?
              <Card title={<>
            { langTrans("chatbox title") } <Text type="secondary"><Link href={ getWikiAiAssistant() }>{langTrans("link robot chat")}</Link></Text>
            </>} style={{ width: 1050 }}>
                <ChatBox 
                  from="home"
                  meWidth={500}
                  robotWidth={970}
                />
              </Card>
            : 
              ((this.props.iterator && this.state.startupGuide == 1) ?
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
              : 
              (this.state.startupGuide == 0 && 
              <>
                <MarkdownView 
                  content={ markdownContent } 
                />
                <div style={{ textAlign: 'center', marginTop: 16 }}>
                  <Button
                    type="primary"
                    style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
                    onClick={() => {
                      this.setState({startupGuide: 1});
                      localStorage.setItem(GUIDE_SHOW_FLG, 1);
                    }}
                  >
                    {langTrans("guide article btn")}
                  </Button>
                </div>
              </>
              )
              )
            }
            </Flex>
          </Content>
          <Footer style={{ textAlign: 'center' }}>
          <Link href={ this.state.projectUrl }>{ this.props.appName }</Link> ©{new Date().getFullYear()} Created by Mustafa Fang
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
    expireTime: state.device.expireTime,
    projects: state.prj.list,
    versionIterators : state['version_iterator'].list,
    teamName: state.device.teamName,
    clientType: state.device.clientType,
    defaultRunnerVersion: state.device.defaultRunnerVersion,
    userCountry: state.device.userCountry,
    teamId: state.device.teamId,
  }
}

export default connect(mapStateToProps)(Home);