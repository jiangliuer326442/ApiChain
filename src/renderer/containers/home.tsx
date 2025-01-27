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
              {"尊敬的会员 "}
              <Text editable={{onChange: this.setUserName}}>{this.state.user[db_field_uname]}</Text>
              {" 你好， " + this.props.appName + " 陪你度过崭新的一天（会员到期日 " + getdayjs(this.props.expireTime).format("YYYY-MM-DD") + "）"}
              <Button type='link' onClick={() => this.setState({showPay: true})}>续期</Button>
            </> 
            :
            <>
              <Text editable={{onChange: this.setUserName}}>{this.state.user[db_field_uname]}</Text>
              {" 你好，" + this.props.appName + " 陪你度过崭新的一天"}
            </>
            } 
          </Header>
          <Content style={{ padding: '0 16px'}}>
            <PayModel showPay={this.state.showPay} cb={showPay => this.setState({showPay})} />
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
              >开启自动检查更新</Checkbox>
              {this.state.checkAutoUpgrade == 0 ? 
              <Button type="primary" onClick={this.checkForUpgrade}>手动检查更新</Button>
              : null}
            </Typography>
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