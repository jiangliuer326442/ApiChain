import { Component, ReactNode } from 'react';
import { connect } from 'react-redux';
import { 
    Breadcrumb, Layout, Flex, Divider,
    Select, Button, Input, Tabs, Tooltip,
    Typography, Descriptions,
} from "antd";
import type { DescriptionsProps } from 'antd';
import { decode } from 'base-64';
import JsonView from 'react-json-view';
import { cloneDeep } from 'lodash';

import { 
  getType,
  isStringEmpty,
  paramToString,
  isJsonString,
} from '@rutil/index';
import {
  TABLE_FIELD_TYPE,
  TABLE_FIELD_VALUE,
  cleanJson
} from '@rutil/json';
import { ENV_VALUE_API_HOST } from "@conf/envKeys";
import { getWikiSendRequest } from '@conf/url';
import { 
  TABLE_REQUEST_HISTORY_FIELDS,
  TABLE_VERSION_ITERATION_REQUEST_FIELDS,
  TABLE_PROJECT_REQUEST_FIELDS,
} from '@conf/db';
import {
  CONTENT_TYPE_HTML,
  CONTENT_TYPE_JSON,
  CONTENT_TYPE_IMAGE_JPG,
  CONTENT_TYPE_IMAGE_PNG,
  CONTENT_TYPE_IMAGE_GIF,
  CONTENT_TYPE_IMAGE_WEBP,
  CONTENT_TYPE_ATTACH_GZIP1,
  CONTENT_TYPE_ATTACH_GZIP2,
  CONTENT_TYPE_ATTACH_ZIP,
  CONTENT_TYPE_ATTACH_TAR,
  CONTENT_TYPE_ATTACH_STREAM,
  CONTENT_TYPE_URLENCODE,
  CONTENT_TYPE_FORMDATA,
} from '@conf/contentType';
import {
  REQUEST_METHOD_GET,
  REQUEST_METHOD_POST,
  CONTENT_TYPE,
  INPUTTYPE_TEXT,
  INPUTTYPE_FILE,
} from '@conf/global_config';
import RequestSendTips from '@clazz/RequestSendTips';
import {
  getVersionIteratorRequest
} from '@act/version_iterator_requests';
import {
  getProjectRequest
} from '@act/project_request';
import { 
  getRequestHistory,
  addRequestHistory 
} from '@act/request_history';
import {
  sendAjaxMessage
} from '@act/message';
import SelectPrjEnvComponent from "@comp/env_var/select_prj_env";
import RequestSendBody from "@comp/request_send/body_form";
import RequestSendHead from "@comp/request_send/head_form";
import RequestSendParam from "@comp/request_send/request_param";
import RequestSendPathVariable from "@comp/request_send/request_path_variable";

let request_history_env = TABLE_REQUEST_HISTORY_FIELDS.FIELD_ENV_LABEL;
let request_history_micro_service = TABLE_REQUEST_HISTORY_FIELDS.FIELD_MICRO_SERVICE_LABEL;
let request_history_uri = TABLE_REQUEST_HISTORY_FIELDS.FIELD_URI;
let request_history_method = TABLE_REQUEST_HISTORY_FIELDS.FIELD_REQUEST_METHOD;
let request_history_head = TABLE_REQUEST_HISTORY_FIELDS.FIELD_REQUEST_HEADER;
let request_history_body = TABLE_REQUEST_HISTORY_FIELDS.FIELD_REQUEST_BODY;
let request_history_file = TABLE_REQUEST_HISTORY_FIELDS.FIELD_REQUEST_FILE;
let request_history_param = TABLE_REQUEST_HISTORY_FIELDS.FIELD_REQUEST_PARAM;
let request_history_path_variable = TABLE_REQUEST_HISTORY_FIELDS.FIELD_REQUEST_PATH_VARIABLE;
let request_history_response = TABLE_REQUEST_HISTORY_FIELDS.FIELD_RESPONSE_CONTENT;
let request_history_response_header = TABLE_REQUEST_HISTORY_FIELDS.FIELD_RESPONSE_HEAD;
let request_history_response_cookie = TABLE_REQUEST_HISTORY_FIELDS.FIELD_RESPONSE_COOKIE;
let request_history_iterator = TABLE_REQUEST_HISTORY_FIELDS.FIELD_ITERATOR;
let request_history_jsonFlg = TABLE_REQUEST_HISTORY_FIELDS.FIELD_JSONFLG;
let request_history_htmlFlg = TABLE_REQUEST_HISTORY_FIELDS.FIELD_HTMLFLG;
let request_history_picFlg = TABLE_REQUEST_HISTORY_FIELDS.FIELD_PICFLG;
let request_history_fileFlg = TABLE_REQUEST_HISTORY_FIELDS.FIELD_FILEFLG;

let iteration_request_uri = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_URI;
let iteration_request_prj = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_MICRO_SERVICE_LABEL;
let iteration_request_method = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_REQUEST_METHOD;
let iteration_request_body = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_REQUEST_BODY;
let iteration_request_header = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_REQUEST_HEADER;
let iteration_request_param = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_REQUEST_PARAM;
let iteration_request_path_variable = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_REQUEST_PATH_VARIABLE;
let project_request_project = TABLE_PROJECT_REQUEST_FIELDS.FIELD_PROJECT_LABEL;
let project_request_method = TABLE_PROJECT_REQUEST_FIELDS.FIELD_REQUEST_METHOD;
let project_request_uri = TABLE_PROJECT_REQUEST_FIELDS.FIELD_URI;
let project_request_header = TABLE_PROJECT_REQUEST_FIELDS.FIELD_REQUEST_HEADER;
let project_request_body = TABLE_PROJECT_REQUEST_FIELDS.FIELD_REQUEST_BODY;
let project_request_param = TABLE_PROJECT_REQUEST_FIELDS.FIELD_REQUEST_PARAM;
let project_request_path_variable = TABLE_PROJECT_REQUEST_FIELDS.FIELD_REQUEST_PATH_VARIABLE;

const { Header, Content, Footer } = Layout;
const { Text, Link } = Typography;
const { TextArea } = Input;

class RequestSendContainer extends Component {

  private requestSendTip : RequestSendTips;

  constructor(props) {
    super(props);
    this.state = {
      id : 0, 
      prj : "",
      env : "",
      requestHost: "",
      requestUri: "",
      requestEnable: false,
      showFlg: false,
      requestMethod: REQUEST_METHOD_POST,
      contentType: CONTENT_TYPE_URLENCODE,
      defaultTabKey: "body",
      responseData: "",
      responseCookie: {},
      responseHeader: {},
      isResponseJson: false,
      isResponseHtml: false,
      isResponsePic: false,
      isResponseFile: false,
      requestHeadData: {},
      requestBodyData: {},
      requestFileData: {},
      requestPathVariableData: {},
      requestParamData: {},
      iteratorId: "",
      alertMessage: "",
      envKeys: [],
      statusCode: 0,
      costTime: 0,
      sendingFlg: false,
    }

    this.requestSendTip = new RequestSendTips();
  }

  getClearState() : object {
    return {
      alertMessage: "",
      responseData: "",
      responseCookie: {},
      responseHeader: {},
      sendingFlg: false,
      statusCode: 0,
      costTime: 0,
      isResponseJson: false,
      isResponseHtml: false,
      isResponsePic: false,
      isResponseFile: false,
    };
  }

  async componentDidMount() {
    let pathKey = this.props.match.path.split('/')[1];

    if(Object.keys(this.props.match.params).length === 0) {
      this.setState({ showFlg:true });
    } else if (pathKey === "internet_request_send_by_iterator") {
      let iteratorId = this.props.match.params.iteratorId;
      this.setState( { 
        showFlg: true,
        iteratorId,
      } )
    } else if (pathKey === 'internet_request_send_by_history') {
      let key = Number(this.props.match.params.id);
      let record = await getRequestHistory(key);
      if (record == null) {
        return;
      }
      let headerData = record[request_history_head];
      let contentType = headerData[CONTENT_TYPE];
      let method = record[request_history_method];
      this.setRequestMethod(method);
      this.setState({
        id: key,
        showFlg: true,
        iteratorId: record[request_history_iterator],
        prj: record[request_history_micro_service],
        env: record[request_history_env],
        requestUri: record[request_history_uri],
        requestMethod: method,
        responseCookie: record[request_history_response_cookie],
        responseHeader: record[request_history_response_header],
        responseData: record[request_history_response],
        isResponseJson: record[request_history_jsonFlg],
        isResponseHtml: record[request_history_htmlFlg],
        isResponsePic: record[request_history_picFlg],
        isResponseFile: record[request_history_fileFlg],
        requestHeadData: headerData,
        contentType,
        requestBodyData: record[request_history_body],
        requestFileData: record[request_history_file],
        requestPathVariableData: record[request_history_path_variable],
        requestParamData: record[request_history_param],
      });
    } else if (pathKey === 'internet_request_send_by_api') {
      let iteratorId = this.props.match.params.iteratorId;
      let prj = this.props.match.params.prj;
      let requestMethod = this.props.match.params.method;
      let requestUri = decode(this.props.match.params.uri);
      let uri = "";
      let method = "";
      let body = {};
      let header : any = {};
      let requestParam = {};
      let requestPathVariable = {};
      if (isStringEmpty(iteratorId)) {
        iteratorId = "";
        let record = await getProjectRequest(prj, requestMethod, requestUri);
        prj = record[project_request_project];
        uri = record[project_request_uri];
        method = record[project_request_method];
        body = record[project_request_body];
        header = record[project_request_header];
        requestParam = record[project_request_param];
        requestPathVariable = record[project_request_path_variable];
      } else {
        let record = await getVersionIteratorRequest(iteratorId, prj, requestMethod, requestUri);
        prj = record[iteration_request_prj];
        uri = record[iteration_request_uri];
        method = record[iteration_request_method];
        body = record[iteration_request_body];
        header = record[iteration_request_header];
        requestParam = record[iteration_request_param];
        requestPathVariable = record[iteration_request_path_variable];
      }
      let file : any = {};
      let realBody : any = {};
      for (let _key in body) {
        if (body[_key][TABLE_FIELD_TYPE] === "File") {
          file[_key] = body[_key][TABLE_FIELD_VALUE];
        } else {
          realBody[_key] = body[_key];
        }
      }
      this.setRequestMethod(method);
      let requestBodyData = cleanJson(realBody);
      let requestHeadData = cleanJson(header);
      let requestParamData = cleanJson(requestParam);
      let requestPathVariableData = cleanJson(requestPathVariable);
      let requestFileData = file;
      let contentType = requestHeadData[CONTENT_TYPE];
      this.setState({
        showFlg: true,
        iteratorId,
        prj,
        requestUri: uri,
        contentType,
        requestMethod: method,
        requestHeadData,
        requestBodyData,
        requestFileData,
        requestParamData,
        requestPathVariableData,
      });
    }
  }

  setUri = (event : object) => {
    this.setState({requestUri: event.target.value})
  };

  setRequestMethod = (value: string) => {
    let defaultKey;
    if (value === REQUEST_METHOD_GET) {
      defaultKey = "params";
    } else {
      defaultKey = "body";
    }
    let state : any = this.getClearState();
    state.requestMethod = value;
    state.defaultTabKey = defaultKey;
    this.setState(state);
  };

  setRequestBodyData = (data: Array<any>) => {
    if (this.state.contentType === CONTENT_TYPE_JSON) {
      this.state.requestBodyData = JSON.parse(data);
    } else if (this.state.contentType === CONTENT_TYPE_FORMDATA) {
      let obj : any = {};
      let file : any = {};
      let originFile : any = this.state.requestFileData;
      if (data.length > 0) {
        for (let item of data) {
          let value = item.value;
          if (isStringEmpty(item.type)) return;
          if (isStringEmpty(item.key)) return;
          if (item.type === INPUTTYPE_TEXT) {
            if (getType(value) === "Undefined") {
              value = "";
            }
            obj[item.key] = value;
          } else if (item.type === INPUTTYPE_FILE) {
            if (getType(value) === "File" && value.path) {
              let _file : any = {};
              _file.name = value.name;
              _file.type = value.type;
              _file.path = value.path;
              file[item.key] = _file;
              var reader = new FileReader();
              reader.readAsArrayBuffer(value);
              let that = this;
              reader.onload = function(e) {
                let _file = that.state.requestFileData[item.key];
                let blob = e.target.result;
                _file.blob = blob;
              };
            } else if (item.key in originFile) {
              let _file = originFile[item.key];
              file[item.key] = _file;
            }
          }
        }

        this.state.requestFileData = file;
        this.state.requestBodyData = obj;
      }
    } else {
      let obj = {};
      if (data.length > 0) {
        for (let item of data) {
          let value = item.value;
          if (getType(value) === "Undefined") {
            value = "";
          }
          obj[item.key] = value;
        }
      }
      this.state.requestBodyData = obj;
    }
  }

  setRequestHeadData = (data: Array<any>) => {
    let contentType = data.find(item => item.key === CONTENT_TYPE).value;
    let obj = {};
    if (data.length > 0) {
      for (let item of data) {
        let value = item.value;
        if (getType(value) === "Undefined") {
          value = "";
        }
        obj[item.key] = value;
      }
    }
    if (contentType !== this.state.contentType) {
      this.setState({contentType});
    }
    this.state.requestHeadData = obj;
  }

  setRequestParamData = (data: Array<any>) => {
    let obj = {};
    if (data.length > 0) {
      for (let item of data) {
        let value = item.value;
        if (getType(value) === "Undefined") {
          value = "";
        }
        obj[item.key] = value;
      }
    }
    this.state.requestParamData = obj;
  }

  setRequestPathVariableData = (data: Array<any>) => {
    let uri = this.state.requestUri;
    let beginIndex = 0;
    let endIndex = 0;
    let keywords = new Set();
    let dataKeys = new Set();
    //从uri 中提取全部 uri 变量
    if (uri.length > 4) {
      for (let i = 0; i < uri.length; i++) {
        if (i < uri.length - 4) {
          if (uri[i] === "{" && uri[i + 1] === "{") {
            beginIndex = i+2;
            endIndex = 0;
          }
        }  
        if (i <= uri.length - 2) {
          if (uri[i] === "}" && uri[i + 1] === "}" && beginIndex > 0) {
            endIndex = i;
            keywords.add(uri.substring(beginIndex, endIndex));
            beginIndex = 0;
          }
        }
      }
    }
    let obj:any = {};
    if (data.length > 0) {
      for (let item of data) {
        let value = item.value;
        if (getType(value) === "Undefined") {
          value = "";
        }
        if (isStringEmpty(item.key)) {
          continue;
        }
        dataKeys.add(item.key);
        obj[item.key] = value;
      }
    }

    const appendSet = new Set([...dataKeys].filter(x => !keywords.has(x)));
    const deleteSet = new Set([...keywords].filter(x => !dataKeys.has(x)));

    for (let _newKeyword of appendSet) {
      uri += "{{" + _newKeyword + "}}";
    }

    for (let _delKeyword of deleteSet) {
      uri = uri.replaceAll("{{" + _delKeyword + "}}", "");
    }

    this.state.requestPathVariableData = obj;
    this.state.requestUri = uri;
  }

  getEnvValueData = (prj: string, env: string) => {
    if (isStringEmpty(env)) return;
    this.setState(this.getClearState());
    this.requestSendTip.init(prj, env, this.state.iteratorId, "", this.props.dispatch, env_vars => {
      if(env_vars.length === 0) {
        this.setState({ alertMessage: "请到设置菜单配置项目和环境，否则无法发送请求" });
        return;
      }
      this.setState({
        requestEnable : true,
        prj,
        env,
      });
    });
    this.requestSendTip.getHost(requestHost => {
      if (isStringEmpty(requestHost)) {
        this.setState({ alertMessage: "未配置环境变量" + ENV_VALUE_API_HOST + "的值，无法发送请求" });
        return;
      } else {
        this.setState({ requestHost });
      }
    });
    this.requestSendTip.getTips(envKeys => {
      this.setState({ envKeys });
    });
  }

  sendRequest = async () => {
    let state : any = this.getClearState();
    state.sendingFlg = true;
    this.setState(state);

    let requestDefine = await getVersionIteratorRequest(
      this.state.iteratorId, 
      this.state.prj, 
      this.state.requestMethod, 
      this.state.requestUri
    );
    if (requestDefine === null) {
      requestDefine = await getProjectRequest(this.state.prj, this.state.requestMethod, this.state.requestUri);
      if (requestDefine == null) {
        requestDefine = {};
      }
    }

    let url = this.state.requestHost + this.state.requestUri;

    for (let _key in this.state.requestPathVariableData) {
      let value = this.state.requestPathVariableData[_key];
      let beginIndex = value.indexOf("{{");
      let endIndex = value.indexOf("}}");
      if (beginIndex >= 0 && endIndex >= 0 && beginIndex < endIndex) {
        let envValueKey = value.substring(beginIndex + 2, endIndex);
        value = this.requestSendTip.getVarByKey(envValueKey);
      }
      url = url.replaceAll("{{" + _key + "}}", value);
    }

    let paramData = cloneDeep(this.state.requestParamData);
    for (let _key in paramData) {
      let value = paramData[_key];
      let beginIndex = value.indexOf("{{");
      let endIndex = value.indexOf("}}");
      if (beginIndex >= 0 && endIndex >= 0 && beginIndex < endIndex) {
        let envValueKey = value.substring(beginIndex + 2, endIndex);
        value = this.requestSendTip.getVarByKey(envValueKey);
        paramData[_key] = value;
      }
    }
    if (!isStringEmpty(paramToString(paramData))) {
      url += "?" + paramToString(paramData);
    }
    let headData = cloneDeep(this.state.requestHeadData);
    for (let _key in headData) {
      let value = headData[_key];
      let beginIndex = value.indexOf("{{");
      let endIndex = value.indexOf("}}");
      if (beginIndex >= 0 && endIndex >= 0 && beginIndex < endIndex) {
        let envValueKey = value.substring(beginIndex + 2, endIndex);
        value = this.requestSendTip.getVarByKey(envValueKey);
        headData[_key] = value;
      }
    }
    if (this.state.requestMethod === REQUEST_METHOD_POST) {
      let postData = this.requestSendTip.iteratorGetVarByKey(
        this.state.requestBodyData, 
        Object.keys(requestDefine).length > 0 ? requestDefine['body'] : null 
      );

      if (this.state.contentType === CONTENT_TYPE_FORMDATA) {
        sendAjaxMessage('post', url, headData, postData, this.state.requestFileData).then(response => {
          this.handleResponse(response.originUrl, response.cookieObj, response.headers, response.costTime, response.data);
          this.setState({alertMessage: "", sendingFlg: false, statusCode: 200});
        }).catch(err => this.setState({
          alertMessage: err.errorMessage, 
          sendingFlg: false, 
          statusCode: err.statusCode,
        }));
      } else {
        sendAjaxMessage('post', url, headData, postData, null).then(response => {
          this.handleResponse(response.originUrl, response.cookieObj, response.headers, response.costTime, response.data);
          this.setState({alertMessage: "", sendingFlg: false, statusCode: 200});
        }).catch(err => this.setState({
          alertMessage: err.errorMessage, 
          sendingFlg: false, 
          statusCode: err.statusCode,
        }));
      }
    } else if (this.state.requestMethod === REQUEST_METHOD_GET) {
      sendAjaxMessage('get', url, headData, null, null).then(response => {
        this.handleResponse(response.originUrl, response.cookieObj, response.headers, response.costTime, response.data);
        this.setState({alertMessage: "", sendingFlg: false, statusCode: 200});
      }).catch(err => this.setState({
        alertMessage: err.errorMessage, 
        sendingFlg: false, 
        statusCode: err.statusCode,
      }));
    }
  }

  handleResponse = async (url, cookieObj, headers, costTime, data) => {
    let isResponseJson = false;
    let isResponseHtml = false;
    let isResponsePic = false;
    let isResponseFile = false;
    let content = "";
    if (headers === undefined) {
      content = "";
    } else if (headers['content-type'] && headers['content-type'].toString().indexOf(CONTENT_TYPE_HTML) >= 0) {
      isResponseHtml = true;
      content = data;
    } else if (
      headers['content-type'] && (
        headers['content-type'].toString().indexOf(CONTENT_TYPE_IMAGE_JPG) >= 0 || 
        headers['content-type'].toString().indexOf(CONTENT_TYPE_IMAGE_PNG) >= 0 || 
        headers['content-type'].toString().indexOf(CONTENT_TYPE_IMAGE_GIF) >= 0 || 
        headers['content-type'].toString().indexOf(CONTENT_TYPE_IMAGE_WEBP) >= 0 
      )) {
      isResponsePic = true;
      content = url;
    } else if (
      headers['content-type'] && (
        headers['content-type'].toString().indexOf(CONTENT_TYPE_ATTACH_GZIP1) >= 0 || 
        headers['content-type'].toString().indexOf(CONTENT_TYPE_ATTACH_GZIP2) >= 0 || 
        headers['content-type'].toString().indexOf(CONTENT_TYPE_ATTACH_ZIP) >= 0 || 
        headers['content-type'].toString().indexOf(CONTENT_TYPE_ATTACH_TAR) >= 0 ||
        headers['content-type'].toString().indexOf(CONTENT_TYPE_ATTACH_STREAM) >= 0
      )) {
      isResponseFile = true;
      content = "[!返回了一个文件]";
    } else if ((headers['content-type'] && headers['content-type'].toString().indexOf(CONTENT_TYPE_JSON) >= 0) || isJsonString(JSON.stringify(data))) {
      isResponseJson = true;
      content = JSON.stringify(data);
    } else {
      content = data;
    }
    let historyId = await addRequestHistory(this.state.env, this.state.prj, this.state.requestUri, this.state.requestMethod,
      this.state.requestHeadData, this.state.requestBodyData, this.state.requestPathVariableData, this.state.requestParamData, this.state.requestFileData,
      content, headers, cookieObj,
      this.state.iteratorId, 
      isResponseJson, isResponseHtml, isResponsePic, isResponseFile);
    this.setState({ 
      costTime,
      responseCookie: cookieObj,
      responseHeader: headers,
      responseData : content, 
      isResponseJson, 
      isResponseHtml, 
      isResponsePic, 
      isResponseFile, 
      alertMessage: "", 
      id: historyId 
    });
  }

  calculateFormBodyData = (requestBodyData, requestFileData) => {
    if (this.state.contentType === CONTENT_TYPE_JSON) {
      return JSON.stringify(requestBodyData);
    } else {
      let list = [];
      for (let _key in requestBodyData) {
          let item : any = {};
          item["key"] = _key;
          item["value"] = requestBodyData[_key];
          item["type"] = INPUTTYPE_TEXT;
          list.push(item);
      }
      for (let _key in requestFileData) {
        let item : any = {};
        item["key"] = _key;
        item["value"] = "";
        item["type"] = INPUTTYPE_FILE;
        list.push(item);
      }
      this.setRequestBodyData(list);
      return list;
    }
  }

  calculateFormHeadData = (requestHeadData) => {
    let list = [];
    for (let _key in requestHeadData) {
        let item = {};
        item["key"] = _key;
        item["value"] = requestHeadData[_key];
        list.push(item);
    }
    let data = list.length === 0 ? [{
        key: CONTENT_TYPE,
        value: this.state.contentType,
    }] : list;
    this.setRequestHeadData(data);
    return data;
  }

  calculateFormParamsData = (requestParamsData) => {
    let list = [];
    for (let _key in requestParamsData) {
        let item = {};
        item["key"] = _key;
        item["value"] = requestParamsData[_key];
        list.push(item);
    }
    this.setRequestParamData(list);
    return list;
  }

  calculatePathVariableData = (requestPathVariableData) => {
    let list = [];
    for (let _key in requestPathVariableData) {
        let item : any = {};
        item["key"] = _key;
        item["value"] = requestPathVariableData[_key];
        list.push(item);
    }
    this.setRequestPathVariableData(list);
    return list;
  }

  getHeaders = () : DescriptionsProps['items'] => {
    let headerArr = [];
    for (let i = 0; i < Object.keys(this.state.responseHeader).length; i++) {
      let _key = Object.keys(this.state.responseHeader)[i];
      headerArr.push({
        key: i + "",
        label: <Text copyable={{text: _key}}>{ _key }</Text>,
        children: <Text copyable={{text: this.state.responseHeader[_key]}}>{ this.state.responseHeader[_key] }</Text>,
      });
    }
    return headerArr;
  }

  getCookies = () : DescriptionsProps['items'] => {
    let cookieArr = [];
    for (let i = 0; i < Object.keys(this.state.responseCookie).length; i++) {
      let _key = Object.keys(this.state.responseCookie)[i];
      cookieArr.push({
        key: i + "",
        label: <Text copyable={{text: _key}}>{ _key }</Text>,
        children: <Text copyable={{text: this.state.responseCookie[_key]}}>{ this.state.responseCookie[_key] }</Text>,
      });
    }
    return cookieArr;
  }

  getNavs() {
    return [
      {
        key: 'uri',
        label: '路径变量',
        children: <RequestSendPathVariable obj={ this.calculatePathVariableData(this.state.requestPathVariableData) } tips={this.state.envKeys} cb={this.setRequestPathVariableData} />,
      },
      {
        key: 'params',
        label: '参数',
        children: <RequestSendParam obj={ this.calculateFormParamsData(this.state.requestParamData) } tips={this.state.envKeys} cb={this.setRequestParamData} />,
      },
      {
        key: 'headers',
        label: '头部',
        children: <RequestSendHead 
          obj={ this.calculateFormHeadData(this.state.requestHeadData) } 
          tips={this.state.envKeys} 
          cb={this.setRequestHeadData} 
          />,
      },
      {
        key: 'body',
        label: '主体',
        children: <RequestSendBody 
          obj={ this.calculateFormBodyData(this.state.requestBodyData, this.state.requestFileData) } 
          file={ this.state.requestFileData }
          tips={ this.state.envKeys } 
          contentType={ this.state.contentType }
          cb={this.setRequestBodyData} 
        />,
      },
    ];
  }

  render() : ReactNode {
    return (
        <Layout>
            <Header style={{ padding: 0 }}>
                发送网络请求 <Text type="secondary"><Link href={ getWikiSendRequest() }>如何发送网络请求？</Link></Text>
            </Header>
            <Content style={{ padding: '0 16px' }}>
              <Breadcrumb style={{ margin: '16px 0' }} items={[{ title: '请求' }, { title: '发送' }]} />
              <Flex vertical gap="middle">
                <Flex justify="space-between" align="center">
                  {this.state.showFlg ? 
                  <SelectPrjEnvComponent iteratorId={this.state.iteratorId} prj={ this.state.prj ? this.state.prj : this.props.prj } env={ this.state.env ? this.state.env : this.props.env } cb={this.getEnvValueData} />
                  : null}
                  <Button 
                      type="primary" 
                      disabled={this.state.id === 0}
                      href={ isStringEmpty(this.state.iteratorId) ? "#/history_request_to_interator/" + this.state.id : "#/request_to_interator/" + this.state.iteratorId + "/" + this.state.id}
                      style={ { background: "#3b3b3b", color: "rgba(255, 255, 255, 0.5)"} }
                  >保存</Button>
                </Flex>
                <Flex>
                    <Select 
                      style={{borderRadius: 0, width: 118}} 
                      size='large' 
                      value={ this.state.requestMethod }
                      onChange={ this.setRequestMethod }>
                      <Select.Option value={ REQUEST_METHOD_POST }>{ REQUEST_METHOD_POST }</Select.Option>
                      <Select.Option value={ REQUEST_METHOD_GET }>{ REQUEST_METHOD_GET }</Select.Option>
                    </Select>
                    <Input 
                      style={{borderRadius: 0}} 
                      prefix={
                        <Tooltip placement='bottom' title={this.state.requestHost}>
                          {this.state.requestHost.length > 50 ? this.state.requestHost.substring(0, 50) + "..." : this.state.requestHost}
                        </Tooltip> 
                      } 
                      onFocus={e => {
                        this.setState({requesrequestUri: this.state.requestUri})
                      }}
                      onChange={this.setUri} 
                      value={ this.state.requestUri } 
                      size='large' />
                    <Button 
                      size='large' 
                      type="primary" 
                      style={{borderRadius: 0}} 
                      disabled={!this.state.requestEnable || this.state.sendingFlg}
                      onClick={ this.sendRequest }
                    >{this.state.sendingFlg ? "请求中" : "发送请求"}</Button>
                </Flex>
                { this.state.showFlg ? <Tabs activeKey={ this.state.defaultTabKey } items={ this.getNavs() } onChange={key => this.setState({defaultTabKey: key})} /> : null }
                <Divider orientation="left">响应 
                {this.state.statusCode > 0 ? 
                (this.state.statusCode == 200 ? 
                  <Text style={{ color: 'green' }}>（耗时 { this.state.costTime } 毫秒）</Text>
                  :
                  <Text style={{ color: 'red' }}> {this.state.statusCode + " " + this.state.alertMessage} </Text>
                )
                : null}
                </Divider>
                {this.state.responseHeader != null && Object.keys(this.state.responseHeader).length > 0 ?
                <Descriptions column={1} title="header" items={this.getHeaders()} />
                : null}
                {this.state.responseCookie != null && Object.keys(this.state.responseCookie).length > 0 ?
                <Descriptions column={1} title="cookie" items={this.getCookies()} />
                : null}
                <Flex style={ {
                  minHeight: 136,
                  overflowY: this.state.isResponsePic ? "auto":"scroll",
                } }>
                  { this.state.isResponseJson ? 
                    <JsonView 
                    src={JSON.parse(this.state.responseData)}   
                    name="response"
                    theme={ "bright" }
                    collapsed={false}  
                    indentWidth={4}  
                    iconStyle="triangle"
                    enableClipboard={true}
                    displayObjectSize={false}
                    displayDataTypes={false}
                    sortKeys={true}
                    collapseStringsAfterLength={40}  />
                  : null}
                  {this.state.isResponsePic ? 
                    <img style={{height: 200}} src={this.state.responseData} />
                  : null}
                  {this.state.isResponseHtml ? 
                      <TextArea
                          value={this.state.responseData}
                          readOnly={ true }
                          autoSize={{ minRows: 5 }}
                      />
                  : null}
                  {this.state.isResponseFile ? 
                    this.state.responseData
                  : null}
                </Flex>
              </Flex>
            </Content>
            <Footer style={{ textAlign: 'center' }}>
            ApiChain ©{new Date().getFullYear()} Created by 方海亮
            </Footer>
        </Layout>
    );
  }
}

function mapStateToProps (state) {
  return {
    prj: state.env_var.prj,
    env: state.env_var.env,
  }
}

export default connect(mapStateToProps)(RequestSendContainer);