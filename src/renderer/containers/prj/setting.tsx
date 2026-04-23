import { 
    Button,
    Flex,
    Form,
    Input,
    Select,
    message,
    Space,
    Breadcrumb,
    Layout, 
    Divider
} from 'antd';
import { Component, ReactNode } from 'react';
import { connect } from 'react-redux';

import { langTrans } from '@lang/i18n';
import { isStringEmpty } from '@rutil/index';
import { TABLE_ENV_FIELDS } from '@conf/db';
import { 
    ENV_VALUE_RUN_MODE_CLIENT, ENV_VALUE_RUN_MODE_RUMMER 
} from '@conf/envKeys';
import { CLIENT_TYPE_SINGLE } from '@conf/team';
import { GET_ENV_VALS } from '@conf/redux';
import MarkdownEditor from '@comp/markdown/edit';
import { getEnvs } from '@act/env';
import { encryptPromise } from '@act/env_value';
import { getPrjConfig, savePrjConfig } from '@act/project';

const { Header, Content, Footer } = Layout;

let env_label = TABLE_ENV_FIELDS.FIELD_LABEL;

class ProjectSetting extends Component {

    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            apiHost: "",
            apiPrefix: "",
            runMode: ENV_VALUE_RUN_MODE_CLIENT,
            projectDesc: "",
            dbHost: "",
            dbPort: 3306,
            dbUsername: "",
            dbPassword: "",
            oldDbPassword: "",
            dbName: "",
            dbRunMode: ENV_VALUE_RUN_MODE_CLIENT,
        }
    }

    async componentDidMount() {
        if(this.props.envs.length === 0) {
          let envs = await getEnvs(this.props.clientType, this.props.dispatch);
          if (isStringEmpty(this.props.env)) {
            this.setEnvironmentChange(envs[0][env_label])
          } else {
            console.log("222222222");
            this.getData();
          }
        } else {
            let envs = this.props.envs;
            if (isStringEmpty(this.props.env)) {
                console.log("33333333");
                this.setEnvironmentChange(envs[0]["value"])
            } else {
                console.log("444444444");
                this.getData();
            }
        }
    }

    getData = async () => {
        this.setState({
            loading: true,
        })
        let ret = await getPrjConfig(this.props.clientType, this.props.match.params.prj, this.props.env);
        this.setState({
            loading: false,
            apiHost: ret["api_host"],
            apiPrefix: ret["api_prefix"],
            runMode: ret["run_mode"],
            dbHost: ret["db_host"],
            dbPort: ret["db_port"],
            dbUsername: ret["db_username"],
            dbPassword: ret["db_password"],
            oldDbPassword: ret["db_password"],
            dbName: ret["db_name"],
            dbRunMode: ret["db_run_mode"],
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

        this.setState({loading: true});

        // 文本输入框内的密码
        let dbPassword = this.state.dbPassword.trim();
        //用于本地存储的密码
        let localPassword = dbPassword;
        if (this.state.oldDbPassword != dbPassword) {
            localPassword = await encryptPromise(dbPassword);
        }

        await savePrjConfig(this.props.clientType, this.props.teamId, this.props.match.params.prj, this.props.env,
            apiHost, apiPrefix, this.state.runMode, this.state.projectDesc,
            this.state.dbHost, this.state.dbPort, this.state.dbUsername, 
            localPassword, dbPassword, this.state.oldDbPassword, 
            this.state.dbName, this.state.dbRunMode,
            this.props.device);
        
        message.success(langTrans("project setting save success"));

        this.getData();
        this.setState({loading: false});
    }

    setEnvironmentChange = async (value: string) => {
        await this.props.dispatch({
            type: GET_ENV_VALS,
            prj: this.props.match.params.prj,
            env: value,
            iterator: "",
            unittest: ""
        });

        this.setState({
            loading: true,
        })
        let ret = await getPrjConfig(this.props.clientType, this.props.match.params.prj, value);
        this.setState({
            loading: false,
            apiHost: ret["api_host"],
            apiPrefix: ret["api_prefix"],
            runMode: ret["run_mode"],
            dbHost: ret["db_host"],
            dbPort: ret["db_port"],
            dbUsername: ret["db_username"],
            dbPassword: ret["db_password"],
            oldDbPassword: ret["db_password"],
            dbName: ret["db_name"],
            dbRunMode: ret["db_run_mode"],
            projectDesc: isStringEmpty(ret["projectDesc"]) ? langTrans("prj add form3 placeholder") : ret["projectDesc"]
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
                            <Input 
                                value={this.state.apiHost} 
                                placeholder={ langTrans("project setting tip2") }
                                onChange={(e) => this.setState({apiHost: e.target.value})} />
                        </Form.Item>
                        <Form.Item
                            label={langTrans("project setting form3")}
                        >
                            <Input 
                                value={this.state.apiPrefix} 
                                placeholder={ langTrans("project setting tip3") }
                                onChange={(e) => this.setState({apiPrefix: e.target.value})} />
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
                        <Divider>{ langTrans("project setting db divider") }</Divider>
                        <Form.Item
                            label={langTrans("project setting form6")}
                        >
                            <Input 
                                value={this.state.dbHost} 
                                placeholder={langTrans("project setting tip6")}
                                onChange={(e) => this.setState({dbHost: e.target.value})} />
                        </Form.Item>
                        <Form.Item
                            label={langTrans("project setting form7")}
                        >
                            <Input 
                                value={this.state.dbPort} 
                                placeholder={langTrans("project setting tip7")}
                                onChange={(e) => this.setState({dbPort: e.target.value})} />
                        </Form.Item>
                        <Form.Item
                            label={langTrans("project setting form8")}
                        >
                            <Input 
                                value={this.state.dbUsername} 
                                placeholder={langTrans("project setting tip8")}
                                onChange={(e) => this.setState({dbUsername: e.target.value})} />
                        </Form.Item>
                        <Form.Item
                            label={langTrans("project setting form9")}
                        >
                            <Input.Password 
                                value={this.state.dbPassword} 
                                placeholder={langTrans("project setting tip9")}
                                onChange={(e) => this.setState({dbPassword: e.target.value})} />
                        </Form.Item>
                        <Form.Item
                            label={langTrans("project setting form10")}
                        >
                            <Input 
                                value={this.state.dbName} 
                                placeholder={langTrans("project setting tip10")}
                                onChange={(e) => this.setState({dbName: e.target.value})} />
                        </Form.Item>
                        <Form.Item
                            label={langTrans("project setting form11")}
                        >
                            <Select 
                                disabled={this.props.clientType === CLIENT_TYPE_SINGLE}
                                value={this.state.dbRunMode} 
                                onChange={value => this.setState({dbRunMode : value})}
                                options={[
                                    {label:langTrans("runmodel client"), value: ENV_VALUE_RUN_MODE_CLIENT},
                                    {label:langTrans("runmodel runner"), value: ENV_VALUE_RUN_MODE_RUMMER}
                                ]} />
                        </Form.Item>
                        <Divider />
                        {!this.state.loading && <Form.Item
                            label={langTrans("project setting form5")}
                        >
                            <MarkdownEditor content={this.state.projectDesc} cb={content => this.setState({projectDesc: content}) } />
                        </Form.Item>}
                        <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
                            <Button 
                                type="primary" 
                                onClick={this.handleSubmit}
                                loading={this.state.loading}
                                >
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