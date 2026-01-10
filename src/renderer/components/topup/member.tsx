import { Component, ReactNode } from 'react';
import { connect } from 'react-redux';
import { 
    Modal, Button, Form, Radio, Input, Flex, message,
} from "antd";
import { RadioChangeEvent } from 'antd/lib';

import {
    ChannelsVipStr,
    ChannelsVipGenUrlStr, 
    ChannelsVipDoCkCodeStr,
} from '@conf/channel';
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
                this.setState({
                    showPayQrCode1: true,
                    money,
                });
            });

            window.electron.ipcRenderer.sendMessage(ChannelsVipStr, ChannelsVipGenUrlStr, productName, payMethod, contractChain);
        }
    }

    cancelPay = () => {
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
        this.props.cb(false);
    }

    render() : ReactNode {
        return (
            <>
                <Modal
                    title={langTrans("member topup title")}
                    open={this.props.showPay}
                    onCancel={this.cancelPay}
                    width={500}
                    footer={[
                        <Button key="back" onClick={this.cancelPay}>
                            {langTrans("member topup btn cancel")}
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
                            <p style={{marginTop: 0, marginBottom: 0}}>{langFormat("member topup paycontent1", {
                                "money": this.state.money
                            })}</p>
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