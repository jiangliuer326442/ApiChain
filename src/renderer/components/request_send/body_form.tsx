import { Component, ReactNode } from 'react';
import { connect } from 'react-redux';
import { cloneDeep } from 'lodash';
import { DeleteOutlined } from '@ant-design/icons';
import { 
    Input, Flex, AutoComplete, Button, Select, Typography
} from "antd";

import { isStringEmpty, removeWithoutGap, isJsonString, getType } from "@rutil/index";

import CommonHeader from '@comp/request_send/common_header';
import BulkEditBox from '@comp/request_send/bulk_edit_box';
import {
    CONTENT_TYPE_JSON, CONTENT_TYPE_FORMDATA, 
} from '@conf/contentType';
import { INPUTTYPE_TEXT, INPUTTYPE_FILE } from '@conf/global_config';
import { prettyJson } from '@rutil/json';
import { langTrans } from '@lang/i18n';

const { Text, Link } = Typography;
const { TextArea } = Input;

class RequestSendBody extends Component {

    constructor(props) {
        super(props);

        this.state = {
            contentType: props.contentType,
            requestBodyData: props.obj,
            requestFileData: props.file,
            bulkStr: "",
            buckEditFlg: false,
        };

        let ret = this.buildList();
        Object.assign(this.state, this.state, {
            rows : ret[0],
            data : ret[1],
        })
    }

    async componentDidUpdate(prevProps) { 
        if (this.props.contentType != prevProps.contentType) {
            this.state.contentType = this.props.contentType;
            let ret = this.buildList();
            Object.assign(this.state, this.state, {
                rows : ret[0],
                data : ret[1],
            })
        }
    }

    buildList = () => {
        let obj = this.calculateFormBodyData(this.state.requestBodyData, this.state.requestFileData);

        if (this.state.contentType === CONTENT_TYPE_JSON) {
            let data = this.innerPrettyJson(obj);
            return [0, data];
        } else {
            let list = obj;
            for (let _item of list) {
                if (_item.type === INPUTTYPE_FILE) {

                    const blob = new Blob([this.state.requestFileData[_item.key].blob], { type: this.state.requestFileData[_item.key].type });  
  
                    // 使用Blob对象和文件名来创建一个File对象  
                    const file = new File([blob], this.state.requestFileData[_item.key].name, {  
                        type: this.state.requestFileData[_item.key].type,
                    });
                    _item.value = file;
                }
            }
            return [list.length, list];
        }
    }

    innerPrettyJson = (jsonstr : string) : string => {
        let data = jsonstr;
        if (!isStringEmpty(data)) {
            data = prettyJson(JSON.parse(data));
        }
        return data;
    }

    calculateFormBodyData = (requestBodyData, requestFileData) => {
        if (this.state.contentType === CONTENT_TYPE_JSON) {
            return JSON.stringify(requestBodyData);
        } else {
            let list = [];
            for (let _key in requestBodyData) {
                let item : any = {};
                item["key"] = _key;
                item["value"] = requestBodyData[_key];
                item["type"] = INPUTTYPE_TEXT;
                list.push(item);
            }
            if (this.state.contentType === CONTENT_TYPE_FORMDATA) {
                for (let _key in requestFileData) {
                    let item : any = {};
                    item["key"] = _key;
                    item["value"] = "";
                    item["type"] = INPUTTYPE_FILE;
                    list.push(item);
                }
            }
            this.setRequestBodyData(list);
            return list;
        }
    }

    setRequestBodyData = (data: Array<any>) => {
        if (this.state.contentType === CONTENT_TYPE_JSON) {
            this.props.cb(JSON.parse(data), null);
        } else if (this.state.contentType === CONTENT_TYPE_FORMDATA) {
            let obj : any = {};
            let file : any = {};
            let originFile : any = this.state.requestFileData;
            if (data.length > 0) {
                for (let item of data) {
                    let value = item.value;
                    if (isStringEmpty(item.type)) return;
                    if (isStringEmpty(item.key)) return;
                    if (item.type === INPUTTYPE_TEXT) {
                        if (getType(value) === "Undefined") {
                            value = "";
                        }
                        obj[item.key] = value;
                    } else if (item.type === INPUTTYPE_FILE) {
                        if (getType(value) === "File" && value.path) {
                            let _file : any = {};
                            _file.name = value.name;
                            _file.type = value.type;
                            _file.path = value.path;
                            file[item.key] = _file;
                            var reader = new FileReader();
                            reader.readAsArrayBuffer(value);
                            let that = this;
                            reader.onload = function(e) {
                                let _file = that.state.requestFileData[item.key];
                                let blob = e.target.result;
                                _file.blob = blob;
                            };
                        } else if (item.key in originFile) {
                            let _file = originFile[item.key];
                            file[item.key] = _file;
                        }
                    }
                }
    
                this.props.cb(obj, file);
            }
        } else {
            let obj = {};
            if (data.length > 0) {
                for (let item of data) {
                    let value = item.value;
                    if (getType(value) === "Undefined") {
                        value = "";
                    }
                    obj[item.key] = value;
                }
            }
            this.props.cb(obj, null);
        }
    }

    setKey = (value, i) => {
        if (!isStringEmpty(value) && i === this.state.rows) {
            let row : any = {};
            row.key = value;
            row.type = INPUTTYPE_TEXT;
            this.state.data.push(row);
            this.setState({rows : this.state.rows + 1});
            this.setRequestBodyData(this.state.data);
        } else {
            let data = cloneDeep(this.state.data);
            let row = data[i];
            row.key = value;
            this.setState({ data });
            this.setRequestBodyData(data);
        }
    }

    setSelectedValue = (value, i) => {
        let data = cloneDeep(this.state.data);
        data[i].options = [];
        data[i].value = value;
        this.setState({ data });
    }

    setFile = (file, i) => {
        let value = file;
        if(i === this.state.rows) {
            let row : any = {};
            row.value = value;
            row.type = INPUTTYPE_FILE;
            this.setState({rows : this.state.rows + 1});
            this.setRequestBodyData(this.state.data);
        } else {
            let row = this.state.data[i];
            row.value = value;
            let data = cloneDeep(this.state.data);
            this.setState({data});
            this.setRequestBodyData(this.state.data);
        }
    }

    setValue = (value, i) => {
        if(!isStringEmpty(value) && i === this.state.rows) {
            let row : any = {};
            row.value = value;
            this.state.data.push(row);
            this.setState({rows : this.state.rows + 1});
            this.setRequestBodyData(this.state.data);
        } else {
            let row = this.state.data[i];
            row.value = value;
            if (row.type === INPUTTYPE_TEXT) {
                this.state.requestBodyData[row.key] = row.value;
            }
            this.setRequestBodyData(this.state.data);
        }
    }

    setType = (value, i) => {
        if(i === this.state.rows) {
            let row : any = {};
            row.type = value;
            this.state.data.push(row);
            this.setState({rows : this.state.rows + 1});
            this.setRequestBodyData(this.state.data);
        } else {
            let row = this.state.data[i];
            row.type = value;
            if (value === INPUTTYPE_FILE) {
                delete this.state.requestBodyData[row.key];
            } else if (value === INPUTTYPE_TEXT) {
                this.state.requestBodyData[row.key] = row.value;
            }
            this.setState({data: this.state.data});
            this.setRequestBodyData(this.state.data);
        }
    }

    handleDel = (i) => {
        let data = cloneDeep(this.state.data);
        delete this.state.requestBodyData[data[i].key];
        let newData = removeWithoutGap(data, i);
        this.setState({ data: newData, rows: this.state.rows - 1 });
        this.setRequestBodyData(newData);
    }

    setOptions = (text, i) => {
        if (text.length === 1) {
            this.setValue(text, i);
        }
        let data = cloneDeep(this.state.data);
        if (text.indexOf("{{") === 0) {
            text = text.substring(2);
            let options = [];
            for(let tip_value of this.props.tips) {
                if (isStringEmpty(text) || tip_value.toLowerCase().indexOf(text.toLowerCase()) >= 0) {
                    options.push({
                        label: tip_value,
                        value: "{{" + tip_value + "}}"
                    });
                }
            }
            data[i].options = options;
            this.setState({ data });
        } else {
            data[i].options = [];
            this.setState({ data });
        }
    }

    render() : ReactNode {
        return this.props.contentType === CONTENT_TYPE_JSON ? 
            (<Flex vertical gap="small">
                <Flex justify="space-between">
                    <Text>{langTrans("request send body form paste")}</Text>
                    <Link onClick={() => { 
                        let data = this.innerPrettyJson(this.state.data);
                        this.setState({data});
                    }}>{langTrans("request format json")}</Link>
                </Flex>
                <Flex>
                    <TextArea
                        value={this.state.data}
                        onChange={(e) => {
                            let content = e.target.value;
                            this.setState({ data: content });
                            if (isJsonString(content)) {
                                this.setRequestBodyData(content);
                            }
                        }}
                        autoSize={{ minRows: 10 }}
                    />
                </Flex>
            </Flex>)
        : 
            (<Flex vertical gap="small">
                <CommonHeader 
                    data={this.state.requestBodyData}
                    buckEditFlg={this.state.buckEditFlg} 
                    cb={(buckEditFlg, bulkStr) => this.setState({buckEditFlg, bulkStr})} />
                <BulkEditBox 
                    content={this.state.bulkStr}
                    buckEditFlg={this.state.buckEditFlg}
                    cb={(content, data) => {
                        this.state.requestBodyData = data;
                        let ret = this.buildList();

                        this.setState({
                            bulkStr: content,
                            rows : ret[0],
                            data : ret[1],
                        });
                    }}
                    />
            {!this.state.buckEditFlg && Array.from({ length: this.state.rows+1 }, (_, i) => (
                <Flex key={i}>
                    <Flex>
                        <Button 
                            type='link' danger 
                            shape="circle" 
                            disabled={i >= this.state.rows} 
                            icon={<DeleteOutlined />} 
                            onClick={() => this.handleDel(i)}
                        />
                    </Flex>
                    <Flex flex={1}>
                        <Input allowClear value={
                            (i<this.state.rows ? this.state.data[i].key : "")
                            } 
                            onChange={event => this.setKey(event.target.value, i)} />
                    </Flex>
                    <Flex flex={1}>
                    {
                        ((i<this.state.rows ? this.state.data[i].type : INPUTTYPE_TEXT) === INPUTTYPE_TEXT || this.props.contentType !== CONTENT_TYPE_FORMDATA) ?
                        <AutoComplete
                            allowClear
                            style={{width: "100%"}}
                            onSearch={text => this.setOptions(text, i)}
                            placeholder={langTrans("request field tip1")}
                            onChange={data => this.setValue(data, i)}
                            onSelect={data => this.setSelectedValue(data, i)}
                            options={ this.state.data[i] && this.state.data[i]['options'] ? this.state.data[i]['options'] : [] }
                            value={
                                (i<this.state.rows ? this.state.data[i].value : "")
                            }
                        >
                        </AutoComplete>
                        :
                        <>
                            <Button style={{width: "100%"}}>{
                                (i<this.state.rows && (this.state.data[i].value !== undefined) && ('name' in this.state.data[i].value)) 
                                ? this.state.data[i].value.name : langTrans("request send body form unfile")}</Button>
                            <Input 
                                type='file' 
                                onChange={event => this.setFile(event.target.files[0], i)} 
                                style={{  
                                    position: 'absolute',
                                    opacity: 0,  
                                    cursor: 'pointer',
                                    width: 349,
                                    height: 32,
                                }}  
                            />
                        </>
                    }
                    {this.props.contentType === CONTENT_TYPE_FORMDATA ? 
                        <Select 
                            value={
                                (i<this.state.rows ? this.state.data[i].type : INPUTTYPE_TEXT)
                            }
                            onChange={value => this.setType(value, i)}
                            style={{borderRadius: 0, width: 85}}>
                            <Select.Option value={ INPUTTYPE_TEXT }>{ langTrans("request send body form select1") }</Select.Option>
                            <Select.Option value={ INPUTTYPE_FILE }>{ langTrans("request send body form select2") }</Select.Option>
                        </Select>
                    : null}
                    </Flex>
                </Flex>
            ))}
            </Flex>)
    }

}

function mapStateToProps (state) {
    return {
    }
}
  
export default connect(mapStateToProps)(RequestSendBody);