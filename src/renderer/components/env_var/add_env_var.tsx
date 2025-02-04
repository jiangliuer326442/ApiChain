import { Component, ReactNode } from 'react';
import { connect } from 'react-redux';
import { Form, Input, Modal, message } from "antd";

import { isStringEmpty } from '../../util';
import { SHOW_ADD_PROPERTY_MODEL } from '../../../config/redux';
import { ENV_VALUE_API_HOST } from '../../../config/envKeys';
import { addEnvValues, getEnvValues } from '../../actions/env_value';
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
            tips: [],
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
            });
        }
    }

    handleOk = () => {
        const pname = this.state.pname.trim();
        const pvalue = this.state.pvalue.trim();
        let premark = "";
        if (!isStringEmpty(this.state.premark)) {
            premark = this.state.premark.trim();
        }

        if (isStringEmpty(pname)) {
            message.error(langTrans("envvar global add check1"));
            return;
        }

        if(pname === ENV_VALUE_API_HOST) {
            if(!(pvalue.indexOf("http://") === 0 || pvalue.indexOf("https://") === 0)) {
                message.error('接口地址只能是 http:// 或者 https:// 开头');
                return;
            }
            if(!pvalue.endsWith("/")) {
                message.error('接口地址只能是 / 结尾');
                return;
            }
        }

        this.setState({
            loadingFlg: true
        });

        addEnvValues(this.props.prj, this.props.env, this.props.iteration, this.props.unittest ? this.props.unittest : "" , 
            pname, pvalue, premark,
            this.props.device, 
            () => {
                this.clearInput();
                this.setState({
                    loadingFlg: false
                });
                this.props.dispatch({
                    type: SHOW_ADD_PROPERTY_MODEL,
                    open: false
                });
                if (this.props.cb == null) {
                    getEnvValues(this.props.prj, this.props.env, this.props.iteration, this.props.unittest ? this.props.unittest : "", "", this.props.dispatch, env_vars => {});
                } else {
                    this.props.cb();
                }
                
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
                width={300}
            >
               <Form layout="vertical">
                    <Form.Item>
                        <Input allowClear placeholder={langTrans("envvar global add form1")} disabled={ this.state.actionType === "edit" } 
                            value={this.state.pname} onChange={ event=>this.setState({pname : event.target.value}) } />
                    </Form.Item>
                    <Form.Item>
                        <TextArea allowClear rows={ 3 }
                            placeholder={langTrans("envvar global add form2")} 
                            value={this.state.pvalue} 
                            onChange={ e=>this.setState({pvalue : e.target.value}) } />
                    </Form.Item>
                    <Form.Item>
                        <TextArea allowClear 
                            placeholder={langTrans("envvar global add form3")}
                            value={this.state.premark} 
                            onChange={ e=>this.setState({premark : e.target.value}) } />
                    </Form.Item>
                </Form>
            </Modal>
        );
    }

}

function mapStateToProps (state) {
    return {
        open : state.env_var.showAddPropertyModelFlg,
        device : state.device,
        prj: state.env_var.prj ? state.env_var.prj : "",
        iteration: state.env_var.iterator ? state.env_var.iterator : "",
        unittest: state.env_var.unittest ? state.env_var.unittest : "",
        env: state.env_var.env,
        pname: state.env_var.pname,
        pvalue: state.env_var.pvalue,
        premark: state.env_var.premark,
    }
}

export default connect(mapStateToProps)(AddEnvVarComponent);