import { Component, ReactNode } from 'react';
import { connect } from 'react-redux';
import { Layout, Menu, Flex } from "antd";
import Dexie from 'dexie';

import { DB_NAME } from '../../config/db';
import { SET_NAV_COLLAPSED } from '../../config/redux';
import { ChannelsUserInfoStr, ChannelsUserInfoPingStr } from '../../config/channel';
import registerMessageHook from '../actions/message';
import { getVersionIterators } from "../actions/version_iterator";
import { getPrjs } from "../actions/project";

const { Sider } = Layout;

class Nav extends Component {

    constructor(props) {
        super(props);

        registerMessageHook(this.props.dispatch, ()=>{});

        if(window.db === undefined) {
            // 创建一个 Dexie 数据库实例  
            window.db = new Dexie(DB_NAME);
        }

        window.db.on('ready', () => {
          this.cb();
        });

        require('../reducers/db/20240501001');
        require('../reducers/db/20240601001');
        require('../reducers/db/20240604001');
        require('../reducers/db/20240613001');
        require('../reducers/db/20241028001');
        require('../reducers/db/20241111001');
        require('../reducers/db/20241112001');
        require('../reducers/db/20241114001');

        this.state = {

        };
    }

    async componentDidMount() {
      await window.db.open();
      
      if (this.props.uuid === "") {
        if('electron' in window) {
          window.electron.ipcRenderer.sendMessage(ChannelsUserInfoStr, ChannelsUserInfoPingStr);
        }
      }
      
    }

    cb = () => {
      getPrjs(this.props.dispatch);
      getVersionIterators(this.props.dispatch);
    }

    setCollapsed = (collapsed) => {
      this.props.dispatch({
        type: SET_NAV_COLLAPSED,
        collapsed,
      });
    }

    render() : ReactNode {
        return (
          <Sider collapsible collapsed={this.props.collapsed} onCollapse={(value) => this.setCollapsed(value)}>
            <Flex gap="middle" vertical style={{
              height: "32px",
              margin: "16px",
            }}>
              {!this.props.collapsed ? 
              <a href={ "#/" } rel="noopener noreferrer" style={{lineHeight: 0,
                color: "#5DE2E7",
                marginLeft: 5,
                marginTop: 10,
                fontSize: 25,
                fontFamily: "serif"
              }}>
                {this.props.appName}
              </a>
              : null}
              <p style={{
                color: "#fff",
                marginTop: -30,
                fontSize: 10,
                textAlign: "right",
                marginRight: 9
              }}>{this.props.appVersion}</p>
              </Flex>
            <Menu theme="dark" defaultSelectedKeys={this.props.selected} mode="inline" items={this.props.navs} />
          </Sider>
        );
    }
}

function mapStateToProps (state) {
  return {
    uuid: state.device.uuid,
    selected: state.nav.selected,
    navs: state.nav.navs,
    appName: state.device.appName,
    appVersion: state.device.appVersion,
    collapsed: state.nav.collapsed,
  }
}

export default connect(mapStateToProps)(Nav);