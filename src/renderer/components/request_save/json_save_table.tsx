import { Component, ReactNode } from 'react';
import { connect } from 'react-redux';
import { cloneDeep } from 'lodash';
import { Table, Input, Checkbox, Select, message } from "antd";

import {
    TABLE_FIELD_NAME,
    TABLE_FIELD_TYPE,
    TABLE_FIELD_NECESSARY,
    TABLE_FIELD_VALUE,
    TABLE_FIELD_REMARK,
    parseJsonToChildren,
    genHash,
} from '@rutil/json';

import { CONTENT_TYPE } from '@conf/global_config';

import { getJsonFragment } from '@act/request_save';
import { isJsonString } from '@rutil/index';

const { TextArea } = Input;

const dataTypeSelect = [
    {label: "字符串", value: "String"},
    {label: "布尔型", value: "Boolean"},
    {label: "数字", value: "Number"},
    {label: "json字符串", value: "JsonString"},
];

class JsonSaveTableContainer extends Component {

    constructor(props) {
        super(props);
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
                    render: (dtype : any, row : any) => {
                        if (dtype === "Array" || dtype === "Object") {
                            return <span>{dtype}</span>;
                        } else {
                            let key = row.key;
                            return <Select
                                value={ dtype }
                                style={{ width: 170 }}
                                onChange={ value => this.handleSetDataType(key, value) }
                                options={ dataTypeSelect }
                            />
                        }
                    }
                },
                {
                    title: '必填',
                    dataIndex: TABLE_FIELD_NECESSARY,
                    render: (necessary : number|undefined, row : any) => {
                        let key = row.key;
                        return <Checkbox checked={necessary == 1} onChange={event=> this.handleSetNecessary(key, event.target.checked) }></Checkbox>;
                    }
                },
                {
                    title: '备注',
                    dataIndex: TABLE_FIELD_REMARK,
                    render: (remark : any, row : any) => {
                        let key = row.key;
                        let keyArr = key.split(".");
                        let obj : any = {};
                        for (let _key of keyArr) {
                            if (Object.keys(obj).length === 0){
                                obj = this.state.object[_key];
                            } else {
                                obj = obj[_key];
                            }
                        }
                        return <Input defaultValue={ remark } value={ obj[TABLE_FIELD_REMARK] } onChange={ event => this.handleSetRemark(key, event.target.value) } />;
                    }
                },
                {
                    title: '示例',
                    dataIndex: TABLE_FIELD_VALUE,
                    render: (demoRaw : any, row : any) => {
                        let key = row.key;
                        let demo = cloneDeep(demoRaw);
                        if (row[TABLE_FIELD_TYPE] === "File") {
                            if(demo.name != null && demo.name.length > 50) {
                                return demo.name.substring(0, 50) + "...";
                            }
                            return demo.name;
                        } else {
                            return <TextArea 
                                allowClear
                                placeholder="示例数据" 
                                value={demo} 
                                onChange={ event => this.handleSetContent(key, event.target.value) } 
                            />
                        }
                    }
                },
            ],
            datas: [],
        }
    }

    async componentDidMount() {
        this.parseJsonToChildren();
    }

    parseJsonToChildren = async () => {
        let parseJsonToChildrenResult : Array<any> = [];
        await parseJsonToChildren([], "", parseJsonToChildrenResult, this.state.object, async (parentKey, content) => {
            if (this.props.readOnly) return undefined;
            let hash = genHash(content);
            let json_fragement = await getJsonFragment(parentKey, hash);
            return json_fragement;
        });
        this.setState({ datas : parseJsonToChildrenResult })
    }

    handleSetDataType = (key, dataType) => {
        if (dataType === "JsonString") {
            let value = this.state.object[key][TABLE_FIELD_VALUE];
            if (!isJsonString(value)) {
                message.error("示例数据不符合json规范");
                return;
            }
        }
        let obj = this.state.object;
        obj[key][TABLE_FIELD_TYPE] = dataType;
        this.props.cb(this.state.object);

        this.parseJsonToChildren();
    }

    handleSetContent = (key, content) => {
        let obj = this.state.object;
        obj[key][TABLE_FIELD_VALUE] = content;
        this.props.cb(this.state.object);

        this.parseJsonToChildren();
    }

    handleSetNecessary = (key, checked) => {
        let obj = this.state.object;
        if (checked) {
            obj[key][TABLE_FIELD_NECESSARY] = 1;
        } else {
            obj[key][TABLE_FIELD_NECESSARY] = 0;
        }
        this.props.cb(this.state.object);

        this.parseJsonToChildren();
    }

    handleSetRemark = (key, value) => {
        let keyArr = key.split(".");
        let obj = {};
        for (let _key of keyArr) {
            if (Object.keys(obj).length === 0){
                obj = this.state.object[_key];
            } else {
                obj = obj[_key];
            }
        }
        obj[TABLE_FIELD_REMARK] = value;
        this.props.cb(this.state.object);

        let returnObject = cloneDeep(this.state.object);
        this.setState({object: returnObject});
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
  
export default connect(mapStateToProps)(JsonSaveTableContainer);