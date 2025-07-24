import { cloneDeep } from 'lodash';
import React, { Component, ReactNode } from 'react';
import { connect } from 'react-redux';
import { Card, Flex, Select, List, Input, Button, Popover, Typography, Space } from 'antd';
import { SendOutlined, } from '@ant-design/icons';

import { isStringEmpty } from '@rutil/index';
import { addNewlineBeforeTripleBackticks } from '@rutil/markdown';
import MarkdownView from '@comp/markdown/show';

import './index.css';

const { TextArea } = Input;
const { Paragraph } = Typography;

class AiChatBox extends Component {

    constructor(props) {
        super(props);
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
              label: "搜索api",
            }
          ],
          linkProject: "",
          linkOperator: "",
        }

        this.scrollContainerRef = React.createRef();
    }

    componentDidMount(): void {
      this.ws = new WebSocket("ws://127.0.0.1:6588/network/ws/" + this.props.uid);

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
              messageLength: this.state.messageLength + 1
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
        this.setState( {linkProject : ""} );
      } else {
        let prj = originPrj.split("$$")[0];
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

    handleSend = async () => {
        if (!this.state.input.trim()) return;
        let messageLength = this.state.messageLength;

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
            operator: this.state.linkOperator
          }
        }));

    
        // const controller = new AbortController();
        // const formData = new URLSearchParams();
        // formData.append('content', this.state.input);
        // formData.append('project', this.state.linkProject);
        // formData.append('operator', this.state.linkOperator);
        // await fetchEventSource(this.props.clientHost + OPENAI_REQUEST_URL, {
        //   openWhenHidden: false,
        //   method: 'POST',
        //   headers: {
        //     'Content-Type': 'application/x-www-form-urlencoded',

        //   },
        //   body: formData.toString(),
        //   onopen: async (response) => {
        //     if (response.ok) {
        //       console.log("发送数据时间：", Date.now());
        //     } else {
        //       console.log("连接失败", response);
        //     }
        //   },
        //   signal: controller.signal,
        //   fetch: async (input, init) => {
        //     const res = await fetch(input, {
        //       ...init,
        //       timeout: 60000, // 自定义超时
        //     });
        //     if (!res.ok) {
        //       throw new Error(`Server returned ${res.status}`);
        //     }
        //     return res;
        //   },
        //   onmessage: (ret) => {
        //     console.log("ret", ret);
        //     if (ret.event === "error") {
        //        console.error('Stream error:', ret.data);
        //       return;
        //     }
        //     if (ret.event === "done") {
        //       this.state.messageLength++
        //       this.setState(
        //         {
        //           tmpResponse: {},
        //           loading: false,
        //           messageLength: this.state.messageLength,
        //         }
        //       );
        //       setTimeout(() => {
        //         const container = this.scrollContainerRef.current;
        //         if (container) {
        //           container.scrollTop = container.scrollHeight;
        //         }
        //       }, 200);
        //       return;
        //     }
        //     if (ret.event === 'message') {
        //       console.log("接受数据时间：", Date.now())
        //       if (Object.keys(this.state.tmpResponse).length === 0) {
        //         this.state.tmpResponse = { role: 'assistant', content: ret.data };
        //       } else {
        //         this.state.tmpResponse.content += ret.data;
        //       }
        //       let messages = this.state.messages.slice(0, this.state.messageLength);
        //       messages.push(this.state.tmpResponse);
        //       this.state.messages = messages;
              
        //       this.setState(
        //         {
        //           messages: cloneDeep( messages),
        //         }
        //       );
        //     }
        //   },
        //   onclose: () => {
        //     console.log("close connection");
        //   },
        //   onerror(err) {
        //     console.error('Stream error:', err);
        //     throw err;
        //   }
        // });
    };

    render() : ReactNode {
        return (
            <Card title="AI 聊天" style={{ width: 900 }}>
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
                      placeholder="输入您的消息..."
                      autoSize={{ minRows: 1, maxRows: 4 }}
                      onPressEnter={(e) => {
                      if (!e.shiftKey) {
                          e.preventDefault();
                          this.handleSend();
                      }
                      }}
                  />
                  <Flex justify='space-between' align='center' style={{height: 50}}>
                    <Space>
                      <Popover placement="top" title={false} content={
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
                        <Button>{this.state.linkProject ? this.props.projects.find(_prj => _prj.value === this.state.linkProject).label : "关联项目"}</Button>
                      </Popover>
                      <Popover placement="top" title={false} content={
                        <Select 
                          allowClear
                          value={this.state.linkOperator}
                          onChange={ this.handleLinkOperator }
                          style={{width: 200}}
                          options={this.state.linkOperators}
                        />
                      }>
                        <Button>{this.state.linkOperator ? this.state.linkOperators.find(_operator => _operator.value === this.state.linkOperator).label : "关联操作"}</Button>
                      </Popover>
                      <Button>清空记录</Button>
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