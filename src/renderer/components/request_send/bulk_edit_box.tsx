import { Component, ReactNode } from 'react';
import { Input, Flex } from 'antd';

import { langTrans } from '@lang/i18n';

const { TextArea } = Input;

export default class extends Component {

    handleBulkEditChange = (e) => { 
        let content = e.target.value;
        let data : any = {};
        for (const row of content.split("\n")) {
            if (row.indexOf(":") < 0) {
                continue;
            }
            let _bodyKey = row.split(":")[0];
            let _bodyVal = row.substring(_bodyKey.length + 1);
            data[_bodyKey.trim()] = _bodyVal.trim();
        }
        this.props.cb(content, data);
    };

    render() : ReactNode {
        return (
        this.props.buckEditFlg ? 
                <Flex>
                    <TextArea
                        placeholder={langTrans("request bulk edit tips")}
                        value={ this.props.content }
                        onChange={ this.handleBulkEditChange }
                        autoSize={{ minRows: 10 }}
                    />
                </Flex>
        :null
        )
    }
}