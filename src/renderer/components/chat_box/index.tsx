import { cloneDeep } from 'lodash';
import React, { Component, ReactNode } from 'react';
import { connect } from 'react-redux';
import { Flex, Select, List, Input, Button, Popover, Typography, Space } from 'antd';
import { SendOutlined, } from '@ant-design/icons';

import './index.less';

import { 
  CLEAR_CHAT_RECORD,
  GET_PRJ, 
  SET_AI_SUPPORT_INFO, 
  CACHE_CHAT_RECORD,
  SET_CHAT_RECORD, 
} from '@conf/redux';
import { ChannelsAiBreidgeStr, ChannelsAiBreidgeSendStr, ChannelsAiBreidgeReplyStr } from '@conf/channel';
import { getBigModels } from '@act/ai';
import { setChatModel2 } from '@act/team';
import { langTrans } from '@lang/i18n';
import { isStringEmpty, } from '@rutil/index';
import { addNewlineBeforeTripleBackticks, addCodeMarkdown } from '@rutil/markdown';
import MarkdownView from '@comp/markdown/show';

const { TextArea } = Input;
const { Paragraph } = Typography;

class AiChatBox extends Component {

    constructor(props) {
        super(props);
        this.state = {
          input: "",
          codeBlock: "",
          loadingTimeout: false,
          loadingWaitMessage: false,
          aiModels: [],
          tmpResponse: {},
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

      window.electron.ipcRenderer.on(ChannelsAiBreidgeStr, (action, msgType, msgId : number, msgContent : string, finishFlg : boolean, successFlg : boolean) => {
          if (action === ChannelsAiBreidgeReplyStr) {
              let tmpMessage;
              let messages = this.props.messages;
              if (msgId >= messages.length) {
                tmpMessage = { 
                  role: 'assistant', 
                  content: msgContent,
                  hasFinish: finishFlg,
                  success: successFlg,
                }
                messages.push(tmpMessage);
                setTimeout(() => {
                  this.setState({ loadingWaitMessage: false });
                  this.scrollToBottom()
                }, 1000);
              } else {
                tmpMessage = messages[msgId];
                tmpMessage.content += msgContent;
                tmpMessage.hasFinish = finishFlg;
                tmpMessage.success = successFlg;
                messages[msgId] = tmpMessage;
              }
              if (tmpMessage.hasFinish) {
                this.scrollToBottom();
                this.props.dispatch({
                  type: SET_CHAT_RECORD,
                  messages,
                });
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
              } else {
                this.props.dispatch({
                  type: CACHE_CHAT_RECORD,
                  messages,
                });
              }
          }
      });

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

    handleSetAiModel = async (aiModel) => {
      await setChatModel2(aiModel);
      this.setState( {aiModel} );
    }

    clearRecord = () => {
      this.props.dispatch({
        type: CLEAR_CHAT_RECORD,
      });

      this.setState({
        codeBlock: "",
      });
    }

    handleSend = async () => {
        if (!this.state.input.trim()) return;
        let messageLength = this.props.messageLength;

        let historyMessage = this.props.messages.length > 10 ? cloneDeep(this.props.messages.slice(-10)) : cloneDeep(this.props.messages)

        let sendContent = this.state.input.trim();
        if (!isStringEmpty(this.state.codeBlock)) {
          sendContent += "\n\n" + "```\n" + this.state.codeBlock + "```\n"
        }

        const userMessage = { 
          role: 'user', 
          content: this.state.input,
          codeBlock: this.state.codeBlock
        };
        this.props.messages.push(userMessage);
        this.props.dispatch({
          type: SET_CHAT_RECORD,
          messages: this.props.messages,
        });

        messageLength++;
        this.setState(
          {
            input: "",
            codeBlock: "",
            loadingTimeout: true,
            loadingWaitMessage: true,
          }
        );

        window.electron.ipcRenderer.sendMessage(ChannelsAiBreidgeStr, ChannelsAiBreidgeSendStr, 
          "text", 
          messageLength, 
          sendContent, 
          {
            project: this.props.prj,
            history: historyMessage,
            aiModel: this.state.aiModel,
          }
        );

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
        dataSource={this.props.messages}
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
        <Button onClick={this.clearRecord}>{langTrans("chatbox empty record")}</Button>
        {this.state.aiModels.length > 0 ?
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
      messageCode: state.nav.messageCode,
      messages: state["chat_record"].messages,
      messageLength: state["chat_record"].messageLength,
    }
}

export default connect(mapStateToProps)(AiChatBox);