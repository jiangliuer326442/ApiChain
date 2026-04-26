import { Component, ReactNode } from 'react';
import { connect } from 'react-redux';
import { 
    Form,
    Input,
    Modal,
    message
} from "antd";

import { isStringEmpty } from '@rutil/index';
import { SHOW_ADD_PRJ_MODEL } from '@conf/redux';
import { addPrj } from '@act/project';
import { langTrans } from '@lang/i18n';
import { ChannelsLoadAppStr } from '@conf/channel';

const { TextArea } = Input;

class AddPrjComponent extends Component {

    constructor(props) {
        super(props);
        this.state = {
            actionType: "",
            loadingFlg: false,
            prjValue: "",
            remarkValue: "",
        };
    }

    componentWillReceiveProps(nextProps) {
        if (isStringEmpty(nextProps.prj) && isStringEmpty(nextProps.remark)) {
            this.setState({actionType: "create"});
        } else {
            this.setState({
                actionType: "edit",
                prjValue: nextProps.prj,
                remarkValue: nextProps.remark,
            });
        }
    }

    handleOk = async () => {
        const prjValue = this.state.prjValue.trim();
        const remarkValue = this.state.remarkValue.trim();

        if (isStringEmpty(prjValue)) {
            message.error(langTrans("prj add check1"));
            return;
        }

        if (isStringEmpty(remarkValue)) {
            message.error(langTrans("prj add check2"));
            return;
        }

        this.setState({
            loadingFlg: true
        });

        await addPrj(
            this.props.clientType, this.props.teamId, 
            prjValue, remarkValue, 
            this.props.device);

        window.electron.ipcRenderer.sendMessage(ChannelsLoadAppStr);
    };

    handleCancel = () => {
        this.clearInput();
        this.props.dispatch({
            type: SHOW_ADD_PRJ_MODEL,
            open: false
        });
    }

    clearInput = () => {
        this.setState({
            loadingFlg: false,
            prjValue: "",
            remarkValue: "",
        });
    }

    render() : ReactNode {
        return (
            <Modal
                title={this.state.actionType === "create" ? langTrans("prj add title") : langTrans("prj edit title")}
                open={this.props.open}
                onOk={this.handleOk}
                confirmLoading={this.state.loadingFlg}
                onCancel={this.handleCancel}
                width={270}
            >
                <Form labelCol={{ span: 9 }} wrapperCol={{ span: 15 }}>
                    <Form.Item label={langTrans("prj add form1")}>
                        <Input 
                            placeholder={langTrans("prj add tip1")}
                            value={this.state.prjValue} 
                            onChange={ event=>this.setState({prjValue : event.target.value}) } 
                            readOnly={ this.state.actionType === "edit" } 
                            />
                    </Form.Item>
                    <Form.Item label={langTrans("prj add form2")}>
                        <Input 
                            placeholder={langTrans("prj add tip2")}
                            value={this.state.remarkValue} 
                            onChange={ event=>this.setState({remarkValue : event.target.value}) } 
                            />
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
        open : state.prj.showAddPrjModelFlg,
        device : state.device,
        prj: state.prj.prj,
        remark: state.prj.remark,
    }
}

export default connect(mapStateToProps)(AddPrjComponent);