import { 
    Alert,
    Button, 
    Form, 
    Input, 
    Checkbox, 
    Divider, 
    Table,
    Typography, 
    Space, 
    Breadcrumb, 
    Flex, 
    Layout, 
    message, 
    Select 
} from 'antd';
import { ReloadOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { Component, ReactNode } from 'react';
import { connect } from 'react-redux';

import { langTrans } from '@lang/i18n';
import {
    ChannelsAutoUpgradeStr, 
    ChannelsAutoUpgradeCheckStr, 
    ChannelsVipStr,
    ChannelsVipCloseCkCodeStr,
} from '@conf/channel';
import { SET_DEVICE_INFO } from '@conf/redux';
import { IS_AUTO_UPGRADE } from '@conf/storage';
import {
    CLIENT_TYPE_TEAM 
} from '@conf/team';
import { getdayjs } from '@rutil/index';
import { 
    getTokens, 
    setBaseUrl, 
    getTeamSetting,
    enableToken,
    queryRemainGas
} from '@act/team';
import PayAiTokenModel from '@comp/topup/aitoken';

const { Header, Content, Footer } = Layout;
const { Link, Text } = Typography;

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
            columns: [{
                title: langTrans("setting basic table index1"),
                dataIndex: "token_name",
                render: (tokenName, record) => {
                    return (
                    <Space>
                        {record["token_content"] == this.state.apiKey ? 
                        <CheckCircleOutlined style={{ color: '#52c41a' }} />
                        : null}
                        <Text>{tokenName}</Text>
                    </Space>
                    )
                }
            },{
                title: langTrans("setting basic table index2"),
                dataIndex: "total_gas",
            },{
                title: langTrans("setting basic table index3"),
                dataIndex: "remain_gas",
                render: (remainGas, record) => {
                    return <Button 
                        type="link" 
                        icon={<ReloadOutlined style={{ fontSize: '16px', color: '#1890ff' }} />}
                        onClick={async () => {
                            let tokenName = record["token_name"];
                            await queryRemainGas(tokenName).then(async () => this.setState({tokens: await getTokens()}))
                        }}
                        >
                    {remainGas}
                  </Button>;
                },
            },{
                title: langTrans("setting basic table index4"),
                dataIndex: "create_name",
            },{
                title: langTrans("setting basic table index5"),
                dataIndex: "create_time",
                render: (time) => { return getdayjs(time).format("YYYY-MM-DD") },
            },{
                title: langTrans("setting basic table index6"),
                dataIndex: "operator",
                render: (_, record) => {
                    return (
                      <Space size="middle">
                        <Button type="link" onClick={async () => {
                            let tokenName = record["token_name"];
                            await enableToken(tokenName).then(async () => {
                                const { apiKey } = await getTeamSetting();
                                this.setState({
                                    apiKey, 
                                    tokens: await getTokens(),
                                });
                            })
                        }}>{langTrans("setting basic table index7")}</Button>
                      </Space>
                    )
                }
            }],
            tokens: [],
            showPayWriteOff: false,
            closeShowPay: false,
        }
    }

    async componentDidMount() {
        if (this.props.clientType === CLIENT_TYPE_TEAM) {
            const { apiKey, baseUrl } = await getTeamSetting();
            this.setState({
                apiKey, 
                baseUrl,
                tokens: await getTokens(),
                loaded: true
            })
        } else {
            this.setState({loaded: true})
        }
    }

    checkForUpgrade = () => {
        window.electron.ipcRenderer.sendMessage(ChannelsAutoUpgradeStr, ChannelsAutoUpgradeCheckStr);
    }

    setBaseUrl = async (baseUrl : string) => { 
        await setBaseUrl(baseUrl).then(()=> {
            this.setState({baseUrl});
            message.success(langTrans("prj unittest status2"))
        });
    }

    showCkCode = (e) => {
        if (!this.state.closeShowPay) {
            this.setState({showPayWriteOff: true})
        }
    }

    closeShowPay = (e) => {
        window.electron.ipcRenderer.sendMessage(ChannelsVipStr, ChannelsVipCloseCkCodeStr);
        this.props.dispatch({
            type: SET_DEVICE_INFO,
            showCkCode : false,
        });
        this.state.closeShowPay = true;
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
                {(this.props.showCkCode && this.props.ckCodeType === "chat_token") ? 
                    <Alert 
                        message={langTrans("aitoken checkout tips")}
                        type="warning" 
                        closable 
                        onClose={this.closeShowPay} 
                        onClick={this.showCkCode}
                    /> 
                : null}
                    <PayAiTokenModel 
                        showPay={this.state.showPay} 
                        showPayWriteOff={this.state.showPayWriteOff} 
                        payMethod={this.props.payMethod}
                        payParam={this.props.payParam}
                        refresh={async () => {
                            const { apiKey } = await getTeamSetting();
                            this.setState({
                                apiKey: apiKey, 
                                tokens: await getTokens(),
                            })
                        }}
                        cb={showPay => this.setState({showPay, showPayWriteOff: showPay})} 
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
                    <Divider>{langTrans("setting basic table title")}</Divider>
                    {this.props.clientType === CLIENT_TYPE_TEAM ? 
                    <Table rowKey={"token_name"} columns={this.state.columns} dataSource={ this.state.tokens } pagination={ false } />
                    : null}
                </Content>
                <Footer style={{ textAlign: 'center' }}>
                ApiChain ©{new Date().getFullYear()} Created by Mustafa Fang
                </Footer>
            </Layout>
        );
    }
}

function mapStateToProps (state) {
    return {
        clientType: state.device.clientType,
        showCkCode: state.device.showCkCode,
        ckCodeType: state.device.ckCodeType,
        payMethod: state.device.payMethod,
        payParam: state.device.payParam,
    }
}

export default connect(mapStateToProps)(BasicSetting);