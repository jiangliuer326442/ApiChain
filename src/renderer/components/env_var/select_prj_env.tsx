import { Component, ReactNode } from 'react';
import { Select, Form, Button } from 'antd';
import { connect } from 'react-redux';

import { 
    PROJECT_LIST_ROUTE,
    ENV_LIST_ROUTE,
} from "../../../config/routers";
import { 
    TABLE_MICRO_SERVICE_FIELDS,
    TABLE_VERSION_ITERATION_FIELDS,
} from '../../../config/db';
import { getEnvs } from '../../actions/env';
import { getVersionIterator } from '../../actions/version_iterator';
import { isStringEmpty } from '../../util';

let prj_label = TABLE_MICRO_SERVICE_FIELDS.FIELD_LABEL;
let prj_remark = TABLE_MICRO_SERVICE_FIELDS.FIELD_REMARK;

let version_iterator_prjs = TABLE_VERSION_ITERATION_FIELDS.FIELD_PROJECTS;

class PrjEnvSelect extends Component {

    constructor(props) {
        super(props);
        this.state = {
          prj: props.prj,
          env: props.env,
          iteratorId: props.iteratorId,
          versionIteration: {}
        }
    }

    componentDidMount(): void {
        if(this.props.envs.length === 0) {
          getEnvs(this.props.dispatch);
        }
        if (!isStringEmpty(this.state.prj)) {
            this.props.cb(this.state.prj, this.state.env);
        }
        if (!isStringEmpty(this.state.iteratorId)) {
            getVersionIterator(this.state.iteratorId).then(versionIteration => this.setState( { versionIteration } ));
        }
    }

    setProjectChange = (value: string) => {
        this.setState({prj: value});
        if (!isStringEmpty(value)) {
            this.props.cb(value, this.state.env !== "" ? this.state.env : this.state.env);
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
                <Form.Item label="选择项目">
                    {this.props.prjs.length > 0 ? 
                    <Select
                    value={ this.state.prj }
                    onChange={this.setProjectChange}
                    style={{ width: 170 }}
                    options={this.state.versionIteration[version_iterator_prjs] ? this.state.versionIteration[version_iterator_prjs].map(item => {
                        return {value: item, label: this.props.prjs.find(row => row[prj_label] === item) ? this.props.prjs.find(row => row[prj_label] === item)[prj_remark] : ""}
                    }) : this.props.prjs.map(item => {
                        return {value: item.label, label: item.remark}
                    })}
                    />
                    : 
                    <Button type="link" href={"#" + PROJECT_LIST_ROUTE}>创建微服务</Button>
                    }
                </Form.Item>
                <Form.Item label="选择环境">
                    {this.props.envs.length > 0 ?
                    <Select
                    value={ this.state.env }
                    onChange={this.setEnvironmentChange}
                    style={{ width: 120 }}
                    options={this.props.envs.map(item => {
                        return {value: item.label, label: item.remark}
                    })}
                    />
                    :
                    <Button type="link" href={"#" + ENV_LIST_ROUTE}>添加服务器环境</Button>
                    }
                </Form.Item>
            </Form>
        );
    }
}

function mapStateToProps (state) {
    return {
        envs: state.env.list,
        prjs: state.prj.list,
    }
}

export default connect(mapStateToProps)(PrjEnvSelect);