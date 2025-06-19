import { Component, ReactNode } from 'react';
import { cloneDeep } from 'lodash';
import { Input, Flex, Button, AutoComplete } from "antd";
import { DeleteOutlined } from '@ant-design/icons';

import { isStringEmpty, removeWithoutGap, getType } from "@rutil/index";
import { langTrans } from '@lang/i18n';

export default class extends Component {

    constructor(props) {
        super(props);
        this.state = {
            requestUri: props.requestUri,
        };
        let list = this.calculatePathVariableData(props.obj);
        this.state = {
            rows: list.length,
            data: list,
            requestUri: props.requestUri,
        };
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
                <Flex>
                    <Flex><div style={{width: 20}}></div></Flex>
                    <Flex flex={1} style={{paddingLeft: 20}}>{langTrans("request field1")}</Flex>
                    <Flex flex={1} style={{paddingLeft: 20}}>{langTrans("request field2")}</Flex>
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
                            onChange={event => this.setKey(event.target.value, i)} /></Flex>
                        <Flex flex={1}>
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
                        </Flex>
                    </Flex>
                ))}
            </Flex>
        )
    }

}