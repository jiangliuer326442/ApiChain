import { Component, ReactNode } from 'react';
import { connect } from 'react-redux';
import { Table, Button, Input } from "antd";
import { cloneDeep } from 'lodash';

import StepExpressionBuilderBox from "./step_expression_builder_box";
import {
    TABLE_FIELD_NAME,
    TABLE_FIELD_TYPE,
    TABLE_FIELD_VALUE,
    TABLE_FIELD_REMARK,
    buildJsonString,
} from '@rutil/json';
import { getType, isNumeric } from '@rutil/index';
import { langTrans } from '@lang/i18n';

class RequestBodyFormTable extends Component {

    constructor(props) {
        super(props);
        this.state = this.getState(props);
    }

    async componentDidMount() {
        this.initData(this.state.object);
    }

    async componentWillReceiveProps(nextProps) {
        if (nextProps.object !== this.props.object) {
            let newState = this.getState(nextProps);
            this.setState(newState);

            this.initData(newState.object);
        }
    }

    initData = async (obj : any) => {
        let ret = await buildJsonString(obj);
        this.setState({
            jsonStringKeys: ret.jsonStringKeys,
            datas: ret.parseJsonToChildrenResult,
            returnObject: ret.returnObject,
        });
    }

    resetReturnObject = (returnObject) => {
        for (let _key in returnObject) {
            if (this.state.jsonStringKeys.has(_key)) {
                returnObject[_key] = JSON.stringify(returnObject[_key]);
            }
        }
        return returnObject;
    }

    setReturnObject = (returnObject) => {
        for (let _key in returnObject) {
            if (this.state.jsonStringKeys.has(_key)) {
                returnObject[_key] = JSON.parse(returnObject[_key]);
            }
        }
        return returnObject;
    }

    getState = (props) => {
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
                        let key = row.key;
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
                                    enableFlag={ props.enableFlag }
                                    stepPathVariableData={ props.stepPathVariableData }
                                    stepHeaderData={ props.stepHeaderData }
                                    stepBodyData={ props.stepBodyData }
                                    stepParamData={ props.stepParamData }
                                    stepResponseContentData={ props.responseContent }
                                    stepResponseHeaderData={ props.responseHeader }
                                    stepResponseCookieData={ props.responseCookie }
                                    value={data}
                                    cb={value => this.setData(key, value)}
                                    width={288}
                                    iteratorId={props.iteratorId}
                                    unitTestUuid={props.unitTestUuid}
                                    unitTestStepUuid={props.unitTestStepUuid}
                                    project={props.project}
                                />
                            );
                        }
                    }
                },
            ],
            datas: [],
            options: {},
            jsonStringKeys: new Set<String>(),
        }
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
        let keyArr = key.split(".");
        let initObj = cloneDeep(this.setReturnObject(this.state.returnObject));
        let _obj = initObj;
        let keyIndex = 0;
        for (let _key of keyArr) {
            keyIndex++;
            if (keyIndex == keyArr.length) {
                if (getType(_obj) === "Array") {
                    if (isNumeric(_key)) {
                        _obj[0] = value;
                    } else {
                        _obj[0][_key] = value;
                    }
                } else {
                    _obj[_key] = value;
                }
            } else {
                if (getType(_obj) === "Array") {
                    _obj[0] = _obj[_key];
                } else {
                    _obj = _obj[_key];
                }
            }
        }

        let keyPrefix = keyArr[0];
        if (this.state.jsonStringKeys.has(keyPrefix)) {
            initObj[keyPrefix] = JSON.stringify(initObj[keyPrefix]);
        }
        this.state.returnObject = initObj;
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