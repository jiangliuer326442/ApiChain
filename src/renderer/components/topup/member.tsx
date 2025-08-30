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
import { isStringEmpty, getdayjs } from '@rutil/index';
import { langFormat, langTrans } from '@lang/i18n';

const { TextArea } = Input;

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
            money: "",
            qrcode: "",
            ckCode: "",
            cacheCkCodeUrl: "",
            contractParams: "",
            tradeNo: "",
            selectedContractChain: "",
            wcProvider: null,
            etherProvider: null,
            signer: null,
        };
    }

    async componentDidUpdate(prevProps, prevState) {
        if (isStringEmpty(prevProps.payMethod) || isStringEmpty(prevProps.payParam) || !this.props.showPayWriteOff) {
            return;
        }
        if (prevProps.payMethod === "dollerpay") {
            if (prevProps.payParam != prevState.tradeNo) {
                let tradeNo = prevProps.payParam;
                this.state.tradeNo = tradeNo;
                let uri;
                try {
                    uri = await this.getWalletConnectUri();
                } catch (error) {
                    console.error('Error checkAndGenPayPng:', error);
                    this.canelCkCode();
                    return;
                }
                if (!isStringEmpty(uri)) {
                    const qrCodeDataURL = await qrcode.toDataURL(uri);
                    this.setState({
                        tradeNo,
                        showPayQrCode: true,
                        qrcode: qrCodeDataURL,
                    });
                } else {
                    this.setState({
                        tradeNo,
                        showPayQrCode: true,
                        qrcode: "",
                    });
                }
            }
        } else {
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
    }

    getWalletConnectUri = () => {
        return new Promise(async (resolve, reject) => {
            if (this.state.wcProvider === null) {
                let handleFlg = false;
                let wcProvider = null;
                try {
                    const { projectId, supportedChains } = contractConfig;
                    wcProvider = await EthereumProvider.init({
                        projectId,
                        chains: supportedChains,
                        showQrModal: false,
                    });
                    wcProvider.on('session_event', async (event) => {
                        console.log('Received session_request:', event);
                    });
                    wcProvider.on('display_uri', async (url) => {
                        try {
                            await resolve(url);
                        } catch (error) {
                            console.error("2222222", error)
                            this.disconnectWallet();
                            reject(error);
                        }
                    });
                    wcProvider.on('chainChanged', (chainId) => {
                        if (handleFlg) {
                            return;
                        }
                        handleFlg = true;
                        let useChainId = parseInt(chainId, 16);
                        this.state.selectedContractChain = useChainId;
                        const ethersProvider = new ethers.providers.Web3Provider(wcProvider);
                        const signer = ethersProvider.getSigner();
                        this.state.etherProvider = ethersProvider;
                        this.state.signer = signer;
                        this.state.wcProvider = wcProvider;
                        this.doWithContract();
                    });
                    await wcProvider.connect();
                } catch (error) {
                    console.error("111111", error);
                    this.disconnectWallet();
                    reject(error);
                }
            } else {
                await resolve("");
                this.state.selectedContractChain = this.state.wcProvider.chainId;
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
        const chainId = this.state.selectedContractChain;
        const contractInfo = contractConfig[contractName];
        const contractABI = contractInfo.abi;
        const contractAddress = contractInfo.address[chainId];
        let contract;
        try {
            console.log("777777");
            contract = new ethers.Contract(contractAddress, contractABI, this.state.signer);
        } catch (error) {
            console.error('sign contract error:', error);
            this.disconnectWallet();
            this.canelPay();
        }
        console.log("88888888");

        if (this.state.showPayWriteOff || this.props.showPayWriteOff) {
            let contractParamsTradeNo ;
            let currentUid;
            if (isStringEmpty(this.state.contractParams)) {
                console.log("666666666666666")
                currentUid = this.props.uid;
                contractParamsTradeNo = this.state.tradeNo;
            } else {
                console.log("77777777777");
                let contractParams = this.state.contractParams;
                let [_tmp, uid] = atob(contractParams).split("&");
                let [productName, payMethod, tradeNo] = _tmp.split(":");
                contractParamsTradeNo = tradeNo;
                currentUid = uid;
            }
            const methodName = 'getOrderReceipt';
            const params = [contractParamsTradeNo, currentUid];
            console.log("params", params);
            try {
                const ckCode = await contract[methodName](...params, {
                    gasLimit: 110000,
                    gasPrice: ethers.utils.parseUnits("1.2", "gwei"),
                });
                this.setState({ckCode});
            } catch (error) {
                message.error("未查询到核销码，请稍后再试");
            }
        } else {
            let contractParams = this.state.contractParams;
            let [_tmp, uid] = atob(contractParams).split("&");
            let [productName, payMethod, tradeNo] = _tmp.split(":");
            const methodName = 'storePayData';
            const params = [productName, tradeNo, uid];
            try {
                await contract[methodName](...params, {
                    value: ethers.utils.parseEther(this.state.money.toString()),
                    gasLimit: 110000,
                    gasPrice: ethers.utils.parseUnits("1", "gwei"),
                });
            } catch (error) {
                console.error('Error sending transaction:', error);
                this.disconnectWallet();
                this.canelPay();
            }
        }
    }

    setProductName = (e: RadioChangeEvent) => {
        this.setState({productName: e.target.value});
        this.checkAndGenPayPng(e.target.value, null);
    };

    setPayMethod = (e: RadioChangeEvent) => {
        const payMethod = e.target.value;
        this.setState({payMethod});
        this.checkAndGenPayPng(null, payMethod);
    };

    //生成支付二维码
    checkAndGenPayPng = (productName : string | null, payMethod : string | null) => {
        if (productName === null) {
            productName = this.state.productName;
        }
        if (payMethod === null) {
            payMethod = this.state.payMethod;
        }
        if (!(isStringEmpty(productName) || isStringEmpty(payMethod))) {
            //拿支付二维码生成结果
            let listener = window.electron.ipcRenderer.on(ChannelsVipStr, async (action, money, params : string) => {
                if (action !== ChannelsVipGenUrlStr) return;
                listener();
                if (payMethod === "dollerpay") {
                    try {
                        let url = await this.getWalletConnectUri();
                        if (!isStringEmpty(url)) {
                            const qrCodeDataURL = await qrcode.toDataURL(url);
                            this.setState({
                                money,
                                showPayQrCode1: true,
                                qrcode: qrCodeDataURL,
                            });
                        } else {
                            this.setState({
                                money,
                                showPayQrCode1: true,
                                qrcode: "",
                            });
                        }
                        this.state.contractParams = params;
                    } catch (error) {
                        console.error('Error checkAndGenPayPng:', error);
                    }
                } else {
                    try {
                        this.setState({
                            showPayQrCode1: true,
                            money,
                        });
                    } catch (error) {
                        console.error('Error generating QR code:', error);
                    }
                }
            });

            window.electron.ipcRenderer.sendMessage(ChannelsVipStr, ChannelsVipGenUrlStr, productName, payMethod);
        }
    }

    canelPay = () => {
        this.setState({
            showPayQrCode: false,
            showPayQrCode1: false,
            cacheCkCodeUrl: "",
            productName: "",
            payMethod: "",
            money: "",
            qrcode: "",
            wcProvider: null,
            etherProvider: null,
            signer: null,
        });
        this.disconnectWallet();
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
        let listener = window.electron.ipcRenderer.on(ChannelsVipStr, async (action, product, tradeNo, url : string) => {
            if (action !== ChannelsVipCkCodeStr) return;
            listener();
            if (payMethod === "dollerpay") {
                this.state.tradeNo = tradeNo;
                this.props.dispatch({
                    type : SET_DEVICE_INFO,
                    showCkCode : true,
                    ckCodeType: "member",
                    payParam: this.state.tradeNo,
                    payMethod,
                });
                let uri;
                try {
                    uri = await this.getWalletConnectUri();
                } catch (error) {
                    console.error('Error checkAndGenPayPng:', error);
                    this.canelPay();
                    return;
                }
                if (!isStringEmpty(uri)) {
                    const qrCodeDataURL = await qrcode.toDataURL(uri);
                    this.setState({
                        showPayQrCode: true,
                        qrcode: qrCodeDataURL,
                    });
                } else {
                    this.setState({
                        showPayQrCode: true,
                        qrcode: "",
                    });
                }
            } else {
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
            });
            this.setState({
                showPayWriteOff: false,
                showPayQrCode1: false,
                showPayQrCode: false,
                cacheCkCodeUrl: "",
                productName: "",
                payMethod: "",
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
                    onCancel={this.canelPay}
                    width={500}
                    footer={[
                        <Button key="back" onClick={this.canelPay}>
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
                        </Form>
                        {this.state.showPayQrCode1 ? 
                            (this.state.payMethod === 'dollerpay' ? 
                                <>
                                <p style={isStringEmpty(this.state.qrcode) ? {marginTop: 0, marginBottom: 0} : {}}>{langFormat("member topup paycontent2", {
                                    "money": this.state.money
                                })}</p>
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
                                <TextArea value={ this.state.ckCode } autoSize={{ minRows: 6 }}                                  
                                    onChange={(e) => {
                                        let content = e.target.value;
                                        this.setState({ ckCode: content });
                                    }} 
                                />
                            </Form.Item>
                        </Form>
                        {this.state.showPayQrCode ? 
                        <>
                            <p>{langTrans("member checkout paycontent")}</p>
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
        uid: state.device.uuid,
        buyTimes: state.device.buyTimes,
        userCountry: state.device.userCountry,
    }
  }
  
export default connect(mapStateToProps)(PayMemberModel);