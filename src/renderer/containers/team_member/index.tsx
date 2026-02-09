import {  Component, ReactNode } from 'react';
import { connect } from 'react-redux';
import { 
    Button, List, Breadcrumb, Divider, Select,
    Form, Input, Table, Flex, Layout, message,
    Modal, Space, Spin, Popconfirm, Typography,
} from 'antd';

import { getStartParams, isStringEmpty } from '@rutil/index';
import { langTrans } from '@lang/i18n';
import {
    applyUser, 
    getApplyUsers,
    refuseUser,
    getTeamMembers,
    setMemberName,
    setMemberAway,
    setMemberAdmin,
    dissolveTeam,
    renameTeam,
} from '@act/team';
import { 
    ChannelsRestartAppStr,
    ChannelsTeamStr,
    ChannelsTeamListStr,
    ChannelsTeamListResultStr,
} from '@conf/channel';

const { Header, Content, Footer } = Layout;
const { Text } = Typography;

const argsObject = getStartParams();
const isAdmin = argsObject.isAdmin;
const isSuperAdmin = argsObject.isSuperAdmin;

class TeamMember extends Component {

    constructor(props) {
        super(props);
        this.state = {
            initLoading: true,
            showApproveDialog: false,
            approveDialogLoading: false,
            approveNickName: "",
            approveUid: "",
            showRefuseDialog: false,
            refuseDialogLoading: false,
            refuseReason: "",
            refuseUid: "",
            teamId: props.teamId,
            teams: [],
            applyList: [],
            memberList: [],
            columns: [{
                title: langTrans("setting member users table index1"),
                dataIndex: "uname",
                render: (uname, record) => {
                    return (
                        <Text 
                            copyable={{text: record.uid}}
                            editable={((isAdmin == 1) || (isSuperAdmin == 1) || (this.props.uid == record.uid)) ?  { onChange: (newUserName) => {
                                this.setMemberUname(record.uid, newUserName);
                            } } : false}
                        >{uname}</Text>
                    )
                }
            },{
                title: langTrans("setting member users table index2"),
                dataIndex: "registerTime",
            },{
                title: langTrans("setting basic table index6"),
                dataIndex: "operator",
                render: (_, record) => {
                    return (
                        <Space size="middle">
                        {(((isAdmin == 1) || (isSuperAdmin == 1)) && record.uid != this.props.uid) ? 
                            <Popconfirm
                              title={langTrans("setting member users table btn1")}
                              description={langTrans("setting member users table confirm1")}
                              onConfirm={() => this.setMemberAdmin(record.uid)}
                              >
                                <Button type="text" danger>{langTrans("setting member users table btn1")}</Button>
                            </Popconfirm>
                        : null}
                        {(((isAdmin == 1) || (isSuperAdmin == 1)) || record.uid == this.props.uid) ? 
                            <Popconfirm
                                title={langTrans("setting member users table btn2")}
                                description={langTrans("setting member users table confirm2")}
                                onConfirm={() => this.setMemberAway(record.uid)}
                            >
                                <Button type="text" danger>{langTrans("setting member users table btn2")}</Button>
                            </Popconfirm>
                        : null}
                        </Space>
                    )
                }
            }],
            oldTeamName: "",
            newTeamName: "",
        }
    }

    async componentDidMount() {
        if (isAdmin == 1) {
            this.componentGetApplyUsers();
        }
        this.componentGetTeamMembers();
        this.getTeams();
    }

    componentGetTeamMembers = async () => {
        getTeamMembers(this.state.teamId).then((res) => {
            this.setState({memberList: res});
        });
    }

    setMemberAway = async (memberUid : string) => {
        setMemberAway(this.state.teamId, memberUid).then((response) => {
            //移出自己，应该让应用重启
            if (memberUid == this.props.uid) {
                window.electron.ipcRenderer.sendMessage(ChannelsRestartAppStr);
            } else {
                this.componentGetTeamMembers();
            }
        }).catch((err) => {
            message.error(err.errorMessage);
        })
    }

    setMemberAdmin = async (memberUid : string) => {
        setMemberAdmin(this.state.teamId, memberUid).then((response) => {
            //对方是管理员，自己则退出管理员资格，重启应用
            window.electron.ipcRenderer.sendMessage(ChannelsRestartAppStr);
        }).catch((err) => {
            message.error(err.errorMessage);
        })
    }

    setMemberUname = async (memberUid : string, memberUname : string) => {
        setMemberName(this.state.teamId, memberUid, memberUname).then((response) => {
            this.componentGetTeamMembers();
        }).catch((err) => {
            message.error(err.errorMessage);
        })
    }

    componentGetApplyUsers = async () => {
        getApplyUsers().then((res) => {
            const results = Array.isArray(res) ? res : [];
            this.setState({
                initLoading: false,
                applyList: results,
            });
        });
    }

    showApproveDialog = (uid, uname) => {
        this.setState({
            showApproveDialog: true,
            approveDialogLoading: false,
            approveNickName: uname,
            approveUid: uid,
        });
    }

    handleTeamChange = (newTeamId) => {
        this.state.teamId = newTeamId;
        let oldTeamName =this.state.teams.find(item => item.value === this.state.teamId) ? this.state.teams.find(item => item.value === this.state.teamId).label : "";
        this.setState({
            oldTeamName,
            newTeamName: oldTeamName,
        });
        this.componentGetTeamMembers();
    }

    getTeams = async () => {
        this.teamListPromise()
        .then((response) => {
            this.state.teams = response.teams.map(item => ({
                value: item.id,
                label: item.name
            }));
            this.handleTeamChange(this.state.teamId);
        })
        .catch(err => {
            message.error(err.errorMessage);
        })
    }

    teamListPromise = () => {
        return new Promise((resolve, reject) => {
    
            let testTeamListListener = window.electron.ipcRenderer.on(ChannelsTeamStr, (action, errorMessage, teams) => {
                if (action === ChannelsTeamListResultStr) {
                    testTeamListListener();
                    if (isStringEmpty(errorMessage)) {
                        resolve({teams})
                    } else {
                        reject({errorMessage})
                    }
                }
            });

            window.electron.ipcRenderer.sendMessage(ChannelsTeamStr, ChannelsTeamListStr);
        });
    }

    closeApproveDialog = () => {
        this.setState({
            showApproveDialog: false,
            approveDialogLoading: false,
            approveNickName: "",
            approveUid: "",
        });
    }

    handleApprove = () => {
        this.setState({
            approveDialogLoading: true,
        });
        applyUser(this.state.approveUid, this.state.approveNickName).then((response) => {
            this.componentGetApplyUsers();
            this.componentGetTeamMembers();
        }).catch((err) => {
            message.error(err.errorMessage);
        }).finally(() => {
            this.closeApproveDialog();
        });
    }

    showRefuseDialog = (uid) => {
        this.setState({
            showRefuseDialog: true,
            refuseDialogLoading: false,
            refuseUid: uid,
        });
    }

    closeRefuseDialog = () => {
        this.setState({
            showRefuseDialog: false,
            refuseDialogLoading: false,
            refuseReason: "",
            refuseUid: "",
        });
    }

    handleRefuse = () => {
        this.setState({
            refuseDialogLoading: true,
        });
        refuseUser(this.state.refuseUid, this.state.refuseReason).then((response) => {
            this.componentGetApplyUsers();
            this.componentGetTeamMembers();
        }).catch((err) => {
            message.error(err.errorMessage);
        }).finally(() => {
            this.closeRefuseDialog();
        });
    }

    dissolveTeam = () => {
        dissolveTeam(this.state.teamId).then((response) => {
            //解散后重启应用
            window.electron.ipcRenderer.sendMessage(ChannelsRestartAppStr);
        }).catch((err) => {
            message.error(err.errorMessage);
        });
    }

    renameTeam = () => {
        let newTeanName = this.state.newTeamName.trim();
        if ((newTeanName != this.state.oldTeamName) && ((isSuperAdmin == 1) || (isAdmin == 1))) {
            renameTeam(this.state.teamId, newTeanName).then((response) => {
                //重命名后重启应用
                window.electron.ipcRenderer.sendMessage(ChannelsRestartAppStr);
            }).catch((err) => {
                message.error(err.errorMessage);
            });
        }
    }

    render(): ReactNode {
        return (
            <Layout>
                <Header style={{ padding: 0 }}>
                {langTrans("nav setting member")}
                </Header>
                <Content style={{ padding: '0 16px' }}>
                    <Flex justify="space-between" align="center">
                        <Breadcrumb style={{ margin: '16px 0' }} items={[{ title: langTrans("env bread1")}, { title: langTrans("nav setting member") }]} />
                    </Flex>
            {(isAdmin == 1 && this.state.applyList.length > 0) ? 
                <>
                    <Modal
                        title={langTrans("setting member apply table btn1 box title")}
                        open={this.state.showApproveDialog}
                        onOk={this.handleApprove}
                        onCancel={this.closeApproveDialog}
                    >
                        <Spin spinning={this.state.approveDialogLoading}>
                            <Form>
                                <Form.Item label={langTrans("setting member apply table btn1 box form1")}>
                                    <Input value={ this.state.approveNickName } onChange={ event=>this.setState({approveNickName : event.target.value}) } />
                                </Form.Item>
                            </Form>
                        </Spin>
                    </Modal>
                    <Modal
                        title={langTrans("setting member apply table btn2 box title")}
                        open={this.state.showRefuseDialog}
                        onOk={this.handleRefuse}
                        onCancel={this.closeRefuseDialog}
                    >
                        <Spin spinning={this.state.refuseDialogLoading}>
                            <Form>
                                <Form.Item label={langTrans("setting member apply table btn2 box form1")}>
                                    <Input value={ this.state.refuseReason } onChange={ event=>this.setState({refuseReason : event.target.value}) } />
                                </Form.Item>
                            </Form>
                        </Spin>
                    </Modal>
                    <Divider orientation="left">{langTrans("setting member apply title")}</Divider>
                    <div
                        style={{paddingLeft: 58, paddingRight: 58}}
                    >
                        <List
                            className="demo-loadmore-list"
                            loading={this.state.initLoading}
                            itemLayout="horizontal"
                            dataSource={this.state.applyList}
                            renderItem={(item) => (
                                <List.Item
                                actions={[
                                    <Button 
                                        type='link'
                                        onClick={()=>this.showApproveDialog(item.uid, item.uname)}
                                        >{langTrans("setting member apply table btn1")}</Button>, 
                                    <Button 
                                        type='text' 
                                        onClick={()=>this.showRefuseDialog(item.uid)}
                                        danger
                                        >{langTrans("setting member apply table btn2")}</Button>
                                ]}
                                >
                                    <List.Item.Meta
                                        title={item.uname}
                                        description={item.applyContent}
                                    />
                                    <div>{item.applyTime}</div>
                                </List.Item>
                            )}
                        />
                    </div>
                </>
            : null}
                    <Divider orientation="left">
                        <span>{langTrans("setting member users title")}</span>
                    </Divider>
                    <Table rowKey={"uid"} columns={this.state.columns} dataSource={ this.state.memberList } pagination={ false } />
                    <Form
                        labelCol={{ span: 5 }}
                        wrapperCol={{ span: 14 }}
                        style={{width: 800, marginTop: 40}}
                    >
                        <Form.Item
                            label={langTrans("setting member team select")}
                        >
                            <Select 
                                options={this.state.teams} 
                                value={this.state.teamId} 
                                onChange={this.handleTeamChange} 
                                disabled={ !(isSuperAdmin == 1) }
                                style={{width: 184}}
                            />
                        </Form.Item>
                        <Form.Item
                            label={langTrans("setting member team name")}
                        >
                        {((isSuperAdmin == 1) || (isAdmin == 1)) ? 
                            <Space.Compact style={{ width: '100%' }}>
                                <Input value={this.state.newTeamName} onChange={(e) => this.setState({newTeamName: e.target.value})} />
                                <Button type="link" onClick={this.renameTeam}>{langTrans("iterator edit btn")}</Button>
                            </Space.Compact>
                        :
                            <Input value={this.state.newTeamName} readOnly />
                        }

                        </Form.Item>
                        <Form.Item
                            label={langTrans("setting member team operator")}
                        >
                            <Popconfirm
                                title={langTrans("setting member team confirm1")}
                                onConfirm={this.dissolveTeam}
                            >
                                <Button 
                                    variant="outlined" 
                                    color="primary" danger>
                                    {langTrans("setting member team operator1")}
                                </Button>
                            </Popconfirm>
                        </Form.Item>
                    </Form>
                </Content>
                <Footer style={{ textAlign: 'center' }}>
                ApiChain ©{new Date().getFullYear()} Created by Mustafa Fang
                </Footer>
            </Layout>
        )
    }

}

function mapStateToProps (state) {
    return {
        teamId: state.device.teamId,
        uid: state.device.uuid,
    }
}

export default connect(mapStateToProps)(TeamMember);