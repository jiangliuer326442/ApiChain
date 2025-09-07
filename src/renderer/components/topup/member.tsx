import { Component, ReactNode } from 'react';
import { connect } from 'react-redux';
import { 
    Modal, Button, Form, Radio, Input, Flex, message,
} from "antd";
import { EthereumProvider } from '@walletconnect/ethereum-provider';
import { ethers } from 'ethers';
import { RadioChangeEvent } from 'antd/lib';
import qrcode from 'qrcode';

import {
    ChannelsVipStr,
    ChannelsVipGenUrlStr, 
    ChannelsVipCkCodeStr,
    ChannelsVipDoCkCodeStr,
} from '@conf/channel';
import contractConfig from '@conf/contract.json';
import { SET_DEVICE_INFO } from '@conf/redux';
import { isStringEmpty, getdayjs, getStartParams } from '@rutil/index';
import { langFormat, langTrans } from '@lang/i18n';

const { TextArea } = Input;
const { supportedChains } = contractConfig;

let argsObjects = getStartParams();
let allowedChains = argsObjects.allowedChains.split(",");

class PayMemberModel extends Component {

    constructor(props) {
        super(props);
        this.state = {
            showPayWriteOff: false,
            showPayQrCode1: false,
            showPayQrCode: false,
            lodingCkCode: false,
            productName: "",
            payMethod: "",
            tradeNo: "",
            contractChain: "",
            money: "",
            qrcode: "",
            ckCode: "",
            cacheCkCodeUrl: "",
            contractParams: "",
            walletAccount: "",
            wcProvider: null,
            etherProvider: null,
            signer: null,
        };
    }

    async componentDidUpdate(prevProps, prevState) {
        if (isStringEmpty(prevProps.payMethod) || isStringEmpty(prevProps.payParam) || !this.props.showPayWriteOff) {
            return;
        }
        if (prevProps.payParam != prevState.cacheCkCodeUrl) {
            let cacheCkCodeUrl = prevProps.payParam;
            try {
                const qrCodeDataURL = await qrcode.toDataURL(cacheCkCodeUrl);
                this.setState({
                    cacheCkCodeUrl,
                    showPayQrCode: true,
                    qrcode: qrCodeDataURL,
                });
            } catch (error) {
                console.error('Error generating QR code:', error);
            }
        }
    }

    getWalletConnectUri = () => {
        return new Promise(async (resolve, reject) => {
            if (this.state.wcProvider === null) {
                try {
                    const { projectId } = contractConfig;
                    let rpcMap = {};
                    for (let chainId of allowedChains) {
                        rpcMap[chainId] = supportedChains[chainId].rpc;
                    }
                    
                    this.state.wcProvider = await EthereumProvider.init({
                        projectId,
                        metadata: {
                            name: this.props.appName,
                            description: this.props.appName,
                            url: "http://localhost:1212",
                            icons: ["https://apichain.app/icon.ico"],
                        },
                        chains: [this.state.contractChain],
                        optionalChains: [this.state.contractChain],
                        showQrModal: false,
                        disableProviderPing: true,
                        rpcMap
                    });
                    this.state.wcProvider.on('display_uri', async (url) => {
                        try {
                            await resolve(url);
                        } catch (error) {
                            console.error("display_uri error", error)
                            this.cancelPay();
                            return;
                        }
                    });
                    this.state.wcProvider.on('session_update', ({ topic, params }) => {
                        console.log('Session updated:', params);
                        const chainId = params.namespaces.eip155.chains[0].split(':')[1];
                        console.log('Current chainId:', chainId);
                    });
                    this.state.wcProvider.on('session_event', ({ topic, params }) => {
                        if (params.event.name === 'chainChanged') {
                            console.log('Chain changed to:', params.event.data);
                        }
                    });
                    this.state.wcProvider.on('connect', (session) => {
                        const chainId = parseInt(session.chainId, 16);
                        console.log('Initial chainId:', chainId, this.state.contractChain);
                    });

                    this.state.wcProvider.on('disconnect', (error, payload) => {
                        console.error('WalletConnect disconnected:', error, payload);
                        if (error?.message?.includes('expired') || error?.code === 'SESSION_EXPIRED') {
                            console.error('Session expired. Please reconnect.');
                            this.cancelPay();
                        }
                    });
                    
                    if (this.state.wcProvider.session) {
                        await this.state.wcProvider.enable();
                        const accounts = this.state.wcProvider.session.namespaces.eip155.accounts;
                        console.log("accounts", accounts);
                        const currentAccount = accounts[0].split(':')[2];
                        this.setState({walletAccount: currentAccount});
                        await resolve("");
                    } else {
                        await this.state.wcProvider.connect();
                    }
                    this.state.etherProvider = new ethers.providers.Web3Provider(this.state.wcProvider);
                    this.state.signer = this.state.etherProvider.getSigner();
                    this.doWithContract();
                } catch (error) {
                    console.error("init wcProvider error", error);
                    this.cancelPay();
                    return;
                }
            } else {
                await resolve("");
                this.doWithContract();
            }
        });
    }

    disconnectWallet = async () => {
        if (this.state.wcProvider) {
            await this.state.wcProvider.disconnect();
            this.setState({
                wcProvider: null,
                etherProvider: null,
                signer: null,
            });
        }
    }

    doWithContract = async () => {
        const { contractName } = contractConfig;
        const chainId = this.state.contractChain;
        const contractInfo = contractConfig[contractName];
        const contractABI = contractInfo.abi;
        const contractAddress = contractInfo.address[chainId];
        let contract;
        try {
            contract = new ethers.Contract(contractAddress, contractABI, this.state.signer);
        } catch (error) {
            console.error('sign contract error:', error);
            this.cancelPay();
        }

        let contractParams = this.state.contractParams;
        const methodName = 'sendRequest';
        const subscriptionId = supportedChains[chainId].subscription;
        const params = [subscriptionId, [contractParams]];
        try {
            contract[methodName](...params, {
                value: ethers.utils.parseEther(this.state.money.toString()).toString(),
                gasLimit: 500000,
            });
        } catch (error) {
            console.error('Error sending transaction:', error);
            this.cancelPay();
        }
    }

    setProductName = (e: RadioChangeEvent) => {
        this.setState({productName: e.target.value});
        this.checkAndGenPayPng(e.target.value, null, null);
    };

    setPayMethod = (e: RadioChangeEvent) => {
        const payMethod = e.target.value;
        this.setState({payMethod});
        this.checkAndGenPayPng(null, payMethod, null);
    };

    setContractChain = (e: RadioChangeEvent) => {
        const contractChain = e.target.value;
        this.setState({contractChain});
        this.checkAndGenPayPng(null, null, contractChain);
    }

    //生成支付二维码
    checkAndGenPayPng = (productName : string | null, payMethod : string | null, contractChain : string | null) => {
        if (productName === null) {
            productName = this.state.productName;
        }
        if (payMethod === null) {
            payMethod = this.state.payMethod;
        }
        if (contractChain === null) {
            contractChain = this.state.contractChain;
        }
        if (!(isStringEmpty(productName) || isStringEmpty(payMethod))) {
            //美元支付必须选择支付网络
            if (payMethod === "dollerpay" && isStringEmpty(contractChain)) {
                return;
            }

            //拿支付二维码生成结果
            let listener = window.electron.ipcRenderer.on(ChannelsVipStr, async (action, money, params : string) => {
                if (action !== ChannelsVipGenUrlStr) return;
                listener();
                if (payMethod === "dollerpay") {
                    try {
                        let url = await this.getWalletConnectUri();
                        this.state.money = money;
                        if (!isStringEmpty(url)) {
                            const qrCodeDataURL = await qrcode.toDataURL(url);
                            this.setState({
                                showPayQrCode1: true,
                                qrcode: qrCodeDataURL,
                            });
                        } else {
                            this.setState({
                                showPayQrCode1: true,
                                qrcode: "",
                            });
                        }
                        this.state.contractParams = params;
                    } catch (error) {
                        console.error('Error checkAndGenPayPng:', error);
                    }
                } else {
                    this.setState({
                        showPayQrCode1: true,
                        money,
                    });
                }
            });

            window.electron.ipcRenderer.sendMessage(ChannelsVipStr, ChannelsVipGenUrlStr, productName, payMethod, contractChain);
        }
    }

    cancelPay = () => {
        this.disconnectWallet();
        this.setState({
            showPayQrCode: false,
            showPayQrCode1: false,
            cacheCkCodeUrl: "",
            productName: "",
            payMethod: "",
            contractChain: "",
            money: "",
            qrcode: "",
            walletAccount: "",
            wcProvider: null,
            etherProvider: null,
            signer: null,
        });
        this.props.cb(false);
    }

    payDone = () => {
        let productName = this.state.productName;
        let payMethod = this.state.payMethod;
        if (isStringEmpty(productName) || isStringEmpty(payMethod)) {
            message.error(langTrans("team topup check1"));
            return;
        }
        //拿核销二维码
        let listener = window.electron.ipcRenderer.on(ChannelsVipStr, async (action, url : string) => {
            if (action !== ChannelsVipCkCodeStr) return;
            listener();
            this.props.dispatch({
                type : SET_DEVICE_INFO,
                showCkCode : true,
                ckCodeType: "member",
                payParam: url,
                payMethod,
            });
            try {
                const qrCodeDataURL = await qrcode.toDataURL(url);
                this.setState({
                    showPayQrCode: true,
                    qrcode: qrCodeDataURL,
                });
            } catch (error) {
                console.error('Error generating QR code:', error);
            }
        });
        //发消息生成核销码
        window.electron.ipcRenderer.sendMessage(ChannelsVipStr, ChannelsVipCkCodeStr);
        this.setState({
            showPayWriteOff: true,
            showPay: false,
            showPayQrCode: false,
            showPayQrCode1: false,
            cacheCkCodeUrl: "",
            lodingCkCode: false,
            productName: "",
            payMethod: "",
            money: "",
            qrcode: "",
            ckCode: "",
        });
        this.props.cb(false);
    }

    payCheck = () => {
        let ckCode = this.state.ckCode;
        if (isStringEmpty(ckCode)) {
            message.error(langTrans("team topup check2"));
            return;
        }
        this.setState({lodingCkCode: true})
        //进行核销操作
        let listener = window.electron.ipcRenderer.on(ChannelsVipStr, async (action, result, myuid, expireTime : number, buyTimes) => {
            if (action !== ChannelsVipDoCkCodeStr) return;
            listener();
            if (!result) {
                message.error(langTrans("member checkout error"));
                return;
            }
            this.props.dispatch({
                type: SET_DEVICE_INFO,
                vipFlg: true, 
                uuid: myuid,
                expireTime,
                buyTimes,
                showCkCode : false,
                ckCodeType: "",
                payParam: "",
                payMethod: "",
            });

            this.setState({
                showPayWriteOff: false,
                showPayQrCode1: false,
                showPayQrCode: false,
                cacheCkCodeUrl: "",
                productName: "",
                payMethod: "",
                contractChain: "",
                money: "",
                qrcode: "",
                ckCode: "",
                lodingCkCode: false,
            });
            message.success(langFormat("member checkout success", {"date": getdayjs(expireTime).format("YYYY-MM-DD")}));
            this.props.cb(false);
        });
        //发消息进行核销
        window.electron.ipcRenderer.sendMessage(ChannelsVipStr, ChannelsVipDoCkCodeStr, ckCode);
        this.disconnectWallet();
    }

    canelCkCode = () => {
        this.setState({
            showPayWriteOff: false,
            showPayQrCode: false,
            showPayQrCode1: false,
            cacheCkCodeUrl: "",
            productName: "",
            payMethod: "",
            contractChain: "",
            money: "",
            qrcode: "",
            ckCode: "",
            lodingCkCode: false,
        });
        this.disconnectWallet();
        this.props.cb(false);
    }

    render() : ReactNode {
        return (
            <>
                <Modal
                    title={langTrans("member topup title")}
                    open={this.props.showPay}
                    onOk={this.payDone}
                    onCancel={this.cancelPay}
                    width={500}
                    footer={[
                        <Button key="back" onClick={this.cancelPay}>
                            {langTrans("member topup btn cancel")}
                        </Button>,
                        <Button key="submit" type="primary" onClick={this.payDone}>
                            {langTrans("member topup btn finish")}
                        </Button>
                    ]}
                >
                    <Flex gap="small" vertical>
                        <Form>
                            <Form.Item label={langTrans("member topup time")}>
                                {
                                this.props.userCountry === 'CN' ? 
                                <Radio.Group onChange={this.setProductName} value={this.state.productName}>
                                    <Radio value={this.props.buyTimes === 0 ? "product12" : (this.props.buyTimes === 1 ? "product13" : "product9") } >{langTrans("member topup time t1")}</Radio>
                                    <Radio value="product10">{langTrans("member topup time t2")}</Radio>
                                    <Radio value="product11">{langTrans("member topup time t3")}</Radio>
                                </Radio.Group>
                                : 
                                <Radio.Group onChange={this.setProductName} value={this.state.productName}>
                                    <Radio value="product9">{langTrans("member topup time t1")}</Radio>
                                    <Radio value="product10">{langTrans("member topup time t2")}</Radio>
                                    <Radio value="product11">{langTrans("member topup time t3")}</Radio>
                                </Radio.Group>
                                }
                            </Form.Item>
                            <Form.Item label={langTrans("member topup paymethod")}>
                                {
                                this.props.userCountry === 'CN' ? 
                                <Radio.Group onChange={this.setPayMethod} value={this.state.payMethod}>
                                    <Radio value="wxpay">{langTrans("member topup paymethod p1")}</Radio>
                                </Radio.Group>
                                : 
                                <Radio.Group onChange={this.setPayMethod} value={this.state.payMethod}>
                                    <Radio value="dollerpay">{langTrans("member topup paymethod p3")}</Radio>
                                </Radio.Group>
                                }
                            </Form.Item>
                    {this.state.payMethod === 'dollerpay' ? 
                            <Form.Item label={langTrans("member topup network")}>
                        {
                            allowedChains.map(chainId => {
                                return (
                                <Radio.Group key={chainId} onChange={this.setContractChain} value={this.state.contractChain}>
                                    <Radio value={chainId}>{supportedChains[chainId].name}</Radio>
                                </Radio.Group>
                                )
                            })
                        }
                            </Form.Item>
                    : null}
                        </Form>
                        {this.state.showPayQrCode1 ? 
                            (this.state.payMethod === 'dollerpay' ? 
                                <>
                                <p style={isStringEmpty(this.state.qrcode) ? {marginTop: 0, marginBottom: 0} : {}}>
                                {this.state.walletAccount ? 
                                    langFormat("member topup paycontent3", {
                                        "money": this.state.money,
                                        "network": supportedChains[this.state.contractChain].name,
                                        "account": this.state.walletAccount
                                    })
                                :
                                    langFormat("member topup paycontent2", {
                                        "money": this.state.money,
                                        "network": supportedChains[this.state.contractChain].name
                                    })
                                }
                                </p>
                                {!isStringEmpty(this.state.qrcode) ? <img src={ this.state.qrcode } /> : null}
                                </>
                            :<p style={{marginTop: 0, marginBottom: 0}}>{langFormat("member topup paycontent1", {
                                "money": this.state.money
                            })}</p>)
                        : null}
                    </Flex>
                </Modal>
                <Modal
                    title={langTrans("member checkout title1")}
                    open={this.state.showPayWriteOff || this.props.showPayWriteOff}
                    confirmLoading={this.state.lodingCkCode}
                    onOk={this.payCheck}
                    onCancel={this.canelCkCode}
                    width={350}
                    footer={[
                        <Button key="back" onClick={this.canelCkCode}>
                            {langTrans("member checkout btn cancel")}
                        </Button>,
                        <Button key="submit" type="primary" loading={this.state.lodingCkCode} onClick={this.payCheck}>
                            {langTrans("member checkout btn finish")}
                        </Button>
                    ]}
                >
                    <Flex gap="small" vertical>
                        <Form>
                            <Form.Item label={langTrans("member checkout form")}>
                                <TextArea 
                                    value={ this.state.ckCode }
                                    autoSize={{ minRows: 6 }}
                                    onChange={(e) => {
                                        let content = e.target.value;
                                        this.setState({ ckCode: content });
                                    }} 
                                />
                            </Form.Item>
                        </Form>
                        {this.state.showPayQrCode ? 
                        <>
                            <p>{langTrans("member checkout paycontent1")}</p>
                            {!isStringEmpty(this.state.qrcode) ? <img src={ this.state.qrcode } /> : null}
                        </>
                        : null}
                    </Flex>
                </Modal>
            </>
        )
    }
}

function mapStateToProps (state) {
    return {
        appName: state.device.appName,
        buyTimes: state.device.buyTimes,
        userCountry: state.device.userCountry,
    }
  }
  
export default connect(mapStateToProps)(PayMemberModel);