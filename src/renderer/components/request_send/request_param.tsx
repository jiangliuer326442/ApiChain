import { Component, ReactNode } from 'react';
import { connect } from 'react-redux';
import { cloneDeep } from 'lodash';
import { Input, Flex, Button, AutoComplete } from "antd";
import { DeleteOutlined } from '@ant-design/icons';

import { isStringEmpty, removeWithoutGap, getType } from "@rutil/index";
import { langTrans } from '@lang/i18n';

class RequestSendParam extends Component {

    constructor(props) {
        super(props);
        let list = this.calculateFormParamsData(props.obj);
        this.state = {
            rows: list.length,
            data: list,
        };
    }

    calculateFormParamsData = (requestParamsData) => {
        let list = [];
        for (let _key in requestParamsData) {
            let item = {};
            item["key"] = _key;
            item["value"] = requestParamsData[_key];
            list.push(item);
        }
        this.setRequestParamData(list);
        return list;
    }

    setRequestParamData = (data: Array<any>) => {
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
        this.props.cb(obj);
    }

    setKey = (value, i) => {
        if(!isStringEmpty(value) && i === this.state.rows) {
            let row = {};
            row.key = value;
            this.state.data.push(row);
            this.setState({rows : this.state.rows + 1});
            this.setRequestParamData(this.state.data);
        } else {
            let data = cloneDeep(this.state.data);
            let row = data[i];
            row.key = value;
            this.setState({ data });
            this.setRequestParamData(data);
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
            this.setRequestParamData(this.state.data);
        } else {
            let row = this.state.data[i];
            row.value = value;
            this.setRequestParamData(this.state.data);
        }
    }

    handleDel = (i) => {
        let data = cloneDeep(this.state.data);
        let newData = removeWithoutGap(data, i);
        this.setState({ data: newData, rows: this.state.rows - 1 });
        this.setRequestParamData(newData);
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

function mapStateToProps (state) {
    return {
    }
}
  
export default connect(mapStateToProps)(RequestSendParam);