import { Component, ReactNode } from 'react';
import { connect } from 'react-redux';
import { cloneDeep } from 'lodash';
import { 
    AutoComplete, Input, Flex, Select, Button
} from "antd";
import { DeleteOutlined } from '@ant-design/icons';

import CommonHeader from '@comp/request_send/common_header';
import BulkEditBox from '@comp/request_send/bulk_edit_box';
import { 
    isStringEmpty, 
    removeWithoutGap, 
    getType,
    moveKeyValListByKey
} from "@rutil/index";

import {
    CONTENT_TYPE
} from "@conf/global_config";
import { 
    CONTENT_TYPE_URLENCODE,
    CONTENT_TYPE_FORMDATA,
    CONTENT_TYPE_JSON,
} from "@conf/contentType"
import { langTrans } from '@lang/i18n';

class RequestSendHead extends Component {

    constructor(props) {
        super(props);
        this.state = {
            contentType: props.contentType,
            requestHeadData: props.obj,
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
        if (this.props.contentType != prevProps.contentType ) {
            this.state.contentType = this.props.contentType;
            let ret = this.buildList();
            this.setState({
                rows : ret[0],
                data : ret[1],
            });
        }
        if (Object.keys(this.props.obj).length != Object.keys(prevProps.obj).length) {
            this.state.requestHeadData = this.props.obj;
            let ret = this.buildList();
            this.setState({
                rows : ret[0],
                data : ret[1],
            });
        }
    }

    buildList = () => {
        let list = this.calculateFormHeadData(this.state.requestHeadData);
        return [list.length, list];
    }

    calculateFormHeadData = (requestHeadData) => {
        let list = [];
        for (let _key in requestHeadData) {
            let item : any = {};
            item["key"] = _key;
            item["value"] = requestHeadData[_key];
            list.push(item);
        }
        let data = list.length === 0 ? [{
            key: CONTENT_TYPE,
            value: this.state.contentType,
        }] : moveKeyValListByKey(list, CONTENT_TYPE);
        this.setRequestHeadData(data);
        return data;
    }

    setRequestHeadData = (data: Array<any>) => {
        let contentType = data.find(item => item.key === CONTENT_TYPE).value;
        let obj : any = {};
        if (data.length > 0) {
          for (let item of data) {
            let value = item.value;
            if (getType(value) === "Undefined") {
              value = "";
            }
            obj[item.key] = value;
          }
        }
        if (contentType !== this.state.contentType) {
          this.setState({contentType});
        }
        this.props.cb(obj)
    }

    setKey = (value, i) => {
        if(!isStringEmpty(value) && i === this.state.rows) {
            let row = {};
            row.key = value;
            this.state.data.push(row);
            this.setState({rows : this.state.rows + 1});
            this.setRequestHeadData(this.state.data);
        } else {
            let data = cloneDeep(this.state.data);
            let row = data[i];
            row.key = value;
            this.setState({ data });
            this.setRequestHeadData(data);
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
            this.setRequestHeadData(this.state.data);
        } else {
            let row = this.state.data[i];
            row.value = value;
            this.state.requestHeadData[row.key] = row.value;
            this.setRequestHeadData(this.state.data);
        }
    }

    handleDel = (i) => {
        let data = cloneDeep(this.state.data);
        let newData = removeWithoutGap(data, i);
        this.setState({ data: newData, rows: this.state.rows - 1 });
        this.setRequestHeadData(newData);
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
                    data={this.state.requestHeadData}
                    buckEditFlg={this.state.buckEditFlg} 
                    cb={(buckEditFlg, bulkStr) => this.setState({buckEditFlg, bulkStr})} />
                <BulkEditBox 
                    content={this.state.bulkStr}
                    buckEditFlg={this.state.buckEditFlg}
                    cb={(content, data) => {
                        this.state.requestHeadData = data;
                        let ret = this.buildList();

                        this.setState({
                            bulkStr: content,
                            rows : ret[0],
                            data : ret[1],
                        });
                    }}
                    />
                {!this.state.buckEditFlg && Array.from({ length: this.state.rows+1 }, (row, i) => (
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