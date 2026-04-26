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

import MarkdownView from '@comp/markdown/show';
import RequestSendBody from "@comp/request_send/body_form";
import RequestSendHead from "@comp/request_send/head_form";
import RequestSendParam from "@comp/request_send/request_param";
import RequestSendPathVariable from "@comp/request_send/request_path_variable";
import { CONTENT_TYPE } from "@conf/global_config";
import { CLIENT_TYPE_SINGLE } from "@conf/team";
import { GET_PRJ } from "@conf/redux";
import { isStringEmpty } from "@rutil/index";
import { getProjectKeys } from "@act/keys";
import { 
  getRequestCommon, 
  setRequestCommon 
} from "@act/request_common";
import { langTrans, getLang } from '@lang/i18n';

const { Header, Content, Footer } = Layout;

class ParamsProject extends Component {

  constructor(props) {
    super(props);
    const projectLabel = props.match.params.id;
    const teamId = isStringEmpty(props.match.params.team) ? "" : props.match.params.team;
    this.state = {
      readyFlg: false,
      teamId,
      projectLabel,
      defaultTabKey: "body",
      requestPathVariableData: {},
      requestParamData: {},
      requestHeadData: {},
      requestBodyData: {},
      contentType: "",
      envKeys: [],
      lang: getLang()
    }
    props.dispatch({
        type: GET_PRJ,
        prj: projectLabel,
    });
  }

  async componentDidMount() {
    this.getDatas();
  }

  async componentDidUpdate(prevProps) { 
    if (this.props.match.params.id !== prevProps.match.params.id) {
      this.state.projectLabel = this.props.match.params.id;
      this.props.dispatch({
        type: GET_PRJ,
        prj: this.state.projectLabel,
      });
      this.setState({readyFlg: false})
      this.getDatas();
    }
  }

  handleClick = async () => {
    await setRequestCommon(
      this.props.clientType, this.state.teamId, this.state.projectLabel,
      this.state.requestHeadData, this.state.requestBodyData, this.state.requestParamData, this.state.requestPathVariableData,
      this.props.device
    )
    message.success(langTrans("request save result2"))
    this.setState({readyFlg: false})
    this.getDatas();
  }

  getDatas = async () => {
    let envKeys = await getProjectKeys(this.props.clientType, this.state.teamId, this.state.projectLabel);
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
        const markdownContentZhCn = `
全局参数是 API 接口管理工具中的一大**稀缺功能**。它的核心意义在于将接口中重复的公共参数提取出来统一管理，**大幅减少重复编写网络请求的麻烦，显著缩短接口定义耗时**。

### 🎯 解决的痛点

在日常接口管理中，经常会遇到以下问题：

1. **模板冗余**：项目接口的公共参数非常多，且大多具有模板性质，每个接口都需要重复添加。
2. **位置分散**：公共参数不仅存在于 \`param\` 中，还可能分散在 \`header\` 或 \`body\` 里，管理割裂。
3. **维护困难**：公共参数的具体值可能随业务发生变化，甚至需要删减部分参数，逐个修改接口费时费力且易遗漏。

### 🚀 ApiChain 的解决方案

ApiChain 通过以下机制，让您彻底告别公共参数的管理烦恼：

1. **全位置支持**：公共参数全面支持 **路径变量**、**参数**、**头部** 和 **主体**。无论任何位置设置的 \`key-value\` 数据，均可作为公共参数统一配置。
2. **灵活覆盖**：公共参数仅作为接口请求时的**默认填充**。对于特殊无需使用某些公共参数的接口，您可直接在接口中删除对应部分，互不影响。
3. **动态变量注入**：公共参数中的 \`value\` 支持固定值，也支持引用全局或项目的环境变量。使用 \`{{}}\` 包裹变量名（如全局变量 \`{{uid}}\`，项目变量 \`{{version}}\`），执行请求时会动态查询其实际值。这意味着您只需维护一份变量引用，具体数据的变更无需修改公共参数模板。

> **💡 总结**：通过全局参数，实现一次配置、全局生效、动态解析，让接口管理更加高效优雅。
`;  
        const markdownContentZhTw = `
全域參數是 API 介面管理工具中的一大**稀缺功能**。它的核心意義在於將介面中重複的公共參數提取出來統一管理，**大幅減少重複編寫網路請求的麻煩，顯著縮短介面定義耗時**。

### 🎯 解決的痛點

在日常介面管理中，經常會遇到以下問題：

1. **模板冗餘**：專案介面的公共參數非常多，且大多具有模板性質，每個介面都需要重複添加。
2. **位置分散**：公共參數不僅存在於 \`param\` 中，還可能分散在 \`header\` 或 \`body\` 裡，管理割裂。
3. **維護困難**：公共參數的具體值可能隨業務發生變化，甚至需要刪減部分參數，逐個修改介面費時費力且易遺漏。

### 🚀 ApiChain 的解決方案

ApiChain 透過以下機制，讓您徹底告別公共參數的管理煩惱：

1. **全位置支援**：公共參數全面支援 **路徑變數**、**參數**、**標頭** 和 **主體**。無論任何位置設定的 \`key-value\` 資料，均可作為公共參數統一配置。
2. **靈活覆蓋**：公共參數僅作為介面請求時的**預設填充**。對於特殊無需使用某些公共參數的介面，您可直接在介面中刪除對應部分，互不影響。
3. **動態變數注入**：公共參數中的 \`value\` 支援固定值，也支援引用全域或專案的環境變數。使用 \`{{}}\` 包裹變數名稱（如全域變數 \`{{uid}}\`，專案變數 \`{{version}}\`），執行請求時會動態查詢其實際值。這意味著您只需維護一份變數引用，具體資料的變更無需修改公共參數模板。

> **💡 總結**：透過全域參數，實現一次設定、全域生效、動態解析，讓介面管理更加高效優雅。
`;
        const markdownContentEn = `
Global Parameters is a highly **rare feature** in API management tools. Its core value lies in extracting repetitive common parameters from APIs for unified management, **drastically reducing the hassle of rewriting network requests and significantly shortening the time required for API definition**.

### 🎯 Pain Points Addressed

In daily API management, you often encounter the following issues:

1. **Template Redundancy**: Projects have numerous common parameters, mostly template-like, requiring repetitive addition to every single API.
2. **Scattered Locations**: Common parameters don't just exist in \`params\`; they can also be scattered across \`headers\` or \`body\`, leading to fragmented management.
3. **Maintenance Difficulties**: The specific values of common parameters may change with business needs, or some parameters might need to be removed. Modifying APIs one by one is time-consuming, labor-intensive, and prone to omissions.

### 🚀 ApiChain's Solution

ApiChain eliminates your common parameter management headaches through the following mechanisms:

1. **Full Position Support**: Global parameters fully support **Path Variables**, **Query Parameters**, **Headers**, and **Body**. Any \`key-value\` data set in any location can be uniformly configured as a global parameter.
2. **Flexible Override**: Global parameters act merely as **default autofill** for API requests. For specific APIs that don't require certain common parameters, you can simply delete the unnecessary parts within that API without affecting others.
3. **Dynamic Variable Injection**: The \`value\` in global parameters supports both fixed values and references to global or project environment variables. By wrapping the variable name with \`{{}}\` (e.g., global variable \`{{uid}}\`, project variable \`{{version}}\`), the actual value is dynamically queried upon request execution. This means you only need to maintain one variable reference; updating specific data does not require modifying the common parameter template.

> **💡 Summary**: With Global Parameters, you achieve "configure once, apply globally, and parse dynamically," making API management more efficient and elegant.
`;
        let markdownContent;
        if (this.state.lang == "zh-CN") {
          markdownContent = markdownContentZhCn;
        } else if (this.state.lang == "zh-TW") {
          markdownContent = markdownContentZhTw;
        } else {
          markdownContent = markdownContentEn;
        }
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
                {this.state.readyFlg &&
                    <Flex vertical align="center" gap="middle">
                      <Tabs activeKey={ this.state.defaultTabKey } items={ this.getNavs() } onChange={key => this.setState({defaultTabKey: key})} style={{width: "100%"}} />
                  {this.props.clientType == CLIENT_TYPE_SINGLE || this.props.teamId == this.state.teamId && 
                      <Button type="primary" onClick={this.handleClick}>{langTrans("request save bread2")}</Button>
                  }
                    </Flex>
                }
                  <MarkdownView 
                    content={ markdownContent } 
                  />
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