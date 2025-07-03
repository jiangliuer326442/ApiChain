import { Component, ReactNode, Fragment } from 'react';
import { connect } from 'react-redux';
import { Route, Switch } from 'react-router-dom';
import { Layout } from "antd";
import Dexie from 'dexie';

import { setLang } from '@lang/i18n';
import { DB_NAME } from '@conf/db';
import {
    USERCOUNTRY,
    USERLANG,
} from '@conf/storage';
import { SET_DEVICE_INFO } from '@conf/redux';
import { getStartParams, isStringEmpty, urlDecode } from '@rutil/index';
import { getOpenVersionIterators } from "@act/version_iterator";
import { getPrjs } from "@act/project";
import registerMessageHook from "@act/message";

let argsObject = getStartParams();
let userCountry = argsObject.userCountry;
let userLang = argsObject.userLang;
let uuid = argsObject.uuid;
let clientType = argsObject.clientType;

if (isStringEmpty(userCountry) || isStringEmpty(userLang)) {
    userCountry = sessionStorage.getItem(USERCOUNTRY);
    userLang = sessionStorage.getItem(USERLANG);
}

setLang(userCountry, userLang);


import { 
    ENV_LIST_ROUTE, 
    PROJECT_LIST_ROUTE,
    ENVVAR_PRJ_LIST_ROUTE,
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
    UNITTEST_ITERATOR_LIST_ROUTE,
    UNITTEST_PROJECT_LIST_ROUTE,
    UNITTEST_ITERATOR_EXECUTOR_LIST_ROUTE,
    UNITTEST_STEP_ADD_ROUTE,
    UNITTEST_STEP_EDIT_ROUTE,
    VIP_ITERATOR_LIST_ROUTE,
    ITERATOR_ADD_REQUEST_ROUTE,
    WELCOME_ROUTE 
} from '@conf/routers';
import Nav from '@comp/nav';
import HomePage from "@contain/home";
import EnvListPage from "@contain/env";
import ProjectListPage from "@contain/prj";
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
import ProjectRequestListPage from "@contain/request_list/project";
import UnittestListVersionPage from "@contain/unittest/version_iterator";
import UnittestListProjectPage from "@contain/unittest/project";
import UnittestExecutorListPage from "@contain/unittest_executor_list";
import UnittestStepPage from "@contain/unittest_step";
import VipFunctionPage from "@contain/vip";

class MyRouter extends Component {

    constructor(props) {
        super(props);

        this.props.dispatch({
            type : SET_DEVICE_INFO,
            uuid : uuid,
            vipFlg : argsObject.vipFlg === "true" ? true : false, 
            showCkCode : argsObject.showCkCode === "true" ? true : false, 
            ckCodeUrl : argsObject.ckCodeUrl,
            expireTime : parseInt(argsObject.expireTime),
            buyTimes : parseInt(argsObject.buyTimes),
            clientType,
            clientHost: argsObject.clientHost,
            teamName: urlDecode(argsObject.teamName), 
            teamId: argsObject.teamId,
            html : argsObject.html,
            appName : argsObject.appName,
            appVersion : argsObject.appVersion,
            defaultRunnerUrl : argsObject.defaultRunnerUrl,
            minServerVersion : argsObject.minServerVersion,
            userCountry,
            userLang,
        });

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
        require('../reducers/db/20250614001');
        require('../reducers/db/20250614002');

        this.state = {
            initNavFlg: false,
        };
    }

    async componentDidMount() {
        await window.db.open();
        if (!this.state.initNavFlg) {
            this.cb();
        }
        registerMessageHook();
    }

    cb = () => {
        getPrjs(clientType, this.props.dispatch);
        getOpenVersionIterators(clientType, this.props.dispatch);
        this.state.initNavFlg = true;
    }

    render(): ReactNode {
        return (
            <Fragment>
                <Layout style={{ minHeight: '100vh' }}>
                    {'electron' in window ? <Nav /> : null}
                    <Layout>
                        <Switch>
                            <Route path={ ENV_LIST_ROUTE } component={EnvListPage} />
                            <Route path={ PROJECT_LIST_ROUTE } component={ProjectListPage} />
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
                            <Route path={ REQUEST_ITERATOR_DETAIL_ROUTE } component={RequestSaveDetailContainerPage} />
                            <Route path={ REQUEST_PROJECT_DETAIL_ROUTE } component={RequestSaveDetailContainerPage} />
                            <Route path={ REQUEST_ITERATOR_LIST_ROUTE } component={VersionIteratorRequestListPage} />
                            <Route path={ REQUEST_PROJECT_LIST_ROUTE } component={ProjectRequestListPage} />
                            <Route path={ UNITTEST_ITERATOR_LIST_ROUTE } component={UnittestListVersionPage} />
                            <Route path={ UNITTEST_PROJECT_LIST_ROUTE } component={UnittestListProjectPage} />
                            <Route path={ HISTORY_REQUEST_TO_ITERATOR_ROUTE } component={RequestToSaveContainerPage} />
                            <Route path={ UNITTEST_ITERATOR_EXECUTOR_LIST_ROUTE } component={UnittestExecutorListPage} />
                            <Route path={ UNITTEST_STEP_ADD_ROUTE } component={UnittestStepPage} />
                            <Route path={ UNITTEST_STEP_EDIT_ROUTE } component={UnittestStepPage} />
                            <Route path={ VIP_ITERATOR_LIST_ROUTE } component={VipFunctionPage} />
                            <Route path={ ITERATOR_ADD_REQUEST_ROUTE } component={RequestToSaveContainerPage} />
                            <Route path={ ENVVAR_GLOBAL_LIST_ROUTE } component={EnvVarGlobalPage} />
                            <Route path={ ENVVAR_ITERATOR_LIST_ROUTE } component={EnvVarIteratorPage} />
                            <Route path={ ENVVAR_UNITTEST_LIST_ROUTE } component={EnvVarUnittestPage} />
                            <Route path={ WELCOME_ROUTE } component={HomePage} />
                        </Switch>
                    </Layout>
                </Layout>
            </Fragment>
        );
    }
}

function mapStateToProps (state) {
    return {
    }
}
  
export default connect(mapStateToProps)(MyRouter);