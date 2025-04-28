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
import IDBExportImport from 'indexeddb-export-import';

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
            clientType: "",
            clientHost: "",
            clientHostValid: false,
            teamType: "create",
            teamName: "",
            teamId: "",
            teams: [],
            networkIng: false,
        }
    }

    commitTeam = () => {
        if (this.state.networkIng) {
            return;
        }
        const idbDatabase = window.db.backendDB();
        IDBExportImport.exportToJsonString(idbDatabase, async (err, dbJson) => {
            if (err) {
                message.error("数据库导出失败")
            } else {
                let user = await getUser(this.props.uid);
                let uname = user.uname;
                let users = await getUsers();
                let usersList = []
                for (const [_uid, _uname] of users) {
                    usersList.push(_uid + "$$" + _uname);
                }
                let usersStr = usersList.join(",")
                if (this.state.teamType === "create") {
                    this.setState({networkIng: true});
                    this.setTeamInfoPromise(uname, null, this.state.teamName, usersStr, dbJson)
                    .then(response => message.info(response.teamId))
                    .catch(err => {
                        message.error(err.message);
                    })
                    .finally(() => {
                        this.setState({networkIng: false});
                    })
                } else if (this.state.teamType === "join") {
                    this.setState({networkIng: true});
                    this.setTeamInfoPromise(uname, this.state.teamId, null, usersStr, dbJson)
                    .then(response => message.info(response.teamId))
                    .catch(err => {
                        message.error(err.message);
                    })
                    .finally(() => {
                        this.setState({networkIng: false});
                    })
                }
            }
        });
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

    setTeamInfoPromise = (uname, teamId, teamName, users, dbJson) => {
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

            window.electron.ipcRenderer.sendMessage(ChannelsTeamStr, ChannelsTeamSetInfoStr, this.state.teamType, uname, teamId, teamName, users, dbJson);
        })
    }

    ckHostPromise = () => {
        return new Promise((resolve, reject) => {
    
            let testHostSendListener = window.electron.ipcRenderer.on(ChannelsTeamStr, (action, errorMessage, teams) => {
                if (action === ChannelsTeamTestHostResultStr) {
                    testHostSendListener();
                    if (isStringEmpty(errorMessage)) {
                        resolve({teams})
                    } else {
                        reject({errorMessage})
                    }
                }
            });

            let _clientHost = isStringEmpty(this.state.clientHost) ? this.props.clientHost : this.state.clientHost;
    
            if (!isStringEmpty(_clientHost)) {
                window.electron.ipcRenderer.sendMessage(ChannelsTeamStr, ChannelsTeamTestHostStr, _clientHost);
            }
        });
    }

    ckHostClick = async () => {
        this.ckHostPromise()
        .then((response) => {
            this.setState({
                clientHostValid: true,
                teams: response.teams.map(item => ({
                    value: item.id,
                    label: item.name
                }))
            });
        })
        .catch(err => {
            message.error(err.errorMessage);
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
                    <Button key="submit" disabled={(isStringEmpty(this.state.teamName) && isStringEmpty(this.state.teamId)) || this.state.networkIng} onClick={this.commitTeam} type="primary">
                        {this.state.teamType == "create" ? "创建" : "加入"}
                    </Button>
                ]}
            >
                <Form>
                    <Form.Item label={"当前版本"}>
                        <Radio.Group onChange={this.setClientType} value={isStringEmpty(this.state.clientType) ? this.props.clientType : this.state.clientType}>
                            <Radio value="single">单机版</Radio>
                            <Radio value="team">联网版</Radio>
                        </Radio.Group>
                    </Form.Item>
                    {(isStringEmpty(this.state.clientType) ? this.props.clientType : this.state.clientType) === "team" ? 
                    <>
                        <Form.Item label={
                                <Tooltip title="服务器地址:http://127.0.0.1:8000，仅供测试，无法确保数据不被删除，真实使用，请私有化部署服务端。私有化部署服务端教程：http://www.baidu.com/">
                                    <span>服务器</span>
                                </Tooltip>
                            }
                        >
                            <Input.Group compact style={{ display: 'flex' }}>
                                <Input value={ isStringEmpty(this.state.clientHost) ? this.props.clientHost : this.state.clientHost } onChange={ event=> {
                                    this.setState({
                                        clientHost : event.target.value,
                                        clientHostValid: false
                                    })
                                } } />
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
                                <Select options={this.state.teams} defaultValue={this.props.teamId} onChange={_teamId => this.setState({teamId: _teamId})} />
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
      clientType: state.device.clientType,
      clientHost: state.device.clientHost,
      teamId: state.device.teamId,
    }
}

export default connect(mapStateToProps)(TeamModel);