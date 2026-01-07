import { Component, ReactNode } from 'react';
import { connect } from 'react-redux';
import { 
    Breadcrumb, 
    Layout, 
    Flex, 
    ConfigProvider, 
    FloatButton, 
    Descriptions, 
    Form, 
    Select, 
    Divider, 
    Input, 
    Button 
} from "antd";
import { 
    ExportOutlined, 
    Html5Outlined,
    FileMarkdownOutlined,
} from '@ant-design/icons';
import { TinyColor } from '@ctrl/tinycolor';

import RequestListCollapse from '@comp/requests_list_collapse';
import MarkdownView from '@comp/markdown/show';
import { 
    TABLE_MICRO_SERVICE_FIELDS,
    TABLE_VERSION_ITERATION_FIELDS,
    UNAME,
} from '@conf/db';
import {
    GET_ITERATOR
} from '@conf/redux';
import { 
    ChannelsMarkdownStr, 
    ChannelsMarkdownSaveMarkdownStr, 
    ChannelsMarkdownSaveHtmlStr,
} from '@conf/channel';
import { 
    getdayjs,
    isStringEmpty, 
} from '@rutil/index';
import { getRemoteVersionIterator } from '@act/version_iterator';
import { getEnvs } from '@act/env';
import { getPrjs } from '@act/project';
import { getExportVersionIteratorRequests } from '@act/version_iterator_requests';
import { getEnvHosts } from '@act/env_value';
import { 
    allFolders,
    getIteratorFolders, 
} from '@act/version_iterator_folders';
import { langFormat, langTrans } from '@lang/i18n';

const { Header, Content, Footer } = Layout;

type FieldType = {
    prj?: string;
    folder?: string,
    title?: string;
    uri?: string;
};

// const colorsAddRequestApi = ['#fc6076', '#ff9a44', '#ef9d43', '#e75516'];
const colorsSendRequestApi = ['#6253e1', '#04befe'];
const getHoverColors = (colors: string[]) =>
    colors.map((color) => new TinyColor(color).lighten(5).toString());
const getActiveColors = (colors: string[]) =>
    colors.map((color) => new TinyColor(color).darken(5).toString());

let version_iterator_title = TABLE_VERSION_ITERATION_FIELDS.FIELD_NAME;
let version_iterator_prjs = TABLE_VERSION_ITERATION_FIELDS.FIELD_PROJECTS;
let version_iterator_content = TABLE_VERSION_ITERATION_FIELDS.FIELD_CONTENT;
let version_iterator_openflg = TABLE_VERSION_ITERATION_FIELDS.FIELD_OPENFLG;
let version_iterator_ctime = TABLE_VERSION_ITERATION_FIELDS.FIELD_CTIME;
let version_iterator_projects = TABLE_VERSION_ITERATION_FIELDS.FIELD_PROJECTS;

let prj_label = TABLE_MICRO_SERVICE_FIELDS.FIELD_LABEL;

class RequestListVersion extends Component {

    constructor(props) {
        super(props);
        let iteratorId = this.props.match.params.id;
        this.state = {
            iteratorId,
            versionIteration: {},
            formReadyFlg: false,
            folders: [],
            allFolders: [],
            prj: "",
            folder: null,
            filterTitle: "",
            filterUri: "",
            filterPrj: "",
            filterFold: null,
            requests: [],
            prjs: [],
            envs: [],
            envVars: {},
        }
    }

    async componentDidUpdate(prevProps, prevState) {
        let newIteratorId = this.props.match.params.id;
        let oldIteratorId = prevProps.match.params.id;
        if (newIteratorId !== oldIteratorId) {
            this.state.iteratorId = newIteratorId;
            let versionIteration = await getRemoteVersionIterator(this.props.clientType, this.state.iteratorId);
            this.state.versionIteration = versionIteration;
            this.loadMarkDownFromElectron(this.state.iteratorId);
            this.props.dispatch({
                type: GET_ITERATOR,
                iterator: newIteratorId,
                unittest: ""
            });
            this.onFinish({});
        }
    }

    async componentDidMount() {
        let versionIteration = await getRemoteVersionIterator(this.props.clientType, this.state.iteratorId);
        this.state.versionIteration = versionIteration;
        this.loadMarkDownFromElectron(this.state.iteratorId);
        this.setState( {  formReadyFlg : true } )
        this.props.dispatch({
            type: GET_ITERATOR,
            iterator: this.state.iteratorId,
            unittest: ""
        });
        this.onFinish({});
    }

    onFinish = async (values) => {
        let title = values?.title;
        let uri = values?.uri;
        let prj = values?.prj;
        let folder = values?.folder;
        let allFoldersRet = await allFolders(this.props.clientType, this.state.iteratorId);
        if (isStringEmpty(uri) && isStringEmpty(title) && isStringEmpty(prj) && isStringEmpty(folder)) {
            let folders = await getIteratorFolders(this.props.clientType, this.state.iteratorId, null, null, null, null);
            this.setState({
                allFolders: allFoldersRet,
                folders,
                filterTitle: "",
                filterUri: "",
                filterPrj: "",
                filterFold: null,
            })
            return;
        }
        if (title === undefined) {
            title = ""
        }
        if (uri === undefined) {
            uri = "";
        }
        if (prj === undefined) {
            prj = ""
        }
        if (folder === undefined) {
            folder = null;
        }
        let folders = await getIteratorFolders(this.props.clientType, this.state.iteratorId, title, uri, prj, folder);
        this.setState({
            folders,
            allFolders: allFoldersRet,
            filterTitle: title,
            filterUri: uri,
            filterPrj: prj,
            filterFold: folder,
        })
    }

    loadMarkDownFromElectron = async (iteratorId : string) => {
        let envs = await getEnvs(this.props.clientType, null);
        let prjs = await getPrjs(this.props.clientType, null);
        let versionIterationPrjs = this.state.versionIteration[version_iterator_projects];
        let requests = await getExportVersionIteratorRequests(this.props.clientType, iteratorId);
        prjs = prjs.filter(_prj => versionIterationPrjs.includes(_prj[prj_label]));
        let envVars : any = {};
        for (let _prj of prjs) {
            let projectLabel = _prj[prj_label];
            const envVarItems = await getEnvHosts(this.props.clientType, projectLabel, null);
            envVars[projectLabel] = Object.fromEntries(envVarItems);
        }

        this.setState({prjs, envs, envVars, requests});
    }

    render() : ReactNode {
        return (
            <Layout>
                <Header style={{ padding: 0 }}>
                    {langTrans("version doc title")}
                </Header>
                {this.state.formReadyFlg ?
                <Content style={{ padding: '0 16px', width: "calc(100% - 16px)" }}>
                    <Breadcrumb style={{ margin: '16px 0' }} items={[
                        { title: langTrans("version doc bread1") }, 
                        { title: langTrans("version doc bread2") }
                    ]} />
                    <Descriptions column={2} title={langTrans("version doc desc title")} items={ [
                        {
                            key: version_iterator_title,
                            label: langTrans("version doc desc1"),
                            children: this.state.versionIteration[version_iterator_title],
                        },
                        {
                            key: version_iterator_openflg,
                            label: langTrans("version doc desc2"),
                            children: this.state.versionIteration[version_iterator_openflg] === 1 ? langTrans("version doc status1") : langTrans("version doc status2"),
                        },
                        {
                            key: UNAME,
                            label: langTrans("version doc desc3"),
                            children: this.state.versionIteration[UNAME],
                        },
                        {
                            key: version_iterator_ctime,
                            label: langTrans("version doc desc4"),
                            children: getdayjs(this.state.versionIteration[version_iterator_ctime]).format("YYYY-MM-DD"),
                        },
                        ] } />
                    <Flex justify="flex-start" align="center" style={{marginTop: 20}} gap="middle">
                        <Form 
                            layout="inline"
                            onFinish={ this.onFinish } 
                            initialValues={ { prj: this.state.prj } }
                            autoComplete="off"
                        >
                            <Form.Item<FieldType> style={{paddingBottom: 20}} label={langTrans("prj doc operator1")} name="uri" rules={[{ required: false }]}>
                                <Input allowClear />
                            </Form.Item>

                            <Form.Item<FieldType> label={langTrans("prj doc operator2")} name="title" rules={[{ required: false }]}>
                                <Input allowClear />
                            </Form.Item>

                            <Form.Item<FieldType> label={langTrans("version doc operator1")} name="prj" rules={[{ required:  false }]}>
                                <Select
                                    allowClear
                                    style={{ width: 180 }}
                                    options={this.state.versionIteration[version_iterator_prjs].map(item => {
                                        return {value: item, label: this.props.prjs.find(row => row.value=== item) ? this.props.prjs.find(row => row.value === item).label : ""}
                                    })}
                                    onChange={ async value => {
                                        this.setState({ prj: value });
                                    } }
                                />
                            </Form.Item>                           

                            {this.state.prj ? 
                            <Form.Item<FieldType> label={langTrans("version doc operator2")} name="folder" rules={[{ required:  false }]}>
                                <Select
                                    allowClear
                                    style={{ width: 180 }}
                                    options={ this.state.folders[this.state.prj] }
                                />
                            </Form.Item>
                            : null}

                            <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
                                <Button htmlType="submit">
                                    {langTrans("prj doc btn")}
                                </Button>
                            </Form.Item>
                        </Form>
                        {this.state.versionIteration[version_iterator_openflg] === 1 ? 
                        <Flex vertical justify="flex-start" align="center" gap="middle">
                            <ConfigProvider
                                theme={{
                                    components: {
                                    Button: {
                                        colorPrimary: `linear-gradient(135deg,  ${colorsSendRequestApi.join(', ')})`,
                                        colorPrimaryHover: `linear-gradient(135deg, ${getHoverColors(colorsSendRequestApi).join(', ')})`,
                                        colorPrimaryActive: `linear-gradient(135deg, ${getActiveColors(colorsSendRequestApi).join(', ')})`,
                                        lineWidth: 0,
                                    },
                                    },
                                }}
                                >
                                <Button type="primary" href={'#/internet_request_send_by_iterator/' + this.state.iteratorId} size="large">
                                    {langTrans("version doc btn1")}
                                </Button>
                            </ConfigProvider>

                        </Flex>
                        : null}
                    </Flex>
                    {this.state.versionIteration[version_iterator_prjs]
                    .filter(prj => isStringEmpty(this.state.filterPrj) || this.state.filterPrj === prj)
                    .map(prj => (
                        (this.props.prjs.length > 0 && this.props.prjs.find(row => row.value === prj) ? 
                            <div key={prj}>
                                <Divider orientation="left">
                                    <p>{langFormat("version doc project", {
                                        name: (this.props.prjs.length > 0 ? this.props.prjs.find(row => row.value === prj).label : "")
                                    })}</p >
                                </Divider>
                            {this.state.folders !== undefined && Object.keys(this.state.folders).length > 0 && prj in this.state.folders ?
                                <RequestListCollapse 
                                    metadata={this.state.iteratorId+"$$"+prj}
                                    folders={this.state.folders[prj]} 
                                    allFolders={this.state.allFolders} 
                                    filterTitle={this.state.filterTitle}
                                    filterUri={this.state.filterUri}
                                    filterPrj={this.state.filterPrj}
                                    filterFold={this.state.filterFold}
                                    refreshCallback={() => this.onFinish({
                                        title: this.state.filterTitle,
                                        uri: this.state.filterUri
                                    })}
                                />
                            : null}
                            </div>
                        : null)
                    ))}
                    <Flex>
                        <Divider>{langTrans("version doc md title")}</Divider>
                    </Flex>
                    <MarkdownView 
                        content={ this.state.versionIteration[version_iterator_content] } 
                        />
                    <FloatButton.Group
                        trigger="click"
                        description={langTrans("doc btn2")}
                        shape="square"
                        type="primary"
                        style={{ right: 96 }}
                        icon={<ExportOutlined />}
                        >
                        <FloatButton 
                            icon={<Html5Outlined/>} 
                            description="html"
                            shape="square"
                            onClick={() => window.electron.ipcRenderer.sendMessage(
                                ChannelsMarkdownStr, ChannelsMarkdownSaveHtmlStr, 
                                this.state.versionIteration, this.state.requests, this.state.prjs, this.state.envs, this.state.envVars)} 
                        />
                        <FloatButton 
                            icon={<FileMarkdownOutlined />} 
                            description="md"
                            shape="square"
                            onClick={ () => window.electron.ipcRenderer.sendMessage(ChannelsMarkdownStr, ChannelsMarkdownSaveMarkdownStr, 
                                this.state.versionIteration, this.state.requests, this.state.prjs, this.state.envs, this.state.envVars) } 
                        />
                    </FloatButton.Group>
                </Content>
                : null}
                <Footer style={{ textAlign: 'center' }}>
                ApiChain ©{new Date().getFullYear()} Created by Mustafa Fang
                </Footer>
            </Layout>
        );
    }
}
    
function mapStateToProps (state) {
    return {
        prjs: state.prj.list,
        teamId: state.device.teamId,
        clientType: state.device.clientType,
    }
}
      
export default connect(mapStateToProps)(RequestListVersion);