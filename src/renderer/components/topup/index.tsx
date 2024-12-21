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
} from '../../../config/channel';
import { SET_DEVICE_INFO } from '../../../config/redux';
import { isStringEmpty, getdayjs } from '../../util';

const { TextArea } = Input;

class PayModel extends Component {

    constructor(props) {
        super(props);
        this.state = {
            showPayWriteOff: false,
            showPayQrCode: false,
            lodingCkCode: false,
            productName: "",
            payMethod: "",
            money: "",
            qrcode: "",
            ckCode: "",
        };
    }

    componentDidMount(): void {
        //拿支付二维码生成结果
        window.electron.ipcRenderer.on(ChannelsVipStr, async (action, money, url) => {
            if (action !== ChannelsVipGenUrlStr) return;
            try {
                const qrCodeDataURL = await qrcode.toDataURL(url);
                this.setState({
                    showPayQrCode: true,
                    money,
                    qrcode: qrCodeDataURL,
                });
            } catch (error) {
                console.error('Error generating QR code:', error);
            }
        });
        //拿核销二维码
        window.electron.ipcRenderer.on(ChannelsVipStr, async (action, product, url) => {
            if (action !== ChannelsVipCkCodeStr) return;
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

        //进行核销操作
        window.electron.ipcRenderer.on(ChannelsVipStr, async (action, result, myuid, expireTime, buyTimes) => {
            if (action !== ChannelsVipDoCkCodeStr) return;
            if (!result) {
                message.error("核销码填写错误，核销失败");
                return;
            }
            this.props.dispatch({
                type: SET_DEVICE_INFO,
                vipFlg: true, 
                uuid: myuid,
                expireTime,
                buyTimes
            });
            this.setState({
                showPayWriteOff: false,
                showPayQrCode: false,
                productName: "",
                payMethod: "",
                money: "",
                qrcode: "",
                ckCode: "",
                lodingCkCode: false,
            });
            message.success("核销成功，尊敬的会员，您的 vip 截止日期为：" + getdayjs(expireTime).format("YYYY-MM-DD"));
        });
    }

    setProductName = (e: RadioChangeEvent) => {
        this.setState({productName: e.target.value});
        this.checkAndGenPayPng(e.target.value, null);
    };

    setPayMethod = (e: RadioChangeEvent) => {
        this.setState({payMethod: e.target.value});
        this.checkAndGenPayPng(null, e.target.value);
    };

    checkAndGenPayPng = (productName : string | null, payMethod : string | null) => {
        if (productName === null) {
            productName = this.state.productName;
        }
        if (payMethod === null) {
            payMethod = this.state.payMethod;
        }
        if (!(isStringEmpty(productName) || isStringEmpty(payMethod))) {
            window.electron.ipcRenderer.sendMessage(ChannelsVipStr, ChannelsVipGenUrlStr, productName, payMethod);
        }
    }

    canelPay = () => {
        this.setState({
            showPayQrCode: false,
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
        //发消息生成核销码
        window.electron.ipcRenderer.sendMessage(ChannelsVipStr, ChannelsVipCkCodeStr);
        this.setState({
            showPayWriteOff: true,
            showPay: false,
            showPayQrCode: false,
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
        //发消息进行核销
        window.electron.ipcRenderer.sendMessage(ChannelsVipStr, ChannelsVipDoCkCodeStr, ckCode);
    }

    canelCkCode = () => {
        this.setState({
            showPayWriteOff: false,
            showPayQrCode: false,
            productName: "",
            payMethod: "",
            money: "",
            qrcode: "",
            ckCode: "",
            lodingCkCode: false,
        });
    }

    render() : ReactNode {
        return (
            <>
                <Modal
                    title="您还不是会员，无法使用会员功能"
                    open={this.props.showPay}
                    onOk={this.payDone}
                    onCancel={this.canelPay}
                    width={350}
                    footer={[
                        <Button key="back" onClick={this.canelPay}>
                            取消支付
                        </Button>,
                        <Button key="submit" type="primary" onClick={this.payDone}>
                            支付完成
                        </Button>
                    ]}
                >
                    <Flex gap="small" vertical>
                        <Form>
                            <Form.Item label="购买时长">
                                <Radio.Group onChange={this.setProductName} value={this.state.productName}>
                                    <Radio value={this.props.buyTimes === 0 ? "product7" : (this.props.buyTimes === 1 ? "product8" : "product4") } >1 个月</Radio>
                                    <Radio value="product5">1 年</Radio>
                                    <Radio value="product6">永久</Radio>
                                </Radio.Group>
                            </Form.Item>
                            <Form.Item label="支付方式">
                                <Radio.Group onChange={this.setPayMethod} value={this.state.payMethod}>
                                    <Radio value="wxpay">微信</Radio>
                                    <Radio value="alipay">支付宝</Radio>
                                </Radio.Group>
                            </Form.Item>
                        </Form>
                        {this.state.showPayQrCode ? 
                        <>
                            <p>共需支付 { this.state.money } 元，使用 {this.state.payMethod === 'wxpay' ? "微信" : "支付宝"} 扫描以下二维码</p>
                            <img src={ this.state.qrcode } />
                        </>
                        : null}
                    </Flex>
                </Modal>
                <Modal
                    title="填写您手机上展示的核销码，进行核销"
                    open={this.state.showPayWriteOff}
                    confirmLoading={this.state.lodingCkCode}
                    onOk={this.payCheck}
                    onCancel={this.canelCkCode}
                    width={350}
                    footer={[
                        <Button key="back" onClick={this.canelCkCode}>
                            未支付
                        </Button>,
                        <Button key="submit" type="primary" loading={this.state.lodingCkCode} onClick={this.payCheck}>
                            核销支付
                        </Button>
                    ]}
                >
                    <Flex gap="small" vertical>
                        <Form>
                            <Form.Item label="核销码">
                                <TextArea value={ this.state.ckCode } autoSize={{ minRows: 6 }}                                  onChange={(e) => {
                                    let content = e.target.value;
                                    this.setState({ ckCode: content });
                                }} />
                            </Form.Item>
                        </Form>
                        {this.state.showPayQrCode ? 
                        <>
                            <p>可扫以下二维码查询您的核销码</p>
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
    }
  }
  
  export default connect(mapStateToProps)(PayModel);