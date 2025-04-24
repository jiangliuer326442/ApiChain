import { 
    Button,
    Form,
    Flex,
    Input,
    message,
    Modal, 
    Radio,
    Select,
    Tooltip,
} from 'antd';
import { RadioChangeEvent } from 'antd/lib';
import { Component, ReactNode } from 'react';
import { connect } from 'react-redux';

import { getUser, getUsers } from '@act/user';
import {
    ChannelsTeamStr, 
    ChannelsTeamTestHostStr,
    ChannelsTeamTestHostResultStr,
    ChannelsTeamSetInfoStr,
    ChannelsTeamSetInfoResultStr,
} from '@conf/channel';
import { isStringEmpty } from '@rutil/index';

class TeamModel extends Component {

    constructor(props) {
        super(props);
        this.state = {
            clientType: props.clientType,
            clientHost: props.clientHost,
            clientHostValid: false,
            teamType: "create",
            teamName: "",
            teamId: "",
        }
    }

    commitTeam = async () => {
        let user = await getUser(this.props.uid);
        let uname = user.uname;
        let users = await getUsers();
        let usersList = []
        for (const [_uid, _uname] of users) {
            usersList.push(_uid + "$$" + _uname);
        }
        let usersStr = usersList.join(",")
        if (this.state.teamType === "create") {
            this.setTeamInfoPromise(this.props.uid, uname, null, this.state.teamName, usersStr)
            .then(response => message.info(response.teamId))
            .catch(err => {
                message.error(err.message);
            })
        }
    }

    canelTeam = () => {
        this.setState({
            clientType: "",
            clientHost: "",
            teamName: "",
            teamId: "",
        });
        this.props.cb(false);
    }

    setClientType = (e: RadioChangeEvent) => {
        this.setState({clientType: e.target.value});
    };

    setTeamType = (e: RadioChangeEvent) => {
        this.setState({teamType: e.target.value});
    };

    setTeamInfoPromise = (uid, uname, teamId, teamName, users) => {
        return new Promise((resolve, reject) => {

            let addTeamSendListener = window.electron.ipcRenderer.on(ChannelsTeamStr, (action, errorMessage, retTeamId) => {
                if (action === ChannelsTeamSetInfoResultStr) {
                    addTeamSendListener();
                    if (isStringEmpty(errorMessage)) {
                        resolve({teamId: retTeamId})
                    } else {
                        reject({message: errorMessage})
                    }
                }
            });

            window.electron.ipcRenderer.sendMessage(ChannelsTeamStr, ChannelsTeamSetInfoStr, this.state.teamType, uid, uname, teamId, teamName, users);
        })
    }

    ckHostPromise = () => {
        return new Promise((resolve, reject) => {
    
            let testHostSendListener = window.electron.ipcRenderer.on(ChannelsTeamStr, (action, result) => {
                if (action === ChannelsTeamTestHostResultStr) {
                    testHostSendListener();
                    if (result == 1) {
                        resolve({})
                    } else {
                        reject({})
                    }
                }
            });
    
            if (!isStringEmpty(this.state.clientHost)) {
                window.electron.ipcRenderer.sendMessage(ChannelsTeamStr, ChannelsTeamTestHostStr, this.state.clientHost);
            }
        });
    }

    ckHostClick = async () => {
        this.ckHostPromise()
        .then(()=>{
            this.setState({clientHostValid: true});
        })
        .catch(err => {
            message.error("服务器地址连接失败");
        })
    }

    render() : ReactNode {
        return (
            <Modal
                title="客户端类型设置"
                open={this.props.showTeam}
                onOk={this.commitTeam}
                onCancel={this.canelTeam}
                width={400}
                footer={[
                    <Button key="back" onClick={this.canelTeam}>
                        取消
                    </Button>,
                    <Button key="submit" disabled={isStringEmpty(this.state.teamName) && isStringEmpty(this.state.teamId)} onClick={this.commitTeam} type="primary">
                        确定
                    </Button>
                ]}
            >
                <Form>
                    <Form.Item label={"当前版本"}>
                        <Radio.Group onChange={this.setClientType} value={this.state.clientType}>
                            <Radio value="single">单机版</Radio>
                            <Radio value="team">联网版</Radio>
                        </Radio.Group>
                    </Form.Item>
                    {this.state.clientType === "team" ? 
                    <>
                        <Form.Item label={
                                <Tooltip title="服务器地址:http://127.0.0.1:8000，仅供测试，无法确保数据不被删除，真实使用，请私有化部署服务端。私有化部署服务端教程：http://www.baidu.com/">
                                    <span>服务器</span>
                                </Tooltip>
                            }
                        >
                            <Input.Group compact style={{ display: 'flex' }}>
                                <Input value={ this.state.clientHost } onChange={ event=>this.setState({clientHost : event.target.value}) } />
                                <Button onClick={this.ckHostClick}>检测</Button>
                            </Input.Group>
                        </Form.Item>
                        {this.state.clientHostValid ? 
                        <>
                            <Form.Item label={"团队"}>
                                <Radio.Group onChange={this.setTeamType} value={this.state.teamType}>
                                    <Radio value="create">创建团队</Radio>
                                    <Radio value="join">加入团队</Radio>
                                </Radio.Group>
                            </Form.Item>
                            {this.state.teamType === "create" ? 
                            <Form.Item label={"团队名称"}>
                                <Input value={ this.state.teamName } onChange={ event=>this.setState({teamName : event.target.value}) } />
                            </Form.Item>
                            : null}
                            {this.state.teamType === "join" ? 
                            <Form.Item label={"选择团队"}>
                                <Select />
                            </Form.Item>
                            : null}
                            
                        </>
                        : null}
                    </>
                    : null}
                </Form>
            </Modal>
        )
    }

}

function mapStateToProps (state) {
    return {
      uid: state.device.uuid,
    }
}

export default connect(mapStateToProps)(TeamModel);