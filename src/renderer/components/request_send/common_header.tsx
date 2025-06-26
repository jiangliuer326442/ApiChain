import { Component, ReactNode } from 'react';
import { Button, Flex } from 'antd';

import { langTrans } from '@lang/i18n';

export default class extends Component {

    triggerBulkEdit = () => {
        let bulkStr = "";
        if (!this.props.buckEditFlg) {
            for (let _bodyKey in this.props.data) {
                let _bodyVal = this.props.data[_bodyKey];
                bulkStr += _bodyKey + ": " + _bodyVal + "\n";
            }
        }
        this.props.cb(!this.props.buckEditFlg, bulkStr)
    };

    render() : ReactNode {
        return (
            <Flex>
                <Flex><div style={{width: 20}}></div></Flex>
                <Flex flex={1} style={{paddingLeft: 20}}>{langTrans("request field1")}</Flex>
                <Flex flex={1} style={{paddingLeft: 150}}>{langTrans("request field2")}</Flex>
                <Flex>
                    <div style={{width: 130}}>
                        <Button 
                            type='link' 
                            onClick={this.triggerBulkEdit}>
                                {this.props.buckEditFlg ? langTrans("request single edit") : langTrans("request bulk edit")}
                        </Button>
                    </div>
                </Flex>
            </Flex>
        )
    }
}