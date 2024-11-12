import { Component, ReactNode } from 'react';
import { connect } from 'react-redux';
import { AutoComplete, Form, Input, Modal, message } from "antd";

import { isStringEmpty } from '../../util';
import { SHOW_ADD_PROPERTY_MODEL } from '../../../config/redux';
import { ENV_VALUE_API_HOST } from '../../../config/envKeys';
import { addEnvValues, getEnvValues } from '../../actions/env_value';
import { cloneDeep } from 'lodash';

class AddEnvVarComponent extends Component {

    constructor(props) {
        super(props);
        this.state = {
            actionType: "",
            loadingFlg: false,
            pname: "",
            pvalue: "",
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
            });
        }
    }

    handleSearchEnvKey = text => {
        if (isStringEmpty(text)) {
            this.setState({ tips: [] });
            return;
        }

        let tips = cloneDeep(this.props.tips);
        let searchTips : Array<any> = [];
        for (let tip of tips) {
            if (tip.value.toLowerCase().indexOf(text.toLowerCase()) >= 0) {
                searchTips.push(tip);
            }
        }
        this.setState({tips: searchTips});
    }

    handleOk = () => {
        const pname = this.state.pname.trim();
        const pvalue = this.state.pvalue.trim();

        if (isStringEmpty(pname)) {
            message.error('请输入参数名称');
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

        addEnvValues(this.props.prj, this.props.env, this.props.iteration, pname, pvalue, this.props.device, () => {
            this.clearInput();
            this.setState({
                loadingFlg: false
            });
            this.props.dispatch({
                type: SHOW_ADD_PROPERTY_MODEL,
                open: false
            });
            getEnvValues(this.props.prj, this.props.env, this.props.iteration, "", "", this.props.dispatch, env_vars => {});
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
        });
    }

    render() : ReactNode {
        return (
            <Modal
                title={this.state.actionType === "create" ? "添加环境变量" : "编辑环境变量"}
                open={this.props.open}
                onOk={this.handleOk}
                confirmLoading={this.state.loadingFlg}
                onCancel={this.handleCancel}
                width={230}
            >
               <Form layout="vertical">
                    <Form.Item>
                        <AutoComplete
                            allowClear
                            onSearch={ this.handleSearchEnvKey }
                            options={(this.state.tips.length > 0 || !isStringEmpty(this.state.pname)) ? this.state.tips : this.props.tips}
                            disabled={ this.state.actionType === "edit" }
                            placeholder="参数名称"
                            value={this.state.pname}
                            onChange={value => this.setState({pname: value})}
                        />
                    </Form.Item>
                    <Form.Item>
                        <Input allowClear placeholder="参数值" value={this.state.pvalue} onChange={ event=>this.setState({pvalue : event.target.value}) } />
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
        env: state.env_var.env,
        pname: state.env_var.pname,
        pvalue: state.env_var.pvalue,
    }
}

export default connect(mapStateToProps)(AddEnvVarComponent);