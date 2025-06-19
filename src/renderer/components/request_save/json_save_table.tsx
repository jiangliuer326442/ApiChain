import { Component, ReactNode } from 'react';
import { connect } from 'react-redux';
import { cloneDeep } from 'lodash';
import { Table, Input, Checkbox, Select, message } from "antd";

import { 
    dataTypeSelect,
    DataTypeJsonObject,
    KEY_SEPARATOR,
} from '@conf/global_config';

import {
    TABLE_FIELD_NAME,
    TABLE_FIELD_TYPE,
    TABLE_FIELD_NECESSARY,
    TABLE_FIELD_VALUE,
    TABLE_FIELD_REMARK,
    parseJsonToChildren,
    genHash,
} from '@rutil/json';

import { getJsonFragment } from '@act/request_save';
import { isJsonString } from '@rutil/index';
import { langTrans } from '@lang/i18n';

const { TextArea } = Input;

class JsonSaveTableContainer extends Component {

    constructor(props) {
        super(props);
        let columns = [
            {
                title: langTrans("network table1"),
                dataIndex: TABLE_FIELD_NAME,
            },
            {
                title: langTrans("network table2"),
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
                            options={ dataTypeSelect.map(_v => ({label: langTrans("datatype " + _v), value: _v})) }
                        />
                    }
                }
            },
            {
                title: langTrans("network table5"),
                dataIndex: TABLE_FIELD_NECESSARY,
                render: (necessary : number|undefined, row : any) => {
                    let key = row.key;
                    return <Checkbox checked={necessary == 1} onChange={event=> this.handleSetNecessary(key, event.target.checked) }></Checkbox>;
                }
            },
            {
                title: langTrans("network table3"),
                dataIndex: TABLE_FIELD_REMARK,
                render: (remark : any, row : any) => {
                    let key = row.key;
                    let keyArr = key.split(KEY_SEPARATOR);
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
                title: langTrans("network table6"),
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
                            placeholder={ langTrans("json save table placeholder") }
                            value={demo} 
                            onChange={ event => this.handleSetContent(key, event.target.value) } 
                        />
                    }
                }
            },
        ];
        if (props.showNecessary !== undefined && !props.showNecessary) {
            columns.splice(2, 1);
        }
        this.state = {
            object: props.object,
            columns,
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
        let keyArr = key.split(KEY_SEPARATOR);
        let obj : any = {};
        for (let _key of keyArr) {
            if (Object.keys(obj).length === 0){
                obj = this.state.object[_key];
            } else {
                obj = obj[_key];
            }
        }
        if (dataType === DataTypeJsonObject) {
            let value = obj[key][TABLE_FIELD_VALUE];
            if (!isJsonString(value)) {
                message.error(langTrans("json save table json error"));
                return;
            }
        }
        obj[TABLE_FIELD_TYPE] = dataType;
        this.props.cb(this.state.object);

        this.parseJsonToChildren();
    }

    handleSetContent = (key, content) => {
        let keyArr = key.split(KEY_SEPARATOR);
        let obj : any = {};
        for (let _key of keyArr) {
            if (Object.keys(obj).length === 0){
                obj = this.state.object[_key];
            } else {
                obj = obj[_key];
            }
        }
        obj[TABLE_FIELD_VALUE] = content;
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
        let keyArr = key.split(KEY_SEPARATOR);
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