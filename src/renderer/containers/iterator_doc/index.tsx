import { Component, ReactNode } from 'react';
import { connect } from 'react-redux';
import axios from 'axios';
import { Breadcrumb, Layout, FloatButton, Result } from "antd";
import { FileMarkdownOutlined, Html5Outlined, ExportOutlined } from '@ant-design/icons';

import {
    CONTENT_TYPE_URLENCODE
} from '../../../config/contentType';
import {
    TABLE_VERSION_ITERATION_FIELDS,
    TABLE_MICRO_SERVICE_FIELDS,
} from '../../../config/db';
import { SET_NAV_COLLAPSED } from '../../../config/redux';
import { ENV_VALUE_API_HOST } from '../../../config/envKeys';
import { 
    ChannelsMarkdownStr, 
    ChannelsMarkdownShowStr, 
    ChannelsMarkdownSaveMarkdownStr, 
    ChannelsMarkdownSaveHtmlStr,
} from '../../../config/channel';
import MarkdownView from '../../components/markdown/show';
import { getEnvs } from '../../actions/env';
import { getVarsByKey } from '../../actions/env_value';
import { getVersionIterator } from '../../actions/version_iterator';
import { getVersionIteratorRequestsByProject } from '../../actions/version_iterator_requests';

let prj_label = TABLE_MICRO_SERVICE_FIELDS.FIELD_LABEL;

let version_iterator_projects = TABLE_VERSION_ITERATION_FIELDS.FIELD_PROJECTS;

const { Header, Content, Footer } = Layout;

class IteratorDoc extends Component {

    constructor(props) {
        super(props);
        let iteratorId = this.props.match.params.uuid;
        sessionStorage.setItem("iterator_doc_iteratorId", iteratorId);
        this.state = {
            iteratorId,
            md: "",
            versionIteration: "",
            requests: [],
            prjs: [],
            envs: [],
            envVars: {},
            errorCode: 1000,
            errorMessage: "",
        };
    }

    async componentDidMount() {
        if('electron' in window) {
            this.loadMarkDownFromElectron(this.state.iteratorId);
        } else {
            try {
                axios.post("/sprint/docs", { 
                    iteratorId: this.state.iteratorId 
                }, {
                    headers: {
                        "Content-Type": CONTENT_TYPE_URLENCODE,
                    }
                }).then(response => {
                    if (response.data.code === 1000) {
                        this.setState({
                            md: response.data.data.markdown
                        });
                        document.title = response.data.data.title;
                    } else {
                        this.setState({
                            errorCode: response.data.code,
                            errorMessage: response.data.message,
                        });
                    }
                });
            } catch (error) {
                console.error(error);
            }
        }
    }

    loadMarkDownFromElectron = async (iteratorId : string) => {
        let envs;
        if (this.props.envs.length === 0) {
            envs = await getEnvs(null);
        } else {
            envs = this.props.envs;
        }
        let versionIteration = await getVersionIterator(iteratorId);
        let versionIterationPrjs = versionIteration[version_iterator_projects];
        let requests = await getVersionIteratorRequestsByProject(iteratorId, "", null, "", "");
        let prjs = this.props.prjs.filter(_prj => versionIterationPrjs.includes(_prj[prj_label]));
        let envVars : any = {};
        for (let _prj of prjs) {
            let projectLabel = _prj[prj_label];
            const envVarItems = await getVarsByKey(projectLabel, ENV_VALUE_API_HOST);
            envVars[projectLabel] = envVarItems;
        }

        this.setState({prjs, envs, envVars, versionIteration, requests});

        if (requests.length == 0 || Object.keys(versionIteration).length == 0) {
            return;
        }

        let response = await this.handleMarkdownMessage(versionIteration, requests, prjs, envs, envVars);
        
        this.props.dispatch({
            type: SET_NAV_COLLAPSED,
            collapsed: true,
        });
        this.setState( { md : response.markdownContent } );
    }

    handleMarkdownMessage = (versionIteration, requests, prjs, envs, envVars) => {
        return new Promise((resolve, reject) => {
            let listener = window.electron.ipcRenderer.on(ChannelsMarkdownStr, (action, iteratorId, markdownTitle, markdownContent) => {
                if (action === ChannelsMarkdownShowStr) {
                    if(iteratorId === this.state.iteratorId) {
                        listener();
                        resolve( {markdownContent} );
                    }
                }
            });
            window.electron.ipcRenderer.sendMessage(ChannelsMarkdownStr, ChannelsMarkdownShowStr, versionIteration, requests, prjs, envs, envVars);
        });
    }

    render() : ReactNode {
        return (
            <Layout>
                <Header style={{ padding: 0 }}>
                    迭代文档
                </Header>
                <Content style={{ padding: '0 16px' }}>
                    <Breadcrumb style={{ margin: '16px 0' }} items={[
                        { title: '迭代' }, 
                        { title: '文档' }
                    ]} />
                    {this.state.errorCode === 1000 ? 
                    <MarkdownView showNav={ true } content={ this.state.md } show={ true } />
                    : null}
                    {(this.state.errorCode === 403 || this.state.errorCode === 404) ?
                    <Result
                        status={ this.state.errorCode }
                        title={ this.state.errorCode }
                        subTitle={this.state.errorMessage}
                    />
                    : null} 
                    {'electron' in window ? 
                    <FloatButton.Group
                        trigger="click"
                        description="导出文档"
                        shape="square"
                        type="primary"
                        style={{ right: 96 }}
                        icon={<ExportOutlined />}
                        >
                        <FloatButton 
                            icon={<Html5Outlined/>} 
                            description="html"
                            shape="square"
                            onClick={() => window.electron.ipcRenderer.sendMessage(ChannelsMarkdownStr, ChannelsMarkdownSaveHtmlStr, this.state.versionIteration, this.state.requests, this.state.prjs, this.state.envs, this.state.envVars)} 
                        />
                        <FloatButton 
                            icon={<FileMarkdownOutlined />} 
                            description="md"
                            shape="square"
                            onClick={ () => window.electron.ipcRenderer.sendMessage(ChannelsMarkdownStr, ChannelsMarkdownSaveMarkdownStr, this.state.versionIteration, this.state.requests, this.state.prjs, this.state.envs, this.state.envVars) } 
                        />
                    </FloatButton.Group>
                    :null}
                </Content>
                <Footer style={{ textAlign: 'center' }}>
                ApiChain ©{new Date().getFullYear()} Created by 方海亮
                </Footer>
            </Layout>
        )
    }

}

function mapStateToProps (state) {
    return {
        prjs: state.prj.list,
        envs: state.env.list,
    }
}
      
export default connect(mapStateToProps)(IteratorDoc);