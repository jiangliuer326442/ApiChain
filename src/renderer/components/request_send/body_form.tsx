import { Component, ReactNode } from 'react';
import { connect } from 'react-redux';
import { cloneDeep } from 'lodash';
import { DeleteOutlined } from '@ant-design/icons';
import { 
    Input, Flex, AutoComplete, Button, Select
} from "antd";

import { isStringEmpty, removeWithoutGap, isJsonString } from "../../util";

import {
    CONTENT_TYPE_JSON, CONTENT_TYPE_FORMDATA, 
} from '../../../config/contentType';
import { INPUTTYPE_TEXT, INPUTTYPE_FILE } from '../../../config/global_config';
import { prettyJson } from '../../util/json';

const { TextArea } = Input;

class RequestSendBody extends Component {

    constructor(props) {
        super(props);

        if (props.contentType === CONTENT_TYPE_JSON) {
            let data = props.obj;
            if (!isStringEmpty(data)) {
                data = prettyJson(JSON.parse(data));
            }
            this.state = {
                rows : 0,
                data
            }
        } else {
            let list = props.obj;
            for (let _item of list) {
                if (_item.type === INPUTTYPE_FILE) {

                    const blob = new Blob([props.file[_item.key].blob], { type: props.file[_item.key].type });  
  
                    // 使用Blob对象和文件名来创建一个File对象  
                    const file = new File([blob], props.file[_item.key].name, {  
                        type: props.file[_item.key].type,
                    });
                    _item.value = file;
                }
            }
            this.state = {
                rows: list.length,
                data: list,
            };
        }
    }

    setKey = (value, i) => {
        if(!isStringEmpty(value) && i === this.state.rows) {
            let row : any = {};
            row.key = value;
            row.type = INPUTTYPE_TEXT;
            this.state.data.push(row);
            this.setState({rows : this.state.rows + 1});
            this.props.cb(this.state.data);
        } else {
            let data = cloneDeep(this.state.data);
            let row = data[i];
            row.key = value;
            this.setState({ data });
            this.props.cb(data);
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
            this.props.cb(this.state.data);
        } else {
            let row = this.state.data[i];
            row.value = value;
            let data = cloneDeep(this.state.data);
            this.setState({data});
            this.props.cb(this.state.data);
        }
    }

    setValue = (value, i) => {
        if(!isStringEmpty(value) && i === this.state.rows) {
            let row : any = {};
            row.value = value;
            this.state.data.push(row);
            this.setState({rows : this.state.rows + 1});
            this.props.cb(this.state.data);
        } else {
            let row = this.state.data[i];
            row.value = value;
            this.props.cb(this.state.data);
        }
    }

    setType = (value, i) => {
        if(i === this.state.rows) {
            let row : any = {};
            row.type = value;
            this.state.data.push(row);
            this.setState({rows : this.state.rows + 1});
            this.props.cb(this.state.data);
        } else {
            let row = this.state.data[i];
            row.type = value;
            this.setState({data: this.state.data});
            this.props.cb(this.state.data);
        }
    }

    handleDel = (i) => {
        let data = cloneDeep(this.state.data);
        let newData = removeWithoutGap(data, i);
        this.setState({ data: newData, rows: this.state.rows - 1 });
        this.props.cb(newData);
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
                <Flex>在下方粘贴你的 json 报文</Flex>
                <Flex>
                    <TextArea
                        value={this.state.data}
                        onChange={(e) => {
                            let content = e.target.value;
                            this.setState({ data: content });
                            if (isJsonString(content)) {
                                this.props.cb(content);
                            }
                        }}
                        autoSize={{ minRows: 10 }}
                    />
                </Flex>
            </Flex>)
        : 
            (<Flex vertical gap="small">
                <Flex>
                    <Flex><div style={{width: 20}}></div></Flex>
                    <Flex flex={1} style={{paddingLeft: 20}}>键</Flex>
                    <Flex flex={1} style={{paddingLeft: 20}}>值</Flex>
                </Flex>
                {Array.from({ length: this.state.rows+1 }, (_, i) => (
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
                            placeholder="输入 {{ 可引用环境变量参数"
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
                                ? this.state.data[i].value.name : "未选择任何文件"}</Button>
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
                            <Select.Option value={ INPUTTYPE_TEXT }>文本</Select.Option>
                            <Select.Option value={ INPUTTYPE_FILE }>文件</Select.Option>
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