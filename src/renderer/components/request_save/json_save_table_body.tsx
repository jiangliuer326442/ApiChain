import { Component, ReactNode } from 'react';
import { Input, Modal, Form, Checkbox, Button, message, Select, Space } from "antd";

import {
    TABLE_FIELD_TYPE,
    TABLE_FIELD_VALUE,
    TABLE_FIELD_REMARK,
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
} from '@conf/global_config';
import JsonSaveCommonTable from '@comp/request_save/json_save_table_common';
import { isStringEmpty, isJsonString } from '@rutil/index';

const { TextArea } = Input;

export default class extends Component {

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
            rawJson: {},
        }
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
                <JsonSaveCommonTable 
                    contentType={this.props.contentType}
                    readOnly={this.props.readOnly}
                    object={this.state.object}
                    cb={this.props.cb}
                />
            </Space>
        )
    }
}