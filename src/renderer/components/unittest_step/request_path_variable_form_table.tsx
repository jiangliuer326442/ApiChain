import { Component, ReactNode } from 'react';
import { connect } from 'react-redux';
import { Table } from "antd";

import StepExpressionBuilderBox from "./step_expression_builder_box";
import {
    TABLE_FIELD_NAME,
    TABLE_FIELD_TYPE,
    TABLE_FIELD_VALUE,
    TABLE_FIELD_REMARK,
    parseJsonToChildren,
} from '../../util/json';

class RequestPathVariableFormTable extends Component {

    constructor(props) {
        super(props);
        let returnObject : any = {};
        for(let _key in props.object ) {
            returnObject[_key] = props.object[_key][TABLE_FIELD_VALUE];
        }
        this.state = {
            object: props.object,
            columns: [
                {
                    title: '参数名',
                    dataIndex: TABLE_FIELD_NAME,
                },
                {
                    title: '参数类型',
                    dataIndex: TABLE_FIELD_TYPE,
                },
                {
                    title: '备注',
                    dataIndex: TABLE_FIELD_REMARK,
                    render: (remark : any, row : any) => {
                        return remark;
                    }
                },
                {
                    title: '数据',
                    dataIndex: TABLE_FIELD_VALUE,
                    render: (data, row) => {
                        let key = row[TABLE_FIELD_NAME];
                        return (
                            <StepExpressionBuilderBox
                                enableFlag={ this.props.enableFlag }
                                stepPathVariableData={ this.props.stepPathVariableData }
                                stepHeaderData={ this.props.stepHeaderData }
                                stepBodyData={ this.props.stepBodyData }
                                stepParamData={ this.props.stepParamData }
                                stepResponseData={ this.props.stepResponseData }
                                value={data}
                                cb={value => this.setData(key, value)}
                                width={288}
                                iteratorId={this.props.iteratorId}
                                unitTestUuid={this.props.unitTestUuid}
                                unitTestStepUuid={this.props.unitTestStepUuid}
                                project={this.props.project}
                            />
                        );
                    }
                },
            ],
            datas: [],
            returnObject,
            options: {},
        }
    }

    async componentDidMount() {
        let parseJsonToChildrenResult : Array<any> = [];
        await parseJsonToChildren([], "", parseJsonToChildrenResult, this.state.object, async (_1, _2) => undefined);
        this.setState({ datas : parseJsonToChildrenResult })
    }

    setData = (key, value) => {
        if (value === undefined) {
            value = "";
        }
        this.state.returnObject[key] = value;
        this.props.cb(this.state.returnObject);
    }

    render() : ReactNode {
        return (
            <Table
                style={{width : "100%"}}
                columns={this.state.columns}
                dataSource={this.state.datas}
                pagination={ false }
            />
        )
    }
}

function mapStateToProps (state) {
    return {
    }
}
  
export default connect(mapStateToProps)(RequestPathVariableFormTable);