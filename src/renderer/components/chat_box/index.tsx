import { cloneDeep } from 'lodash';
import React, { Component, ReactNode } from 'react';
import { connect } from 'react-redux';
import { Card, Flex, Select, List, Input, Button, Popover, Typography, Space } from 'antd';
import { SendOutlined, } from '@ant-design/icons';

import './index.less';

import { AI_LINK_PROJECT, AI_MODEL } from '@conf/storage';
import { langTrans } from '@lang/i18n';
import { replaceHttpWithWs, getStartParams, isStringEmpty } from '@rutil/index';
import { addNewlineBeforeTripleBackticks } from '@rutil/markdown';
import MarkdownView from '@comp/markdown/show';

const { TextArea } = Input;
const { Paragraph } = Typography;

let argsObjects = getStartParams();
let aiModels = argsObjects.aiModels.split(",");

class AiChatBox extends Component {

    constructor(props) {
        super(props);

        let linkProject = localStorage.getItem(AI_LINK_PROJECT);
        if (isStringEmpty(linkProject)) {
          linkProject = "";
        }
        let aiModel = localStorage.getItem(AI_MODEL);
        if (isStringEmpty(aiModel)) {
          aiModel = "";
        }

        let messages = [];
        this.state = {
          messages,
          input: "",
          loading: false,
          tmpResponse: {},
          messageLength: messages.length,
          linkOperators: [
            {
              value: "searchInterfaces",
              label: langTrans("chatbox link action1"),
            }
          ],
          linkProject,
          linkOperator: "",
          aiModel,
        }

        this.scrollContainerRef = React.createRef();
    }

    componentDidMount(): void {
      this.ws = new WebSocket(replaceHttpWithWs(this.props.clientHost) + "/network/ws/" + this.props.uid);

      this.ws.onopen = (event) => {
          console.log("WebSocket opened:", event);
      };

      this.ws.onmessage = (event) => {
          let message = JSON.parse(JSON.parse(event.data));
          if (message.id >= this.state.messages.length) {
            let tmpMessage = { 
              role: 'assistant', 
              content: message.content
            }
            this.state.messages.push(tmpMessage);
            this.setState({ 
              messages: cloneDeep(this.state.messages),
              messageLength: this.state.messageLength + 1,
              loading: false,
            });
          } else {
            let tmpMessage = this.state.messages[message.id];
            tmpMessage.content += message.content;
            this.state.messages[message.id] = tmpMessage;
            this.setState({ 
              messages: cloneDeep(this.state.messages),
            });
          }
      };

      this.ws.onclose = (event) => {
          console.log("WebSocket closed:", event);
      };

      this.ws.onerror = (event) => {
          console.error("WebSocket error:", event);
      };

    }

    handleLinkProject = originPrj => {
      if (isStringEmpty(originPrj)) {
        localStorage.removeItem(AI_LINK_PROJECT);
        this.setState( {linkProject : ""} );
      } else {
        let prj = originPrj.split("$$")[0];
        localStorage.setItem(AI_LINK_PROJECT, prj);
        this.setState( {linkProject : prj} );
      }
    }

    handleLinkOperator = oroginOperator => {
      if (isStringEmpty(oroginOperator)) {
        this.setState( {linkOperator : ""} );
      } else {
        this.setState( {linkOperator : oroginOperator} );
      }
    }

    handleSetAiModel = aiModel => {
      localStorage.setItem(AI_MODEL, aiModel);
      this.setState( {aiModel} );
    }

    handleSend = async () => {
        if (!this.state.input.trim()) return;
        let messageLength = this.state.messageLength;

        let historyMessage = this.state.messages.length > 10 ? cloneDeep(this.state.messages.slice(-10)) : cloneDeep(this.state.messages)

        const userMessage = { role: 'user', content: this.state.input };
        this.state.messages.push(userMessage);
        messageLength++;
        this.setState(
          {
            messages: cloneDeep( this.state.messages),
            input: '',
            loading: true,
            messageLength,
          }
        );
        const container = this.scrollContainerRef.current;
        if (container) {
          container.scrollTop = container.scrollHeight;
        }

        this.ws.send(JSON.stringify({
          type: "text", 
          id: messageLength, 
          content:this.state.input,
          header: {
            'Sys_Lang': this.props.userLang,
            'Sys_Country': this.props.userCountry,
            'Sys_Uid': this.props.uid,
            'Sys_Team': this.props.teamId,
            'Client_Version': this.props.appVersion,
          },
          payload: {
            project: this.state.linkProject,
            operator: this.state.linkOperator,
            aiModel: this.state.aiModel,
            history: historyMessage,
          }
        }));
    };

    render() : ReactNode {
        return (
            <Card title={langTrans("chatbox title")} style={{ width: 900 }}>
                <div 
                  className='chat-box'
                  ref={this.scrollContainerRef}
                >
                  <List
                      dataSource={this.state.messages}
                      renderItem={(item) => (
                      <List.Item
                          style={{
                          justifyContent: item.role === 'user' ? 'flex-end' : 'flex-start',
                          }}
                      >
                        {item.role === 'user' ? 
                          <Paragraph copyable>{item.content}</Paragraph>
                        :
                          <MarkdownView 
                              content={ addNewlineBeforeTripleBackticks(item.content) } 
                              width={800}
                          />
                        }
                      </List.Item>
                      )}
                    />
                  </div>
                <Flex vertical>
                  <TextArea
                      value={this.state.input}
                      onChange={(e) => this.setState({input: e.target.value})}
                      placeholder={langTrans("chatbox question tips")}
                      autoSize={{ minRows: 1, maxRows: 10 }}
                      onPressEnter={(e) => {
                      if (!e.shiftKey) {
                          e.preventDefault();
                          this.handleSend();
                      }
                      }}
                  />
                  <Flex justify='space-between' align='center' style={{height: 50}}>
                    <Space>
                      <Popover placement="top" title={langTrans("chatbox link project")} content={
                        <Select
                          showSearch
                          allowClear
                          size='large'
                          style={{ height: '100%', width: 260 }} 
                          optionFilterProp="children"
                          filterOption={(input, option) =>
                            (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                          }
                          options={this.props.projects.map(_prj => ({label: _prj.label, value: _prj.value + "$$" + _prj.label}))}
                          onChange={ this.handleLinkProject }
                          value={this.state.linkProject}
                        />
                      }>
                        <Button>{(this.state.linkProject && this.props.projects.length > 0) ? this.props.projects.find(_prj => _prj.value === this.state.linkProject).label : langTrans("chatbox link project")}</Button>
                      </Popover>
                      <Popover placement="top" title={langTrans("chatbox link action")} content={
                        <Select 
                          allowClear
                          value={this.state.linkOperator}
                          onChange={ this.handleLinkOperator }
                          style={{width: 200}}
                          options={this.state.linkOperators}
                        />
                      }>
                        <Button>{this.state.linkOperator ? this.state.linkOperators.find(_operator => _operator.value === this.state.linkOperator).label : langTrans("chatbox link action")}</Button>
                      </Popover>
                      <Button onClick={()=>this.setState({messages: [], messageLength: 0})}>{langTrans("chatbox empty record")}</Button>
                      <Popover placement="top" title={langTrans("chatbox aimodel select")} content={
                        <Select 
                        value={this.state.aiModel}
                        onChange={ this.handleSetAiModel }
                        style={{width: 200}}
                        options={aiModels.map(item=>({label: item, value: item}))}
                        />
                      }>
                        <Button>{this.state.aiModel ? this.state.aiModel : langTrans("chatbox aimodel select")}</Button>
                      </Popover>
                    </Space>
                    <Button
                        type="primary"
                        icon={<SendOutlined />}
                        onClick={this.handleSend}
                        loading={this.state.loading}
                        disabled={!this.state.input.trim()}
                    >
                        发送
                    </Button>
                  </Flex>
                </Flex>
            </Card>
        )
    }
}

function mapStateToProps (state) {
    return {
      teamId: state.device.teamId,
      clientHost: state.device.clientHost,
      projects: state.prj.list,
      userLang: state.device.userLang,
      userCountry: state.device.userCountry,
      uid: state.device.uuid,
      appVersion: state.device.appVersion,
    }
}

export default connect(mapStateToProps)(AiChatBox);