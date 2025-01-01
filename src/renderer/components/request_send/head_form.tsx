import { Component, ReactNode } from 'react';
import { connect } from 'react-redux';
import { cloneDeep } from 'lodash';
import { 
    AutoComplete, Input, Flex, Select, Button
} from "antd";
import { DeleteOutlined } from '@ant-design/icons';

import { isStringEmpty, removeWithoutGap } from "../../util";

import { 
    CONTENT_TYPE_URLENCODE,
    CONTENT_TYPE_FORMDATA,
    CONTENT_TYPE_JSON,
} from "../../../config/contentType"

class RequestSendHead extends Component {

    constructor(props) {
        super(props);
        this.state = {
            rows: props.obj.length,
            data: props.obj,
        };
    }

    setKey = (value, i) => {
        if(!isStringEmpty(value) && i === this.state.rows) {
            let row = {};
            row.key = value;
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

    setContentType = (contentType : string) => {
        this.setValue(contentType, 0);
    }

    setValue = (value : string, i : number) => {
        if(!isStringEmpty(value) && i === this.state.rows) {
            let row = {};
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

    handleDel = (i) => {
        let data = cloneDeep(this.state.data);
        let newData = removeWithoutGap(data, i);
        this.setState({ data: newData, rows: this.state.rows - 1 });
        console.debug(newData);
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
        return (
            <Flex vertical gap="small">
                <Flex>
                    <Flex><div style={{width: 20}}></div></Flex>
                    <Flex flex={1} style={{paddingLeft: 20}}>键</Flex>
                    <Flex flex={1} style={{paddingLeft: 20}}>值</Flex>
                </Flex>
                {Array.from({ length: this.state.rows+1 }, (row, i) => (
                    ( i === 0 ? 
                        <Flex key={i}>
                            <Flex>
                                <Button 
                                    type='link' danger 
                                    shape="circle" 
                                    disabled={true} 
                                    icon={<DeleteOutlined />} 
                                    onClick={() => this.handleDel(i)}
                                />
                            </Flex>
                            <Flex flex={1}>
                                <Input onChange={event => this.setKey(event, i)} defaultValue={this.state.data[i].key} readOnly />
                            </Flex>
                            <Flex flex={1}>
                            <Select
                                defaultValue={this.state.data[i].value}
                                style={{ width: "100%" }}
                                onChange={ this.setContentType }
                                options={[
                                    { value: CONTENT_TYPE_URLENCODE, label: CONTENT_TYPE_URLENCODE },
                                    { value: CONTENT_TYPE_FORMDATA, label: CONTENT_TYPE_FORMDATA },
                                    { value: CONTENT_TYPE_JSON, label: CONTENT_TYPE_JSON },
                                ]}
                                />
                            </Flex>
                        </Flex>
                    : 
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
                                <Input allowClear
                                    value={
                                        (i<this.state.rows ? this.state.data[i].key : "")
                                    }
                                    onChange={event => this.setKey(event.target.value, i)} />
                            </Flex>
                            <Flex flex={1}>
                                <AutoComplete allowClear
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
                            </Flex>
                        </Flex>
                    )
                ))}
            </Flex>
        )
    }

}

function mapStateToProps (state) {
    return {
    }
}
  
export default connect(mapStateToProps)(RequestSendHead);