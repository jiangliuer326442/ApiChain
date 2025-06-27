import { 
    Button,
    Form,
    Spin,
    Input,
    message,
    Modal, 
    Radio,
    Select,
    Typography,
    Tooltip,
} from 'antd';
import { QuestionCircleTwoTone } from '@ant-design/icons';
import { RadioChangeEvent } from 'antd/lib';
import { Component, ReactNode } from 'react';
import { connect } from 'react-redux';
import IDBExportImport from 'indexeddb-export-import';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/cjs/styles/prism';

import { getUser, getUsers } from '@act/user';
import {
    ChannelsTeamStr, 
    ChannelsTeamTestHostStr,
    ChannelsTeamTestHostResultStr,
    ChannelsTeamSetInfoStr,
    ChannelsTeamSetInfoResultStr,
} from '@conf/channel';
import { SET_DEVICE_INFO } from '@conf/redux';
import { CLIENT_TYPE_SINGLE, CLIENT_TYPE_TEAM } from '@conf/team';
import { isStringEmpty } from '@rutil/index';
import { langTrans } from '@lang/i18n';

const { Paragraph, Text, Link } = Typography;

class TeamModel extends Component {

    constructor(props) {
        super(props);
        this.state = {
            clientType: "",
            clientHost: props.clientHost,
            clientHostValid: false,
            teamType: this.props.teamType,
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
                let user = await getUser(this.props.clientType, this.props.uid);
                let uname = user.uname;
                let users = await getUsers(this.props.clientType);
                let usersList = []
                for (const [_uid, _uname] of users) {
                    usersList.push(_uid + "$$" + _uname);
                }
                let usersStr = usersList.join(",")
                if (this.state.teamType === "create") {
                    this.setState({networkIng: true});
                    this.setTeamInfoPromise(uname, null, this.state.teamName, usersStr, dbJson)
                    .then(async response => await this.handleResponse(response))
                    .catch(err => {
                        message.error(err.message);
                    })
                    .finally(() => {
                        this.setState({networkIng: false});
                    })
                } else if (this.state.teamType === "join") {
                    this.setState({networkIng: true});
                    this.setTeamInfoPromise(uname, this.state.teamId, null, usersStr, dbJson)
                    .then(async response => await this.handleResponse(response))
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

    handleResponse = async (response) => {
        let teamId = response.teamId;
        await this.updateAllRecords(teamId);
        this.props.dispatch({
            type : SET_DEVICE_INFO,
            clientType: this.state.clientType,
            clientHost: this.state.clientHost,
            teamName: response.teamName, 
            teamId,
        });
        this.canelTeam();
    }

    canelTeam = () => {
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

            let addTeamSendListener = window.electron.ipcRenderer.on(ChannelsTeamStr, (action, errorMessage, retTeamId, retTeamName) => {
                if (action === ChannelsTeamSetInfoResultStr) {
                    addTeamSendListener();
                    if (isStringEmpty(errorMessage)) {
                        resolve({teamId: retTeamId, teamName: retTeamName})
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

            let _clientHost = this.state.clientHost;
    
            if (!isStringEmpty(_clientHost)) {
                window.electron.ipcRenderer.sendMessage(ChannelsTeamStr, ChannelsTeamTestHostStr, _clientHost);
            }
        });
    }

    // 更新所有表的所有记录
    updateAllRecords = async (teamId : string) => {
        // 获取所有表的名称
        const tableNames = window.db.tables.map(table => table.name);
    
        for (const tableName of tableNames) {
            let tables = [
                'env',
                'env_vars_241112001',
                'microservices_keys',
                'microservices',
                'project_request',
                'user',
                'version_iteration',
                'version_iteration_request',
                'version_iteration_folders'
            ];
            if (!tables.includes(tableName)) continue;

            const table = window.db.table(tableName);
        
            // 获取所有记录
            const records = await table.toArray();
        
            // 更新每个记录
            for (const record of records) {
                record.upload_flg = 1;
                record.team_id = teamId;
                await table.put(record);
            }
        
            console.log(`Updated records in ${tableName}`);
        }
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
                title={langTrans("team topup title")}
                open={this.props.showTeam}
                onOk={this.commitTeam}
                onCancel={this.canelTeam}
                width={500}
                footer={[
                    <Button key="back" onClick={this.canelTeam}>
                        {langTrans("team topup btn3")}
                    </Button>,
                    <Button key="submit" disabled={(isStringEmpty(this.state.teamName) && isStringEmpty(this.state.teamId)) || this.state.networkIng} onClick={this.commitTeam} type="primary">
                        {this.state.teamType == "create" ? langTrans("team topup btn1") : langTrans("team topup btn2")}
                    </Button>
                ]}
            >
                <Spin spinning={this.state.networkIng}>
                    <Form>
                        <Form.Item label={langTrans("team topup form1")}>
                            <Radio.Group onChange={this.setClientType} value={isStringEmpty(this.state.clientType) ? this.props.clientType : this.state.clientType}>
                                <Radio value={ CLIENT_TYPE_SINGLE }>{langTrans("team topup form1 select1")}</Radio>
                                <Radio value={ CLIENT_TYPE_TEAM }>{langTrans("team topup form1 select2")}</Radio>
                            </Radio.Group>
                        </Form.Item>
                        {(isStringEmpty(this.state.clientType) ? this.props.clientType : this.state.clientType) === "team" ? 
                        <>
                            <Form.Item label={
                                    <Tooltip 
                                        title={
                                        <Paragraph>
                                            {langTrans("team topup form2 tip1")} 
                                            <Link onClick={() => {
                                                this.setState({clientHost: this.props.defaultRunnerUrl});
                                            }}>{this.props.defaultRunnerUrl}</Link>
                                            {langTrans("team topup form2 tip2")}
                                            <SyntaxHighlighter
                                            language="shell"
                                            style={tomorrow}
                                            wrapLines
                                            >
                                                {`docker run -d 
-p 6588:6588 
-e DB_HOST=[MYSQL_HOST_URL]
-e DB_PORT=[MYSQL_HOST_PORT]
-e DB_USER=[MYSQL_HOST_USER]
-e DB_PASS=[MYSQL_HOST_PWD]
-e DB_NAME=apichain_runner
-e APICHAIN_SUPER_UID=${this.props.uid}
-e APICHAIN_SUPER_UNAME=${this.props.uname}
-v [/path/to/local/dir]:/opt/cache
--name apichain-runner
registry.cn-shanghai.aliyuncs.com/apichain/runner:${this.props.defaultRunnerVersion}`}
                                            </SyntaxHighlighter>
                                        </Paragraph>}
                                        overlayStyle={{ maxWidth: 500 }}>
                                        <Text>{langTrans("team topup form2")}<QuestionCircleTwoTone /></Text>
                                    </Tooltip>
                                }
                            >
                                <Input.Group compact style={{ display: 'flex' }}>
                                    <Input 
                                        value={ this.state.clientHost } 
                                        placeholder={this.props.defaultRunnerUrl}
                                        onChange={ event=> {
                                            this.setState({
                                                clientHost : event.target.value,
                                                clientHostValid: false
                                            })
                                        } } />
                                    <Button onClick={this.ckHostClick}>{langTrans("team topup form2 btn1")}</Button>
                                </Input.Group>
                            </Form.Item>
                            {this.state.clientHostValid ? 
                            <>
                                <Form.Item label={langTrans("team topup form3")}>
                                    <Radio.Group onChange={this.setTeamType} value={this.state.teamType}>
                                        <Radio value="create">{langTrans("team topup form3 radio1")}</Radio>
                                        <Radio value="join">{langTrans("team topup form3 radio2")}</Radio>
                                    </Radio.Group>
                                </Form.Item>
                                {this.state.teamType === "create" ? 
                                <Form.Item label={langTrans("team topup form4")}>
                                    <Input value={ this.state.teamName } onChange={ event=>this.setState({teamName : event.target.value}) } />
                                </Form.Item>
                                : null}
                                {this.state.teamType === "join" ? 
                                <Form.Item label={langTrans("team topup form5")}>
                                    <Select options={this.state.teams} defaultValue={this.props.teamId} onChange={_teamId => this.setState({teamId: _teamId})} />
                                </Form.Item>
                                : null}
                                
                            </>
                            : null}
                        </>
                        : null}
                    </Form>
                </Spin>
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
      defaultRunnerUrl: state.device.defaultRunnerUrl,
      defaultRunnerVersion: state.device.defaultRunnerVersion,
    }
}

export default connect(mapStateToProps)(TeamModel);