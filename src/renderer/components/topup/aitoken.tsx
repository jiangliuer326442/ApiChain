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
import { langTrans, langFormat } from '@lang/i18n';
import { isStringEmpty } from '@rutil/index';

class PayAiTokenModel extends Component {
    constructor(props) {
        super(props);
        this.state = {
            showPayQrCode1: false,
            lodingCkCode: false,
            productName: "",
            payMethod: "",
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

    render(): ReactNode {
        return (
            <>
                <Modal
                    title={langTrans("aitoken topup title")}
                    open={this.props.showPay}
                    onCancel={this.cancelPay}
                    width={500}
                    footer={[
                        <Button key="back" onClick={this.cancelPay}>
                            {langTrans("member topup btn cancel")}
                        </Button>,
                    ]}
                >
                    <Flex gap="small" vertical>
                        <Form>
                            <Form.Item label={langTrans("aitoken topup tokens")}>
                                <Radio.Group onChange={this.setProductName} value={this.state.productName}>
                                    <Radio value="token1">{langTrans("aitoken topup tokens t1")}</Radio>
                                    <Radio value="token2">{langTrans("aitoken topup tokens t2")}</Radio>
                                    <Radio value="token3">{langTrans("aitoken topup tokens t3")}</Radio>
                                </Radio.Group>
                            </Form.Item>
                            <Form.Item label={langTrans("member topup paymethod")}>
                                {
                                IS_CHINA_BUILD || this.props.userCountry === 'CN' ? 
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
        );
    }
}

function mapStateToProps (state) {
    return {
        appName: state.device.appName,
        userCountry: state.device.userCountry,
    }
  }
  
export default connect(mapStateToProps)(PayAiTokenModel);