import { Component, ReactNode } from 'react';
import { connect } from 'react-redux';
import { 
    Layout, List, Switch, Typography, Divider, Table
} from "antd";

import { cloneDeep } from 'lodash';

import { 
    GLobalPort,
    VipTagDoc,
    VipTagMockServer,
} from '@conf/global_config';
import {
    ChannelsMarkdownAccessSetStr,
    ChannelsMockServerAccessSetStr,
    ChannelsMarkdownStr, 
    ChannelsMockServerStr,
    ChannelsMarkdownAccessSetResultStr,
    ChannelsMarkdownAccessGetStr,
    ChannelsMockServerAccessGetStr,
    ChannelsMockServerAccessSetResultStr,
} from '@conf/channel';
import { 
    TABLE_MICRO_SERVICE_FIELDS, 
    TABLE_VERSION_ITERATION_FIELDS,
    TABLE_USER_FIELDS,
} from '@conf/db';
import PayModel from '@comp/topup';
import { getUser } from '@act/user';
import { langTrans } from '@lang/i18n';

const { Header, Content, Footer } = Layout;
const { Text } = Typography;

let field_user_ip = TABLE_USER_FIELDS.FIELD_IP;

let prj_label = TABLE_MICRO_SERVICE_FIELDS.FIELD_LABEL;
let prj_remark = TABLE_MICRO_SERVICE_FIELDS.FIELD_REMARK;

let version_iterator_uuid = TABLE_VERSION_ITERATION_FIELDS.FIELD_UUID;
let version_iterator_projects = TABLE_VERSION_ITERATION_FIELDS.FIELD_PROJECTS;

class Vip extends Component {

    constructor(props) {
        super(props);

        let iteratorId = props.match.params.id;

        this.state = {
            iteratorId,
            list: [],
            showPay: false,
            columns: [{
                title: langTrans("member mock table1"),
                dataIndex: "serviceName",
            },{
                title: langTrans("member mock table2"),
                dataIndex: "mockUrl",
            }],
            ip: "",
            mockServers: [],
            queryMarkdownAccessStatusListener: null,
            queryMockserverAccessStatusListener: null,
        };
        this.state.checkFlg = {};
        this.state.checkFlg[VipTagDoc] = false;
        this.state.checkFlg[VipTagMockServer] = false;
    }

    componentWillUnmount() {
        if (this.state.queryMarkdownAccessStatusListener != null) {
            this.state.queryMarkdownAccessStatusListener();
        }
        if (this.state.queryMockserverAccessStatusListener != null) {
            this.state.queryMockserverAccessStatusListener();
        }
    }

    componentDidMount(): void {
        if (this.props.vipFlg) {
            this.queryMarkdownAccessStatus(this.state.iteratorId).then(response => {
                let checkFlg = cloneDeep(this.state.checkFlg);
                checkFlg[VipTagDoc] = response.access;
                this.setState({checkFlg})
            });
            this.queryMockServerAccessStatus(this.state.iteratorId).then(response => {
                let checkFlg = cloneDeep(this.state.checkFlg);
                checkFlg[VipTagMockServer] = response.access;
                this.setState({checkFlg})
            });
        }
        getUser(this.props.uuid).then(async user => {
            let ip = user[field_user_ip];
            let docUrl = this.props.html.replace("localhost", ip) + "#/version_iterator_doc/" + this.state.iteratorId;
            let projects = this.props.versionIterators.find(row => row[version_iterator_uuid] === this.state.iteratorId)[version_iterator_projects];
            let mockServers = [];
            for (let project of projects) {
                let serviceName = this.props.prjs.find(row => row[prj_label] === project)[prj_remark];
                let url = "http://" + ip + ":" + GLobalPort + "/mockserver/" + this.state.iteratorId + "/" + project + "/";
                let mockUrl = <Text copyable={{text: url}}>{ url }</Text>
                mockServers.push({key: project,serviceName, mockUrl});
            }

            this.setState({
                ip,
                mockServers,
                list: [{
                    "key": VipTagDoc,
                    "title": langTrans("member func1 title") ,
                    "description_unchecked": langTrans("member func1 desc"),
                    "description_checked": <Text copyable={{text: docUrl}}>{langTrans("member func1 desc2")}</Text>
                },{
                    "key": VipTagMockServer,
                    "title": langTrans("member func2 title"),
                    "description_unchecked": langTrans("member func2 desc"),
                    "description_checked": langTrans("member func2 desc2")
                }],
            })
        })
    }

    //查询当前迭代是否开启mock服务端共享
    queryMockServerAccessStatus = (iteratorId : string) => {
        return new Promise((resolve, reject) => {
            //拿当前mock服务器共享结果
            this.state.queryMockserverAccessStatusListener = window.electron.ipcRenderer.on(ChannelsMockServerStr, async (action, iteratorId, access) => {
                if (action !== ChannelsMockServerAccessSetResultStr) return;
                if (iteratorId !== this.state.iteratorId) return;
                resolve( {access} );
            });
            window.electron.ipcRenderer.sendMessage(ChannelsMockServerStr, ChannelsMockServerAccessGetStr, iteratorId);
        });
    }

    //查询当前迭代是否开启文档共享
    queryMarkdownAccessStatus = (iteratorId : string) => {
        return new Promise((resolve, reject) => {
            //拿当前迭代共享结果
            this.state.queryMarkdownAccessStatusListener = window.electron.ipcRenderer.on(ChannelsMarkdownStr, async (action, retIteratorId, access) => {
                if (action !== ChannelsMarkdownAccessSetResultStr) return;
                if (iteratorId !== retIteratorId) return;
                resolve( {access} );
            });
            window.electron.ipcRenderer.sendMessage(ChannelsMarkdownStr, ChannelsMarkdownAccessGetStr, iteratorId);
        });
    }

    setChecked = (key : string, checked : boolean) => {
        if (this.props.vipFlg || !checked) {
            if (key === VipTagDoc) {
                window.electron.ipcRenderer.sendMessage(ChannelsMarkdownStr, ChannelsMarkdownAccessSetStr, this.state.iteratorId, checked);
                this.queryMarkdownAccessStatus(this.state.iteratorId).then(response => {
                    let checkFlg = cloneDeep(this.state.checkFlg);
                    checkFlg[VipTagDoc] = response.access;
                    this.setState({checkFlg})
                })
            } else if (key === VipTagMockServer) {
                window.electron.ipcRenderer.sendMessage(ChannelsMockServerStr, ChannelsMockServerAccessSetStr, this.state.iteratorId, checked);
                this.queryMockServerAccessStatus(this.state.iteratorId).then(response => {
                    let checkFlg = cloneDeep(this.state.checkFlg);
                    checkFlg[VipTagMockServer] = response.access;
                    this.setState({checkFlg})
                })
            }
        } else {
            this.setState({
                showPay: true,
            });
        }
    }

    render() : ReactNode {
        return (
            <Layout>
                <Header style={{ padding: 0 }}>
                    {langTrans("member title")} 
                </Header>
                <Content style={{ padding: '0 16px' }}>
                    <PayModel showPay={this.state.showPay} cb={showPay => this.setState({showPay})} />
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
                    <Divider>{langTrans("member mock title")}</Divider>
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
        uuid: state.device.uuid,
        vipFlg: state.device.vipFlg,
        prjs: state.prj.list,
        versionIterators : state['version_iterator'].list,
    }
  }
  
  export default connect(mapStateToProps)(Vip);