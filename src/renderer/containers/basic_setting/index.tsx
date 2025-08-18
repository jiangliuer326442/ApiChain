import { Button, Form, Input, Checkbox, Typography, Space, Breadcrumb, Flex, Layout, message, Select } from 'antd';
import { Component, ReactNode } from 'react';
import { connect } from 'react-redux';

import { langTrans } from '@lang/i18n';
import {
  ChannelsAutoUpgradeStr, 
  ChannelsAutoUpgradeCheckStr, 
} from '@conf/channel';
import { IS_AUTO_UPGRADE } from '@conf/storage';
import {
    OS_ENV_VALUE_SET_URL,
    OS_ENV_VALUE_GET_URL,
    CLIENT_TYPE_TEAM 
} from '@conf/team';
import { sendTeamMessage } from '@act/message';
import PayAiTokenModel from '@comp/topup/aitoken';

const { Header, Content, Footer } = Layout;
const { Link } = Typography;

class BasicSetting extends Component {

    constructor(props) {
        super(props);
        let checkAutoUpgrade = localStorage.getItem(IS_AUTO_UPGRADE);
        checkAutoUpgrade = checkAutoUpgrade == null ? 1 : checkAutoUpgrade;
        this.state = {
            loaded: false,
            checkAutoUpgrade,
            baseUrl: "",
            apiKey: "",
            showPay: false,
        }
    }

    async componentDidMount() {
        if (this.props.clientType === CLIENT_TYPE_TEAM) {
            let ret1 = await sendTeamMessage(OS_ENV_VALUE_GET_URL, {key: "OPENAI_API_KEY"});
            let ret2 = await sendTeamMessage(OS_ENV_VALUE_GET_URL, {key: "OPENAI_BASE_URL"});
            this.setState({
                apiKey: ret1 ? ret1 : "", 
                baseUrl: ret2 ? ret2 : "",
                loaded: true
            })
        } else {
            this.setState({loaded: true})
        }
    }

    checkForUpgrade = () => {
        window.electron.ipcRenderer.sendMessage(ChannelsAutoUpgradeStr, ChannelsAutoUpgradeCheckStr);
    }

    setBaseUrl = async (baseUrl) => { 
        await sendTeamMessage(OS_ENV_VALUE_SET_URL, {
            key: "OPENAI_BASE_URL",
            value: baseUrl
        });
        this.setState({baseUrl});
        message.success(langTrans("prj unittest status2"))
    }

    render(): ReactNode {
        return (
            <Layout>
                <Header style={{ padding: 0 }}>
                {langTrans("nav setting basic")}
                </Header>
                <Content style={{ padding: '0 16px' }}>
                    <Flex justify="space-between" align="center">
                        <Breadcrumb style={{ margin: '16px 0' }} items={[{ title: langTrans("env bread1")}, { title: langTrans("nav setting basic") }]} />
                    </Flex>
                    <PayAiTokenModel 
                        showPay={this.state.showPay} 
                        cb={showPay => this.setState({showPay})} 
                        refresh={async () => {
                            let ret1 = await sendTeamMessage(OS_ENV_VALUE_GET_URL, {key: "OPENAI_API_KEY"});
                            this.setState({
                                apiKey: ret1 ? ret1 : "", 
                            })
                        }}
                        />
                {this.state.loaded ? 
                    <Form
                        labelCol={{ span: 10 }}
                        wrapperCol={{ span: 14 }}
                    >
                        {this.props.clientType === CLIENT_TYPE_TEAM ? 
                    <>
                        <Form.Item
                            label={langTrans("setting basic url label")}
                        >
                            <Select 
                                size='large' 
                                value={ this.state.baseUrl }
                                onChange={ this.setBaseUrl }
                            >
                                <Select.Option value="https://yunwu.zeabur.app/v1">{ langTrans("setting basic url mainland") }</Select.Option>
                                <Select.Option value="https://yunwu.ai/v1">{ langTrans("setting basic url other") }</Select.Option>
                            </Select>
                        </Form.Item>
                        <Form.Item
                            label={langTrans("setting basic key label")}
                            help={
                                <span>
                                    {langTrans("setting basic key help1")}
                                    <Link onClick={() => this.setState({showPay: true})}>
                                    {langTrans("setting basic key help2")}
                                    </Link>
                                    {langTrans("setting basic key help3")}
                                </span>
                            }
                        >
                            <Input.Password
                                readOnly
                                size='large'
                                allowClear
                                value={this.state.apiKey}
                                placeholder={langTrans("setting basic key placeholder")} 
                            />
                        </Form.Item>
                    </>
                        : null}
                
                        <Form.Item
                            label={langTrans("update checkbox")}
                        >
                            <Space size="middle">
                                <Checkbox 
                                    checked={this.state.checkAutoUpgrade == 1}
                                    onChange={e => {
                                        if (e.target.checked) {
                                            this.setState({checkAutoUpgrade: 1});
                                            localStorage.setItem(IS_AUTO_UPGRADE, "1");
                                            this.checkForUpgrade();
                                        } else {
                                            this.setState({checkAutoUpgrade: 0});
                                            localStorage.setItem(IS_AUTO_UPGRADE, "0");
                                        }
                                    }}
                                >
                                </Checkbox>
                            {this.state.checkAutoUpgrade == 0 ? 
                                <Button type="primary" onClick={this.checkForUpgrade}>{langTrans("update manual")}</Button>
                            : null}
                            </Space>
                        </Form.Item>
                    </Form>
                : null}
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
      clientType: state.device.clientType,
    }
}

export default connect(mapStateToProps)(BasicSetting);