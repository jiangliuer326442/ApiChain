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
    Select, 
    Popconfirm
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
    setBaseUrl, 
    setApiKey,
    setChatModel,
    setProvider,
} from '@act/team';
import {
    getTokens, 
    getTeamSetting,
    enableToken,
    vectorModels,
    reVectorModels,
    queryRemainGas
} from '@act/ai';
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
            bigModelProviders:[],
            selectedProvider: "",
            providers: [],
            baseUrls: [],
            languageModels: [],
            baseUrl: "",
            languageModel: "",
            initApiKey: "",
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
                        {record["use_flg"] ? 
                        langTrans("setting basic table index8")
                        :
                        <Button type="link" onClick={async () => {
                            let tokenName = record["token_name"];
                            await enableToken(tokenName).then(async () => {
                                message.success(langTrans("prj unittest status2"));
                                let selectedProvider = "YUNWU";
                                this.setState({
                                    selectedProvider,
                                    tokens: await getTokens(),
                                });
                            })
                        }}>{langTrans("setting basic table index7")}</Button>
                        }
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
            const ret = await getTeamSetting();
            let selectedProvider = ret.currentProvider;
            let bigModelProviders = ret.providers;
            let providers = [];
            for (let bigModelProvider of bigModelProviders) {
                let providerRow = bigModelProvider.provider;
                let providerArr = providerRow.split(":");
                providers.push({label:providerArr[0], value:providerArr[1]})
            }
            let baseUrlArr = this.getBaseUrl(bigModelProviders, selectedProvider);
            let langguageModelArr = this.getLanguageModels(bigModelProviders, selectedProvider);
            let apiKey = this.getApiKey(bigModelProviders, selectedProvider);
            const tokenList = await getTokens();
            this.setState({
                selectedProvider,
                bigModelProviders,
                providers,
                baseUrls : baseUrlArr,
                apiKey,
                initApiKey: apiKey,
                languageModels: langguageModelArr,
                tokens: tokenList,
                loaded: true
            })
        } else {
            this.setState({loaded: true})
        }
    }

    getApiKey = (bigModelProviders, selectedProvider) => {
        if (bigModelProviders == null) {
            bigModelProviders = this.state.bigModelProviders;
        }
        if (selectedProvider == null) {
            selectedProvider = this.state.selectedProvider;
        }
        let apiKey = "";
        for (let bigModelProvider of bigModelProviders) {
            let providerRow = bigModelProvider.provider;
            let providerArr = providerRow.split(":");
            if (providerArr[1] == selectedProvider) {
                apiKey = bigModelProvider.chatApiKey;
                break;
            }
        }
        return apiKey;
    }

    getLanguageModels = (bigModelProviders, selectedProvider) => {
        if (bigModelProviders == null) {
            bigModelProviders = this.state.bigModelProviders;
        }
        if (selectedProvider == null) {
            selectedProvider = this.state.selectedProvider;
        }
        let retLanguageModels = [];
        for (let bigModelProvider of bigModelProviders) {
            let providerRow = bigModelProvider.provider;
            let providerArr = providerRow.split(":");
            if (providerArr[1] == selectedProvider) {
                let rawChatApiModel = bigModelProvider.chatApiModel;
                let langguageModelArr = rawChatApiModel.split(",");
                for (let langguageModelItem of langguageModelArr) {
                    let langguageModelArr = langguageModelItem.split(/:(.+)/);
                    if (langguageModelArr.length >= 2) {
                        retLanguageModels.push({label:langguageModelArr[0], value:langguageModelArr[1]});
                    } else {
                        retLanguageModels.push(langguageModelItem);
                    }
                }
                break;
            }
        }
        return retLanguageModels;
    }

    getBaseUrl = (bigModelProviders, selectedProvider) => {
        if (bigModelProviders == null) {
            bigModelProviders = this.state.bigModelProviders;
        }
        if (selectedProvider == null) {
            selectedProvider = this.state.selectedProvider;
        }
        let retBaseUrlArr = [];
        for (let bigModelProvider of bigModelProviders) {
            let providerRow = bigModelProvider.provider;
            let providerArr = providerRow.split(":");
            if (providerArr[1] == selectedProvider) {
                let rawBaseUrl = bigModelProvider.chatApiUrl;
                let baseUrlArr = rawBaseUrl.split(",");
                for (let baseUrlItem of baseUrlArr) {
                    let baseUrlArr = baseUrlItem.split(/:(.+)/);
                    let baseUrlArr_tmp = baseUrlItem.split(":");
                    if (baseUrlArr_tmp.length > 2) {
                        retBaseUrlArr.push({label:baseUrlArr[0], value:baseUrlArr[1]});
                    } else {
                        retBaseUrlArr.push(baseUrlItem);
                    }
                }
                break;
            }
        }
        return retBaseUrlArr;
    }

    checkForUpgrade = () => {
        window.electron.ipcRenderer.sendMessage(ChannelsAutoUpgradeStr, ChannelsAutoUpgradeCheckStr);
    }

    setProvider = async (newProvider : string) => {
        await setProvider(newProvider).then(()=> {
            let baseUrlArr = this.getBaseUrl(null, newProvider);
            let langguageModelArr = this.getLanguageModels(null, newProvider);
            let apiKey = this.getApiKey(null, newProvider);
            this.setState({
                selectedProvider : newProvider,
                baseUrls : baseUrlArr,
                languageModels: langguageModelArr,
                apiKey,
                initApiKey: apiKey,
            });
            message.success(langTrans("prj unittest status2"))
        });
    }

    setBaseUrl = async (baseUrl : string) => {
        this.setState({baseUrl});
    }

    setBaseUrl2 = async (baseUrl : string) => { 
        await setBaseUrl(this.state.selectedProvider, baseUrl).then(()=> {
            this.setState({baseUrl});
            message.success(langTrans("prj unittest status2"))
        });
    }

    setLanguageModel = async (newLanguageModel) => {
        this.setState({languageModel : newLanguageModel});
    }

    setLanguageModel2 = async (languageModel) => {
        await setChatModel(this.state.selectedProvider, languageModel).then(()=> {
            this.setState({languageModel});
            message.success(langTrans("prj unittest status2"))
        });
    }

    setApiKey = async (apiKey) => {
        this.setState({apiKey});
    }

    setApiKey2 = async (apiKey) => {
        if (apiKey == this.state.initApiKey) {
            return;
        }
        await setApiKey(this.state.selectedProvider, apiKey).then(()=> {
            this.setState({apiKey});
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
                        labelCol={{ span: 5 }}
                        wrapperCol={{ span: 14 }}
                        style={{width: 800}}
                    >
                        {this.props.clientType === CLIENT_TYPE_TEAM ? 
                    <>
                        <Form.Item
                            label={langTrans("setting basic provider label")}
                        >
                            <Select 
                                size='large' 
                                value={ this.state.selectedProvider }
                                options={this.state.providers}
                                onChange={ this.setProvider }
                            />
                        </Form.Item>
                        <Form.Item
                            label={langTrans("setting basic url label")}
                        >
                        {this.state.baseUrls.length > 1 ? 
                            <Select 
                                size='large' 
                                value={ this.state.baseUrl ? this.state.baseUrl : this.state.baseUrls[0].value }
                                onChange={ this.setBaseUrl2 }
                                options={this.state.baseUrls}
                            />
                        :
                            <Input 
                                value={ this.state.baseUrl ? this.state.baseUrl : this.state.baseUrls[0] } 
                                onChange={ event => this.setBaseUrl(event.target.value) }
                                onBlur={ event => this.setBaseUrl2(event.target.value) }
                            />
                        }

                        </Form.Item>
                        <Form.Item
                            label={langTrans("setting basic aimodels label")}
                        >
                        {this.state.languageModels.length > 1 ? 
                            <Select 
                                size='large' 
                                value={ this.state.languageModel ? this.state.languageModel : this.state.languageModels[0].value }
                                onChange={ this.setLanguageModel2 }
                                options={this.state.languageModels}
                            />
                        :
                            <Input 
                                value={ this.state.languageModel ? this.state.languageModel : this.state.languageModels[0] } 
                                onChange={ event => this.setLanguageModel(event.target.value) }
                                onBlur={ event => this.setLanguageModel2(event.target.value) }
                            />
                        }

                        </Form.Item>
                        <Form.Item
                            label={langTrans("setting basic key label")}
                            help={this.state.selectedProvider == "YUNWU" ? (
                                <span>
                                    {langTrans("setting basic key help1")}
                                    <Link onClick={() => this.setState({showPay: true})}>
                                    {langTrans("setting basic key help2")}
                                    </Link>
                                    {langTrans("setting basic key help3")}
                                </span>
                            ):null}
                        >
                            <Input.Password
                                readOnly={this.state.selectedProvider == "YUNWU"}
                                size='large'
                                allowClear
                                value={this.state.apiKey}
                                onChange={ event => this.setApiKey(event.target.value) }
                                onBlur={ event => this.setApiKey2(event.target.value) }
                                placeholder={langTrans("setting basic key placeholder")} 
                            />
                        </Form.Item>
                        <Form.Item
                            label={langTrans("knowledge management")}
                            style={{ borderTop: '1px dashed rgba(255, 255, 255, 0.85)', paddingTop: '12px' }}
                        >
                            <Space size="middle">
                                <Button
                                     variant="outlined" 
                                    onClick={async ()=>{
                                        try {
                                            await vectorModels();
                                            message.success(langTrans("prj unittest status2"));
                                        } catch (error) {
                                            message.error(error.errorMessage);
                                        }
                                }} color="primary">{langTrans("knowledge management update")}</Button>
                                <Popconfirm
                                    title={langTrans("knowledge management rebuild confirm")}
                                    onConfirm={async ()=>{
                                        try {
                                            await reVectorModels();
                                            message.success(langTrans("prj unittest status2"));
                                        } catch (error) {
                                            message.error(error.errorMessage);
                                        }
                                    }}
                                >
                                    <Button 
                                        variant="outlined" 
                                        color="primary" danger>{langTrans("knowledge management rebuild")}</Button>
                                </Popconfirm>
                            </Space>
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
    }
}

export default connect(mapStateToProps)(BasicSetting);