import { Component, ReactNode } from 'react';
import { connect } from 'react-redux';
import { 
    Breadcrumb, 
    Layout, 
    Flex, 
    Typography,
    Form, 
    Input,
    Button,
} from "antd";
import { 
    CloseSquareFilled, 
} from '@ant-design/icons'

import { langTrans } from '@lang/i18n';
import { getWikiProject } from '@conf/url';
import RequestListCollapse from '@comp/requests_list_collapse';
import {
    getProjectFolders
} from '@act/project_folders';
import { isStringEmpty } from '@rutil/index';
import { title } from 'node:process';

const { Header, Content, Footer } = Layout;
const { Text, Link } = Typography;

type FieldType = {
    title?: string;
    uri?: string;
};

class RequestListProject extends Component {

    constructor(props) {
        super(props);
        let projectLabel = this.props.match.params.id;
        this.state = {
            projectLabel,
            requestsJsxDividered: [],
            title: "",
            uri: "",
            optionsUri: [],
            optionsTitle: [],
            folders: [],
            filterTitle: "",
            filterUri: ""
        }
    }

    async componentDidUpdate(prevProps) {
        if (prevProps.match.params.id !== this.props.match.params.id) {
            this.state.projectLabel = this.props.match.params.id;
            this.onFinish({});
        }
    }

    static getDerivedStateFromProps(props, state) {
        let projectLabel = props.match.params.id;
        if (state.projectLabel !== projectLabel) {
            return {
                projectLabel,
            }
        }
        return null;
    }

    async componentDidMount() {
        this.onFinish({});
    }

    onFinish = async (values) => {
        let title = values?.title;
        let uri = values?.uri;
        if (isStringEmpty(uri) && isStringEmpty(title)) {
            let folders = await getProjectFolders(this.props.clientType, this.state.projectLabel, null, null);
            this.setState({
                folders,
                filterTitle: "",
                filterUri: ""
            })
            return;
        }
        let folders = await getProjectFolders(this.props.clientType, this.state.projectLabel, title, uri);
        this.setState({
            folders,
            filterTitle: title,
            filterUri: uri,
        })
    }

    render() : ReactNode {
        return (
            <Layout>
                <Header style={{ padding: 0 }}>
                    {langTrans("prj doc title")} <Text type="secondary"><Link href={getWikiProject()}>{langTrans("prj doc link")}</Link></Text>
                </Header>
                <Content style={{ padding: '0 16px' }}>
                    <Breadcrumb style={{ margin: '16px 0' }} items={[
                        { title: langTrans("prj doc bread1") }, 
                        { title: langTrans("prj doc bread2") }
                    ]} />
                    <Flex vertical gap="middle">
                        <Flex justify="flex-start" align="center" gap="middle">
                            <Form 
                                layout="inline"
                                onFinish={ this.onFinish } 
                                initialValues={ {} }
                                autoComplete="off"
                            >

                                <Form.Item<FieldType> style={{paddingBottom: 20}} label={langTrans("prj doc operator1")} name="uri" rules={[{ required: false }]}>
                                    <Input 
                                        allowClear={{ clearIcon: <CloseSquareFilled /> }} 
                                        style={{width: 600}} />
                                </Form.Item>

                                <Form.Item<FieldType> label={langTrans("prj doc operator2")} name="title" rules={[{ required: false }]}>
                                    <Input 
                                        allowClear={{ clearIcon: <CloseSquareFilled /> }} 
                                    />
                                </Form.Item>

                                <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
                                    <Button type="primary" htmlType="submit">
                                        {langTrans("prj doc btn")}
                                    </Button>
                                </Form.Item>
                            </Form>
                        </Flex>
                        <Flex>
                            <div style={ { width: "100%" } }>
                                <RequestListCollapse 
                                    metadata={this.state.projectLabel}
                                    folders={this.state.folders} 
                                    filterTitle={this.state.filterTitle}
                                    filterUri={this.state.filterUri}
                                    refreshCallback={() => this.onFinish({
                                        title: this.state.filterTitle,
                                        uri: this.state.filterUri
                                    })}
                                />
                            </div>
                        </Flex>
                    </Flex>
                </Content>
                <Footer style={{ textAlign: 'center' }}>
                ApiChain ©{new Date().getFullYear()} Created by 方海亮
                </Footer>
            </Layout>
        );
    }
}
    
function mapStateToProps (state) {
    return {
        device : state.device,
        teamId: state.device.teamId,
        clientType: state.device.clientType,
    }
}
      
export default connect(mapStateToProps)(RequestListProject);