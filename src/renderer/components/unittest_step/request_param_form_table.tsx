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
} from '@rutil/json';
import { langTrans } from '@lang/i18n';

class RequestParamFormTable extends Component {

    constructor(props) {
        super(props);
        this.state = this.getState(props);
    }

    async componentDidMount() {
        let parseJsonToChildrenResult : Array<any> = [];
        await parseJsonToChildren([], "", parseJsonToChildrenResult, this.state.object, async (_1, _2) => undefined);
        this.setState({ datas : parseJsonToChildrenResult })
    }

    async componentWillReceiveProps(nextProps) {
        if (nextProps.object !== this.props.object) {
            let newState = this.getState(nextProps);
            this.setState(newState);

            let parseJsonToChildrenResult : Array<any> = [];
            await parseJsonToChildren([], "", parseJsonToChildrenResult, newState.object, async (_1, _2) => undefined);
            this.setState({ datas : parseJsonToChildrenResult })
        }
    }

    getState = (props) => {
        let returnObject : any = {};
        for(let _key in props.object ) {
            returnObject[_key] = props.object[_key][TABLE_FIELD_VALUE];
        }
        return {
            object: props.object,
            columns: [
                {
                    title: langTrans("network table1"),
                    dataIndex: TABLE_FIELD_NAME,
                },
                {
                    title: langTrans("network table2"),
                    dataIndex: TABLE_FIELD_TYPE,
                },
                {
                    title: langTrans("network table3"),
                    dataIndex: TABLE_FIELD_REMARK,
                    render: (remark : any, row : any) => {
                        return remark;
                    }
                },
                {
                    title: langTrans("network table4"),
                    dataIndex: TABLE_FIELD_VALUE,
                    render: (data, row) => {
                        let key = row[TABLE_FIELD_NAME];
                        return (
                            <StepExpressionBuilderBox
                                enableFlag={ props.enableFlag }
                                stepPathVariableData={ props.stepPathVariableData }
                                stepHeaderData={ props.stepHeaderData }
                                stepBodyData={ props.stepBodyData }
                                stepParamData={ props.stepParamData }
                                stepResponseContentData={ props.responseContent }
                                stepResponseHeaderData={ props.responseHeade }
                                stepResponseCookieData={ props.responseCookie }
                                value={data}
                                cb={value => this.setData(key, value)}
                                width={288}
                                iteratorId={ props.iteratorId }
                                unitTestUuid={ props.unitTestUuid }
                                unitTestStepUuid={ props.unitTestStepUuid }
                                project={ props.project }
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
  
export default connect(mapStateToProps)(RequestParamFormTable);