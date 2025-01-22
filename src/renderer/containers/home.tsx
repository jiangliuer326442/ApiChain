import { Component, ReactNode } from 'react';
import { connect } from 'react-redux';
import { Checkbox, Typography, Layout, Card, notification, Space, Button} from "antd";

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
  isStringEmpty,
  getStartParams
} from '@rutil/index';
import { addUser, getUser, setUserName as ac_setUserName, } from '@act/user';
import registerMessageHook from '@act/message';

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
      checkAutoUpgrade : checkAutoUpgrade === null ? 1 : checkAutoUpgrade,
    }
  }

  async componentDidMount() {
    if (!isStringEmpty(this.props.uid)) {
      this.initUser(this.props.uid);
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
      });

      this.initUser(uuid);

      this.updateOnLoad();
      registerMessageHook(this.props.dispatch, async (uid)=>{
        let user = await getUser(uid);
        this.setState({ user });
      });
    }
  }

  initUser = async (uid : string) => {
    let user = await getUser(uid);
    this.setState({ user });
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
          <Header style={{ padding: 0 }}>
            {this.props.vipFlg ? 
            <>
              {"尊敬的会员 "}
              <Text editable={{onChange: this.setUserName}}>{this.state.user[db_field_uname]}</Text>
              {" 你好， " + this.props.appName + " 陪你度过崭新的一天"}</> 
            :
            <>
              <Text editable={{onChange: this.setUserName}}>{this.state.user[db_field_uname]}</Text>
              {" 你好，" + this.props.appName + " 陪你度过崭新的一天"}
            </>
            } 
          </Header>
          <Content style={{ padding: '0 16px' }}>
            <div
              style={{
                padding: 24,
                minHeight: 360,
              }}
            >
                <Typography>
                  <Title>您的隐私数据非常重要！！！</Title>
                  <Paragraph>
                    ApiChain 所有存储内容都是您和您的企业至关重要的数字化财产，由于笔者常年在银行这样的纯内网的环境中从事开发，ApiChain 所有功能均不需要连接外部网络。所有数据都存储在您的个人电脑中，这样既保证了极高的性能，更重要的是确保了绝对的安全～
                  </Paragraph>
                  <Paragraph>
                    经常备份数据库很重要！鉴于api接口文档对于日常开发的重要性，强烈建议您养成定时备份的好习惯。备份操作路径：顶部菜单-帮助-备份数据库。
                  </Paragraph>
                  <Paragraph>
                    尽管非常希望将这款软件做成无需网络完全单机的，但是检查更新依然需要连接外部网络。新版本能够修复现有软件的一些bug以及能够让您使用到一些新增的功能。
                  </Paragraph>
                  <Paragraph>
                    您自行决定是否使用自动检查更新，如果关闭自动检查更新，强烈建议您定期点击一下手动检查按钮，看一下是否有新的软件版本可用。也可以经常光顾我们的<Link href="https://github.com/jiangliuer326442/ApiChain">项目主页</Link>，看看新增了什么你感兴趣的功能。
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
            </div>
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
    appName: state.device.appName,
    vipFlg: state.device.vipFlg,
    expireTime: state.device.expireTime,
  }
}

export default connect(mapStateToProps)(Home);