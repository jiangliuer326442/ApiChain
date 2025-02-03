import { Component, ReactNode } from 'react';
import { connect } from 'react-redux';
import { Checkbox, Typography, Layout, Card, notification, Space, Button } from "antd";

import { 
  DownloadDemoDatabase,
  DownloadDemoPostMan,
  getProjectUrl,
  getWikiUrl,
  getWikiConceptUrl,
  getWikiWeatherReportUrl,
  getWikiUserRegisterUrl,
} from '@conf/url';
import { IS_AUTO_UPGRADE } from '@conf/storage';
import { SET_DEVICE_INFO } from '@conf/redux';
import {
  ChannelsAutoUpgradeStr, 
  ChannelsAutoUpgradeCheckStr, 
  ChannelsAutoUpgradeNewVersionStr,
  ChannelsAutoUpgradeDownloadStr,
} from '@conf/channel';
import {
  TABLE_USER_NAME,
  TABLE_USER_FIELDS
} from '@conf/db';
import { 
  getdayjs,
  isStringEmpty,
  getStartParams
} from '@rutil/index';
import { addUser, getUser, setUserName as ac_setUserName, } from '@act/user';
import registerMessageHook from '@act/message';
import PayModel from '@comp/topup';
import { getLang, langFormat, langTrans } from '@lang/i18n';

const { Header, Content, Footer } = Layout;

const { Title, Paragraph, Text, Link } = Typography;

const db_field_uname = TABLE_USER_FIELDS.FIELD_UNAME;
let user_country = TABLE_USER_FIELDS.FIELD_COUNTRY;
let user_lang = TABLE_USER_FIELDS.FIELD_LANG;
let user_ip = TABLE_USER_FIELDS.FIELD_IP;

class Home extends Component {

  constructor(props) {
    super(props);
    let checkAutoUpgrade = localStorage.getItem(IS_AUTO_UPGRADE);
    this.state = {
      user: {
        "uname": "",
        "register_time": 0,
      },
      showPay: false,
      checkAutoUpgrade : checkAutoUpgrade === null ? 1 : checkAutoUpgrade,
    }
  }

  async componentDidMount() {
    if (!isStringEmpty(this.props.uid)) {
      let user = await getUser(this.props.uid);
      if (user !== null) {
        this.setState({ 
          user,
        });
      }
    }
    if('electron' in window) {
      let argsObject = getStartParams();
      let uuid = argsObject.uuid;
      let uname = argsObject.uname;
      let ip = argsObject.ip;

      let userCountry = argsObject.userCountry;
      let userLang = argsObject.userLang;
      let user = await getUser(uuid);
      if (user === null) {
          await addUser(uuid, uname, ip, userCountry, userLang);
          user = await getUser(uuid);
      } else {
          user[user_country] = userCountry;
          user[user_lang] = userLang;
          user[user_ip] = ip;
          console.debug(user);
          await window.db[TABLE_USER_NAME].put(user);
      }

      this.props.dispatch({
        type : SET_DEVICE_INFO,
        uuid : uuid,
        vipFlg : argsObject.vipFlg === "true" ? true : false, 
        expireTime : parseInt(argsObject.expireTime),
        buyTimes : parseInt(argsObject.buyTimes),
        html : argsObject.html,
        appName : argsObject.appName,
        appVersion : argsObject.appVersion,
        userCountry,
        userLang,
      });

      this.setState({ 
        user,
      });

      this.updateOnLoad();
      registerMessageHook(this.props.dispatch, async (uid)=>{
        let user = await getUser(uid);
        this.setState({ user });
      });
    }
  }

  updateOnLoad = () => {
    window.electron.ipcRenderer.on(ChannelsAutoUpgradeStr, (action, newVersion) => {
      if (action !== ChannelsAutoUpgradeNewVersionStr) {
        return;
      }
      let items = newVersion.releaseNotes.split("\\n");
      notification.open({
        message: '版本 ' + newVersion.version + ' 已发布，是否更新？',
        description:(<Card title={ "发现新版本" } style={{ width: 300 }}>
          {items.map((item, index) => (
            <p key={index}>{item}</p >
          ))}
        </Card>),
        btn: this.renderBtn(),
        key: 'newVersion',
        duration: 0,
      });
    });

    //前端通知服务端进行版本更新检查
    if (this.state.checkAutoUpgrade == 1) {
      this.checkForUpgrade();
    }
  }

  setUserName = async (newUserName) => {
    await ac_setUserName(this.props.uid, newUserName);
    let user = await getUser(this.props.uid);
    this.setState({ user });
  }

  checkForUpgrade = () => {
    window.electron.ipcRenderer.sendMessage(ChannelsAutoUpgradeStr, ChannelsAutoUpgradeCheckStr);
  }

  handleAutoUpdate = () => {
    window.electron.ipcRenderer.sendMessage(ChannelsAutoUpgradeStr, ChannelsAutoUpgradeDownloadStr);
    notification.destroy();
  }

  renderBtn() : ReactNode {
    return (
      <Space>
        <Button type="link" size="small" onClick={() => notification.destroy()}>
          取消
        </Button>
        <Button type="primary" size="small" onClick={this.handleAutoUpdate}>
          更新
        </Button>
      </Space>
    );
  }

  render() : ReactNode {
    return (
      <Layout>
          <Header style={{ padding: 0, paddingLeft: 16 }}>
            {this.props.vipFlg ? 
            <>
              {langTrans("member welcome")}
              <Text editable={{onChange: this.setUserName}}>{this.state.user[db_field_uname]}</Text>
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
            <PayModel showPay={this.state.showPay} cb={showPay => this.setState({showPay})} />
            {getLang() === 'zh-CN' ? 
            <Typography>
              <Title>不会使用？跟着示例慢慢学</Title>
              <Paragraph>
                第一次下载安装 { this.props.appName } ，不知如何使用？首页，你需要了解一些关于这款软件使用的一些概念，点击<Link href={ getWikiConceptUrl() }>这里</Link>了解它们。其次，下载并导入我们的示例数据，跟着示例学习编写接口文档和Api自动化测试，这也是程序员了解和接触新事物的常用流程。在开始之前，首先修改一下你的昵称吧，位置在顶部 “尊敬的会员 XXX 你好” 有个编辑按钮，这样团队里的小伙伴就能知道哪些接口是你写的啦！
              </Paragraph>
              <Title level={3}>下载并导入我们的示例demo数据</Title>
              <ul>
                <li>
                点击<Link href={ DownloadDemoDatabase }>这里</Link>下载示例数据库
                </li>
                <li>
                  点击顶部菜单-数据-还原数据库，选择下载的示例数据库文件
                </li>
                <li>
                  点击顶部菜单-页面-刷新当前页面，就可以看到已经导入的示例数据了，包含示例的环境、项目、接口、单侧等，通过查看编辑、发送网络请求等，学习他的配置和使用哦！
                </li>
              </ul>  
              <Paragraph>
                示例数据库包含了两个示例，一个演示了 { this.props.appName } 的基本使用，另一个包含了 { this.props.appName } 的高阶使用，你可以参照教程一步步学习，在学习的过程中熟悉对这款软件的使用。以下是这两个示例的详细操作流程的链接。
              </Paragraph>
              <ul>
                <li>
                  <Link href={ getWikiWeatherReportUrl() }>入门教程1：用任意城市查询天气预报-{ this.props.appName }基本使用</Link>
                </li>
                <li>
                  <Link href={ getWikiUserRegisterUrl() }>入门教程2：用户注册登录鉴权-{ this.props.appName }高阶使用</Link>
                </li>
              </ul>
              <Title level={3}>从PostMan导入您的接口数据</Title>
              <Paragraph>
                这里假设你需要从PostMan导入接口数据，首先你需要在PostMan中导出接口数据，然后在{ this.props.appName }中导入接口数据。具体步骤如下：
              </Paragraph>
              <ul>
                <li>
                点击<Link href={ DownloadDemoPostMan }>这里</Link>下载 PostMan 的备份文件。
                </li>
                <li>
                  点击设置-项目-添加微服务，项目标识 填写 “fly”，备注填写 “无人机”，确定按钮新增项目。
                </li>
                <li>
                  在左侧项目菜单找到“无人机”项目，点击项目环境变量，选择环境，本地环境，可以看到一个名为“api_host”的环境变量，这代表这个项目的接口域名地址。是这个项目所有接口的地址前缀，需要 “http://”或者“https://”开头，“/”结尾。点击旁边的编辑按钮，参数值填写 <Text underline copyable>http://127.0.0.1:8081/</Text>，点击确定按钮保存。
                </li>
                <li>
                  点击当前项目左侧菜单的“文档”菜单，可以看到红色的“从PostMan导入”按钮，点击这个按钮，选择第一步下载的 PostMan 备份为难。
                </li>
                <li>
                  看到“导入PostMan成功”的提示，但是没有看到接口数据？别着急，点击顶部的页面-刷新当前页面，就可以看到刚刚从PostMan导入的数据了。
                </li>
                <li>
                  选择一个刚刚导入的接口，点击发送请求按钮，就可以测试接口了，可以看到这是一个 application/json 格式的网络请求。
                </li>
              </ul>
              <Paragraph>
                更多教程请查阅我们的<Link href={ getWikiUrl() }>文档</Link>，版本更新后新增功能也会同步更新到该文档中。
              </Paragraph>
              <Title level={3}>您的隐私数据非常重要！！！</Title>
              <Paragraph>
              { this.props.appName } 所有存储内容都是您和您的企业至关重要的数字化财产，由于笔者常年在银行这样的纯内网的环境中从事开发，{ this.props.appName } 所有功能均不需要连接外部网络。所有数据都存储在您的个人电脑中，这样既保证了极高的性能，更重要的是确保了绝对的安全～
              </Paragraph>
              <Paragraph>
                经常备份数据库很重要！鉴于api接口文档对于日常开发的重要性，强烈建议您养成定时备份的好习惯。备份操作路径：顶部菜单-帮助-备份数据库。
              </Paragraph>
              <Paragraph>
                尽管非常希望将这款软件做成无需网络完全单机的，但是检查更新依然需要连接外部网络。新版本能够修复现有软件的一些bug以及能够让您使用到一些新增的功能。
              </Paragraph>
              <Paragraph>
                您自行决定是否使用自动检查更新，如果关闭自动检查更新，强烈建议您定期点击一下手动检查按钮，看一下是否有新的软件版本可用。也可以经常光顾我们的<Link href={ getProjectUrl() }>项目主页</Link>，看看新增了什么你感兴趣的功能。
              </Paragraph>
            </Typography>
            : 
            (getLang() === 'zh-TW' ? 
            <Typography>
              <Title>不會使用？跟著示例慢慢學。</Title>
              <Paragraph>
                第一次下載安裝 { this.props.appName }，不知如何使用？首先，你需要了解一些關於這款軟體使用的基本概念，點擊<Link href={ getWikiConceptUrl() }>這裡</Link>了解它們。其次，下載並導入我們的示例數據，跟著示例學習編寫接口文檔和 Api 自動化測試，這也是程式設計師了解和接觸新事物的常用流程。在開始之前，首先修改一下你的暱稱吧，位置在頂部「尊敬的會員 XXX 你好」有個編輯按鈕，這樣團隊裡的小夥伴就能知道哪些接口是你寫的啦！
              </Paragraph>
              <Title level={3}>下載並導入我們的示例 demo 數據</Title>
              <ul>
                <li>
                點擊<Link href={ DownloadDemoDatabase }>這裡</Link>下載示例數據庫。
                </li>
                <li>
                點擊頂部選單-數據-還原數據庫，選擇下載的範例數據庫文件
                </li>
                <li>
                點擊頂部選單-頁面-刷新當前頁面，就可以看到已經導入的範例數據了，包含範例的環境、項目、接口、單側等，通過查看編輯、發送網絡請求等，學習他的配置和使用哦！
                </li>
              </ul>  
              <Paragraph>
              範例數據庫包含了兩個範例，一個演示了 { this.props.appName } 的基本使用，另一個包含了 { this.props.appName } 的高階使用，你可以參照教程一步步學習，在學習的過程中熟悉對這款軟件的使用。以下是這兩個範例的詳細操作流程的鏈接。
              </Paragraph>
              <ul>
                <li>
                  <Link href={ getWikiWeatherReportUrl() }>入門教程1：用任意城市查詢天氣預報 - { this.props.appName }基本使用</Link>
                </li>
                <li>
                  <Link href={ getWikiUserRegisterUrl() }>入門教程2：用戶註冊登錄鑒權 - { this.props.appName }高階使用</Link>
                </li>
              </ul>
              <Title level={3}>從PostMan導入您的接口數據</Title>
              <Paragraph>
              這裡假設你需要從PostMan導入接口數據，首先你需要在PostMan中導出接口數據，然後在{ this.props.appName }中導入接口數據。具體步驟如下：
              </Paragraph>
              <ul>
                <li>
                點擊<Link href={ DownloadDemoPostMan }>這裡</Link>下載 PostMan 的備份文件。
                </li>
                <li>
                點擊設置-項目-添加微服務，項目標識 填寫 “fly”，備註填寫 “無人機”，確定按鈕新增項目。
                </li>
                <li>
                在左側項目菜單找到「無人機」項目，點擊項目環境變量，選擇環境，本地環境，你可以看到一個名為「api_host」的環境變量，這代表這個項目的接口域名地址。這是這個項目所有接口的地址前綴，需要「http://」或者「https://」開頭，「/」結尾。點擊旁邊的編輯按鈕，參數值填寫 <Text underline copyable>http://127.0.0.1:8081/</Text>，點擊確定按鈕保存。
                </li>
                <li>
                點擊當前項目左側菜單的「文檔」菜單，你可以看到紅色的「從PostMan導入」按鈕，點擊這個按鈕，選擇第一步下載的 PostMan 備份文件。
                </li>
                <li>
                看到「導入PostMan成功」的提示，但是沒有看到接口數據？別著急，點擊頂部的頁面-刷新當前頁面，就可以看到剛剛從PostMan導入的數據了。
                </li>
                <li>
                選擇一個剛剛導入的接口，點擊發送請求按鈕，就可以測試接口了，你可以看到這是一個 application/json 格式的網絡請求。
                </li>
              </ul>
              <Paragraph>
              更多教程請查閱我們的<Link href={ getWikiUrl() }>文檔</Link>，版本更新後新增功能也會同步更新到該文檔中。
              </Paragraph>
              <Title level={3}>您的隱私數據非常重要！！！</Title>
              <Paragraph>
              { this.props.appName } 所有存儲內容都是您和您的企業至關重要的數字化財產，由於筆者常年在銀行這樣的純內網的環境中從事開發，{ this.props.appName } 所有功能均不需要連接外部網絡。所有數據都存儲在您的個人電腦中，這樣既保證了極高的性能，更重要的是確保了絕對的安全～
              </Paragraph>
              <Paragraph>
              經常備份數據庫很重要！鑑於api接口文檔對於日常開發的重要性，強烈建議您養成定時備份的好習慣。備份操作路徑：頂部菜單-幫助-備份數據庫。
              </Paragraph>
              <Paragraph>
              儘管非常希望將這款軟件做成無需網絡完全單機的，但是檢查更新依然需要連接外部網絡。新版本能夠修復現有軟件的一些bug以及能夠讓您使用到一些新增的功能。
              </Paragraph>
              <Paragraph>
              您自行決定是否使用自動檢查更新，如果關閉自動檢查更新，強烈建議您定期點擊一下手動檢查按鈕，看一下是否有新的軟件版本可用。也可以經常光顧我們的<Link href={ getProjectUrl() }>項目主頁</Link>，看看新增了什麼你感興趣的功能。
              </Paragraph>
            </Typography>
            :
            <Typography>
              <Title>Don't know how to use? Follow the examples and learn step by step.</Title>
              <Paragraph>
                First time downloading and installing { this.props.appName }, and not sure how to use it? First, you need to understand some basic concepts about using this software. Click <Link href={ getWikiConceptUrl() }>here</Link> to learn about them. Next, download and import our sample data, and follow the examples to learn how to write API documentation and automate API testing. This is also a common process for programmers to understand and explore new things. Before you start, first modify your nickname! You can find the edit button at the top where it says "Dear Member XXX, hello." This way, your teammates will know which APIs were written by you!
              </Paragraph>
              <Title level={3}>Download and import our sample demo data</Title>
              <ul>
                <li>
                Click <Link href={ DownloadDemoDatabase }>here</Link> to download the sample database.
                </li>
                <li>
                Click on the top menu - Data - Restore Database, then select the downloaded sample database file.
                </li>
                <li>
                Click on the top menu - Page - Refresh Current Page, and you will be able to see the imported sample data, including environments, projects, interfaces, unit tests, etc. Learn its configuration and usage by viewing edits, sending network requests, etc.!
                </li>
              </ul>  
              <Paragraph>
                The sample database contains two examples; one demonstrates the basic use of { this.props.appName }, while the other includes advanced usage of { this.props.appName }. You can follow the tutorial step by step to learn and get familiar with using this software during the learning process. Here are the links to the detailed operation procedures for these two examples.
              </Paragraph>
              <ul>
                <li>
                  <Link href={ getWikiWeatherReportUrl() }>Beginner Tutorial 1: Query the Weather Forecast for Any City - Basic Usage of { this.props.appName }</Link>
                </li>
                <li>
                  <Link href={ getWikiUserRegisterUrl() }>Beginner Tutorial 2: User Registration, Login, and Authentication - Advanced Usage of { this.props.appName }</Link>
                </li>
              </ul>
              <Title level={3}>Import Your API Data from PostMan</Title>
              <Paragraph>
              Here, it is assumed that you need to import API data from PostMan. First, you need to export the API data from PostMan and then import the API data in { this.props.appName }. The specific steps are as follows:
              </Paragraph>
              <ul>
                <li>
                Click <Link href={ DownloadDemoPostMan }>here</Link> to download the backup file of PostMan.
                </li>
                <li>
                Click on Settings - Projects - Add Microservice, fill in “fly” for the project identifier, and “drone” for the remarks, then click the confirm button to add the project.
                </li>
                <li>
                In the left-side project menu, find the "drone" project, click on Project Environment Variables, select the environment as Local Environment, and you will see an environment variable named "api_host". This represents the domain name address of the project's APIs. It serves as the address prefix for all APIs in this project and needs to start with "http://" or "https://" and end with "/". Click the edit button next to it, fill in the parameter value as <Text underline copyable>http://127.0.0.1:8081/</Text>, and click the confirm button to save.
                </li>
                <li>
                Click on the "Documentation" menu in the left-side menu of the current project, where you will see a red "Import from PostMan" button. Click this button and select the PostMan backup file downloaded in the first step.
                </li>
                <li>
                After seeing the "PostMan Import Successful" message but not seeing the API data? Don't worry, click on Page - Refresh Current Page at the top, and you will be able to see the data just imported from PostMan.
                </li>
                <li>
                Select an API just imported, click the send request button to test the API, and you can see that it is a network request in application/json format.
                </li>
              </ul>
              <Paragraph>
              For more tutorials, please refer to our <Link href={ getWikiUrl() }>documentation</Link>, which will also be updated with new features after version updates.
              </Paragraph>
              <Title level={3}>Your privacy data is extremely important!!!</Title>
              <Paragraph>
              All contents stored by { this.props.appName } are crucial digital assets for you and your company. As the developer has long been working in a purely intranet environment such as banks, all functions of { this.props.appName } do not require connection to the external network. All data is stored on your personal computer, which not only ensures very high performance but, more importantly, guarantees absolute security.
              </Paragraph>
              <Paragraph>
              Regularly backing up the database is crucial! Given the importance of API documentation for daily development, it is highly recommended that you develop a habit of regular backups. Backup operation path: Top menu - Help - Backup Database.
              </Paragraph>
              <Paragraph>
              Although there is a strong desire to make this software completely standalone without needing any network, checking for updates still requires connecting to the external network. New versions can fix some bugs in the existing software and allow you to use some new features.
              </Paragraph>
              <Paragraph>
              It's up to you whether to use automatic update checks. If you turn off automatic update checks, it is strongly recommended that you regularly click the manual check button to see if there is a new software version available. You can also frequently visit our project homepage to see what new features have been added that may interest you.
              </Paragraph>
            </Typography>
            )}
            <Checkbox
              checked={this.state.checkAutoUpgrade == 1}
              onChange={e => {
                if (e.target.checked) {
                  this.setState({checkAutoUpgrade: 1});
                  localStorage.setItem(IS_AUTO_UPGRADE, "1");
                  this.checkForUpgrade();
                } else {
                  this.setState({checkAutoUpgrade: 0});
                  localStorage.setItem(IS_AUTO_UPGRADE, "0");
                }
              }}
            >{langTrans("update checkbox")}</Checkbox>
            {this.state.checkAutoUpgrade == 0 ? 
            <Button type="primary" onClick={this.checkForUpgrade}>{langTrans("update manual")}</Button>
            : null}
          </Content>
          <Footer style={{ textAlign: 'center' }}>
          { this.props.appName } ©{new Date().getFullYear()} Created by 方海亮
          </Footer>
        </Layout>
    );
  }
}

function mapStateToProps (state) {
  return {
    uid: state.device.uuid,
    appName: state.device.appName,
    vipFlg: state.device.vipFlg,
    expireTime: state.device.expireTime,
  }
}

export default connect(mapStateToProps)(Home);