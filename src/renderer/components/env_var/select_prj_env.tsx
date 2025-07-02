import { Component, ReactNode } from 'react';
import { Select, Form, Button } from 'antd';
import { connect } from 'react-redux';

import { 
    PROJECT_LIST_ROUTE,
    ENV_LIST_ROUTE,
} from "@conf/routers";
import {
    TABLE_VERSION_ITERATION_FIELDS,
} from '@conf/db';
import { getEnvs } from '@act/env';
import { getRemoteVersionIterator } from "@act/version_iterator";
import { isStringEmpty } from '@rutil/index';
import { langTrans } from '@lang/i18n';

let version_iterator_prjs = TABLE_VERSION_ITERATION_FIELDS.FIELD_PROJECTS;
let version_iterator_title = TABLE_VERSION_ITERATION_FIELDS.FIELD_NAME;

class PrjEnvSelect extends Component {

    constructor(props) {
        super(props);
        this.state = {
          prj: "",
          env: props.env,
          iteratorName: "",
          prjOptions: [],
        }
    }

    async componentDidMount() {
        if(this.props.envs.length === 0) {
          getEnvs(this.props.clientType, this.props.dispatch);
        }
        let prjOptions;
        let iteratorName = "";
        if (!isStringEmpty(this.props.iteratorId)) {
            let versionIteration = await getRemoteVersionIterator(this.props.clientType, this.props.iteratorId);
            prjOptions = versionIteration[version_iterator_prjs].map(item => {
                let label = this.props.prjs.find(row => row.value === item) ? this.props.prjs.find(row => row.value === item).label : "";
                return {value: item + "$$" + label, label }
            })
            iteratorName = versionIteration[version_iterator_title];
        } else {
            prjOptions = this.props.prjs.map(item => {
                return {value: item.value + "$$" + item.label , label: item.label}
            });
        }
        let selectedValue = this.props.prj;
        if (!prjOptions.find(item => item.value.startsWith(selectedValue + "$$"))) {
            selectedValue = this.props.prjs.length > 0 ? prjOptions[0].value : "";
        } else {
            selectedValue = prjOptions.find(item => item.value.startsWith(selectedValue + "$$")).value;
        }
        
        if (!isStringEmpty(selectedValue)) {
            this.props.cb(selectedValue.split("$$")[0], this.state.env);
        }
        this.setState({iteratorName, prjOptions, prj: selectedValue})
    }

    async componentDidUpdate(prevProps) { 
        if (this.props.prjs.length !== prevProps.prjs.length && isStringEmpty(this.state.selectedValue)) {
            let prjOptions = this.props.prjs.map(item => {
                return {value: item.value + "$$" + item.label , label: item.label}
            });
            let selectedValue = prjOptions[0].value;
            if (!isStringEmpty(selectedValue)) {
                this.props.cb(selectedValue.split("$$")[0], this.state.env);
            }
            this.setState({prjOptions, prj: selectedValue})
        }
    }

    setProjectChange = (rawValue: string) => {
        if (isStringEmpty(rawValue)) {
            this.setState({prj: ""});
            return;
        }
        let prj = rawValue.split("$$")[0];
        this.setState({prj: rawValue});
        this.props.cb(prj, this.state.env !== "" ? this.state.env : this.state.env);
    }
  
    setEnvironmentChange = (value: string) => {
        this.setState({env: value});
        if (!isStringEmpty(this.state.prj)) {
            this.props.cb(this.state.prj.split("$$")[0], value);
        }
    }

    render() : ReactNode {
        return (
            <Form layout="inline">
                {!isStringEmpty(this.props.iteratorId) ? 
                <Form.Item label={langTrans("request select1")}>
                    { this.state.iteratorName }
                </Form.Item>
                : null}
                <Form.Item label={langTrans("request select2")}>
                    {this.props.prjs.length > 0 ? 
                    <Select
                        showSearch
                        allowClear
                        value={ this.state.prj }
                        onChange={this.setProjectChange}
                        style={{ width: 170 }}
                        options={ this.state.prjOptions }
                    />
                    : 
                    <Button type="link" href={"#" + PROJECT_LIST_ROUTE}>{langTrans("prj add")}</Button>
                    }
                </Form.Item>
                <Form.Item label={langTrans("request select3")}>
                {this.props.envs.length > 0 ?
                    <Select
                    value={ this.state.env }
                    onChange={this.setEnvironmentChange}
                    style={{ width: 120 }}
                    options={this.props.envs}
                    />
                :
                    <Button type="link" href={"#" + ENV_LIST_ROUTE}>{langTrans("env add")}</Button>
                }
                </Form.Item>
            </Form>
        );
    }
}

function mapStateToProps (state) {
    return {
        clientType: state.device.clientType,
        envs: state.env.list,
        prjs: state.prj.list,
    }
}

export default connect(mapStateToProps)(PrjEnvSelect);