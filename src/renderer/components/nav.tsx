import { Component, ReactNode } from 'react';
import {
  SettingOutlined,
  OneToOneOutlined,
  LineChartOutlined,
  FlagOutlined,
} from '@ant-design/icons';
import { connect } from 'react-redux';
import { Button, Layout, Menu, Flex } from "antd";
import { cloneDeep } from 'lodash';

import { langTrans } from '@lang/i18n';
import { 
  TABLE_VERSION_ITERATION_FIELDS,
  TABLE_MICRO_SERVICE_FIELDS,
} from '@conf/db';
import { SET_NAV_COLLAPSED } from '@conf/redux';
import {
  EMPTY_STRING,
  NETWORK,
  SETTINGS,
  ITERATOR,
  PROJECT,
} from '@conf/global_config';
import {
  ENV_LIST_ROUTE,
  PROJECT_LIST_ROUTE,
  VERSION_ITERATOR_LIST_ROUTE,
  INTERNET_REQUEST,
  REQUEST_HISTORY,
  ENVVAR_GLOBAL_LIST_ROUTE,
  BASIC_SETTING_ROUTE,
  TEAM_MEMBER_ROUTE,
} from '@conf/routers';
import {
  CLIENT_TYPE_TEAM,
  CLIENT_TYPE_SINGLE,
} from '@conf/team';
import { getOpenVersionIterators } from "@act/version_iterator";
import { getPrjs } from "@act/project";
import { isStringEmpty } from '@rutil/index';

let version_iterator_uuid = TABLE_VERSION_ITERATION_FIELDS.FIELD_UUID;
let version_iterator_title = TABLE_VERSION_ITERATION_FIELDS.FIELD_NAME;

let prj_label = TABLE_MICRO_SERVICE_FIELDS.FIELD_LABEL;

const { Sider } = Layout;

class Nav extends Component {


    constructor(props) {
        super(props);
        const basicNavs = [
          {
            key: NETWORK,
            icon: <OneToOneOutlined />,
            label: langTrans("nav request"),
            children:[
              {
                key: INTERNET_REQUEST,
                label: (
                  <a href={ "#" + INTERNET_REQUEST } rel="noopener noreferrer">
                    {langTrans("nav request send")}
                  </a >
                )
              },
              {
                key: REQUEST_HISTORY,
                label: (
                  <a href={ "#" + REQUEST_HISTORY } rel="noopener noreferrer">
                    {langTrans("nav request log")}
                  </a >
                )
              }
            ]
          },
          {
            key: ITERATOR,
            icon: <LineChartOutlined />,
            label: <Button style={{padding: 0}} type='text' onClick={() => {
              if (this.props.iterations.length === 0) {
                getOpenVersionIterators(this.props.clientType, this.props.dispatch);
              }
            }}>{langTrans("nav iterator")}</Button>,
            children: [
            ]
          },
          {
            key: PROJECT,
            icon: <FlagOutlined />,
            label: <Button style={{padding: 0}} type='text' onClick={() => {
              if (this.props.prjs.length === 0) {
                getPrjs(this.props.clientType, this.props.dispatch);
              }
            }}>{langTrans("nav project")}</Button>,
            children: [
            ]
          },
          {
            key: SETTINGS,
            icon: <SettingOutlined />,
            label: langTrans("nav setting"),
            children: [
              {
                key: VERSION_ITERATOR_LIST_ROUTE,
                label:(
                  <a href={ "#" + VERSION_ITERATOR_LIST_ROUTE } rel="noopener noreferrer">
                    {langTrans("nav setting iterator")}
                  </a>
                )
              },
              {
                key: ENVVAR_GLOBAL_LIST_ROUTE,
                label: (
                  <a href={ "#" + ENVVAR_GLOBAL_LIST_ROUTE } rel="noopener noreferrer">
                    {langTrans("nav setting envvar")}
                  </a >
                )
              },
              {
                key: PROJECT_LIST_ROUTE,
                label: (
                  <a href={ "#" + PROJECT_LIST_ROUTE } rel="noopener noreferrer">
                    {langTrans("nav setting project")}
                  </a >
                )
              },
              {
                key: ENV_LIST_ROUTE,
                label: (
                  <a href={ "#" + ENV_LIST_ROUTE } rel="noopener noreferrer">
                    {langTrans("nav setting env")}
                  </a >
                )
              },
            ]
          },
        ];

        if (this.props.clientType === CLIENT_TYPE_TEAM) {
          basicNavs[3].children.push({
            key: TEAM_MEMBER_ROUTE,
            label: (
              <a href={ "#" + TEAM_MEMBER_ROUTE } rel="noopener noreferrer">
                {langTrans("nav setting member")}
              </a >
            )
          }) 
          basicNavs[3].children.push(              {
            key: BASIC_SETTING_ROUTE,
            label: (
              <a href={ "#" + BASIC_SETTING_ROUTE } rel="noopener noreferrer">
                {langTrans("nav setting basic")}
              </a >
            )
          });
        }

        this.state = {
          navs: basicNavs,
          initPrjsFlg: false,
          initIterationFlg: false,
        };
    }

    static getDerivedStateFromProps(nextProps, prevState) {  
        if (!prevState.initPrjsFlg && nextProps.prjs.length > 0 && prevState.navs[2].children.length === 0 ) {
          let newSstate = cloneDeep(prevState);
          newSstate.navs[2].children = nextProps.prjs.map((prj) => {
            const teamId = isStringEmpty(prj.teamId) ? EMPTY_STRING : prj.teamId;
            const children = [];
            children.push({
              key: prj[prj_label] + "_envvar",
              label: <a href={`#/prj_envvars/${teamId}/${prj.value}` } rel="noopener noreferrer">{langTrans("nav project envvar")}</a >
            });
            children.push({
              key: prj[prj_label] + "_doc",
              label: <a href={`#/project_requests/${teamId}/${prj.value}` } rel="noopener noreferrer">{langTrans("nav project doc")}</a >
            });
            children.push({
              key: prj[prj_label] + "_params",
              label: <a href={`#/project_params/${teamId}/${prj.value}` } rel="noopener noreferrer">{langTrans("nav project params")}</a >
            });
            if (nextProps.clientType === CLIENT_TYPE_SINGLE || prj.teamId === nextProps.teamId) {
              children.push(                {
                key: prj[prj_label] + "_unittest",
                label: <a href={`#/project_tests/${teamId}/${prj.value}` } rel="noopener noreferrer">{langTrans("nav project unittest")}</a >
              });
            }
            return {
              key: prj.value,
              label: prj.label,
              children
            }
          });
          return {initPrjsFlg: true, navs: newSstate.navs};
        } 
        
        if (!prevState.initIterationFlg && nextProps.iterations.length > 0 && prevState.navs[1].children.length === 0 ) {
          let newSstate = cloneDeep(prevState);
          newSstate.navs[1].children = nextProps.iterations.map(iteration => {
            return {
              key: ITERATOR + "_" + iteration[version_iterator_uuid],
              label: iteration[version_iterator_title],
              children: [
                {
                  key: ITERATOR + "_" + iteration[version_iterator_uuid] + "_envvar",
                  label: <a href={"#/iterator_envvars/" + iteration[version_iterator_uuid] } rel="noopener noreferrer">{langTrans("nav iterator envvar")}</a >
                },
                {
                  key: ITERATOR + "_" + iteration[version_iterator_uuid] + "_doc",
                  label: <a href={"#/version_iterator_requests/" + iteration[version_iterator_uuid] } rel="noopener noreferrer">{langTrans("nav iterator doc")}</a >
                },
                {
                  key: ITERATOR + "_" + iteration[version_iterator_uuid] + "_unittest",
                  label: <a href={"#/version_iterator_tests/" + iteration[version_iterator_uuid] } rel="noopener noreferrer">{langTrans("nav iterator unittest")}</a >
                },
                {
                  key: ITERATOR + "_" + iteration[version_iterator_uuid] + "_vip",
                  label: <a href={"#/version_iterator_vip/" + iteration[version_iterator_uuid] } rel="noopener noreferrer">{langTrans("nav iterator member")}</a >
                }
              ],
            }
          });
          return {initIterationFlg: true, navs: newSstate.navs};
        } 
        return null;
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
              <Menu 
                theme="dark" 
                defaultSelectedKeys={this.props.selected} 
                mode="inline" 
                items={this.state.navs} 
                />
          </Sider>
        );
    }
}

function mapStateToProps (state) {
  return {
    uuid: state.device.uuid,
    selected: state.nav.selected,
    appName: state.device.appName,
    appVersion: state.device.appVersion,
    collapsed: state.nav.collapsed,
    prjs: state.prj.list,
    iterations: state.version_iterator.list,
    clientType: state.device.clientType,
    teamId: state.device.teamId,
  }
}

export default connect(mapStateToProps)(Nav);