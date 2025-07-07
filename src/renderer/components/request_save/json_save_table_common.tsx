import { Component, ReactNode } from 'react';

import { message, Button, Checkbox, Divider, Input, Select, Table } from 'antd';
import { cloneDeep } from 'lodash';
import { MinusOutlined, DeleteOutlined } from "@ant-design/icons";
import JsonView from 'react-json-view';

import { 
    CONTENT_TYPE,
    KEY_SEPARATOR,
    DataTypeJsonObject,
    DataTypeSelectValues,
    dataTypeSelect,
 } from '@conf/global_config';
 import { 
    CONTENT_TYPE_JSON,
    CONTENT_TYPE_URLENCODE,
    CONTENT_TYPE_FORMDATA,
} from '@conf/contentType';
import {
    TABLE_FIELD_NAME,
    TABLE_FIELD_VALUE,
    TABLE_FIELD_NECESSARY,
    TABLE_FIELD_TYPE,
    TABLE_FIELD_REMARK,
    parseJsonToChildren,
    parseJsonToTable,
    retShortJsonContent,
    prettyJson,
} from '@rutil/json';
import { isJsonString, isStringEmpty } from '@rutil/index';
import { langTrans } from '@lang/i18n';

const { TextArea } = Input;

//readonly object cb

export default class extends Component {

    constructor(props) {
        super(props);
        let rawJson : any = {};
        if (!isStringEmpty(props.contentType)) {
            rawJson[CONTENT_TYPE] = props.contentType;
        }
        this.state = {
            appendSelectorValue: "",
            object: props.object,
            columns: [
                {
                    title: langTrans("network table1"),
                    dataIndex: TABLE_FIELD_NAME,
                },
                {
                    title: langTrans("network table2"),
                    dataIndex: TABLE_FIELD_TYPE,
                    render: (dtype : any, row : any) => {
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
                        if (dtype === "Array" || dtype === "Object") {
                            return <span>{dtype}</span>;
                        } else {
                            let key = row.key;
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
                                    style={{ width: 190 }}
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
                        let keyArr = key.split(KEY_SEPARATOR);
                        let obj : any = {};
                        for (let _key of keyArr) {
                            if (Object.keys(obj).length === 0){
                                obj = this.state.object[_key];
                            } else {
                                obj = obj[_key];
                            }
                        }
                        return <Checkbox checked={obj[TABLE_FIELD_NECESSARY] == 1} onChange={event=> this.handleSetNecessary(key, event.target.checked) }></Checkbox>;
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
                        return <Input.TextArea 
                            autoSize 
                            defaultValue={ remark } 
                            value={ obj[TABLE_FIELD_REMARK] } 
                            onChange={ event => this.handleSetRemark(key, event.target.value) } />;
                    }
                },
                {
                    title: langTrans("network table6"),
                    dataIndex: TABLE_FIELD_VALUE,
                    render: (demoRaw : any, row : any) => {
                        let type = row[TABLE_FIELD_TYPE];
                        let key = row.key;
                        let demo = cloneDeep(demoRaw);
                        if (this.props.readOnly || this.props.contentType === CONTENT_TYPE_JSON) {
                            if (type === "File") {
                                let fileName = demo.name;
                                if(fileName != null && fileName.length > 50) {
                                    return fileName.substring(0, 50) + "...";
                                }
                                return fileName;
                            } else if (isJsonString(demo)) {
                                let shortJsonRet = retShortJsonContent(JSON.parse(demo));
                                return <JsonView 
                                    src={shortJsonRet}
                                    name={ false }
                                    indentWidth={2}  
                                    sortKeys={false}
                                    collapseStringsAfterLength={40}
                                    theme={ "bright" }
                                    collapsed={ false }  
                                 />
                            } else {
                                if(type !== DataTypeJsonObject && key !== CONTENT_TYPE && demo != null && demo.length > 50) {
                                    return demo.substring(0, 50) + "...";
                                }
                                return demo;
                            }
                        } else {
                            if (type === "File") {
                                return (<>
                                    <Button style={{width: "100%"}}>{
                                        ((demo !== undefined) && ('name' in demo)) 
                                        ? demo.name : "未选择任何文件"}</Button>
                                    <Input 
                                        type='file' 
                                        onChange={event => this.handleSetFile(key, event.target.files[0])} 
                                        style={{
                                            position: 'absolute',
                                            opacity: 0,  
                                            cursor: 'pointer',
                                            width: 365,
                                            height: 32,
                                            left: 0,
                                        }}  
                                    />
                                </>);
                            } else if (key === CONTENT_TYPE) {
                                return (
                                    <Select style={{width: 285}} value={demo} onChange={ value => this.handleSetValue(key, value) }>
                                        <Select.Option value={ CONTENT_TYPE_URLENCODE }>{ CONTENT_TYPE_URLENCODE }</Select.Option>
                                        <Select.Option value={ CONTENT_TYPE_FORMDATA }>{ CONTENT_TYPE_FORMDATA }</Select.Option>
                                        <Select.Option value={ CONTENT_TYPE_JSON }>{ CONTENT_TYPE_JSON }</Select.Option>
                                    </Select>
                                );
                            } else {
                                return <TextArea 
                                    allowClear 
                                    placeholder={ langTrans("json save table placeholder") }
                                    value={demo} 
                                    onChange={ event => this.handleSetValue(key, event.target.value) } 
                                />
                            }
                        }
                    }
                },
            ],
            datas: [],
            rawJson,
        }

        if (!this.props.readOnly) {
            this.state.columns.unshift(                {
                title: langTrans("log field5"),
                dataIndex: 'operator',
                render: (_, row : any) => {
                    let key = row.key;
                    if (key === CONTENT_TYPE) {
                        return null;
                    } else {
                        return <Button onClick={ () => this.handleDelKey(key) } icon={<MinusOutlined />} />
                    }
                }
            });
        }
    }

    async componentDidMount() {
        if (!this.props.readOnly) {
            parseJsonToTable(this.state.object, this.state.rawJson);
        }
        this.parseJsonToChildren();
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

    handleSetValue = (key, value) => {
        let obj = this.state.object[key];
        obj[TABLE_FIELD_VALUE] = value;
        this.props.cb(this.state.object);

        this.parseJsonToChildren();
    }

    handleSetFile = (key, file) => {
        let obj = this.state.object[key];
        let name = file.name;
        let type = file.type;
        let path = file.path;
        let addVal = {name, type, path};
        obj[TABLE_FIELD_VALUE] = addVal;
        this.props.cb(this.state.object);
        this.parseJsonToChildren();
    }

    handleDelKey = (key : string) => {
        let rawJson = this.state.rawJson;
        delete rawJson[key];
        delete this.state.object[key];
        this.props.cb(this.state.object);
        this.parseJsonToChildren();
    }

    handleSetRemark = (key, value) => {
        let keyArr = key.split(KEY_SEPARATOR);
        let obj : any = {};
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

    handleSetNecessary = (key, checked) => {
        let keyArr = key.split(KEY_SEPARATOR);
        let obj : any = {};
        for (let _key of keyArr) {
            if (Object.keys(obj).length === 0){
                obj = this.state.object[_key];
            } else {
                obj = obj[_key];
            }
        }
        if (checked) {
            obj[TABLE_FIELD_NECESSARY] = 1;
        } else {
            obj[TABLE_FIELD_NECESSARY] = 0;
        }
        this.props.cb(this.state.object);

        this.parseJsonToChildren();
    }

    parseJsonToChildren = async () => {
        let parseJsonToChildrenResult : Array<any> = [];
        await parseJsonToChildren([], "", parseJsonToChildrenResult, this.state.object, async (parentKey, content) => undefined);
        this.setState({ datas : parseJsonToChildrenResult })
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