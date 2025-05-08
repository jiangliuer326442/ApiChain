import { Component, ReactNode } from 'react';
import { connect } from 'react-redux';
import { 
    Modal, Button, Form, Radio, Input, Flex, message,
} from "antd";
import { RadioChangeEvent } from 'antd/lib';
import qrcode from 'qrcode';

import {
    ChannelsVipStr,
    ChannelsVipGenUrlStr, 
    ChannelsVipCkCodeStr,
    ChannelsVipDoCkCodeStr,
} from '@conf/channel';
import { SET_DEVICE_INFO } from '@conf/redux';
import { isStringEmpty, getdayjs } from '@rutil/index';
import { langFormat, langTrans } from '@lang/i18n';

const { TextArea } = Input;

class PayModel extends Component {

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

    setProductName = (e: RadioChangeEvent) => {
        this.setState({productName: e.target.value});
        this.checkAndGenPayPng(e.target.value, null);
    };

    setPayMethod = (e: RadioChangeEvent) => {
        this.setState({payMethod: e.target.value});
        this.checkAndGenPayPng(null, e.target.value);
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
            let listener = window.electron.ipcRenderer.on(ChannelsVipStr, async (action, money, url) => {
                if (action !== ChannelsVipGenUrlStr) return;
                listener();
                try {
                    const qrCodeDataURL = await qrcode.toDataURL(url);
                    this.setState({
                        showPayQrCode1: true,
                        money,
                        qrcode: qrCodeDataURL,
                    });
                } catch (error) {
                    console.error('Error generating QR code:', error);
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
        });
        this.props.cb(false);
    }

    payDone = () => {
        let productName = this.state.productName;
        let payMethod = this.state.payMethod;
        if (isStringEmpty(productName) || isStringEmpty(payMethod)) {
            message.error("请选择购买时长和支付方式");
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
            message.error("请填写核销码");
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
        this.props.cb(false);
    }

    render() : ReactNode {
        let payTools = "";
        if (this.state.payMethod === 'wxpay') {
            payTools = langTrans("member topup equipment e1");
        } else if (this.state.payMethod === 'alipay') {
            payTools = langTrans("member topup equipment e2");
        } else if (this.state.payMethod === 'dollerpay') {
            payTools = langTrans("member topup equipment e3");
        }
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
                                    <Radio value="alipay">{langTrans("member topup paymethod p2")}</Radio>
                                </Radio.Group>
                                : 
                                <Radio.Group onChange={this.setPayMethod} value={this.state.payMethod}>
                                    <Radio value="dollerpay">{langTrans("member topup paymethod p3")}</Radio>
                                </Radio.Group>
                                }
                            </Form.Item>
                        </Form>
                        {this.state.showPayQrCode1 ? 
                        <>
                            <p>{langFormat("member topup paycontent", {
                                "money": this.state.money,
                                "unit": this.state.payMethod === 'dollerpay' ? '$' : '￥',
                                "equipment": payTools
                            })}</p>
                            <img src={ this.state.qrcode } />
                        </>
                        : null}
                    </Flex>
                </Modal>
                <Modal
                    title={langTrans("member checkout title")}
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
  
export default connect(mapStateToProps)(PayModel);