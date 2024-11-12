import { Component, ReactNode } from 'react';
import { connect } from 'react-redux';
import { 
    Layout, List, Switch, Typography, Modal, 
    Button, Input, Form, Radio, Flex, message,
    Divider, 
    Table
} from "antd";
import { RadioChangeEvent } from 'antd/lib';
import { cloneDeep } from 'lodash';
import qrcode from 'qrcode';

import { 
    GLobalPort,
    VipTagDoc,
    VipTagMockServer,
    ChannelsMarkdownAccessSetStr,
    ChannelsMockServerAccessSetStr,
    ChannelsMarkdownStr, 
    ChannelsMockServerStr,
    ChannelsMarkdownAccessSetResultStr,
    ChannelsMarkdownAccessGetStr,
    ChannelsVipStr,
    ChannelsVipGenUrlStr, 
    ChannelsVipCkCodeStr,
    ChannelsVipDoCkCodeStr,
    ChannelsMockServerAccessGetStr,
    ChannelsMockServerAccessSetResultStr,
} from '../../../config/global_config';
import { 
    TABLE_MICRO_SERVICE_FIELDS, 
    TABLE_VERSION_ITERATION_FIELDS 
} from '../../../config/db';
import { SET_DEVICE_INFO } from '../../../config/redux';
import { isStringEmpty, getdayjs } from '../../util';

const { TextArea } = Input;
const { Header, Content, Footer } = Layout;
const { Text } = Typography;

let prj_label = TABLE_MICRO_SERVICE_FIELDS.FIELD_LABEL;
let prj_remark = TABLE_MICRO_SERVICE_FIELDS.FIELD_REMARK;

let version_iterator_uuid = TABLE_VERSION_ITERATION_FIELDS.FIELD_UUID;
let version_iterator_projects = TABLE_VERSION_ITERATION_FIELDS.FIELD_PROJECTS;

class Vip extends Component {

    constructor(props) {
        super(props);

        let iteratorId = props.match.params.id;
        let docUrl = props.html.replace("localhost", props.ip) + "#/version_iterator_doc/" + iteratorId;

        this.state = {
            iteratorId,
            list: [{
                "key": VipTagDoc,
                "title": "迭代文档",
                "description_unchecked": "分享一个网页，让前端&测试随时看到你迭代文档的最新改动",
                "description_checked": <Text copyable={{text: docUrl}}>迭代文档 url 点击复制后可用浏览器打开</Text>
            },{
                "key": VipTagMockServer,
                "title": "mock服务器",
                "description_unchecked": "接口先行，让前端先调用你的 mock 接口，返回 mock 数据",
                "description_checked": "前端可调用你下面这个迭代的 mock url 地址，返回 mock 数据"
            }],
            showPay: false,
            showPayWriteOff: false,
            showPayQrCode: false,
            lodingCkCode: false,
            productName: "",
            payMethod: "",
            money: "",
            qrcode: "",
            ckCode: "",
            columns: [{
                title: "服务名",
                dataIndex: "serviceName",
            },{
                title: "mock 地址",
                dataIndex: "mockUrl",
            }],
        };
        this.state.checkFlg = {};
        this.state.checkFlg[VipTagDoc] = false;
        this.state.checkFlg[VipTagMockServer] = false;
        let projects = this.props.versionIterators.find(row => row[version_iterator_uuid] === iteratorId)[version_iterator_projects];
        let mockServers = [];
        for (let project of projects) {
            let serviceName = this.props.prjs.find(row => row[prj_label] === project)[prj_remark];
            let url = "http://" + props.ip + ":" + GLobalPort + "/mockserver/" + iteratorId + "/" + project + "/";
            let mockUrl = <Text copyable={{text: url}}>{ url }</Text>
            mockServers.push({key: project,serviceName, mockUrl});
        }
        this.state.mockServers = mockServers;
    }

    componentDidMount(): void {
        if (this.props.vipFlg) {
            //查询当前迭代是否开启文档共享
            window.electron.ipcRenderer.sendMessage(ChannelsMarkdownStr, ChannelsMarkdownAccessGetStr, this.state.iteratorId);
            //查询当前迭代是否开启 mock 服务器
            window.electron.ipcRenderer.sendMessage(ChannelsMockServerStr, ChannelsMockServerAccessGetStr, this.state.iteratorId);
        }
        //拿当前迭代共享结果
        window.electron.ipcRenderer.on(ChannelsMarkdownStr, async (action, iteratorId, access) => {
            if (action !== ChannelsMarkdownAccessSetResultStr) return;
            if (iteratorId !== this.state.iteratorId) return;
            let checkFlg = cloneDeep(this.state.checkFlg);
            checkFlg[VipTagDoc] = access;
            this.setState({checkFlg})
        });
        //拿当前mock服务器共享结果
        window.electron.ipcRenderer.on(ChannelsMockServerStr, async (action, iteratorId, access) => {
            if (action !== ChannelsMockServerAccessSetResultStr) return;
            if (iteratorId !== this.state.iteratorId) return;
            let checkFlg = cloneDeep(this.state.checkFlg);
            checkFlg[VipTagMockServer] = access;
            this.setState({checkFlg})
        });
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
        window.electron.ipcRenderer.on(ChannelsVipStr, async (action, result, expireTime) => {
            if (action !== ChannelsVipDoCkCodeStr) return;
            if (!result) {
                message.error("核销码填写错误，核销失败");
                return;
            }
            this.props.dispatch({
                type: SET_DEVICE_INFO,
                vipFlg: true, 
                expireTime
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

    setChecked = (key : string, checked : boolean) => {
        if (this.props.vipFlg || !checked) {
            if (key === VipTagDoc) {
                window.electron.ipcRenderer.sendMessage(ChannelsMarkdownStr, ChannelsMarkdownAccessSetStr, this.state.iteratorId, checked);
            } else if (key === VipTagMockServer) {
                window.electron.ipcRenderer.sendMessage(ChannelsMockServerStr, ChannelsMockServerAccessSetStr, this.state.iteratorId, checked);
            }
        } else {
            this.setState({
                showPay: true,
                showPayQrCode: false,
            });
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
            showPay: false,
            showPayQrCode: false,
            productName: "",
            payMethod: "",
            money: "",
            qrcode: "",
        });
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

    render() : ReactNode {
        return (
            <Layout>
                <Header style={{ padding: 0 }}>
                    会员功能 
                </Header>
                <Content style={{ margin: '0 16px' }}>
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
                    <Modal
                        title="您还不是会员，无法使用会员功能"
                        open={this.state.showPay}
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
                                        <Radio value="product1">1 个月</Radio>
                                        <Radio value="product2">1 年</Radio>
                                        <Radio value="product3">永久</Radio>
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
                    <List itemLayout="horizontal" dataSource={this.state.list} renderItem={(item) => (
                        <List.Item
                            actions={[<Switch checked={this.state.checkFlg[item.key]} onChange={checked => this.setChecked(item.key, checked)} />]}
                        >
                            <>
                                <List.Item.Meta
                                    title={item.title}
                                    description={ this.state.checkFlg[item.key] ? item['description_checked'] : item['description_unchecked']}
                                />
                            </>
                        </List.Item>
                    )} />
                    <Divider>mock 服务器地址</Divider>
                    <Table columns={this.state.columns} dataSource={ this.state.mockServers } pagination={ false } />
                </Content>
                <Footer style={{ textAlign: 'center' }}>
                ApiChain ©{new Date().getFullYear()} Created by 方海亮
                </Footer>
            </Layout>
        );
    }

}

function mapStateToProps (state) {
    return {
        html: state.device.html,			
        ip: state.device.ip,
        vipFlg: state.device.vipFlg,
        prjs: state.prj.list,
        versionIterators : state['version_iterator'].list,
    }
  }
  
  export default connect(mapStateToProps)(Vip);