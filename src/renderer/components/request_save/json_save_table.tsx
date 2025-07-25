import { Component, ReactNode } from 'react';
import { cloneDeep } from 'lodash';
import { Table, Divider, Input, Checkbox, Select, message } from "antd";
import { DeleteOutlined } from "@ant-design/icons";

import { 
    dataTypeSelect,
    DataTypeJsonObject,
    DataTypeSelectValues,
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

export default class extends Component {

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
                        let keyArr = key.split(KEY_SEPARATOR);
                        let obj : any = {};
                        for (let _key of keyArr) {
                            if (Object.keys(obj).length === 0){
                                obj = this.state.object[_key];
                            } else {
                                obj = obj[_key];
                            }
                        }
                        if (dtype === DataTypeSelectValues || dtype.indexOf(DataTypeSelectValues + "|") > -1) {
                            let options = [];
                            if (dtype.indexOf(DataTypeSelectValues + "|") > -1) {
                                options = dtype.substring((DataTypeSelectValues + "|").length).split('|').map(pair => {
                                    const [label, value] = pair.split(':');
                                    return { label, value };
                                });
                                dtype = DataTypeSelectValues;
                            }
                            return <>
                                <Select
                                    value={ dtype }
                                    style={{ width: 100 }}
                                    onChange={ value => this.handleSetDataType(key, value) }
                                    options={ dataTypeSelect.map(_v => {
                                        if (_v.indexOf(DataTypeSelectValues + "|") === 0) {
                                            _v = DataTypeSelectValues;
                                        }
                                        return {label: langTrans("datatype " + _v), value: _v};
                                    }) }
                                />
                                <Select 
                                    allowClear
                                    style={{ width: 110 }}
                                    optionRender={(option) => (
                                        <div>
                                            <span>{option.label} </span>
                                            <DeleteOutlined
                                                onClick={async (e) => {
                                                    e.stopPropagation();
                                                    let handledDtype = DataTypeSelectValues + "|" + (options.filter(item => item.value !== option.value).map(item => `${item.label}:${item.value}`).join('|'))
                                                    if (handledDtype === DataTypeSelectValues + "|") {
                                                        handledDtype = DataTypeSelectValues;
                                                    }
                                                    this.handleSetDataType(key, handledDtype)
                                                }}
                                            />
                                        </div>
                                    )}
                                    dropdownRender={(menu) => (
                                        <>
                                            {menu}
                                            <Divider style={{ margin: '8px 0' }} />
                                            <Input
                                                onChange={e => { this.setState({ appendSelectorValue: e.target.value }) }}
                                                value={this.state.appendSelectorValue}
                                                placeholder="label:value"
                                                onKeyDown={e => {
                                                    if (e.key === 'Enter') {
                                                        obj[TABLE_FIELD_TYPE] = obj[TABLE_FIELD_TYPE] + "|" + e.target.value;
                                                        this.setState({appendSelectorValue: ""})
                                                        this.handleSetDataType(key, obj[TABLE_FIELD_TYPE])
                                                    }
                                                    e.stopPropagation()
                                                }}
                                            />
                                        </>
                                    )}
                                    options={options}
                                />
                            </>
                        } else {
                            return <Select
                                value={ dtype }
                                style={{ width: 170 }}
                                onChange={ value => this.handleSetDataType(key, value) }
                                options={ dataTypeSelect.map(_v => ({label: langTrans("datatype " + _v), value: _v})) }
                            />
                        }
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
                    return <TextArea 
                        autoSize
                        defaultValue={ remark } 
                        value={ obj[TABLE_FIELD_REMARK] } 
                        onChange={ event => this.handleSetRemark(key, event.target.value) } 
                    />;
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
                    } else if(row[TABLE_FIELD_TYPE] === DataTypeSelectValues || row[TABLE_FIELD_TYPE].indexOf(DataTypeSelectValues + "|") > -1) {
                        let options = [];
                        if (row[TABLE_FIELD_TYPE].indexOf(DataTypeSelectValues + "|") > -1) {
                            options = row[TABLE_FIELD_TYPE].substring((DataTypeSelectValues + "|").length).split('|').map(pair => {
                                const [label, value] = pair.split(':');
                                return { label, value };
                            });
                        }
                        return <Select 
                            allowClear
                            value={demo} 
                            onChange={newValue => this.handleSetContent(key, newValue)}
                            style={{ width: 265 }}
                            options={options}
                            />
                    } else {
                        return <TextArea 
                            allowClear
                            autoSize
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
            let value = obj[TABLE_FIELD_VALUE];
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