import { Component, ReactNode } from 'react';
import { cloneDeep } from 'lodash';
import { Input, Flex, Button, AutoComplete, Select, InputNumber } from "antd";
import { DeleteOutlined } from '@ant-design/icons';

import CommonHeader from '@comp/request_send/common_header';
import BulkEditBox from '@comp/request_send/bulk_edit_box';
import { isStringEmpty, removeWithoutGap, getType } from "@rutil/index";
import { TABLE_FIELD_TYPE } from "@rutil/json";
import {
    DataTypeSelectValues
} from "@conf/global_config";
import { langTrans } from '@lang/i18n';

export default class extends Component {

    constructor(props) {
        super(props);
        this.state = {
            requestUri: props.requestUri,
            requestPathVariableData: props.obj,
            bulkStr: "",
            buckEditFlg: false,
        };
        let ret = this.buildList();
        Object.assign(this.state, this.state, {
            rows : ret[0],
            data : ret[1],
        })
    }

    buildList = () => {
        let list = this.calculatePathVariableData(this.state.requestPathVariableData);
        return [list.length, list];
    }

    calculatePathVariableData = (requestPathVariableData) => {
        let list = [];
        for (let _key in requestPathVariableData) {
            let item : any = {};
            item["key"] = _key;
            item["value"] = requestPathVariableData[_key];
            list.push(item);
        }
        this.setRequestPathVariableData(list);
        return list;
    }

    setRequestPathVariableData = (data: Array<any>) => {
        let uri = this.state.requestUri;
        let beginIndex = 0;
        let endIndex = 0;
        let keywords = new Set();
        let dataKeys = new Set();
        //从uri 中提取全部 uri 变量
        if (uri.length > 4) {
          for (let i = 0; i < uri.length; i++) {
            if (i < uri.length - 4) {
              if (uri[i] === "{" && uri[i + 1] === "{") {
                beginIndex = i+2;
                endIndex = 0;
              }
            }  
            if (i <= uri.length - 2) {
              if (uri[i] === "}" && uri[i + 1] === "}" && beginIndex > 0) {
                endIndex = i;
                keywords.add(uri.substring(beginIndex, endIndex));
                beginIndex = 0;
              }
            }
          }
        }
        let obj:any = {};
        if (data.length > 0) {
          for (let item of data) {
            let value = item.value;
            if (getType(value) === "Undefined") {
              value = "";
            }
            if (isStringEmpty(item.key)) {
              continue;
            }
            dataKeys.add(item.key);
            obj[item.key] = value;
          }
        }
    
        const appendSet = new Set([...dataKeys].filter(x => !keywords.has(x)));
        const deleteSet = new Set([...keywords].filter(x => !dataKeys.has(x)));
    
        for (let _newKeyword of appendSet) {
          uri += "{{" + _newKeyword + "}}";
        }
    
        for (let _delKeyword of deleteSet) {
          uri = uri.replaceAll("{{" + _delKeyword + "}}", "");
        }

        this.props.cb(obj, uri);
    }

    setKey = (value, i) => {
        if(!isStringEmpty(value) && i === this.state.rows) {
            let row = {};
            row.key = value;
            this.state.data.push(row);
            this.setState({rows : this.state.rows + 1});
            this.setRequestPathVariableData(this.state.data);
        } else {
            let data = cloneDeep(this.state.data);
            let row = data[i];
            row.key = value;
            this.setState({ data });
            this.setRequestPathVariableData(data);
        }
    }

    setSelectedValue = (value, i) => {
        let data = cloneDeep(this.state.data);
        data[i].options = [];
        data[i].value = value;
        this.setState({ data });
    }

    setValue = (value, i) => {
        if(!isStringEmpty(value) && i === this.state.rows) {
            let row = {};
            row.value = value;
            this.state.data.push(row);
            this.setState({rows : this.state.rows + 1});
            this.setRequestPathVariableData(this.state.data);
        } else {
            let row = this.state.data[i];
            row.value = value;
            this.state.requestPathVariableData[row.key] = row.value;
            this.setRequestPathVariableData(this.state.data);
        }
    }

    handleDel = (i) => {
        let data = cloneDeep(this.state.data);
        let newData = removeWithoutGap(data, i);
        this.setState({ data: newData, rows: this.state.rows - 1 });
        this.setRequestPathVariableData(newData);
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
                <CommonHeader 
                    data={this.state.requestPathVariableData}
                    buckEditFlg={this.state.buckEditFlg} 
                    cb={(buckEditFlg, bulkStr) => this.setState({buckEditFlg, bulkStr})} />
                <BulkEditBox 
                    content={this.state.bulkStr}
                    buckEditFlg={this.state.buckEditFlg}
                    cb={(content, data) => {
                        this.state.requestPathVariableData = data;
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
                            onChange={event => this.setKey(event.target.value, i)} /></Flex>
                        <Flex flex={1}>
{(i<this.state.rows && this.props.schema !== undefined && this.state.data[i].key in this.props.schema) ? 
    (this.props.schema[this.state.data[i].key][TABLE_FIELD_TYPE] === "String") ?
        <AutoComplete allowClear
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
    (this.props.schema[this.state.data[i].key][TABLE_FIELD_TYPE].indexOf(DataTypeSelectValues) >= 0) ?
        <Select
            allowClear
            style={{width: "100%"}}
            value={
                (i<this.state.rows ? this.state.data[i].value : "")
            }
            onChange={data => this.setValue(data, i)}
            options={this.props.schema[this.state.data[i].key][TABLE_FIELD_TYPE].split("|").filter((_, index) => index !== 0).map(part => {
                const [label, value] = part.split(':');
                return { label, value };
            })}
        />
    :
    (this.props.schema[this.state.data[i].key][TABLE_FIELD_TYPE] === "Number" ? 
        <InputNumber
            style={{width: "100%"}}
            onChange={data => this.setValue(data, i)}
            value={
                (i<this.state.rows ? this.state.data[i].value : "")
            }
        />
    :
        <AutoComplete allowClear
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
    )
:
    <AutoComplete allowClear
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
}
                        </Flex>
                    </Flex>
                ))}
            </Flex>
        )
    }

}