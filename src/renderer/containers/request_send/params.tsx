import { Component, ReactNode } from 'react';
import { connect } from 'react-redux';
import { 
    Breadcrumb, 
    Button,
    Layout, 
    Flex, 
    Tabs,
    message
} from "antd";

import RequestSendBody from "@comp/request_send/body_form";
import RequestSendHead from "@comp/request_send/head_form";
import RequestSendParam from "@comp/request_send/request_param";
import RequestSendPathVariable from "@comp/request_send/request_path_variable";
import { CONTENT_TYPE } from "@conf/global_config";
import { getProjectKeys } from "@act/keys";
import { 
  getRequestCommon, 
  setRequestCommon 
} from "@act/request_common";
import { langTrans } from '@lang/i18n';

const { Header, Content, Footer } = Layout;

class ParamsProject extends Component {

  constructor(props) {
    super(props);
    let projectLabel = this.props.match.params.id;
    this.state = {
      readyFlg: false,
      projectLabel,
      defaultTabKey: "body",
      requestPathVariableData: {},
      requestParamData: {},
      requestHeadData: {},
      requestBodyData: {},
      contentType: "",
      envKeys: [],
    }
  }

  async componentDidMount() {
    this.getDatas();
  }

  async componentDidUpdate(prevProps) { 
    if (this.props.match.params.id !== prevProps.match.params.id) {
      this.state.projectLabel = this.props.match.params.id;
      this.setState({readyFlg: false})
      this.getDatas();
    }
  }

  handleClick = async () => {
    await setRequestCommon(
      this.props.clientType, this.props.teamId, this.state.projectLabel,
      this.state.requestHeadData, this.state.requestBodyData, this.state.requestParamData, this.state.requestPathVariableData,
      this.props.device
    )
    message.success(langTrans("request save result2"))
    this.setState({readyFlg: false})
    this.getDatas();
  }

  getDatas = async () => {
    let envKeys = await getProjectKeys(this.props.clientType, this.state.projectLabel);
    let requestCommon = await getRequestCommon(this.props.clientType, this.state.projectLabel);
    let requestPathVariableData = {};
    let requestParamData = {};
    let requestHeadData = {};
    let requestBodyData = {};
    let contentType = "";
    if (requestCommon !== null) {
      requestBodyData = requestCommon.body;
      requestHeadData = requestCommon.header;
      requestParamData = requestCommon.param;
      requestPathVariableData = requestCommon.path_variable;
      contentType = requestHeadData[CONTENT_TYPE];
    }
    this.setState({
      envKeys, 
      requestPathVariableData, requestParamData, requestHeadData, requestBodyData, 
      readyFlg: true,
      contentType
    });
  }

    getNavs() {
        return [
          {
            key: 'uri',
            label: langTrans("network tab1"),
            forceRender: true,
            children: <RequestSendPathVariable 
              requestUri=""
              obj={ this.state.requestPathVariableData } 
              tips={ this.state.envKeys } 
              cb={(obj, uri) => {
                this.state.requestPathVariableData = obj;
              }} 
            />,
          },
          {
            key: 'params',
            label: langTrans("network tab2"),
            forceRender: true,
            children: <RequestSendParam 
              obj={ this.state.requestParamData } 
              tips={ this.state.envKeys } 
              cb={obj => {
                this.state.requestParamData = obj
              }} 
            />,
          },
          {
            key: 'headers',
            label: langTrans("network tab3"),
            forceRender: true,
            children: <RequestSendHead 
              contentType={ this.state.contentType }
              obj={ this.state.requestHeadData } 
              tips={this.state.envKeys} 
              cb={obj => {
                this.state.requestHeadData = obj;
              }} 
            />,
          },
          {
            key: 'body',
            label: langTrans("network tab4"),
            forceRender: true,
            children: <RequestSendBody 
              obj={ this.state.requestBodyData }
              tips={ this.state.envKeys } 
              cb={(obj, file) => {
                this.state.requestBodyData = obj;
              }} 
            />,
          },
        ];
    }

    render() : ReactNode {
        return (
            <Layout>
                <Header style={{ padding: 0 }}>
                    {langTrans("nav project params")}
                </Header>
                <Content style={{ padding: '0 16px' }}>
                    <Breadcrumb style={{ margin: '16px 0' }} items={[
                        { title: langTrans("nav project params") }, 
                        { title: this.props.prjs.find(row => row.value === this.state.projectLabel) ? this.props.prjs.find(row => row.value === this.state.projectLabel).label : "" },
                    ]} />
                    {this.state.readyFlg ? 
                    <Flex vertical align="center" gap="middle">
                      <Tabs activeKey={ this.state.defaultTabKey } items={ this.getNavs() } onChange={key => this.setState({defaultTabKey: key})} style={{width: "100%"}} />
                      <Button type="primary" onClick={this.handleClick}>{langTrans("request save bread2")}</Button>
                    </Flex>
                    : null}
                </Content>
                <Footer style={{ textAlign: 'center' }}>
                ApiChain ©{new Date().getFullYear()} Created by Mustafa Fang
                </Footer>
            </Layout>
        )
    }
}

function mapStateToProps (state) {
    return {
        prjs: state.prj.list,
        teamId: state.device.teamId,
        clientType: state.device.clientType,
        device : state.device,
    }
}

export default connect(mapStateToProps)(ParamsProject);