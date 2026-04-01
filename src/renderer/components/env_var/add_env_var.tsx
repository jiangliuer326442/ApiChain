import { Component, ReactNode } from 'react';
import { connect } from 'react-redux';
import { Form, Input, Modal, Radio, message } from "antd";

import { isStringEmpty } from '@rutil/index';
import { SHOW_ADD_PROPERTY_MODEL } from '@conf/redux';
import { CLIENT_TYPE_SINGLE } from '@conf/team';
import StepExpressionBuilderBox from "@comp/unittest_step/step_expression_builder_box";
import { addEnvValues, encryptPromise } from '@act/env_value';
import { langTrans } from '@lang/i18n';

const { TextArea } = Input;

class AddEnvVarComponent extends Component {

    constructor(props) {
        super(props);
        this.state = {
            actionType: "",
            loadingFlg: false,
            pname: "",
            pvalue: "",
            oldPValue: "",
            premark: "",
            encryptFlg: 0,
            oldEncryptFlg: 0,
        };
    }

    componentWillReceiveProps(nextProps) {
        if (isStringEmpty(nextProps.pname) && isStringEmpty(nextProps.pvalue)) {
            this.setState({actionType: "create"});
        } else {
            this.setState({
                actionType: "edit",
                pname: nextProps.pname,
                pvalue: nextProps.pvalue,
                oldPValue: nextProps.pvalue,
                premark: nextProps.premark,
                encryptFlg: nextProps.encryptFlg,
                oldEncryptFlg: nextProps.encryptFlg,
            });
        }
    }

    handleOk = async () => {
        const pname = this.state.pname.trim();
        const pvalue = this.state.pvalue.trim();
        let premark = "";
        if (!isStringEmpty(this.state.premark)) {
            premark = this.state.premark.trim();
        }
        let encryptFlg = this.state.encryptFlg;

        if (isStringEmpty(pname)) {
            message.error(langTrans("envvar global add check1"));
            return;
        }

        this.setState({
            loadingFlg: true
        });

        let iteration = this.props.iteration;
        let unittest = this.props.unittest;
        //在迭代中增加单侧环境变量
        if (this.props.iteration && this.props.unittest) {
            if (this.state.actionType === "create") {
                iteration = "";
                unittest = this.props.unittest;
            }
        } 

        let handledData;
        //团队版，走服务端加密
        if (encryptFlg == 1 && (pvalue != this.state.oldPValue || encryptFlg != this.state.oldEncryptFlg) && this.props.clientType == CLIENT_TYPE_SINGLE) {
            handledData = await encryptPromise(pvalue);
        } else {
            handledData = pvalue;
        }

        await addEnvValues(
            this.props.clientType, 
            this.props.teamId, 
            this.props.prj, 
            this.props.env, 
            iteration ? iteration : "", 
            unittest ? unittest : "" , 
            this.props.source ? this.props.source : "",
            pname, handledData, this.state.oldPValue, premark, encryptFlg, this.state.oldEncryptFlg,
            this.props.device
        );

        message.success(langTrans("prj unittest status2"))

        this.clearInput();
        this.setState({
            loadingFlg: false
        });
        this.props.dispatch({
            type: SHOW_ADD_PROPERTY_MODEL,
            open: false
        });

        this.props.cb();
    }

    handleCancel = () => {
        this.clearInput();
        this.props.dispatch({
            type: SHOW_ADD_PROPERTY_MODEL,
            open: false
        });
    }

    clearInput = () => {
        this.setState({
            loadingFlg: false,
            pname: "",
            pvalue: "",
            premark: "",
            encryptFlg: 0,
        });
    }

    render() : ReactNode {
        return (
            <Modal
                title={this.state.actionType === "create" ? langTrans("envvar global add title") : langTrans("envvar global edit title")}
                open={this.props.open}
                onOk={this.handleOk}
                confirmLoading={this.state.loadingFlg}
                onCancel={this.handleCancel}
                width={450}
            >
               <Form layout="horizontal" labelCol={{ span: 7 }} wrapperCol={{ span: 17 }}>
                    <Form.Item label={langTrans("envvar global add form1")}>
                        <Input allowClear disabled={ this.state.actionType === "edit" } 
                            value={this.state.pname} onChange={ event=>this.setState({pname : event.target.value}) } />
                    </Form.Item>
                {this.props.unittest 
                ?
                    <Form.Item label={langTrans("envvar global add form2")}>
                        <StepExpressionBuilderBox
                            enableFlag={true}
                            value={(this.state.oldEncryptFlg == 1 && this.state.pvalue == this.state.oldPValue) ? "******" : this.state.pvalue}
                            cb={value => {
                                this.setState({pvalue : value})
                            }}
                            width={ 288 }
                            unitTestUuid={ this.props.unittest}
                            project={ this.state.prj}
                        />
                    </Form.Item>
                :
                    <Form.Item label={langTrans("envvar global add form2")}>
                        <TextArea allowClear rows={ 3 }
                            value={(this.state.oldEncryptFlg == 1 && this.state.pvalue == this.state.oldPValue) ? "******" : this.state.pvalue} 
                            onChange={ e=>this.setState({pvalue : e.target.value}) } />
                    </Form.Item>
                }
                    <Form.Item label={langTrans("envvar global add form3")}>
                        <TextArea allowClear
                            value={this.state.premark} 
                            onChange={ e=>this.setState({premark : e.target.value}) } />
                    </Form.Item>
                    <Form.Item label={langTrans("envvar global add form4")}>
                        <Radio.Group 
                            value={this.state.encryptFlg}
                            onChange={ event=>this.setState({encryptFlg : event.target.value}) }
                            disabled={ this.state.oldEncryptFlg == 1 }
                            >
                            <Radio value={0}>{langTrans("envvar global add form4 no")}</Radio>
                            <Radio value={1}>{langTrans("envvar global add form4 yes")}</Radio>
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
        open : state.env_var.showAddPropertyModelFlg,
        device : state.device,
        prj: state.env_var.prj ? state.env_var.prj : "",
        iteration: state.env_var.iterator ? state.env_var.iterator : "",
        unittest: state.env_var.unittest ? state.env_var.unittest : "",
        source: state.env_var.source ? state.env_var.source : "",
        pname: state.env_var.pname,
        pvalue: state.env_var.pvalue,
        premark: state.env_var.premark,
        encryptFlg: state.env_var.encryptFlg,
    }
}

export default connect(mapStateToProps)(AddEnvVarComponent);