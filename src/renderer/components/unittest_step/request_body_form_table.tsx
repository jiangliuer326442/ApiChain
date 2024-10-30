import { Component, ReactNode } from 'react';
import { connect } from 'react-redux';
import { Table, Button, Input } from "antd";

import StepExpressionBuilderBox from "./step_expression_builder_box";
import {
    TABLE_FIELD_NAME,
    TABLE_FIELD_TYPE,
    TABLE_FIELD_VALUE,
    TABLE_FIELD_REMARK,
    parseJsonToChildren,
} from '../../util/json';
import { cloneDeep } from 'lodash';

class RequestBodyFormTable extends Component {

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
                        let type = row[TABLE_FIELD_TYPE];
                        if (type === "Object" || type === "Array") {
                            return null;
                        } else if (type === "File") {
                            return (<>
                                <Button style={{width: 291}}>{(data != null && 'name' in data) ? data.name : "未选择任何文件"}</Button>
                                <Input 
                                    type='file' 
                                    onChange={event => this.setFile(key, event.target.files[0])} 
                                    style={{  
                                        position: 'absolute',
                                        opacity: 0,  
                                        cursor: 'pointer',
                                        width: 291,
                                        height: 32,
                                        top: 17,
                                    }}  
                                />
                            </>);
                        } else {
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

    setFile = (key, file) => {
        let item : any = {};
        item.name = file.name;
        item.path = file.path;
        item.type = file.type;

        let data = cloneDeep(this.state.datas);
        for (let _item of data) {
            if (_item.key === key) {
                _item[TABLE_FIELD_VALUE] = item;
            }
        }
        this.setState({datas: data});
        this.state.returnObject[key] = item;
        this.props.cb(this.state.returnObject);
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
                style={ {width : "100%"} }
                columns={ this.state.columns }
                dataSource={ this.state.datas }
                pagination={ false }
            />
        )
    }
}

function mapStateToProps (state) {
    return {
    }
}
  
export default connect(mapStateToProps)(RequestBodyFormTable);