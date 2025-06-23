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
    FileTextOutlined, 
} from '@ant-design/icons';
import { TinyColor } from '@ctrl/tinycolor';

import RequestListCollapse from '@comp/requests_list_collapse';
import MarkdownView from '@comp/markdown/show';
import { 
    TABLE_VERSION_ITERATION_FIELDS,
    UNAME,
} from '@conf/db';
import {
    GET_ITERATOR
} from '@conf/redux';
import { 
    getdayjs,
    isStringEmpty, 
} from '@rutil/index';
import { getRemoteVersionIterator } from '@act/version_iterator';
import { 
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

const colorsAddRequestApi = ['#fc6076', '#ff9a44', '#ef9d43', '#e75516'];
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

class RequestListVersion extends Component {

    constructor(props) {
        super(props);
        let iteratorId = this.props.match.params.id;
        this.state = {
            iteratorId,
            versionIteration: {},
            formReadyFlg: false,
            folders: [],
            prj: "",
            folder: null,
            filterTitle: "",
            filterUri: "",
        }
    }

    async componentWillReceiveProps(nextProps) {
        let iteratorId = nextProps.match.params.id;
        if (this.state.iteratorId !== iteratorId) {
            this.state.iteratorId = iteratorId;
            let versionIteration = await getRemoteVersionIterator(this.props.clientType, this.state.iteratorId);
            this.setState( { 
                versionIteration,
            } );
            this.props.dispatch({
                type: GET_ITERATOR,
                iterator: iteratorId,
                unittest: ""
            });
            this.onFinish({});
        }
    }

    async componentDidMount() {
        let versionIteration = await getRemoteVersionIterator(this.props.clientType, this.state.iteratorId);
        this.setState( { versionIteration, formReadyFlg : true } )
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
        if (isStringEmpty(uri) && isStringEmpty(title)) {
            let folders = await getIteratorFolders(this.props.clientType, this.state.iteratorId, null, null);
            this.setState({
                folders,
                filterTitle: "",
                filterUri: ""
            })
            return;
        }
        if (title === undefined) {
            title = ""
        }
        if (uri === undefined) {
            uri = "";
        }

        let folders = await getIteratorFolders(this.props.clientType, this.state.iteratorId, title, uri);
        this.setState({
            folders,
            filterTitle: title,
            filterUri: uri
        })
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
                    <Flex justify="flex-start" align="center" gap="middle">
                        <Form 
                            layout="inline"
                            onFinish={ this.onFinish } 
                            initialValues={ { prj: this.state.prj } }
                            autoComplete="off"
                        >
                            <Form.Item<FieldType> style={{paddingBottom: 20}} label={langTrans("prj doc operator1")} name="uri" rules={[{ required: false }]}>
                                <Input />
                            </Form.Item>

                            <Form.Item<FieldType> label={langTrans("prj doc operator2")} name="title" rules={[{ required: false }]}>
                                <Input />
                            </Form.Item>

                            <Form.Item<FieldType> label={langTrans("version doc operator1")} name="prj" rules={[{ required:  false }]}>
                                <Select
                                    style={{ width: 180 }}
                                    options={this.state.versionIteration[version_iterator_prjs].map(item => {
                                        return {value: item, label: this.props.prjs.find(row => row.value=== item) ? this.props.prjs.find(row => row.value === item).label : ""}
                                    })}
                                    onChange={ async value => {
                                        this.setState({ prj: value });
                                    } }
                                />
                            </Form.Item>                           

                            <Form.Item<FieldType> label={langTrans("version doc operator2")} name="folder" rules={[{ required:  false }]}>
                                <Select
                                    style={{ width: 180 }}
                                    options={ this.state.folders[this.state.prj] }
                                />
                            </Form.Item>

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
                                        colorPrimary: `linear-gradient(90deg,  ${colorsAddRequestApi.join(', ')})`,
                                        colorPrimaryHover: `linear-gradient(90deg, ${getHoverColors(colorsAddRequestApi).join(', ')})`,
                                        colorPrimaryActive: `linear-gradient(90deg, ${getActiveColors(colorsAddRequestApi).join(', ')})`,
                                        lineWidth: 0,
                                    },
                                    },
                                }}
                                >
                                <Button type="primary" href={'#/interator_add_request/' + this.state.iteratorId} size="large">
                                    {langTrans("version doc btn2")}
                                </Button>
                            </ConfigProvider>

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
                    {this.state.versionIteration[version_iterator_prjs].map(prj => (
                        (this.props.prjs.length > 0 && this.props.prjs.find(row => row.value === prj) ? 
                            <div key={prj}>
                                <Divider orientation="left">
                                    <p>{langFormat("version doc project", {
                                        name: (this.props.prjs.length > 0 ? this.props.prjs.find(row => row.value === prj).label : "")
                                    })}</p >
                                </Divider>
                                <RequestListCollapse 
                                    metadata={this.state.iteratorId+"$$"+prj}
                                    folders={this.state.folders[prj]} 
                                    filterTitle={this.state.filterTitle}
                                    filterUri={this.state.filterUri}
                                    refreshCallback={() => this.onFinish({
                                        title: this.state.filterTitle,
                                        uri: this.state.filterUri
                                    })}
                                />
                            </div>
                        : null)
                    ))}
                    <Flex>
                        <Divider>{langTrans("version doc md title")}</Divider>
                    </Flex>
                    <MarkdownView 
                        showNav={ true } 
                        content={ this.state.versionIteration[version_iterator_content] } 
                        width={ 630 }
                        />
                    <FloatButton 
                        icon={<FileTextOutlined />}
                        description={langTrans("doc btn1")}
                        shape="square"
                        style={{right: 24, width: 60}}
                        onClick={() => window.location.href = "#/version_iterator_doc/" + this.state.iteratorId} />
                </Content>
                : null}
                <Footer style={{ textAlign: 'center' }}>
                ApiChain ©{new Date().getFullYear()} Created by 方海亮
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