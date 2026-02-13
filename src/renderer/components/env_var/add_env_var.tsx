import { Component, ReactNode } from 'react';
import { connect } from 'react-redux';
import { Form, Input, Modal, Select, Radio, message } from "antd";

import { isStringEmpty } from '@rutil/index';
import { SHOW_ADD_PROPERTY_MODEL } from '@conf/redux';
import { ENV_VALUE_API_HOST, ENV_VALUE_RUN_MODE, ENV_VALUE_RUN_MODE_CLIENT, ENV_VALUE_RUN_MODE_RUMMER } from '@conf/envKeys';
import { ChannelsEncryptStr, ChannelsEncryptEncrypt, ChannelsEncryptEncryptResult } from '@conf/channel'
import { addEnvValues } from '@act/env_value';
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
            premark: "",
            encryptFlg: 0,
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
                premark: nextProps.premark,
                encryptFlg: nextProps.encryptFlg,
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

        console.log("34345345", await this.encryptPromise(pvalue))

        if (isStringEmpty(pname)) {
            message.error(langTrans("envvar global add check1"));
            return;
        }

        if(pname === ENV_VALUE_API_HOST) {
            if(!(pvalue.indexOf("http://") === 0 || pvalue.indexOf("https://") === 0)) {
                message.error(langTrans("envvar prj host check1"));
                return;
            }
            if(!pvalue.endsWith("/")) {
                message.error(langTrans("envvar prj host check2"));
                return;
            }
        }

        this.setState({
            loadingFlg: true
        });
        await addEnvValues(this.props.clientType, this.props.teamId, this.props.prj, this.props.env, this.props.iteration ? this.props.iteration : "", this.props.unittest ? this.props.unittest : "" , 
            pname, pvalue, premark, encryptFlg,
            this.props.device);

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

    encryptPromise = (content : string) => {
        return new Promise((resolve, reject) => {

            let listener = window.electron.ipcRenderer.on(ChannelsEncryptStr, (action, encryptContent) => {
                if (action === ChannelsEncryptEncryptResult) {
                    listener();
                    resolve(encryptContent);
                }
            });

            window.electron.ipcRenderer.sendMessage(ChannelsEncryptStr, ChannelsEncryptEncrypt, content);
        });
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
                width={350}
            >
               <Form layout="horizontal" labelCol={{ span: 5 }} wrapperCol={{ span: 19 }}>
                    <Form.Item label={langTrans("envvar global add form1")}>
                        <Input allowClear disabled={ this.state.actionType === "edit" } 
                            value={this.state.pname} onChange={ event=>this.setState({pname : event.target.value}) } />
                    </Form.Item>
                    <Form.Item label={langTrans("envvar global add form2")}>
                        {
                            this.state.pname === ENV_VALUE_RUN_MODE ? 
                            <Select 
                                value={this.state.pvalue} 
                                onChange={value => this.setState({pvalue : value})}
                                options={[
                                    {label:ENV_VALUE_RUN_MODE_CLIENT, value:ENV_VALUE_RUN_MODE_CLIENT},
                                    {label:ENV_VALUE_RUN_MODE_RUMMER, value:ENV_VALUE_RUN_MODE_RUMMER}
                                ]} />
                            :
                            <TextArea allowClear rows={ 3 }
                                value={this.state.pvalue} 
                                onChange={ e=>this.setState({pvalue : e.target.value}) } />
                        }
                    </Form.Item>
                    <Form.Item label={langTrans("envvar global add form3")}>
                        <TextArea allowClear
                            value={this.state.premark} 
                            onChange={ e=>this.setState({premark : e.target.value}) } />
                    </Form.Item>
                    <Form.Item label={langTrans("envvar global add form4")}>
                        <Radio.Group 
                            value={this.state.encryptFlg}
                            onChange={ event=>this.setState({encryptFlg : event.target.value}) }
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
        pname: state.env_var.pname,
        pvalue: state.env_var.pvalue,
        premark: state.env_var.premark,
        encryptFlg: state.env_var.encryptFlg,
    }
}

export default connect(mapStateToProps)(AddEnvVarComponent);