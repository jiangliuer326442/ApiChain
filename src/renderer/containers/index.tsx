import { Component, ReactNode, Fragment } from 'react';
import { Provider } from 'react-redux';
import { HashRouter, Route, Switch } from 'react-router-dom';
import { Layout } from "antd";

import configureStore from '../stores/configureStore';
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
    VERSION_ITERATOR_DOC_ROUTE,
    REQUEST_PROJECT_LIST_ROUTE,
    UNITTEST_ITERATOR_LIST_ROUTE,
    UNITTEST_ITERATOR_EXECUTOR_LIST_ROUTE,
    UNITTEST_STEP_ADD_ROUTE,
    UNITTEST_STEP_EDIT_ROUTE,
    VIP_ITERATOR_LIST_ROUTE,
    ITERATOR_ADD_REQUEST_ROUTE,
    WELCOME_ROUTE 
} from '../../config/routers';
import Nav from '../components/nav';
import HomePage from "./home";
import EnvListPage from "./env";
import ProjectListPage from "./prj";
import EnvVarPrjectPage from "./env_var/project";
import EnvVarGlobalPage from "./env_var/global";
import EnvVarIteratorPage from "./env_var/iterator";
import VersionIteratorPage from "./version_iterator";
import VersionIteratorAddPage from "./version_iterator/add"
import NetSendPage from './request_send';
import RequestHistoryPage from './request_history';
import RequestToSaveContainerPage from './request_save/to_save';
import RequestSaveDetailContainerPage from './request_save/save_detail';
import VersionIteratorRequestListPage from "./request_list_version";
import ProjectRequestListPage from "./request_list_project";
import VersionIteratorDocPage from "./iterator_doc";
import UnittestListVersionPage from "./unittest_list_version";
import UnittestExecutorListPage from "./unittest_executor_list";
import UnittestStepPage from "./unittest_step";
import VipFunctionPage from "./vip";

const store = configureStore({});

class MyRouter extends Component {

    render(): ReactNode {
        return (
            <Provider store={store}>
                <HashRouter>
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
                                    <Route path={ VERSION_ITERATOR_DOC_ROUTE } component={VersionIteratorDocPage} />
                                    <Route path={ REQUEST_PROJECT_LIST_ROUTE } component={ProjectRequestListPage} />
                                    <Route path={ UNITTEST_ITERATOR_LIST_ROUTE } component={UnittestListVersionPage} />
                                    <Route path={ HISTORY_REQUEST_TO_ITERATOR_ROUTE } component={RequestToSaveContainerPage} />
                                    <Route path={ UNITTEST_ITERATOR_EXECUTOR_LIST_ROUTE } component={UnittestExecutorListPage} />
                                    <Route path={ UNITTEST_STEP_ADD_ROUTE } component={UnittestStepPage} />
                                    <Route path={ UNITTEST_STEP_EDIT_ROUTE } component={UnittestStepPage} />
                                    <Route path= { VIP_ITERATOR_LIST_ROUTE } component={VipFunctionPage} />
                                    <Route path={ ITERATOR_ADD_REQUEST_ROUTE } component={RequestToSaveContainerPage} />
                                    <Route path={ ENVVAR_GLOBAL_LIST_ROUTE } component={EnvVarGlobalPage} />
                                    <Route path={ ENVVAR_ITERATOR_LIST_ROUTE } component={EnvVarIteratorPage} />
                                    <Route path={ WELCOME_ROUTE } component={HomePage} />
                                </Switch>
                            </Layout>
                        </Layout>
                    </Fragment>
                </HashRouter>
            </Provider>
        );
    }
}
  
export default MyRouter;