import { Component, ReactNode } from 'react';
import { connect } from 'react-redux';
import { 
    Form,
    Radio,
    Input,
    Modal,
    message
} from "antd";

import { isStringEmpty } from '@rutil/index';
import { SHOW_ADD_ENV_MODEL } from '@conf/redux';
import { CLIENT_TYPE_SINGLE } from '@conf/team';
import { addEnv } from '@act/env';
import { langTrans } from '@lang/i18n';

class AddEnvComponent extends Component {

    constructor(props) {
        super(props);
        this.state = {
            actionType: "",
            loadingFlg: false,
            envValue: "",
            remarkValue: "",
            requestDevice: "0",
        };
    }

    static getDerivedStateFromProps(nextProps, prevState) {  
        if (isStringEmpty(nextProps.env) && isStringEmpty(nextProps.remark)) {
            return {actionType: "create"};
        } else if (isStringEmpty(prevState.envValue)) {
            return {
                actionType: "edit",
                envValue: nextProps.env,
                remarkValue: nextProps.remark,
                requestDevice: nextProps.requestDevice.toString(),
            };
        } 
        return null;
    }

    handleOk = async () => {
        const envValue = this.state.envValue.trim();
        const remarkValue = this.state.remarkValue.trim();

        if (isStringEmpty(envValue)) {
            message.error(langTrans("env add check1"));
            return;
        }

        if (isStringEmpty(remarkValue)) {
            message.error(langTrans("env add check2"));
            return;
        }

        this.setState({
            loadingFlg: true
        });

        await addEnv(this.props.clientType, this.props.teamId, envValue, remarkValue, this.state.requestDevice, this.props.device);

        this.clearInput();
        this.setState({
            loadingFlg: false
        });
        this.props.dispatch({
            type: SHOW_ADD_ENV_MODEL,
            open: false
        });
        this.props.cb();
    };

    handleCancel = () => {
        this.clearInput();
        this.props.dispatch({
            type: SHOW_ADD_ENV_MODEL,
            open: false
        });
    }

    clearInput = () => {
        this.setState({
            loadingFlg: false,
            envValue: "",
            remarkValue: "",
            requestDevice: "0",
            actionType: "",
        });
    }

    render() : ReactNode {
        return (
            <Modal
                title={this.state.actionType === "create" ? langTrans("env add title") : langTrans("env edit title")}
                open={this.props.open}
                onOk={this.handleOk}
                confirmLoading={this.state.loadingFlg}
                onCancel={this.handleCancel}
                width={310}
            >
                <Form labelCol={{ span: 9 }} wrapperCol={{ span: 15 }}>
                    <Form.Item label={langTrans("env add form1")}>
                        <Input 
                            value={this.state.envValue} 
                            onChange={ event=>this.setState({envValue : event.target.value}) } 
                            readOnly={ this.state.actionType === "edit" } 
                            />
                    </Form.Item>
                    <Form.Item label={langTrans("env add form2")}>
                        <Input
                            value={this.state.remarkValue} 
                            onChange={ event=>this.setState({remarkValue : event.target.value}) } 
                            />
                    </Form.Item>
                    <Form.Item label={langTrans("env add form3")}>
                        <Radio.Group 
                            value={(this.props.clientType === CLIENT_TYPE_SINGLE) ? 0 : this.state.requestDevice}
                            disabled={ this.props.clientType === CLIENT_TYPE_SINGLE }
                            onChange={ event=>this.setState({requestDevice : event.target.value}) }
                            >
                            <Radio value="1">runner</Radio>
                            <Radio value="0">client</Radio>
                        </Radio.Group>
                    </Form.Item>
                </Form>
            </Modal>
        );
    }

}

function mapStateToProps (state) {
    return {
        teamId: state.device.teamId,
        clientType: state.device.clientType,
        open : state.env.showAddEnvModelFlg || state.env.showEditEnvModelFlg,
        device : state.device,
        env: state.env.env,
        remark: state.env.remark,
        requestDevice: state.env.requestDevice,
    }
}

export default connect(mapStateToProps)(AddEnvComponent);