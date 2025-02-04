import { Component, ReactNode } from 'react';
import { connect } from 'react-redux';
import { 
    Form,
    Input,
    Modal,
    message
} from "antd";

import { isStringEmpty } from '@rutil/index';
import { SHOW_ADD_ENV_MODEL } from '@conf/redux';
import { getEnvs, addEnv } from '@act/env';
import { langTrans } from '@lang/i18n';

class AddEnvComponent extends Component {

    constructor(props) {
        super(props);
        this.state = {
            actionType: "",
            loadingFlg: false,
            envValue: "",
            remarkValue: "",
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
            };
        } 
        return null;
    }

    handleOk = () => {
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

        addEnv(envValue, remarkValue, this.props.device, () => {
            this.clearInput();
            this.setState({
                loadingFlg: false
            });
            this.props.dispatch({
                type: SHOW_ADD_ENV_MODEL,
                open: false
            });
            getEnvs(this.props.dispatch);
        });
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
                width={230}
            >
                <Form
                layout="vertical"
                >
                    <Form.Item>
                        <Input placeholder={langTrans("env add form1")} value={this.state.envValue} onChange={ event=>this.setState({envValue : event.target.value}) } readOnly={ this.state.actionType === "edit" } />
                    </Form.Item>
                    <Form.Item>
                        <Input placeholder={langTrans("env add form2")} value={this.state.remarkValue} onChange={ event=>this.setState({remarkValue : event.target.value}) } />
                    </Form.Item>
                </Form>
            </Modal>
        );
    }

}

function mapStateToProps (state) {
    return {
        open : state.env.showAddEnvModelFlg || state.env.showEditEnvModelFlg,
        device : state.device,
        env: state.env.env,
        remark: state.env.remark,
    }
}

export default connect(mapStateToProps)(AddEnvComponent);