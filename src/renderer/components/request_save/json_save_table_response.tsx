import { Component, ReactNode } from 'react';
import { connect } from 'react-redux';
import { cloneDeep } from 'lodash';
import { Table, Input, Modal, Form, Button, Space, message } from "antd";

import {
    TABLE_FIELD_NAME,
    TABLE_FIELD_TYPE,
    TABLE_FIELD_VALUE,
    TABLE_FIELD_REMARK,
    parseJsonToChildren,
    parseJsonToTable,
    genHash,
    shortJsonContent,
} from '../../util/json';

import { getJsonFragment } from '../../actions/request_save';
import { isStringEmpty, isJsonString } from '../../util';

const { TextArea } = Input;

class JsonSaveResponseTableContainer extends Component {

    constructor(props) {
        super(props);
        this.state = {
            open: false,
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
                        let demo = cloneDeep(demoRaw);
                        if(demo != null && demo.length > 50) {
                            return demo.substring(0, 50) + "...";
                        }
                        return demo;
                    }
                },
            ],
            datas: [],
            jsonStr: props.jsonStr,
        }
    }

    async componentDidMount() {
        this.parseJsonToChildren();
    }

    parseJsonToChildren = async () => {
        let parseJsonToChildrenResult : Array<any> = [];
        await parseJsonToChildren([], "", parseJsonToChildrenResult, this.state.object, async (parentKey, content) => {
            let hash = genHash(content);
            let json_fragement = await getJsonFragment(parentKey, hash);
            return json_fragement;
        });
        this.setState({ datas : parseJsonToChildrenResult })
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
        this.props.cb(this.state.object, this.state.jsonStr);

        let returnObject = cloneDeep(this.state.object);
        this.setState({object: returnObject});
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
  
export default connect(mapStateToProps)(JsonSaveResponseTableContainer);