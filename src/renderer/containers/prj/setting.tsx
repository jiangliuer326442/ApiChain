import { 
    Button,
    Flex,
    Form,
    Input,
    Select,
    message,
    Space,
    Breadcrumb,
    Layout 
} from 'antd';
import { Component, ReactNode } from 'react';
import { connect } from 'react-redux';

import { langTrans } from '@lang/i18n';
import { isStringEmpty } from '@rutil/index';
import { 
    ENV_VALUE_RUN_MODE_CLIENT, ENV_VALUE_RUN_MODE_RUMMER 
} from '@conf/envKeys';
import { CLIENT_TYPE_SINGLE } from '@conf/team';
import { GET_ENV_VALS } from '@conf/redux';
import MarkdownEditor from '@comp/markdown/edit';
import { getEnvs } from '@act/env';
import { getPrjConfig, savePrjConfig } from '@act/project';

const { Header, Content, Footer } = Layout;

class ProjectSetting extends Component {

    constructor(props) {
        super(props);
        this.state = {
            apiHost: "",
            apiPrefix: "",
            runMode: ENV_VALUE_RUN_MODE_CLIENT,
            projectDesc: "",
            loading: true
        }
    }

    async componentDidMount() {
        if(this.props.envs.length === 0) {
          getEnvs(this.props.clientType, this.props.dispatch);
        }
        if (isStringEmpty(this.props.env)) {
            return;
        }
        let ret = await getPrjConfig(this.props.clientType, this.props.match.params.prj, this.props.env);
        this.setState({
            loading: false,
            apiHost: ret["api_host"],
            apiPrefix: ret["api_prefix"],
            runMode: ret["run_mode"],
            projectDesc: isStringEmpty(ret["projectDesc"]) ? langTrans("prj add form3 placeholder") : ret["projectDesc"]
        });
    }

    handleSubmit = async () => {
        let apiHost = this.state.apiHost.trim();

        if(!(apiHost.indexOf("http://") === 0 || apiHost.indexOf("https://") === 0)) {
            message.error(langTrans("envvar prj host check1"));
            return;
        }
        if(!apiHost.endsWith("/")) {
            message.error(langTrans("envvar prj host check2"));
            return;
        }

        let apiPrefix = this.state.apiPrefix.trim();
        if (!isStringEmpty(apiPrefix)) {
            if(!apiPrefix.startsWith("/")) {
                message.error(langTrans("envvar prj host check3"));
                return;
            }
            if(!apiPrefix.endsWith("/")) {
                message.error(langTrans("envvar prj host check2"));
                return;
            }
        }

        await savePrjConfig(this.props.clientType, this.props.teamId, this.props.match.params.prj, this.props.env,
            apiHost, apiPrefix, this.state.runMode, this.state.projectDesc,
            this.props.device);
        
        message.success(langTrans("project setting save success"));
    }

    setEnvironmentChange = async (value: string) => {
        this.props.dispatch({
            type: GET_ENV_VALS,
            prj: this.props.match.params.prj,
            env: value,
            iterator: "",
            unittest: ""
        });
        let ret = await getPrjConfig(this.props.clientType, this.props.match.params.prj, value);
        this.setState({
            apiHost: ret["api_host"],
            apiPrefix: ret["api_prefix"],
            runMode: ret["run_mode"] 
        });
    }

    render(): ReactNode {
        return (
            <Layout>
                <Header style={{ padding: 0 }}>
                    {langTrans("prj title")}
                </Header>
                <Content style={{ margin: '0 16px' }}>
                    <Flex justify="space-between" align="center">
                        <Breadcrumb style={{ margin: '16px 0' }} items={[{ title: langTrans("project setting bread1")}, { title: langTrans("project setting bread2") }]} />
                    </Flex>
                    <Form
                        layout='vertical'
                        style={{ maxWidth: this.props.collapsed ? 1140 : 950 }}
                        autoComplete="off"
                    >
                        <Form.Item
                            label={langTrans("project setting form1")}
                        >
                            <Select
                                value={ this.props.env }
                                onChange={this.setEnvironmentChange}
                                options={this.props.envs}
                            />
                        </Form.Item>
                        <Form.Item
                            label={langTrans("project setting form2")}
                        >
                            <Space.Compact style={{ width: '100%' }}>
                                <Input value={this.state.apiHost} onChange={(e) => this.setState({apiHost: e.target.value})} />
                            </Space.Compact>
                        </Form.Item>
                        <Form.Item
                            label={langTrans("project setting form3")}
                        >
                            <Space.Compact style={{ width: '100%' }}>
                                <Input value={this.state.apiPrefix} onChange={(e) => this.setState({apiPrefix: e.target.value})} />
                            </Space.Compact>
                        </Form.Item>
                        <Form.Item
                            label={langTrans("project setting form4")}
                        >
                             <Select 
                                disabled={this.props.clientType === CLIENT_TYPE_SINGLE}
                                value={this.state.runMode} 
                                onChange={value => this.setState({runMode : value})}
                                options={[
                                    {label:langTrans("runmodel client"), value: ENV_VALUE_RUN_MODE_CLIENT},
                                    {label:langTrans("runmodel runner"), value: ENV_VALUE_RUN_MODE_RUMMER}
                                ]} />
                        </Form.Item>
                        {!this.state.loading && <Form.Item
                            label={langTrans("project setting form5")}
                        >
                            <MarkdownEditor content={this.state.projectDesc} cb={content => this.setState({projectDesc: content}) } />
                        </Form.Item>}
                        <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
                            <Button type="primary" onClick={this.handleSubmit}>
                            {langTrans("iterator edit btn")}
                            </Button>
                        </Form.Item>
                    </Form>
                </Content>
                <Footer style={{ textAlign: 'center' }}>
                ApiChain ©{new Date().getFullYear()} Created by Mustafa Fang
                </Footer>
            </Layout>
        )
    }

}

function mapStateToProps (state) {
    return {
        device : state.device,
        env: state.env_var.env,
        envs: state.env.list,
        clientType: state.device.clientType,
        teamId: state.device.teamId,
    }
}

export default connect(mapStateToProps)(ProjectSetting);