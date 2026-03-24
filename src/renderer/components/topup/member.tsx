import { Component, ReactNode } from 'react';
import { connect } from 'react-redux';
import { 
    Modal, Button, Form, Radio, Flex,
} from "antd";
import { RadioChangeEvent } from 'antd/lib';

import {
    ChannelsVipStr,
    ChannelsVipGenUrlStr, 
} from '@conf/channel';
import { isStringEmpty } from '@rutil/index';
import { langFormat, langTrans } from '@lang/i18n';

class PayMemberModel extends Component {

    constructor(props) {
        super(props);
        this.state = {
            showPayQrCode1: false,
            lodingCkCode: false,
            productName: "",
            payMethod: "",
            tradeNo: "",
            money: "",
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
                this.setState({
                    showPayQrCode1: true,
                    money,
                });
            });

            window.electron.ipcRenderer.sendMessage(ChannelsVipStr, ChannelsVipGenUrlStr, productName, payMethod);
        }
    }

    cancelPay = () => {
        this.setState({
            showPayQrCode1: false,
            cacheCkCodeUrl: "",
            productName: "",
            payMethod: "",
            money: "",
            walletAccount: "",
            wcProvider: null,
            etherProvider: null,
            signer: null,
        });
        this.props.cb(false);
    }

    canelCkCode = () => {
        this.setState({
            showPayQrCode1: false,
            cacheCkCodeUrl: "",
            productName: "",
            payMethod: "",
            money: "",
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
                                (IS_CHINA_BUILD || this.props.userCountry === 'CN') ? 
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
                                (IS_CHINA_BUILD || this.props.userCountry === 'CN') ? 
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
                    ((IS_CHINA_BUILD || this.state.payMethod == "wxpay") ? 
                        <p style={{marginTop: 0, marginBottom: 0}}>{langFormat("member topup paycontent1", {
                            "money": this.state.money
                        })}</p>
                    :
                        <p style={{marginTop: 0, marginBottom: 0}}>{langFormat("member topup paycontent2", {
                            "money": this.state.money
                        })}</p>
                    )
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