import { Component, ReactNode, Fragment } from 'react';
import { connect } from 'react-redux';
import { Route, Switch, withRouter } from 'react-router-dom';
import { MessageOutlined } from '@ant-design/icons';
import { 
    FloatButton,
    Layout,
    Drawer, 
} from "antd";

import { setLang2, langTrans } from '@lang/i18n';
import {
    USERCOUNTRY,
    USERLANG,
} from '@conf/storage';
import { SET_DEVICE_INFO, SET_AI_COLLAPSED } from '@conf/redux';
import { 
    BASIC_SETTING_ROUTE,
    TEAM_MEMBER_ROUTE,
    ENV_LIST_ROUTE, 
    PROJECT_LIST_ROUTE,
    ENVVAR_PRJ_LIST_ROUTE,
    ENVVAR_PRJ_SETTING_ROUTE,
    ENVVAR_GLOBAL_LIST_ROUTE,
    ENVVAR_ITERATOR_LIST_ROUTE,
    ENVVAR_UNITTEST_LIST_ROUTE,
    VERSION_ITERATOR_LIST_ROUTE,
    VERSION_ITERATOR_ADD_ROUTE,
    VERSION_ITERATOR_DETAIL_ROUTE,
    INTERNET_REQUEST,
    INTERNET_REQUEST_BY_HISTORY_ROUTE,
    INTERNET_REQUEST_BY_ITERATOR_ROUTE,
    INTERNET_REQUEST_BY_ITERATOR_API_ROUTE,
    INTERNET_REQUEST_BY_PRJ_API_ROUTE,
    HISTORY_REQUEST_TO_ITERATOR_ROUTE,
    REQUEST_TO_ITERATOR_ROUTE,
    REQUEST_ITERATOR_DETAIL_ROUTE,
    REQUEST_PROJECT_DETAIL_ROUTE,
    REQUEST_ITERATOR_LIST_ROUTE,
    REQUEST_HISTORY,
    REQUEST_PROJECT_LIST_ROUTE,
    UNITTEST_CLEAN_DATA_ADD_ROUTE,
    UNITTEST_CLEAN_DATA_EDIT_ROUTE,
    UNITTEST_ITERATOR_LIST_ROUTE,
    UNITTEST_TEMPLATE_LIST_ROUTE,
    UNITTEST_PROJECT_LIST_ROUTE,
    UNITTEST_ITERATOR_EXECUTOR_LIST_ROUTE,
    UNITTEST_STEP_ADD_ROUTE,
    UNITTEST_STEP_EDIT_ROUTE,
    UNITTEST_TEMPLATE_STEP_EDIT_ROUTE,
    REQUEST_PROJECT_PARAMS,
    VIP_ITERATOR_LIST_ROUTE,
    ITERATOR_ADD_REQUEST_ROUTE,
    WELCOME_ROUTE 
} from '@conf/routers';
import { getStartParams, isStringEmpty, urlDecode } from '@rutil/index';

let argsObject = getStartParams();
let userCountry = argsObject.userCountry;
let preferLang = argsObject.preferLang;
let uuid = argsObject.uuid;
let clientType = argsObject.clientType;

if (isStringEmpty(userCountry)) {
    userCountry = sessionStorage.getItem(USERCOUNTRY);
    preferLang = sessionStorage.getItem(USERLANG);
}

setLang2(preferLang);

import Nav from '@comp/nav';
import ChatBox from '@comp/chat_box/index'
import HomePage from "@contain/home";
import BasicSettingPage from "@contain/basic_setting";
import TeamMemberPage from "@contain/team_member";
import EnvListPage from "@contain/env";
import ProjectListPage from "@contain/prj";
import PrjectSettingPage from "@contain/prj/setting";
import EnvVarPrjectPage from "@contain/env_var/project";
import EnvVarGlobalPage from "@contain/env_var/global";
import EnvVarIteratorPage from "@contain/env_var/iterator";
import EnvVarUnittestPage from "@contain/env_var/unittest";
import VersionIteratorPage from "@contain/version_iterator";
import VersionIteratorAddPage from "@contain/version_iterator/add"
import NetSendPage from '@contain/request_send';
import RequestHistoryPage from '@contain/request_history';
import RequestToSaveContainerPage from '@contain/request_save/to_save';
import RequestSaveDetailContainerPage from '@contain/request_save/save_detail';
import VersionIteratorRequestListPage from "@contain/request_list/version";
import UnittestCleanDataPage from "@contain/unittest/clean";
import ProjectRequestListPage from "@contain/request_list/project";
import ParamsProjectPage from "@contain/request_send/params";
import UnittestListVersionPage from "@contain/unittest/version_iterator";
import UnittestListTemplatePage from "@contain/unittest/template";
import UnittestListProjectPage from "@contain/unittest/project";
import UnittestExecutorListPage from "@contain/unittest_executor_list";
import UnittestStepPage from "@contain/unittest/step";
import VipFunctionPage from "@contain/vip";

class MyRouter extends Component {

    constructor(props) {
        super(props);

        this.props.dispatch({
            type : SET_DEVICE_INFO,
            uuid : uuid,
            vipFlg : argsObject.vipFlg === "true" ? true : false, 
            showCkCode : argsObject.showCkCode === "true" ? true : false, 
            ckCodeType : argsObject.ckCodeType,
            payMethod : argsObject.payMethod,
            expireTime : parseInt(argsObject.expireTime),
            buyTimes : parseInt(argsObject.buyTimes),
            clientType,
            clientHost: argsObject.clientHost,
            teamName: isStringEmpty(argsObject.teamId) ? "" : urlDecode(argsObject.teamName), 
            teamId: argsObject.teamId,
            appName : argsObject.appName,
            appVersion : argsObject.appVersion,
            defaultRunnerUrl : argsObject.defaultRunnerUrl,
            minServerVersion : argsObject.minServerVersion,
            isAiSupport : argsObject.isAiSupport == 1 ? true : false,
            isUnitTest : argsObject.isUnitTest == 1 ? true : false,
            userCountry,
            preferLang,
        });


        this.state = {
            drawSize: 736
        };
    }

    closeAiBoxOpenFlg = () => {
        this.props.dispatch({
            type: SET_AI_COLLAPSED,
            collapsed: false,
            aiBoxOpenFlg: false
        });
    }

    openAiBoxOpenFlg = () => {
        this.props.dispatch({
            type: SET_AI_COLLAPSED,
            collapsed: true,
            aiBoxOpenFlg: true
        });
    }

    render(): ReactNode {

        // 从 props 中获取当前路由路径（通过 withRouter 注入）
        const { pathname } = this.props.location;
        // 判断是否是需要排除的路由
        const isExcludePath = pathname === WELCOME_ROUTE;

        return (
            <Fragment>
                <Layout style={{ minHeight: '100vh' }}>
                {'electron' in window ? <>
                    <Nav />
                {this.props.isAiSupport && !isExcludePath && (
                    <Drawer
                        title={ `${langTrans("chatbox title")}${
                            (isStringEmpty(this.props.prj) || this.props.projects.length == 0) ? "" : 
                            `【${this.props.projects.find(_prj => _prj.value === this.props.prj).label}】`}` }
                        closable={{ 'aria-label': 'Close Button' }}
                        open={this.props.aiBoxOpenFlg}
                        onClose={this.closeAiBoxOpenFlg}
                        size={"large"}
                    >
                        <ChatBox 
                            from="drawer"
                            meWidth={parseInt(this.state.drawSize/376*280)}
                            robotWidth={parseInt(this.state.drawSize/376*300) + 70}
                        />
                    </Drawer>)
                }
                </> : null}
                    <Layout>
                        <Switch>
                            <Route path={ BASIC_SETTING_ROUTE } component={BasicSettingPage} />
                            <Route path={ TEAM_MEMBER_ROUTE } component={TeamMemberPage} />
                            <Route path={ ENV_LIST_ROUTE } component={EnvListPage} />
                            <Route path={ PROJECT_LIST_ROUTE } component={ProjectListPage} />
                            <Route path={ ENVVAR_PRJ_SETTING_ROUTE } component={PrjectSettingPage} />
                            <Route path={ ENVVAR_PRJ_LIST_ROUTE } component={EnvVarPrjectPage} />
                            <Route path={ VERSION_ITERATOR_LIST_ROUTE } component={VersionIteratorPage} />
                            <Route path={ VERSION_ITERATOR_ADD_ROUTE } component={VersionIteratorAddPage}/>
                            <Route path={ VERSION_ITERATOR_DETAIL_ROUTE } component={VersionIteratorAddPage}/>
                            <Route path={ INTERNET_REQUEST } component={NetSendPage} />
                            <Route path={ INTERNET_REQUEST_BY_HISTORY_ROUTE } component={NetSendPage} />
                            <Route path={ INTERNET_REQUEST_BY_ITERATOR_ROUTE } component={NetSendPage} />
                            <Route path={ INTERNET_REQUEST_BY_ITERATOR_API_ROUTE } component={NetSendPage} />
                            <Route path={ INTERNET_REQUEST_BY_PRJ_API_ROUTE } component={NetSendPage} />
                            <Route path={ REQUEST_HISTORY } component={RequestHistoryPage} />
                            <Route path={ REQUEST_TO_ITERATOR_ROUTE } component={RequestToSaveContainerPage} />
                            <Route path={ UNITTEST_CLEAN_DATA_ADD_ROUTE } component={UnittestCleanDataPage} />
                            <Route path={ UNITTEST_CLEAN_DATA_EDIT_ROUTE } component={UnittestCleanDataPage} />
                            <Route path={ REQUEST_ITERATOR_DETAIL_ROUTE } component={RequestSaveDetailContainerPage} />
                            <Route path={ REQUEST_PROJECT_DETAIL_ROUTE } component={RequestSaveDetailContainerPage} />
                            <Route path={ REQUEST_ITERATOR_LIST_ROUTE } component={VersionIteratorRequestListPage} />
                            <Route path={ REQUEST_PROJECT_LIST_ROUTE } component={ProjectRequestListPage} />
                            <Route path={ REQUEST_PROJECT_PARAMS } component={ParamsProjectPage} />
                            <Route path={ UNITTEST_ITERATOR_LIST_ROUTE } component={UnittestListVersionPage} />
                            <Route path={ UNITTEST_TEMPLATE_LIST_ROUTE } component={UnittestListTemplatePage} />
                            <Route path={ UNITTEST_PROJECT_LIST_ROUTE } component={UnittestListProjectPage} />
                            <Route path={ HISTORY_REQUEST_TO_ITERATOR_ROUTE } component={RequestToSaveContainerPage} />
                            <Route path={ UNITTEST_ITERATOR_EXECUTOR_LIST_ROUTE } component={UnittestExecutorListPage} />
                            <Route path={ UNITTEST_STEP_ADD_ROUTE } component={UnittestStepPage} />
                            <Route path={ UNITTEST_STEP_EDIT_ROUTE } component={UnittestStepPage} />
                            <Route path={ UNITTEST_TEMPLATE_STEP_EDIT_ROUTE } component={UnittestStepPage} />
                            <Route path={ VIP_ITERATOR_LIST_ROUTE } component={VipFunctionPage} />
                            <Route path={ ITERATOR_ADD_REQUEST_ROUTE } component={RequestToSaveContainerPage} />
                            <Route path={ ENVVAR_GLOBAL_LIST_ROUTE } component={EnvVarGlobalPage} />
                            <Route path={ ENVVAR_ITERATOR_LIST_ROUTE } component={EnvVarIteratorPage} />
                            <Route path={ ENVVAR_UNITTEST_LIST_ROUTE } component={EnvVarUnittestPage} />
                            <Route path={ WELCOME_ROUTE } component={HomePage} />
                        </Switch>
                        {this.props.isAiSupport && !isExcludePath && (<FloatButton 
                            shape="circle"
                            type="primary"
                            style={{ insetInlineEnd: 120 }}
                            icon={<MessageOutlined />}
                            onClick={this.openAiBoxOpenFlg}
                        />)}
                    </Layout>
                </Layout>
            </Fragment>
        );
    }
}

function mapStateToProps (state) {
    return {
        prj: state.env_var.prj,
        projects: state.prj.list,
        aiBoxOpenFlg: state.nav.aiBoxOpenFlg,
        isAiSupport: state.device.isAiSupport
    }
}
  
export default connect(mapStateToProps)(withRouter(MyRouter));