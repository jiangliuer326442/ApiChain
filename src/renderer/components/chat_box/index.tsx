import { cloneDeep } from 'lodash';
import React, { Component, ReactNode } from 'react';
import { connect } from 'react-redux';
import { Flex, Select, List, Input, Button, Popover, Typography, Space } from 'antd';
import { SendOutlined, } from '@ant-design/icons';

import './index.less';

import { AI_RECORD } from '@conf/storage';
import { GET_PRJ, SET_AI_SUPPORT_INFO, } from '@conf/redux';
import { ChannelsLoadAppStr } from '@conf/channel';
import { getBigModels } from '@act/ai';
import { setChatModel2 } from '@act/team';
import { langTrans } from '@lang/i18n';
import { replaceHttpWithWs, isStringEmpty, } from '@rutil/index';
import { addNewlineBeforeTripleBackticks, addCodeMarkdown } from '@rutil/markdown';
import MarkdownView from '@comp/markdown/show';

const { TextArea } = Input;
const { Paragraph } = Typography;

class AiChatBox extends Component {

    constructor(props) {
        super(props);
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
          loadingTimeout: false,
          loadingWaitMessage: false,
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
          linkOperator: "",
          aiModel: "",
        }

        this.scrollContainerRef = React.createRef();
    }

    componentDidMount(): void {
      getBigModels().then( (response) => {
        this.setState({ 
          aiModel: response.chatModel,
          aiModels: response.chatModels 
        })
      });
      this.ws = new WebSocket(replaceHttpWithWs(this.props.clientHost) + "/ai/ws/" + this.props.teamId + "/" + this.props.uid);

      this.ws.onopen = (event) => {
      };

      this.ws.onmessage = async (event) => {
        let message = JSON.parse(JSON.parse(event.data));
        let tmpMessage;
        if (message.id >= this.state.messages.length) {
          tmpMessage = { 
            role: 'assistant', 
            content: message.content,
            hasFinish: message.hasFinish,
            success: message.success,
          }
          this.state.messages.push(tmpMessage);
          this.setState({ 
            messages: cloneDeep(this.state.messages),
            messageLength: this.state.messageLength + 1,
          });
          setTimeout(() => {
            this.setState({ loadingWaitMessage: false });
            this.scrollToBottom()
          }, 1000);
        } else {
          tmpMessage = this.state.messages[message.id];
          tmpMessage.content += message.content;
          tmpMessage.hasFinish = message.hasFinish;
          tmpMessage.success = message.success;
          this.state.messages[message.id] = tmpMessage;
          this.setState({ 
            messages: cloneDeep(this.state.messages),
          });
        }
        if (tmpMessage.hasFinish) {
          this.scrollToBottom();
          localStorage.setItem(AI_RECORD, JSON.stringify(this.state.messages));
          if (tmpMessage.success) {
            this.props.dispatch({
              type: SET_AI_SUPPORT_INFO,
              isAiSupport: true
            });
          } else {
            this.setState({
              loadingWaitMessage: false,
            });
            this.props.dispatch({
              type: SET_AI_SUPPORT_INFO,
              isAiSupport: false
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

    componentDidUpdate(prevProps) {
        if (prevProps.messageText !== this.props.messageText) {
          this.state.input = this.props.messageText;
          this.state.codeBlock = this.props.messageCode;
          if (!isStringEmpty(this.state.input)) {
            this.handleSend();
          }
        }
    }

    handleLinkProject = originPrj => {
      if (isStringEmpty(originPrj)) {
        this.props.dispatch({
            type: GET_PRJ,
            prj: "",
        });
      } else {
        let prj = originPrj.split("$$")[0];
        this.props.dispatch({
            type: GET_PRJ,
            prj,
        });
      }
    }

    handleLinkOperator = oroginOperator => {
      if (isStringEmpty(oroginOperator)) {
        this.setState( {input : ""} );
      } else if (oroginOperator === "searchInterfaces") {
        this.setState( {input : "【" + langTrans("chatbox link action1") + "】" + this.state.input} );
      } else if (oroginOperator === "retrieveiterationDocuments") {
        this.setState( {input : "【" + langTrans("chatbox link action2") + "】" + this.state.input} );
      }
    }

    handleSetAiModel = async (aiModel) => {
      await setChatModel2(aiModel);
      this.setState( {aiModel} );
    }

    clearRecord = () => {
      localStorage.removeItem(AI_RECORD);
      this.setState({
        messages: [], 
        codeBlock: "", 
        messageLength: 0
      });
      window.electron.ipcRenderer.sendMessage(ChannelsLoadAppStr);
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
            loadingTimeout: true,
            loadingWaitMessage: true,
            messageLength,
          }
        );

        this.ws.send(JSON.stringify({
          type: "text", 
          id: messageLength, 
          content:sendContent,
          header: {
            'Sys_Lang': this.props.preferLang,
            'Sys_Country': this.props.userCountry,
            'Sys_Uid': this.props.uid,
            'Sys_Team': this.props.teamId,
            'Client_Version': this.props.appVersion,
          },
          payload: {
            project: this.props.prj,
            operator: this.state.linkOperator,
            history: historyMessage,
          }
        }));

        setTimeout(() => {
          this.setState({ loadingTimeout: false });
          this.scrollToBottom();
        }, 500);
    };

    scrollToBottom = () => {
      const container = this.scrollContainerRef.current;
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    }

    render() : ReactNode {
        return (
<>
  <div 
    className='chat-box'
    style={{height: this.props.from === "drawer" ? 539 : 400}}
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
                width={this.props.meWidth}
            />
            : null}
          </>:
            <MarkdownView 
                content={ addNewlineBeforeTripleBackticks(item.content) } 
                width={this.props.robotWidth}
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
    <Flex justify='space-between' align='center' className='function-box'>
      <Space>
      {this.props.from === "drawer" ? null : 
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
            value={ this.props.prj }
          />
        }>
          <Button>{(this.props.prj && this.props.projects.length > 0 && this.props.projects.find(_prj => _prj.value === this.props.prj)) ? this.props.projects.find(_prj => _prj.value === this.props.prj).label : langTrans("chatbox link project")}</Button>
        </Popover>
      }
      {this.props.from === "drawer" ? null : 
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
      }
        <Button onClick={this.clearRecord}>{langTrans("chatbox empty record")}</Button>
        {this.state.aiModels.length > 1 && this.props.from !== "drawer" ?
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
          loading={this.state.loadingTimeout || this.state.loadingWaitMessage}
          disabled={!this.state.input.trim()}
      >
          {this.state.loading ? langTrans("chatbox sending") : langTrans("chatbox send")}
      </Button>
    </Flex>
  </Flex>
</>
        )
    }
}

function mapStateToProps (state) {
    return {
      prj: state.env_var.prj,
      teamId: state.device.teamId,
      clientHost: state.device.clientHost,
      projects: state.prj.list,
      preferLang: state.device.preferLang,
      userCountry: state.device.userCountry,
      uid: state.device.uuid,
      appVersion: state.device.appVersion,
      messageText: state.nav.messageText,
      messageCode: state.nav.messageCode
    }
}

export default connect(mapStateToProps)(AiChatBox);