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
import { getPrjs, addPrj } from '@act/project';
import { langTrans } from '@lang/i18n';

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

    handleOk = () => {
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

        addPrj(prjValue, remarkValue, this.props.device, () => {
            this.clearInput();
            this.setState({
                loadingFlg: false
            });
            this.props.dispatch({
                type: SHOW_ADD_PRJ_MODEL,
                open: false
            });
            getPrjs(this.props.dispatch);
        });
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
                width={230}
            >
                <Form
                layout="vertical"
                >
                    <Form.Item>
                        <Input placeholder={langTrans("prj add form1")} value={this.state.prjValue} onChange={ event=>this.setState({prjValue : event.target.value}) } readOnly={ this.state.actionType === "edit" } />
                    </Form.Item>
                    <Form.Item>
                        <Input placeholder={langTrans("prj add form2")} value={this.state.remarkValue} onChange={ event=>this.setState({remarkValue : event.target.value}) } />
                    </Form.Item>
                </Form>
            </Modal>
        );
    }

}

function mapStateToProps (state) {
    return {
        open : state.prj.showAddPrjModelFlg,
        device : state.device,
        prj: state.prj.prj,
        remark: state.prj.remark,
    }
}

export default connect(mapStateToProps)(AddPrjComponent);