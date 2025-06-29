import { Component, ReactNode } from 'react';
import { connect } from 'react-redux';
import { Input, Modal, Form, Button, Space, message } from "antd";

import {
    parseJsonToTable,
    shortJsonContent,
} from '@rutil/json';
import { isStringEmpty, isJsonString } from '@rutil/index';
import JsonSaveCommonTable from '@comp/request_save/json_save_table_common';

const { TextArea } = Input;

class JsonSaveResponseTableContainer extends Component {

    constructor(props) {
        super(props);
        this.state = {
            open: false,
            object: props.object,
            jsonStr: props.jsonStr,
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
        this.parseJsonToChildren();
        this.props.cb(this.state.object, this.state.jsonStr);
        this.cleanPop();
    }

    handleCancel = () => {
        this.cleanPop();
    }

    cleanPop = () => {
        this.setState({
            open: false,
            addKey: "",
            addVal: "",
        });
    }

    render() : ReactNode {
        return (
            <Space direction="vertical" size={"small"} style={{width: "100%"}}>
                {!this.props.readOnly ? 
                <>
                    <Button onClick={() => this.setState({open: true})}>粘贴 json 报文</Button>
                    <Modal
                        title="接口返回 json 报文"
                        open={this.state.open}
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
                </>
                : null}
                <JsonSaveCommonTable
                    readOnly={this.props.readOnly}
                    object={this.state.object}
                    cb={this.props.cb}
                />
            </Space>
        )
    }
}

function mapStateToProps (state) {
    return {
    }
}
  
export default connect(mapStateToProps)(JsonSaveResponseTableContainer);