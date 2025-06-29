import { Component, ReactNode } from 'react';
import { connect } from 'react-redux';
import { Input, Modal, Form, Button, Space } from "antd";

import {
    parseJsonToTable,
} from '@rutil/json';
import JsonSaveCommonTable from '@comp/request_save/json_save_table_common';

class JsonSaveHeaderTableContainer extends Component {

    constructor(props) {
        super(props);
        this.state = {
            open: false,
            addKey: "",
            addVal: "",
            object: props.object,
            rawJson: {},
        }
    }

    async componentDidMount() {
        if (!this.props.readOnly) {
            parseJsonToTable(this.state.object, this.state.rawJson);
        }
    }

    handleAddKey = () => {
        let rawJson = this.state.rawJson;
        let addKey = this.state.addKey;
        let addVal = this.state.addVal;
        rawJson[addKey] = addVal;
        parseJsonToTable(this.state.object, rawJson);
        this.props.cb(this.state.object);

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
                    <Button onClick={() => this.setState({open: true})}>新增一行</Button>
                    <Modal
                        title="添加Header"
                        open={this.state.open}
                        onOk={this.handleAddKey}
                        onCancel={this.handleCancel}
                        width={230}
                    >
                        <Form
                            layout="vertical"
                        >
                            <Form.Item>
                                <Input placeholder="key" value={this.state.addKey} onChange={ event=>this.setState({addKey : event.target.value}) } />
                            </Form.Item>
                            <Form.Item>
                                <Input placeholder="value" value={this.state.addVal} onChange={ event=>this.setState({addVal : event.target.value}) } />
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
  
export default connect(mapStateToProps)(JsonSaveHeaderTableContainer);