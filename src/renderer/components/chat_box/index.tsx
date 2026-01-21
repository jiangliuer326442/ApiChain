import { cloneDeep } from 'lodash';
import React, { Component, ReactNode } from 'react';
import { connect } from 'react-redux';
import { Card, Flex, Select, List, Input, Button, Popover, Typography, Space } from 'antd';
import { SendOutlined, } from '@ant-design/icons';

import './index.less';

import { getWikiAiAssistant } from '@conf/url';
import { AI_LINK_PROJECT, AI_MODEL, AI_RECORD } from '@conf/storage';
import { AI_LANGUAGE_MODELS_URL } from '@conf/team';
import { sendTeamMessage } from '@act/message';
import { langTrans } from '@lang/i18n';
import { replaceHttpWithWs, isStringEmpty, } from '@rutil/index';
import { addNewlineBeforeTripleBackticks, addCodeMarkdown } from '@rutil/markdown';
import MarkdownView from '@comp/markdown/show';

const { TextArea } = Input;
const { Paragraph, Link, Text } = Typography;

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
        let messages
        let chatRecord = localStorage.getItem(AI_RECORD);
        if (isStringEmpty(chatRecord)) {
          messages = [];
        } else {
          messages = JSON.parse(chatRecord);
        }
        this.state = {
          messages,
          input: "",
          codeBlock: "",
          loading: false,
          aiModels: [],
          tmpResponse: {},
          messageLength: messages.length,
          linkOperators: [
            {
              value: "searchInterfaces",
              label: langTrans("chatbox link action1"),
            },
            {
              value: "retrieveiterationDocuments",
              label: langTrans("chatbox link action2"),
            }
          ],
          linkProject,
          linkOperator: "",
          aiModel,
        }

        this.scrollContainerRef = React.createRef();
    }

    componentDidMount(): void {
      sendTeamMessage(AI_LANGUAGE_MODELS_URL, {}).then( (response) => {
        this.setState({ aiModels: response })
      });
      this.ws = new WebSocket(replaceHttpWithWs(this.props.clientHost) + "/ai/ws/" + this.props.teamId + "/" + this.props.uid);

      this.ws.onopen = (event) => {
          console.log("WebSocket opened:", event);
      };

      this.ws.onmessage = async (event) => {
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
          });
        } else {
          if (message.hasFinish) {
            this.scrollToBottom();
            localStorage.setItem(AI_RECORD, JSON.stringify(this.state.messages));
          } else {
            let tmpMessage = this.state.messages[message.id];
            tmpMessage.content += message.content;
            this.state.messages[message.id] = tmpMessage;
            this.setState({ 
              messages: cloneDeep(this.state.messages),
            });
          }
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

        let sendContent = this.state.input.trim();
        if (!isStringEmpty(this.state.codeBlock)) {
          sendContent += "\n\n" + "```\n" + this.state.codeBlock + "```\n"
        }

        const userMessage = { 
          role: 'user', 
          content: this.state.input,
          codeBlock: this.state.codeBlock
        };
        this.state.messages.push(userMessage);
        localStorage.setItem(AI_RECORD, JSON.stringify(this.state.messages));
        messageLength++;
        this.setState(
          {
            messages: cloneDeep( this.state.messages),
            input: "",
            codeBlock: "",
            loading: true,
            messageLength,
          }
        );

        this.ws.send(JSON.stringify({
          type: "text", 
          id: messageLength, 
          content:sendContent,
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

        setTimeout(() => {
          this.setState({ loading: false });
          this.scrollToBottom()
        }, 3000);
    };

    scrollToBottom = () => {
      const container = this.scrollContainerRef.current;
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    }

    render() : ReactNode {
        return (
            <Card title={<>
            { langTrans("chatbox title") } <Text type="secondary"><Link href={ getWikiAiAssistant() }>{langTrans("link robot chat")}</Link></Text>
            </>} style={{ width: 1050 }}>
                <div 
                  className='chat-box'
                  ref={this.scrollContainerRef}
                >
                  <List
                      dataSource={this.state.messages}
                      renderItem={(item) => (
                      <List.Item
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'flex-end',
                            justifyContent: item.role === 'user' ? 'flex-end' : 'flex-start',
                          }}
                      >
                        {item.role === 'user' ? <>
                          <Paragraph copyable>{item.content}</Paragraph>
                          {!isStringEmpty(item.codeBlock) ? 
                          <MarkdownView 
                              content={ addCodeMarkdown(item.codeBlock) } 
                              width={500}
                          />
                          : null}
                        </>:
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
                      if (!e.shiftKey && !e.ctrlKey) {
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
                      <Button onClick={()=>{
                        localStorage.removeItem(AI_RECORD);
                        this.setState({messages: [], codeBlock: "", messageLength: 0});
                      }}>{langTrans("chatbox empty record")}</Button>
                      {this.state.aiModels.length > 1 ?
                      <Popover placement="top" title={langTrans("chatbox aimodel select")} content={
                        <Select 
                          value={this.state.aiModel}
                          onChange={ this.handleSetAiModel }
                          style={{width: 170}}
                          options={this.state.aiModels}
                        />
                      }>
                        <Button>{
                        (this.state.aiModel && this.state.aiModels.find(model => model.value === this.state.aiModel)) 
                        ? 
                        this.state.aiModels.find(model => model.value === this.state.aiModel).label 
                        : 
                        langTrans("chatbox aimodel select")}</Button>
                      </Popover>
                      : null}
                      <Popover placement="top" title={langTrans("chatbox code block help")} content={
                        <TextArea allowClear
                          style={{width: 500}}
                          rows = {14}
                          value={this.state.codeBlock} 
                          onChange={ e=>this.setState({codeBlock : e.target.value}) } />
                      }>
                        <Button>{ langTrans("chatbox code block") }</Button>
                      </Popover>
                    </Space>
                    <Button
                        type="primary"
                        icon={<SendOutlined />}
                        onClick={this.handleSend}
                        loading={this.state.loading}
                        disabled={!this.state.input.trim()}
                    >
                        {this.state.loading ? langTrans("chatbox sending") : langTrans("chatbox send")}
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