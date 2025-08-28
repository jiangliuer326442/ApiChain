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

const { contractName } = contractConfig;
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
            dollerPayLoading: false,
            provider: null,
            signer: null,
            connected: false,
            transactionHash: "",
        };
    }

    async componentDidUpdate(prevProps, prevState) {
        if (!isStringEmpty(prevProps.ckCodeUrl) && prevProps.ckCodeUrl != prevState.cacheCkCodeUrl) {
            let cacheCkCodeUrl = prevProps.ckCodeUrl;
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
            try {
                const { projectId, supportedChains } = contractConfig;
                let wcProvider = await EthereumProvider.init({
                    projectId,
                    chains: supportedChains,
                    showQrModal: false,
                });
                if (wcProvider.connected) {
                    resolve("");
                    return;
                }
                wcProvider.on('display_uri', async (url) => {
                    try {
                        resolve(url);
                    } catch (error) {
                        reject(error);
                    }
                });
                await wcProvider.connect();
            } catch (error) {
                reject(error);
            }
        });
    }

    connectWallet = async () => {
        let wcProvider = null;
        try {
            wcProvider = await EthereumProvider.init({
                projectId,
                chains: supportedChains,
                showQrModal: false,
            });
            wcProvider.on('display_uri', async (url) => {
                try {
                    const qrCodeDataURL = await qrcode.toDataURL(url);
                    this.setState({
                        showPayQrCode1: true,
                        qrcode: qrCodeDataURL,
                    });
                } catch (error) {
                    console.error('Error generating QR code:', error);
                }
            });
        } catch (error) {
            console.error('Error connecting to provider:', error);
            wcProvider = null;
            await this.canelPay();
        }
        if (wcProvider === null) return;
        const ethersProvider = new ethers.providers.Web3Provider(wcProvider);
        this.state.provider = ethersProvider;
        const signer = ethersProvider.getSigner();

        if (wcProvider.connected) {
            this.state.signer = signer;
            this.state.connected = true;
            this.doWithContract(wcProvider.chainId);
        } else {
            this.state.dollerPayLoading = true;
        }

        this.setState({
            signer,
            connected: true,
        });

        this.setupWalletConnectEvents(wcProvider);
    }

    disconnectWallet = async () => {
        if (this.state.provider?.provider) {
            await this.state.provider.provider.disconnect();
            this.setState({
                provider: null,
                signer: null,
                connected: false,
            });
        }
    }

    setupWalletConnectEvents = (wcProvider) => {
        // Handle connection
        wcProvider.on('connect', (payload) => {
            console.log('Wallet connected:', payload);
        });

        // Handle account changes
        wcProvider.on('accountsChanged', (accounts) => {
            console.log('Accounts changed:', accounts);
        });

        // Handle chain changes
        wcProvider.on('chainChanged', async (chainId) => {
            console.log('Chain changed:', chainId);
            if (!this.state.dollerPayLoading) return;
            this.state.dollerPayLoading = false;
            let useChainId = parseInt(chainId, 10);
            this.doWithContract(useChainId);
        });

        // Handle disconnection
        wcProvider.on('disconnect', (error, payload) => {
            if (error) {
            console.error('Disconnect error:', error);
            }
            console.log('Wallet disconnected:', payload);
        });
    }

    doWithContract = async (chainId : number) => {
        const contractInfo = contractConfig[contractName];
        const contractABI = contractInfo.abi;
        const contractAddress = contractInfo.address[chainId];
        const contract = new ethers.Contract(contractAddress, contractABI, this.state.signer);

        const getNumberMethod = "getNumber";
        const getNumberRet = await contract[getNumberMethod]();
        console.log("getNumberRet", getNumberRet);


        const methodName = 'setNumber';
        console.log("money", this.state.money);
        const params = [(this.state.money * 100000).toString()];
        console.log("params", params);
        try {
            const tx = await contract[methodName](...params);
            console.log("tx hash", tx.hash);
            this.setState({transactionHash: tx.hash});
            const receipt = await tx.wait();
            console.log('Transaction confirmed:', receipt);
        } catch (error) {
            this.canelPay();
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
            let listener = window.electron.ipcRenderer.on(ChannelsVipStr, async (action, money) => {
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
            dollerPayLoading: false,
            provider: null,
            signer: null,
            connected: false,
            transactionHash: "",
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
        let listener = window.electron.ipcRenderer.on(ChannelsVipStr, async (action, product, url : string) => {
            if (action !== ChannelsVipCkCodeStr) return;
            listener();
            this.props.dispatch({
                type : SET_DEVICE_INFO,
                showCkCode : true,
                ckCodeUrl: url,
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
                            <img src={ this.state.qrcode } />
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
        buyTimes: state.device.buyTimes,
        userCountry: state.device.userCountry,
    }
  }
  
export default connect(mapStateToProps)(PayMemberModel);