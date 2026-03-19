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
    ENV_VALUE_API_HOST, ENV_VALUE_RUN_MODE, ENV_VALUE_API_PREFIX,
    ENV_VALUE_RUN_MODE_CLIENT, ENV_VALUE_RUN_MODE_RUMMER 
} from '@conf/envKeys';
import { GET_ENV_VALS } from '@conf/redux';
import { getEnvs } from '@act/env';
import { addEnvValues } from '@act/env_value';
import { getPrjConfig } from '@act/project';

const { Header, Content, Footer } = Layout;

class ProjectSetting extends Component {

    constructor(props) {
        super(props);
        this.state = {
            apiHost: "",
            apiPrefix: "",
            runMode: ENV_VALUE_RUN_MODE_CLIENT,
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
            apiHost: ret["api_host"],
            apiPrefix: ret["api_prefix"],
            runMode: ret["run_mode"] 
        });
    }

    setApiPrefix = async (e) => {
        let pvalue = this.state.apiPrefix.trim();
        if(!pvalue.startsWith("/")) {
            message.error(langTrans("envvar prj host check3"));
            return;
        }
        if(!pvalue.endsWith("/")) {
            message.error(langTrans("envvar prj host check2"));
            return;
        }

        await addEnvValues(
            this.props.clientType, 
            this.props.teamId, 
            this.props.match.params.prj, 
            this.props.env, 
            "", "" , 
            ENV_VALUE_API_PREFIX, pvalue, "", "", 0, 0,
            this.props.device
        );

        message.success(langTrans("prj unittest status2"))
    }

    setApiHost = async (e) => {
        let pvalue = this.state.apiHost.trim();

        if(!(pvalue.indexOf("http://") === 0 || pvalue.indexOf("https://") === 0)) {
            message.error(langTrans("envvar prj host check1"));
            return;
        }
        if(!pvalue.endsWith("/")) {
            message.error(langTrans("envvar prj host check2"));
            return;
        }

        await addEnvValues(
            this.props.clientType, 
            this.props.teamId, 
            this.props.match.params.prj, 
            this.props.env, 
            "", "" , 
            ENV_VALUE_API_HOST, pvalue, "", "", 0, 0,
            this.props.device
        );

        message.success(langTrans("prj unittest status2"))
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

    setRunMode = async (value: string) => {
        this.setState({runMode : value})

        await addEnvValues(
            this.props.clientType, 
            this.props.teamId, 
            this.props.match.params.prj, 
            this.props.env, 
            "", "" , 
            ENV_VALUE_RUN_MODE, value, "", "", 0, 0,
            this.props.device
        );

        message.success(langTrans("prj unittest status2"))
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
                        labelCol={{ span: 5 }}
                        wrapperCol={{ span: 14 }}
                        style={{width: 800}}
                    >
                        <Form.Item
                            label={langTrans("project setting form1")}
                        >
                            <Select
                                value={ this.props.env }
                                onChange={this.setEnvironmentChange}
                                style={{ width: 120 }}
                                options={this.props.envs}
                            />
                        </Form.Item>
                        <Form.Item
                            label={langTrans("project setting form2")}
                        >
                            <Space.Compact style={{ width: '100%' }}>
                                <Input value={this.state.apiHost} onChange={(e) => this.setState({apiHost: e.target.value})} />
                                <Button type="link" onClick={this.setApiHost}>{langTrans("iterator edit btn")}</Button>
                            </Space.Compact>
                        </Form.Item>
                        <Form.Item
                            label={langTrans("project setting form3")}
                        >
                            <Space.Compact style={{ width: '100%' }}>
                                <Input value={this.state.apiPrefix} onChange={(e) => this.setState({apiPrefix: e.target.value})} />
                                <Button type="link" onClick={this.setApiPrefix}>{langTrans("iterator edit btn")}</Button>
                            </Space.Compact>
                        </Form.Item>
                        <Form.Item
                            label={langTrans("project setting form4")}
                        >
                             <Select 
                                value={this.state.runMode} 
                                onChange={this.setRunMode}
                                options={[
                                    {label:langTrans("runmodel client"), value: ENV_VALUE_RUN_MODE_CLIENT},
                                    {label:langTrans("runmodel runner"), value: ENV_VALUE_RUN_MODE_RUMMER}
                                ]} />
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