import JsonView from 'react-json-view';
import { Button } from 'antd';
import { Component, ReactNode } from 'react';
import { connect } from 'react-redux';

import { SET_AI_MESSAGE } from '@conf/redux';
import { langTrans } from '@lang/i18n';
import { retShortJsonContent } from '@rutil/json';

import "./less/JsonViewWrapper.less";

class JsonViewWrapper extends Component {

    genEntity = () => {
        this.props.dispatch({
            type: SET_AI_MESSAGE,
            messageText: langTrans("chatbox convert model tips"),
            messageCode: JSON.stringify(retShortJsonContent(JSON.parse(this.props.content)), null, 2)
        });
    }

    render() : ReactNode {
        return (
            <div className="json-view-container">
                <Button 
                    className="json-to-model-btn" 
                    onClick={this.genEntity}
                >
                    {langTrans("chatbox convert model")}
                </Button>
                <JsonView 
                    src={JSON.parse(this.props.content)}   
                    name={ false }
                    theme={ "bright" }
                    collapsed={false}  
                    indentWidth={4}  
                    iconStyle="triangle"
                    enableClipboard={true}
                    displayObjectSize={false}
                    displayDataTypes={false}
                    sortKeys={true}
                    collapseStringsAfterLength={40}  
                />
            </div>
        )
    }
}

function mapStateToProps (state) {
  return {
  }
}

export default connect(mapStateToProps)(JsonViewWrapper);