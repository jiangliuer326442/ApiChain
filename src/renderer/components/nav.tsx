import { Component, ReactNode } from 'react';
import { connect } from 'react-redux';
import { Layout, Menu, Flex } from "antd";
import Dexie from 'dexie';

import { DB_NAME } from '../../config/db';
import { SET_NAV_COLLAPSED } from '../../config/redux';
import { getVersionIterators } from "../actions/version_iterator";
import { getPrjs } from "../actions/project";

const { Sider } = Layout;

class Nav extends Component {

    constructor(props) {
        super(props);

        if(window.db === undefined) {
            window.db = new Dexie(DB_NAME);
        }

        window.db.on('ready', () => {
          if (!this.state.initNavFlg) {
            this.cb();
          }
        });

        require('../reducers/db/20240501001');
        require('../reducers/db/20240601001');
        require('../reducers/db/20240604001');
        require('../reducers/db/20240613001');
        require('../reducers/db/20241028001');
        require('../reducers/db/20241111001');
        require('../reducers/db/20241112001');
        require('../reducers/db/20241114001');
        require('../reducers/db/20241216001');
        require('../reducers/db/20250102001');

        this.state = {
          initNavFlg: false,
        };
    }

    async componentDidMount() {
      await window.db.open();
      if (!this.state.initNavFlg) {
        this.cb();
      }
    }

    cb = () => {
      getPrjs(this.props.dispatch);
      getVersionIterators(this.props.dispatch);
      this.state.initNavFlg = true;
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
              padding: "16px",
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