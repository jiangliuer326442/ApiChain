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
  isStringEmpty,
  paramToString,
  isJsonString,
  getMapValueOrDefault,
  getType,
} from '@rutil/index';
import {
  TABLE_FIELD_TYPE,
  TABLE_FIELD_VALUE,
  cleanJson,
  shortJsonContent,
  getEnvVarsIterator,
} from '@rutil/json';
import { ENV_VALUE_API_HOST, ENV_VALUE_RUN_MODE_CLIENT, ENV_VALUE_RUN_MODE_RUMMER } from "@conf/envKeys";
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
  CLIENT_TYPE_TEAM,
} from '@conf/team';
import {
  REQUEST_METHOD_GET,
  REQUEST_METHOD_POST,
  CONTENT_TYPE,
} from '@conf/global_config';
import { GET_ENV_VALS } from '@conf/redux';
import {
  getEnvHosts,
  getEnvRunModes,
  getPrjEnvValues,
  getIteratorEnvValues,
} from '@act/env_value';
import {
  getProjectKeys,
  getIteratorKeys
} from '@act/keys';
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
  sendAjaxMessageByClient,
  sendAjaxMessageByRunner,
} from '@act/message';
import SelectPrjEnvComponent from "@comp/env_var/select_prj_env";
import RequestSendBody from "@comp/request_send/body_form";
import RequestSendHead from "@comp/request_send/head_form";
import RequestSendParam from "@comp/request_send/request_param";
import RequestSendPathVariable from "@comp/request_send/request_path_variable";
import { langFormat, langTrans } from '@lang/i18n';

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

let iteration_request_body = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_REQUEST_BODY;
let iteration_request_header = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_REQUEST_HEADER;
let iteration_request_param = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_REQUEST_PARAM;
let iteration_request_path_variable = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_REQUEST_PATH_VARIABLE;
let project_request_header = TABLE_PROJECT_REQUEST_FIELDS.FIELD_REQUEST_HEADER;
let project_request_body = TABLE_PROJECT_REQUEST_FIELDS.FIELD_REQUEST_BODY;
let project_request_param = TABLE_PROJECT_REQUEST_FIELDS.FIELD_REQUEST_PARAM;
let project_request_path_variable = TABLE_PROJECT_REQUEST_FIELDS.FIELD_REQUEST_PATH_VARIABLE;

const { Header, Content, Footer } = Layout;
const { Text, Link } = Typography;
const { TextArea } = Input;

class RequestSendContainer extends Component {

  constructor(props) {
    super(props);

    let pathKey = props.match.path.split('/')[1];

    let id = 0;
    let showFlg = false;
    let type = "project";
    let iteratorId = "";
    let prj = "";
    let requestMethod = REQUEST_METHOD_POST;
    let requestUri = "";
    if(Object.keys(props.match.params).length === 0) {
      showFlg = true;
    } else if (pathKey === 'internet_request_send_by_history') {
      id = Number(props.match.params.id);
    } else if (pathKey === "internet_request_send_by_iterator") {
      iteratorId = props.match.params.iteratorId;
      showFlg = true;
      type = "iterator";
    } else if (pathKey === 'internet_request_send_by_api') {
      iteratorId = props.match.params.iteratorId;
      type = isStringEmpty(iteratorId) ? "project" : "iterator";
      prj = props.match.params.prj;
      requestMethod = this.props.match.params.method;
      requestUri = decode(this.props.match.params.uri);
    }

    this.state = {
      id, 
      prj,
      env : "",
      requestHost: "",
      runMode: ENV_VALUE_RUN_MODE_CLIENT,
      requestUri,
      requestEnable: false,
      showFlg,
      type,
      requestMethod,
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
      iteratorId,
      alertMessage: "",
      envKeys: [],
      statusCode: 0,
      initDatasFlg: false,
      costTime: 0,
      sendingFlg: false,
    }
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
    let method = this.state.requestMethod;
    let showFlg = true;
    let requestEnable = true;

    if (pathKey === 'internet_request_send_by_history') {
      let type = "project";
      let iteratorId = "";
      let record = await getRequestHistory(this.state.id);
      if (record == null) {
        return;
      }
      method = record[request_history_method];
      if (!isStringEmpty(record[request_history_iterator])) {
        type = "iterator";
        iteratorId = record[request_history_iterator];
      }

      let headerData = record[request_history_head];
      let contentType = headerData[CONTENT_TYPE];
      this.setRequestMethod(method);
      this.setState({
        type,
        initDatasFlg: true,
        iteratorId,
        requestMethod: method,
        requestHeadData: headerData,
        contentType,
        prj: record[request_history_micro_service],
        env: record[request_history_env],
        requestUri: record[request_history_uri],
        responseCookie: record[request_history_response_cookie],
        responseHeader: record[request_history_response_header],
        responseData: record[request_history_response],
        isResponseJson: record[request_history_jsonFlg],
        isResponseHtml: record[request_history_htmlFlg],
        isResponsePic: record[request_history_picFlg],
        isResponseFile: record[request_history_fileFlg],
        requestBodyData: record[request_history_body],
        requestFileData: record[request_history_file],
        requestPathVariableData: record[request_history_path_variable],
        requestParamData: record[request_history_param],
        requestEnable,
        showFlg,
      });
    } else if (pathKey === 'internet_request_send_by_api' && this.state.type === "iterator") {
      let record = await getVersionIteratorRequest(
        this.props.clientType, 
        this.state.iteratorId, 
        this.state.prj, 
        this.state.requestMethod, 
        this.state.requestUri
      );
      let body = record[iteration_request_body];
      let header = record[iteration_request_header];
      let requestParam = record[iteration_request_param];
      let requestPathVariable = record[iteration_request_path_variable];
      let file : any = {};
      let realBody : any = {};
      for (let _key in body) {
        if (body[_key][TABLE_FIELD_TYPE] === "File") {
          file[_key] = body[_key][TABLE_FIELD_VALUE];
        } else {
          realBody[_key] = body[_key];
        }
      }
      let requestBodyData = cleanJson(realBody);
      let requestHeadData = cleanJson(header);
      let requestParamData = cleanJson(requestParam);
      let requestPathVariableData = cleanJson(requestPathVariable);
      let requestFileData = file;
      let contentType = requestHeadData[CONTENT_TYPE];
      this.setRequestMethod(method);
      this.setState({
        contentType,
        initDatasFlg: true,
        requestHeadData,
        requestBodyData,
        requestFileData,
        requestParamData,
        requestPathVariableData,
        requestEnable,
        showFlg,
      });
    } else if (pathKey === 'internet_request_send_by_api' && this.state.type === "project") {
      this.initDataByProject(this.state.requestUri);
    }
  }

  setRequestMethod = (value: string) => {
    if (isStringEmpty(value)) return;
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

  initDataByProject = async (url: string) => {
    if (isStringEmpty(url)) return;
    if (this.state.initDatasFlg) return;
    let record = await getProjectRequest(
      this.props.clientType, 
      this.state.prj, 
      this.state.requestMethod, 
      url
    );
    if (record === null) return;
    let body = record[project_request_body];
    let header = record[project_request_header];
    let requestParam = record[project_request_param];
    let requestPathVariable = record[project_request_path_variable];
    let file : any = {};
    let realBody : any = {};
    for (let _key in body) {
      if (body[_key][TABLE_FIELD_TYPE] === "File") {
        file[_key] = body[_key][TABLE_FIELD_VALUE];
      } else {
        realBody[_key] = body[_key];
      }
    }
    let requestBodyData = cleanJson(realBody);
    let requestHeadData = cleanJson(header);
    let requestParamData = cleanJson(requestParam);
    let requestPathVariableData = cleanJson(requestPathVariable);
    let requestFileData = file;
    let contentType = requestHeadData[CONTENT_TYPE];
    this.setRequestMethod(this.state.requestMethod);
    this.setState({
      contentType,
      initDatasFlg: true,
      requestHeadData,
      requestBodyData,
      requestFileData,
      requestParamData,
      requestPathVariableData,
      requestEnable: true,
      showFlg: true,
    });
  }

  getEnvValueData = async (prj: string, env: string) => {
    if (isStringEmpty(env)) return;
    this.setState(this.getClearState());
    let ret = await getEnvHosts(this.props.clientType, prj, env);
    let requestHost = getMapValueOrDefault(ret, env, "");
    let runMode = ENV_VALUE_RUN_MODE_CLIENT;
    if (this.props.clientType === CLIENT_TYPE_TEAM) {
      let ret2 = await getEnvRunModes(this.props.clientType, prj, env);
      runMode = getMapValueOrDefault(ret2, env, ENV_VALUE_RUN_MODE_CLIENT);
    }
    if (isStringEmpty(requestHost)) {
      this.setState({ alertMessage: langFormat("network table7", {"key": ENV_VALUE_API_HOST,}) });
      return;
    }
    let envKeys;
    if (this.state.type === "project") {
      envKeys = await getProjectKeys(this.props.clientType, prj);
    } else if (this.state.type === "iterator") {
      envKeys = await getIteratorKeys(this.props.clientType, this.state.iteratorId, prj);
    }
    this.setState({ prj, env, requestHost, runMode, envKeys: [...envKeys] });
  }

  sendRequest = async () => {
    let state : any = this.getClearState();
    state.sendingFlg = true;
    this.setState(state);
    this.props.dispatch({
      type: GET_ENV_VALS,
      prj: this.state.prj,
      env: this.state.env,
      iterator: this.state.type === "iterator" ? this.state.iteratorId : "",
      unittest: ""
    });

    let requestDefine = {};
    let envvars = new Map<string, string>();
    if (this.state.type === "project") {
      requestDefine = await getProjectRequest(
        this.props.clientType,
        this.state.prj, 
        this.state.requestMethod, 
        this.state.requestUri
      );
      envvars = await getPrjEnvValues(this.state.prj, this.state.env, this.props.clientType);
    } else if (this.state.type === "iterator") {
      requestDefine = await getVersionIteratorRequest(
        this.props.clientType,
        this.state.iteratorId, 
        this.state.prj, 
        this.state.requestMethod, 
        this.state.requestUri
      )
      envvars = await getIteratorEnvValues(this.state.iteratorId, this.state.prj, this.state.env, this.props.clientType);
    }

    let url = this.state.requestHost + this.state.requestUri;

    for (let _key in this.state.requestPathVariableData) {
      let value = this.state.requestPathVariableData[_key];
      let beginIndex = value.indexOf("{{");
      let endIndex = value.indexOf("}}");
      if (beginIndex >= 0 && endIndex >= 0 && beginIndex < endIndex) {
        let envValueKey = value.substring(beginIndex + 2, endIndex);
        value = getMapValueOrDefault(envvars, envValueKey, "");
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
        value = getMapValueOrDefault(envvars, envValueKey, "");
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
        value = getMapValueOrDefault(envvars, envValueKey, "");
        headData[_key] = value;
      }
    }

    if (this.state.requestMethod === REQUEST_METHOD_POST) {
      let postData = getEnvVarsIterator(
        this.state.requestBodyData, 
        requestDefine?.body ?? null,
        envvars
      );

      if (this.state.contentType === CONTENT_TYPE_FORMDATA) {
        if (this.state.runMode === ENV_VALUE_RUN_MODE_RUMMER) {
          sendAjaxMessageByRunner(REQUEST_METHOD_POST, url, headData, postData, this.state.requestFileData).then(response => {
            this.handleResponse(response.originUrl, response.cookieObj, response.headers, response.costTime, response.data);
            this.setState({alertMessage: "", sendingFlg: false, statusCode: 200});
          }).catch(err => this.setState({
            alertMessage: err.errorMessage, 
            sendingFlg: false, 
            statusCode: err.statusCode,
          }));
        } else if (this.state.runMode === ENV_VALUE_RUN_MODE_CLIENT) {
          sendAjaxMessageByClient(REQUEST_METHOD_POST, url, headData, postData, this.state.requestFileData).then(response => {
            this.handleResponse(response.originUrl, response.cookieObj, response.headers, response.costTime, response.data);
            this.setState({alertMessage: "", sendingFlg: false, statusCode: 200});
          }).catch(err => this.setState({
            alertMessage: err.errorMessage, 
            sendingFlg: false, 
            statusCode: err.statusCode,
          }));
        }
      } else {
        if (this.state.runMode === ENV_VALUE_RUN_MODE_RUMMER) {
          sendAjaxMessageByRunner(REQUEST_METHOD_POST, url, headData, postData, null).then(response => {
            this.handleResponse(response.originUrl, response.cookieObj, response.headers, response.costTime, response.data);
            this.setState({alertMessage: "", sendingFlg: false, statusCode: 200});
          }).catch(err => this.setState({
            alertMessage: err.errorMessage, 
            sendingFlg: false, 
            statusCode: err.statusCode,
          }));
        } else if (this.state.runMode === ENV_VALUE_RUN_MODE_CLIENT) {
          sendAjaxMessageByClient(REQUEST_METHOD_POST, url, headData, postData, null).then(response => {
            this.handleResponse(response.originUrl, response.cookieObj, response.headers, response.costTime, response.data);
            this.setState({alertMessage: "", sendingFlg: false, statusCode: 200});
          }).catch(err => this.setState({
            alertMessage: err.errorMessage, 
            sendingFlg: false, 
            statusCode: err.statusCode,
          }));
        }
      }
    } else if (this.state.requestMethod === REQUEST_METHOD_GET) {
      if (this.state.runMode === ENV_VALUE_RUN_MODE_RUMMER) {
        sendAjaxMessageByRunner(REQUEST_METHOD_GET, url, headData, null, null).then(response => {
          this.handleResponse(response.originUrl, response.cookieObj, response.headers, response.costTime, response.data);
          this.setState({alertMessage: "", sendingFlg: false, statusCode: 200});
        }).catch(err => this.setState({
          alertMessage: err.errorMessage, 
          sendingFlg: false, 
          statusCode: err.statusCode,
        }));
      } else if (this.state.runMode === ENV_VALUE_RUN_MODE_CLIENT) {
        sendAjaxMessageByClient(REQUEST_METHOD_GET, url, headData, null, null).then(response => {
          this.handleResponse(response.originUrl, response.cookieObj, response.headers, response.costTime, response.data);
          this.setState({alertMessage: "", sendingFlg: false, statusCode: 200});
        }).catch(err => this.setState({
          alertMessage: err.errorMessage, 
          sendingFlg: false, 
          statusCode: err.statusCode,
        }));
      }
    }
  }

  handleResponse = async (url, cookieObj, headers, costTime, data) => {
    if (getType(data) === "String" && isJsonString(data)) {
        data = JSON.parse(data);
    }
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
    let shortResponseJsonContent = "";
    if (isResponseJson) {
      let shortResponseJsonObject = {};
      shortJsonContent(shortResponseJsonObject, JSON.parse(content));
      shortResponseJsonContent = JSON.stringify(shortResponseJsonObject);
    } else {
      shortResponseJsonContent = content;
    }
    let historyId = await addRequestHistory(
      this.state.env, this.state.prj, this.state.requestUri, this.state.requestMethod,
      this.state.requestHeadData, this.state.requestBodyData, this.state.requestPathVariableData, this.state.requestParamData, this.state.requestFileData,
      shortResponseJsonContent, headers, cookieObj,
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
        label: langTrans("network tab1"),
        forceRender: true,
        children: <RequestSendPathVariable 
          requestUri={ this.state.requestUri }
          obj={ this.state.requestPathVariableData } 
          tips={ this.state.envKeys } 
          cb={(obj, uri) => {
            this.state.requestPathVariableData = obj;
            this.state.requestUri = uri;
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
          cb={obj => this.state.requestParamData = obj} 
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
            this.state.requestHeadData = obj
            if (obj[CONTENT_TYPE] !== this.state.contentType) {
              this.setState({contentType: obj[CONTENT_TYPE]})
            }
          }} 
        />,
      },
      {
        key: 'body',
        label: langTrans("network tab4"),
        forceRender: true,
        children: <RequestSendBody 
          obj={ this.state.requestBodyData }
          file={ this.state.requestFileData }
          tips={ this.state.envKeys } 
          contentType={ this.state.contentType }
          cb={(obj, file) => {
            this.state.requestBodyData = obj;
            if (file !== null) {
              this.state.requestFileData = file;
            }
          }} 
        />,
      },
    ];
  }

  render() : ReactNode {
    return (
        <Layout>
            <Header style={{ padding: 0 }}>
                {langTrans("request title")} <Text type="secondary"><Link href={ getWikiSendRequest() }>{langTrans("request link")}</Link></Text>
            </Header>
            <Content style={{ padding: '0 16px' }}>
              <Breadcrumb style={{ margin: '16px 0' }} items={[{ title: langTrans("request bread1") }, { title: langTrans("request bread2") }]} />
              <Flex vertical gap="middle">
                <Flex justify="space-between" align="center">
                {this.state.showFlg ? 
                  <SelectPrjEnvComponent 
                    iteratorId={this.state.iteratorId} 
                    prj={ this.state.prj ? this.state.prj : this.props.prj } 
                    env={ this.state.env ? this.state.env : this.props.env } 
                    cb={this.getEnvValueData} />
                : null}
                  <Button 
                      type="primary" 
                      disabled={this.state.id === 0}
                      href={ isStringEmpty(this.state.iteratorId) ? "#/history_request_to_interator/" + this.state.id : "#/request_to_interator/" + this.state.iteratorId + "/" + this.state.id}
                      style={ { background: "#3b3b3b", color: "rgba(255, 255, 255, 0.5)"} }
                  >{langTrans("request btn1")}</Button>
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
                      onChange={event => this.setState({requestUri: event.target.value})} 
                      onBlur={event => this.initDataByProject(event.target.value)}
                      value={ this.state.requestUri } 
                      size='large' />
                    <Button 
                      size='large' 
                      type="primary" 
                      style={{borderRadius: 0}} 
                      disabled={!this.state.requestEnable || this.state.sendingFlg}
                      onClick={ this.sendRequest }
                    >{this.state.sendingFlg ? langTrans("request btn3") : langTrans("request btn2")}</Button>
                </Flex>
                { this.state.showFlg ? <Tabs activeKey={ this.state.defaultTabKey } items={ this.getNavs() } onChange={key => this.setState({defaultTabKey: key})} /> : null }
                <Divider orientation="left">{langTrans("request response title")} 
                  {this.state.statusCode > 0 ? 
                  (this.state.statusCode == 200 ? 
                  <Text style={{ color: 'green' }}>{langFormat("request response costtime", {costtime: this.state.costTime})}</Text>
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
                    name={ false }
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
    clientHost: state.device.clientHost,
    clientType: state.device.clientType,
    teamId: state.device.teamId,
    prj: state.env_var.prj,
    env: state.env_var.env,
  }
}

export default connect(mapStateToProps)(RequestSendContainer);