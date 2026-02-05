import {  Component, ReactNode } from 'react';
import { connect } from 'react-redux';
import { 
    Button, 
    List, 
    Breadcrumb,
    Divider,
    Form,
    Input,
    Table,
    Flex, 
    Layout,
    message,
    Modal,
    Space,
    Spin,
} from 'antd';

import { getStartParams, isStringEmpty, } from '@rutil/index';
import { langTrans } from '@lang/i18n';
import {
    applyUser, 
    getApplyUsers,
    refuseUser,
    getTeamMembers,
} from '@act/team';

const { Header, Content, Footer } = Layout;

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
            teamId: "",
            applyList: [],
            memberList: [],
            columns: [{
                title: langTrans("setting member users table index1"),
                dataIndex: "uname",
                render: (uname, record) => {
                    return (
                        <Space size="middle">
                            <span>{uname} {record.uid}</span>
                            <Button type="link">{langTrans("setting member users table btn3")}</Button>
                        </Space>
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
                            <Button type="link">{langTrans("setting member users table btn1")}</Button>
                            <Button type="link">{langTrans("setting member users table btn2")}</Button>
                        </Space>
                    )
                }
            }],
        }
    }

    async componentDidMount() {
        if (isAdmin == 1) {
            this.componentGetApplyUsers();
        }
        this.componentGetTeamMembers();
    }

    componentGetTeamMembers = async () => {
        getTeamMembers(
            (isSuperAdmin && !isStringEmpty(this.state.teamId)) ? this.state.teamId : this.props.teamId
        ).then((res) => {
            this.setState({memberList: res});
        });
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
        }).catch((err) => {
            message.error(err.errorMessage);
        }).finally(() => {
            this.closeRefuseDialog();
        });
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
            {isAdmin == 1 ? 
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
                    <Divider orientation="left">{langTrans("setting member users title")}</Divider>
                    <Table rowKey={"uid"} columns={this.state.columns} dataSource={ this.state.memberList } pagination={ false } />
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
    }
}

export default connect(mapStateToProps)(TeamMember);