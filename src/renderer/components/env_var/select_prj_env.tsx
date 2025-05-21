import { Component, ReactNode } from 'react';
import { Select, Form, Button } from 'antd';
import { connect } from 'react-redux';

import { 
    PROJECT_LIST_ROUTE,
    ENV_LIST_ROUTE,
} from "@conf/routers";
import { 
    TABLE_MICRO_SERVICE_FIELDS,
    TABLE_VERSION_ITERATION_FIELDS,
} from '@conf/db';
import { getEnvs } from '@act/env';
import { getVersionIterators, getRemoteVersionIterator } from "@act/version_iterator";
import { isStringEmpty } from '@rutil/index';
import { langTrans } from '@lang/i18n';

let version_iterator_uuid = TABLE_VERSION_ITERATION_FIELDS.FIELD_UUID;
let version_iterator_title = TABLE_VERSION_ITERATION_FIELDS.FIELD_NAME;
let version_iterator_prjs = TABLE_VERSION_ITERATION_FIELDS.FIELD_PROJECTS;

let prj_label = TABLE_MICRO_SERVICE_FIELDS.FIELD_LABEL;
let prj_remark = TABLE_MICRO_SERVICE_FIELDS.FIELD_REMARK;

class PrjEnvSelect extends Component {

    constructor(props) {
        super(props);
        this.state = {
          prj: props.prj,
          env: props.env,
          iteratorId: props.iteratorId,
          versionIteration: {},
          versionIterators: [],
        }
    }

    componentDidMount(): void {
        if(this.props.envs.length === 0) {
          getEnvs(this.props.clientType, this.props.dispatch);
        }
        if (!isStringEmpty(this.state.prj)) {
            this.props.cb(this.state.prj, this.state.env);
        }
        if (!isStringEmpty(this.state.iteratorId)) {
            getRemoteVersionIterator(this.props.clientType, this.state.iteratorId).then(versionIteration => this.setState( { versionIteration } ));
        }
        getVersionIterators().then(iterators => this.setState({versionIterators: iterators}))
    }

    setProjectChange = (rawValue: string) => {
        if (isStringEmpty(rawValue)) {
            this.setState({prj: ""});
            return;
        }
        let prj = rawValue.split("$$")[0];
        this.setState({prj});
        if (!isStringEmpty(prj)) {
            this.props.cb(prj, this.state.env !== "" ? this.state.env : this.state.env);
        }
    }
  
    setEnvironmentChange = (value: string) => {
        this.setState({env: value});
        if (!isStringEmpty(this.state.prj)) {
            this.props.cb(this.state.prj, value);
        }
    }

    render() : ReactNode {
        return (
            <Form layout="inline">
                {!isStringEmpty(this.state.iteratorId) ? 
                <Form.Item label={langTrans("request select1")}>
                    { this.state.versionIterators.find(row => row[version_iterator_uuid] === this.state.iteratorId) ? this.state.versionIterators.find(row => row[version_iterator_uuid] === this.state.iteratorId)[version_iterator_title]:"" }
                </Form.Item>
                : null}
                <Form.Item label={langTrans("request select2")}>
                    {this.props.prjs.length > 0 ? 
                    <Select
                        showSearch
                        allowClear
                        value={ isStringEmpty(this.state.prj) ? "" : (
                            this.state.prj + "$$" + (this.props.prjs.find(row => row.value === this.state.prj) ? this.props.prjs.find(row => row.value === this.state.prj).label : "")
                        ) }
                        onChange={this.setProjectChange}
                        style={{ width: 170 }}
                        options={this.state.versionIteration[version_iterator_prjs] ? this.state.versionIteration[version_iterator_prjs].map(item => {
                            let label = this.props.prjs.find(row => row.value === item) ? this.props.prjs.find(row => row.value === item).label : "";
                            return {value: item + "$$" + label, label }
                        }) : this.props.prjs.map(item => {
                            return {value: item.value + "$$" + item.label , label: item.label}
                        })}
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