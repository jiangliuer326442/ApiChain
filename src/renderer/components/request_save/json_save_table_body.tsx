import { Component, ReactNode } from 'react';
import { connect } from 'react-redux';
import { cloneDeep } from 'lodash';
import { Table, Input, Modal, Form, Checkbox, Button, message, Select, Space } from "antd";
import { MinusOutlined } from "@ant-design/icons";

import {
    TABLE_FIELD_NAME,
    TABLE_FIELD_TYPE,
    TABLE_FIELD_NECESSARY,
    TABLE_FIELD_VALUE,
    TABLE_FIELD_REMARK,
    parseJsonToChildren,
    parseJsonToTable,
    shortJsonContent,
} from '@rutil/json';
import {
    CONTENT_TYPE_JSON,
    CONTENT_TYPE_FORMDATA,
} from '@conf/contentType';
import {
    INPUTTYPE_TEXT,
    INPUTTYPE_FILE,
    dataTypeSelect,
    DataTypeJsonObject,
} from '@conf/global_config';
import { isStringEmpty, isJsonString } from '@rutil/index';

const { TextArea } = Input;

class JsonSaveBodyTableContainer extends Component {

    constructor(props) {
        super(props);
        this.state = {
            open1: false,
            open2: false,
            addType: INPUTTYPE_TEXT,
            addKey: "",
            addVal: "",
            object: props.object,
            jsonStr: JSON.stringify(props.object),
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
                        if (obj === undefined) {
                            return <Input defaultValue="" value="" onChange={ event => this.handleSetRemark(key, event.target.value) } />;
                        }
                        return <Input defaultValue={ remark } value={ obj[TABLE_FIELD_REMARK] } onChange={ event => this.handleSetRemark(key, event.target.value) } />;
                    }
                },
                {
                    title: '示例',
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
                            } else {
                                if(type !== DataTypeJsonObject && demo != null && demo.length > 50) {
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
                            } else {
                                return <Input value={demo} onChange={ event => this.handleSetValue(key, event.target.value) } />
                            }
                        }
                    }
                },
            ],
            datas: [],
            rawJson: {},
        }

        if (!this.props.readOnly) {
            this.state.columns.unshift(                {
                title: '操作',
                dataIndex: 'operator',
                render: (_, row : any) => {
                    return <Button onClick={ () => this.handleDelKey(row.key) } icon={<MinusOutlined />} />
                }
            });
        }
    }

    async componentDidMount() {
        this.parseJsonToChildren();
    }

    parseJsonToChildren = async () => {
        let parseJsonToChildrenResult : Array<any> = [];
        await parseJsonToChildren([], "", parseJsonToChildrenResult, this.state.object, async (parentKey, content) => undefined);
        this.setState({ datas : parseJsonToChildrenResult })
    }

    handleSetDataType = (key, dataType) => {
        let obj = this.state.object;
        if (dataType === DataTypeJsonObject) {
            let value = obj[key][TABLE_FIELD_VALUE];
            if (!isJsonString(value)) {
                message.error("示例数据不符合json规范");
                return;
            }
        }
        obj[key][TABLE_FIELD_TYPE] = dataType;
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

    handleSetJsonStr = () => {
        if (!isJsonString(this.state.jsonStr)) {
            message.error("请输入正确格式的 json ");
            return;
        }
        let responseData = {};
        if (!isStringEmpty(this.state.jsonStr)) {
            responseData = JSON.parse(this.state.jsonStr);
        }
        let shortResponseJsonObject = {};
        shortJsonContent(shortResponseJsonObject, responseData);
        parseJsonToTable(this.state.object, shortResponseJsonObject);
        this.parseJsonToChildren();
        this.props.cb(this.state.object);
        this.cleanPop();
    }

    handleAddKey = () => {
        let addKey = this.state.addKey;
        let addVal = this.state.addVal;
        if (this.state.addType === INPUTTYPE_TEXT) {
            let rawJson = this.state.rawJson;
            rawJson[addKey] = addVal;
            parseJsonToTable(this.state.object, rawJson);
        } else {
            let _item : any = {};
            _item[TABLE_FIELD_REMARK] = "";
            _item[TABLE_FIELD_TYPE] = "File";
            _item[TABLE_FIELD_VALUE] = addVal;
            this.state.object[addKey] = _item;
        }
        this.parseJsonToChildren();
        this.props.cb(this.state.object);

        this.cleanPop();
    }

    handleCancel = () => {
        this.cleanPop();
    }

    setFile = file => {
        let name = file.name;
        let type = file.type;
        let path = file.path;
        this.state.addVal = {name, type, path};
    }

    cleanPop = () => {
        this.setState({
            open1: false,
            open2: false,
            addKey: "",
            addVal: "",
        });
    }

    render() : ReactNode {
        return (
            <Space direction="vertical" size={"small"} style={{width: "100%"}}>
                {!this.props.readOnly ? 
                <>
                    { this.props.contentType === CONTENT_TYPE_JSON ?
                    <Button onClick={() => this.setState({open2: true})}>粘贴 json 报文</Button>
                    :
                    <Button onClick={() => this.setState({open1: true})}>新增一行</Button> 
                    }
                    { this.props.contentType === CONTENT_TYPE_JSON ?
                    <Modal
                        title="接口返回 json 报文"
                        open={this.state.open2}
                        onOk={this.handleSetJsonStr}
                        onCancel={this.handleCancel}
                        width={530}
                    >
                        <Form
                            layout="vertical"
                        >
                            <Form.Item>
                                <TextArea
                                    value={this.state.jsonStr}
                                    onChange={(e) => {
                                        let content = e.target.value;
                                        this.setState({ jsonStr: content });
                                    }}
                                    autoSize={{ minRows: 10 }}
                                />
                            </Form.Item>
                        </Form>
                    </Modal>
                    :
                    <Modal
                        title="添加请求Body"
                        open={this.state.open1}
                        onOk={this.handleAddKey}
                        onCancel={this.handleCancel}
                        width={251}
                    >
                        <Form
                            layout="vertical"
                        >
                            <Form.Item>
                                <Input placeholder="key" value={this.state.addKey} onChange={ event=>this.setState({addKey : event.target.value}) } />
                            </Form.Item>
                            {this.props.contentType === CONTENT_TYPE_FORMDATA ?
                            <Form.Item>
                                <Select style={{width: 201}} value={this.state.addType} onChange={ value => this.setState({addType: value}) }>
                                    <Select.Option value={ INPUTTYPE_TEXT }>文本</Select.Option>
                                    <Select.Option value={ INPUTTYPE_FILE }>文件</Select.Option>
                                </Select>
                            </Form.Item> 
                            : null}
                            {this.state.addType === INPUTTYPE_TEXT ? 
                            <Form.Item>
                                <Input placeholder="value" value={this.state.addVal} onChange={ event=>this.setState({addVal : event.target.value}) } />
                            </Form.Item>
                            :
                            <Form.Item>
                                <Input type='file' onChange={event => this.setFile(event.target.files[0])} />
                            </Form.Item>
                            }
                        </Form>
                    </Modal>
                    }
                </>
                : null}
                <Table
                    style={{width : "100%"}}
                    columns={this.state.columns}
                    dataSource={this.state.datas}
                    pagination={ false }
                />
            </Space>
        )
    }
}

function mapStateToProps (state) {
    return {
    }
}
  
export default connect(mapStateToProps)(JsonSaveBodyTableContainer);