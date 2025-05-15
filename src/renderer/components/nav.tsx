import { Component, ReactNode } from 'react';
import { connect } from 'react-redux';
import { Layout, Menu, Flex } from "antd";

import { SET_NAV_COLLAPSED } from '@conf/redux';

const { Sider } = Layout;

class Nav extends Component {

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