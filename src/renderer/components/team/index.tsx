import { 
    Button,
    Form,
    Flex,
    Input,
    Modal, 
    Radio,
} from 'antd';
import { RadioChangeEvent } from 'antd/lib';
import { Component, ReactNode } from 'react';

class TeamModel extends Component {

    constructor(props) {
        super(props);
        this.state = {
            clientType: "single",
            clientHost: "",
            teamType: "create",
            teamName: "",
        }
    }

    commitTeam = () => {
        console.log("clientHost:", this.state.clientHost);
        console.log("teamName:", this.state.teamName);
    }

    canelTeam = () => {
        this.setState({
            clientType: "",
            clientHost: "",
            teamName: "",
        });
        this.props.cb(false);
    }

    setClientType = (e: RadioChangeEvent) => {
        this.setState({clientType: e.target.value});
    };

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
                    <Button key="submit" onClick={this.commitTeam} type="primary">
                        确定
                    </Button>
                ]}
            >
                <Flex gap="small" vertical>
                    <Form>
                        <Form.Item label={"当前版本"}>
                            <Radio.Group onChange={this.setClientType} value={this.state.clientType}>
                                <Radio value="single">单机版</Radio>
                                <Radio value="team">联网版</Radio>
                            </Radio.Group>
                        </Form.Item>
                        <Form.Item label={"服务器地址"}>
                            <Input value={ this.state.clientHost } onChange={ event=>this.setState({clientHost : event.target.value}) } />
                        </Form.Item>
                        <Form.Item label={"团队操作"}>
                            <Radio.Group value={this.state.teamType}>
                                <Radio value="create">创建团队</Radio>
                                <Radio value="join">加入团队</Radio>
                            </Radio.Group>
                        </Form.Item>
                        <Form.Item label={"团队名称"}>
                            <Input value={ this.state.teamName } onChange={ event=>this.setState({teamName : event.target.value}) } />
                        </Form.Item>
                    </Form>
                </Flex>
            </Modal>
        )
    }

}

export default TeamModel;