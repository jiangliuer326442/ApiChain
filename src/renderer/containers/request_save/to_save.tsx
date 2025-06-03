import { Component, ReactNode } from 'react';
import { connect } from 'react-redux';
import { Descriptions, Breadcrumb, Flex, Layout, Tabs, Form, message, Button, Checkbox, Input, Divider, Select } from "antd";
import { cloneDeep } from 'lodash';
import { encode } from 'base-64';
import { v4 as uuidv4 } from 'uuid';

import {
    getType,
    isStringEmpty
} from '@rutil/index';
import {
    TABLE_FIELD_NAME,
    TABLE_FIELD_TYPE,
    TABLE_FIELD_VALUE,
    TABLE_FIELD_TYPE_REF,
    genHash,
    iteratorGenHash,
    iteratorBodyGenHash,
    shortJsonContent,
    parseJsonToTable,
    retParseBodyJsonToTable,
    parseJsonToFilledTable,
    cleanJson,
} from '@rutil/json';

import { createWindow } from '@rutil/window';
import { ENV_VALUE_API_HOST } from "@conf/envKeys";
import { 
    TABLE_ENV_VAR_FIELDS,
    TABLE_VERSION_ITERATION_FIELDS,
    TABLE_VERSION_ITERATION_REQUEST_FIELDS,
    TABLE_PROJECT_REQUEST_FIELDS,
    TABLE_REQUEST_HISTORY_FIELDS,
} from '@conf/db';
import {
    CONTENT_TYPE_URLENCODE,
} from '@conf/contentType';
import {
    REQUEST_METHOD_GET,
    REQUEST_METHOD_POST,
    CONTENT_TYPE,
    FoldSourcePrj,
    FoldSourceIterator,
} from '@conf/global_config';
import { VERSION_ITERATOR_ADD_ROUTE } from '@conf/routers';
import { getEnvs } from '@act/env';
import { getPrjs } from '@act/project';
import { getPrjEnvValues, getIteratorEnvValues } from '@act/env_value';
import { getRemoteVersionIterator, getOpenVersionIteratorsByPrj } from "@act/version_iterator";
import { getVersionIteratorRequest } from '@act/version_iterator_requests';
import { getProjectRequest } from '@act/project_request';
import { getRequestHistory } from '@act/request_history';
import { addJsonFragement } from '@act/request_save';
import {
    getIteratorFolders 
} from '@act/version_iterator_folders';
import {
    getProjectFolders 
} from '@act/project_folders';
import { addProjectRequest } from '@act/project_request';
import { addVersionIteratorRequest } from '@act/version_iterator_requests';
import FolderSelector from "@comp/request_save/folder";
import JsonSaveParamTableContainer from "@comp/request_save/json_save_table_param";
import JsonSaveHeaderTableContainer from "@comp/request_save/json_save_table_header";
import JsonSavePathVariTableContainer from "@comp/request_save/json_save_table_path_variable";
import JsonSaveBodyTableContainer from "@comp/request_save/json_save_table_body";
import JsonSaveResponseHeaderTableContainer from "@comp/request_save/json_save_table_response_header";
import JsonSaveResponseCookieTableContainer from "@comp/request_save/json_save_table_response_cookie";
import JsonSaveResponseTableComponent from "@comp/request_save/json_save_table_response";
import { langTrans } from '@lang/i18n';

const { TextArea } = Input;
const { Header, Content, Footer } = Layout;

let request_history_env = TABLE_REQUEST_HISTORY_FIELDS.FIELD_ENV_LABEL;
let request_history_micro_service = TABLE_REQUEST_HISTORY_FIELDS.FIELD_MICRO_SERVICE_LABEL;
let request_history_uri = TABLE_REQUEST_HISTORY_FIELDS.FIELD_URI;
let request_history_method = TABLE_REQUEST_HISTORY_FIELDS.FIELD_REQUEST_METHOD;
let request_history_head = TABLE_REQUEST_HISTORY_FIELDS.FIELD_REQUEST_HEADER;
let request_history_body = TABLE_REQUEST_HISTORY_FIELDS.FIELD_REQUEST_BODY;
let request_history_file = TABLE_REQUEST_HISTORY_FIELDS.FIELD_REQUEST_FILE;
let request_history_param = TABLE_REQUEST_HISTORY_FIELDS.FIELD_REQUEST_PARAM;
let request_history_path_variable = TABLE_REQUEST_HISTORY_FIELDS.FIELD_REQUEST_PATH_VARIABLE;
let request_history_response_content = TABLE_REQUEST_HISTORY_FIELDS.FIELD_RESPONSE_CONTENT;
let request_history_response_head = TABLE_REQUEST_HISTORY_FIELDS.FIELD_RESPONSE_HEAD;
let request_history_response_cookie = TABLE_REQUEST_HISTORY_FIELDS.FIELD_RESPONSE_COOKIE;
let request_history_jsonFlg = TABLE_REQUEST_HISTORY_FIELDS.FIELD_JSONFLG;
let request_history_htmlFlg = TABLE_REQUEST_HISTORY_FIELDS.FIELD_HTMLFLG;
let request_history_picFlg = TABLE_REQUEST_HISTORY_FIELDS.FIELD_PICFLG;
let request_history_fileFlg = TABLE_REQUEST_HISTORY_FIELDS.FIELD_FILEFLG;

let version_iterator_request_title = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_TITLE;
let version_iterator_request_desc = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_DESC;
let version_iterator_request_fold = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_FOLD;
let version_iterator_request_jsonflg = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_JSONFLG;
let version_iterator_request_htmlflg = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_HTMLFLG;
let version_iterator_request_picflg = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_PICFLG;
let version_iterator_request_fileflg = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_FILEFLG;
let version_iterator_request_sort = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_SORT;
let version_iterator_request_header = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_REQUEST_HEADER;
let version_iterator_request_exportdocflg = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_EXPORT_DOCFLG;
let version_iterator_request_body = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_REQUEST_BODY;
let version_iterator_request_param = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_REQUEST_PARAM;
let version_iterator_request_path_variable = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_REQUEST_PATH_VARIABLE;
let version_iterator_request_response_content = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_RESPONSE_CONTENT;
let version_iterator_request_response_head = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_RESPONSE_HEAD;
let version_iterator_request_response_cookie = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_RESPONSE_COOKIE;

let project_request_title = TABLE_PROJECT_REQUEST_FIELDS.FIELD_TITLE;
let project_request_desc = TABLE_PROJECT_REQUEST_FIELDS.FIELD_DESC;
let project_request_fold = TABLE_PROJECT_REQUEST_FIELDS.FIELD_FOLD;
let project_request_jsonflg = TABLE_PROJECT_REQUEST_FIELDS.FIELD_JSONFLG;
let project_request_picflg = TABLE_PROJECT_REQUEST_FIELDS.FIELD_PICFLG;
let project_request_header = TABLE_PROJECT_REQUEST_FIELDS.FIELD_REQUEST_HEADER;
let project_request_body = TABLE_PROJECT_REQUEST_FIELDS.FIELD_REQUEST_BODY;
let project_request_param = TABLE_PROJECT_REQUEST_FIELDS.FIELD_REQUEST_PARAM;
let project_request_path_variable = TABLE_PROJECT_REQUEST_FIELDS.FIELD_REQUEST_PATH_VARIABLE;
let project_request_response_content = TABLE_PROJECT_REQUEST_FIELDS.FIELD_RESPONSE_CONTENT;
let project_request_response_head = TABLE_PROJECT_REQUEST_FIELDS.FIELD_RESPONSE_HEAD;
let project_request_response_cookie = TABLE_PROJECT_REQUEST_FIELDS.FIELD_RESPONSE_COOKIE;

let version_iterator_uuid = TABLE_VERSION_ITERATION_FIELDS.FIELD_UUID;
let version_iterator_name = TABLE_VERSION_ITERATION_FIELDS.FIELD_NAME;
let version_iterator_prjs = TABLE_VERSION_ITERATION_FIELDS.FIELD_PROJECTS;

let env_var_pname = TABLE_ENV_VAR_FIELDS.FIELD_PARAM_NAME;
let env_var_pvalue = TABLE_ENV_VAR_FIELDS.FIELD_PARAM_VAR;

class RequestSaveContainer extends Component {

    constructor(props) {
        super(props);

        let iteratorId = props.match.params.versionIteratorId;

        this.state = {
            prj : null,
            env : "",
            title : "",
            description: "",
            requestHost: "",
            requestUri: "",
            requestMethod: "",
            sort: 0,
            responseDemo: "",
            formResponseData: {},
            formResponseHeadData: {},
            formResponseCookieData: {},
            responseHash: "",
            isResponseJson: false,
            isResponseHtml: false,
            isResponsePic: false,
            isResponseFile: false,
            isExportDoc: false,
            requestHeadData: {},
            formRequestHeadData: {},
            requestHeaderHash: "",
            formRequestBodyData: {},
            requestBodyHash: "",
            formRequestPathVariableData: {},
            requestPathVariableHashHash: "",
            formRequestParamData: {},
            requestParamHash: "",
            stopFlg : true,
            showFlg : false,
            iteratorId,
            prjsSelectector: [],
            selectedFolder: "",
            versionIteratorsSelector: [],
            folders: [],
            contentType: "",
            selectedVersionIterator: {}
        }
    }

    async componentDidMount(): Promise<void> {
        let prjs = this.props.prjs;
        let selectedVersionIterator = {};
        if(this.props.envs.length === 0) {
            await getEnvs(this.props.clientType, this.props.dispatch);
        }
        if(prjs.length === 0) {
            prjs = await getPrjs(this.props.clientType, this.props.dispatch);
        }
        let prjsSelectector = [];
        if (!isStringEmpty(this.state.iteratorId)) {
            selectedVersionIterator = await getRemoteVersionIterator(this.props.clientType, this.state.iteratorId);
            let selectVersionIterationPrjs = selectedVersionIterator[version_iterator_prjs];
            for(let _prj of selectVersionIterationPrjs) {
                let prjRemark = prjs.find(row => row.value === _prj).label;
                prjsSelectector.push({label: prjRemark, value: _prj});
            }
        }

        this.setState({selectedVersionIterator, prjsSelectector})

        if (!isStringEmpty(this.props.match.params.historyId)) {
            let historyId = Number(this.props.match.params.historyId);
            this.initFromRequestHistory(historyId);
        } else {
            this.setState({
                showFlg: true,
                requestMethod : REQUEST_METHOD_POST,
                contentType: CONTENT_TYPE_URLENCODE,
            });
        }
    }

    initFromRequestHistory = async (historyId : number) => {
        let record = await getRequestHistory(historyId);
        let prj = record[request_history_micro_service];
        let method = record[request_history_method];
        let uri = record[request_history_uri];
        let env = record[request_history_env];

        this.initByIteratorPrjEnv(this.state.iteratorId, prj, env);

        if (!isStringEmpty(this.state.iteratorId)) {
            getVersionIteratorRequest(this.props.clientType, this.state.iteratorId, prj, method, uri).then(versionIterationRequest => {
                if (versionIterationRequest !== null) {
                    let sort = versionIterationRequest[version_iterator_request_sort] === undefined ? 0 : versionIterationRequest[version_iterator_request_sort];
                    let isExportDoc = (getType(versionIterationRequest[version_iterator_request_exportdocflg]) === "String" && isStringEmpty(versionIterationRequest[version_iterator_request_exportdocflg])) ? true : versionIterationRequest[version_iterator_request_exportdocflg];
                    let requestHeadData = record[request_history_head];
                    let shortRequestHeadJsonObject = {};
                    shortJsonContent(shortRequestHeadJsonObject, requestHeadData);
                    let requestHeaderHash = iteratorGenHash(shortRequestHeadJsonObject);
                    let formRequestHeadData = {};
                    parseJsonToFilledTable(formRequestHeadData, shortRequestHeadJsonObject, versionIterationRequest[version_iterator_request_header]);
                    let requestBodyData = record[request_history_body];
                    let shortRequestBodyJsonObject = {};
                    shortJsonContent(shortRequestBodyJsonObject, requestBodyData);
                    let requestFileData = record[request_history_file];
                    let requestBodyHash = iteratorBodyGenHash(shortRequestBodyJsonObject, requestFileData);
                    let formRequestBodyData = {};
                    parseJsonToFilledTable(formRequestBodyData, shortRequestBodyJsonObject, versionIterationRequest[version_iterator_request_body]);
                    parseJsonToFilledTable(formRequestBodyData, requestFileData, versionIterationRequest[version_iterator_request_body]);
                    let requestParamData = record[request_history_param];
                    let shortRequestParamJsonObject = {};
                    shortJsonContent(shortRequestParamJsonObject, requestParamData);
                    let requestParamHash = iteratorGenHash(shortRequestParamJsonObject);
                    let formRequestParamData = {};
                    parseJsonToFilledTable(formRequestParamData, shortRequestParamJsonObject, versionIterationRequest[version_iterator_request_param]);
                    
                    let requestPathVariableData = record[request_history_path_variable];
                    let shortRequestPathVariableJsonObject = {};
                    shortJsonContent(shortRequestPathVariableJsonObject, requestPathVariableData);
                    let requestPathVariableHash = iteratorGenHash(shortRequestPathVariableJsonObject);
                    let formRequestPathVariableData = {};
                    parseJsonToFilledTable(formRequestPathVariableData, shortRequestPathVariableJsonObject, versionIterationRequest[version_iterator_request_path_variable]);
                                            
                    let shortResponseJsonObject = {};
                    let formResponseData = {};
                    let responseHash = "";
                    let responseDemo = "";
                    if (record[version_iterator_request_jsonflg]) {
                        let responseData = JSON.parse(record[request_history_response_content]);
                        shortJsonContent(shortResponseJsonObject, responseData);
                        responseHash = iteratorGenHash(shortResponseJsonObject);
                        parseJsonToFilledTable(formResponseData, shortResponseJsonObject, versionIterationRequest[version_iterator_request_response_content]);
                    
                        responseDemo = JSON.stringify(shortResponseJsonObject);
                    } else {
                        responseDemo = record[request_history_response_content];
                    }

                    let shortResponseHeadJsonObject = {};
                    let formResponseHeadData = {};
                    let responseHead = record[request_history_response_head];
                    shortJsonContent(shortResponseHeadJsonObject, responseHead);
                    parseJsonToFilledTable(formResponseHeadData, shortResponseHeadJsonObject, versionIterationRequest[version_iterator_request_response_head]);

                    let shortResponseCookieJsonObject = {};
                    let formResponseCookieData = {};
                    let responseCookie = record[request_history_response_cookie];
                    shortJsonContent(shortResponseCookieJsonObject, responseCookie);
                    parseJsonToFilledTable(formResponseCookieData, shortResponseCookieJsonObject, versionIterationRequest[version_iterator_request_response_cookie]);
                    
                    this.setState({
                        showFlg: true,
                        prj,
                        env: record[request_history_env],
                        title: versionIterationRequest[version_iterator_request_title],
                        description: versionIterationRequest[version_iterator_request_desc],
                        selectedFolder: versionIterationRequest[version_iterator_request_fold],
                        requestUri: uri,
                        requestMethod: method,
                        isResponseJson: record[version_iterator_request_jsonflg],
                        isResponseHtml: record[version_iterator_request_htmlflg],
                        isResponsePic: record[version_iterator_request_picflg],
                        isResponseFile: record[version_iterator_request_fileflg],
                        formRequestHeadData,
                        requestHeaderHash,
                        formRequestBodyData,
                        requestBodyHash,
                        formRequestParamData,
                        formRequestPathVariableData,
                        requestParamHash,
                        requestPathVariableHash,
                        formResponseData,
                        formResponseHeadData,
                        formResponseCookieData,
                        responseHash,
                        isExportDoc,
                        sort,
                        responseDemo,
                    });
                } else {
                    this.simpleBootByRequestHistoryRecord(record, prj, method, uri, true);
                }
            });
        } else {
            getProjectRequest(prj, method, uri).then(projectRequest => {
                if (projectRequest !== null) {
                    let requestHeadData = record[request_history_head];
                    let shortRequestHeadJsonObject = {};
                    shortJsonContent(shortRequestHeadJsonObject, requestHeadData);
                    let requestHeaderHash = iteratorGenHash(shortRequestHeadJsonObject);
                    let formRequestHeadData = {};
                    parseJsonToFilledTable(formRequestHeadData, shortRequestHeadJsonObject, projectRequest[project_request_header]);
                    let requestBodyData = record[request_history_body];
                    let shortRequestBodyJsonObject = {};
                    shortJsonContent(shortRequestBodyJsonObject, requestBodyData);
                    let requestFileData = record[request_history_file];
                    let requestBodyHash = iteratorBodyGenHash(shortRequestBodyJsonObject, requestFileData);
                    let formRequestBodyData : any = {};
                    parseJsonToFilledTable(formRequestBodyData, shortRequestBodyJsonObject, projectRequest[project_request_body]);
                    parseJsonToFilledTable(formRequestBodyData, requestFileData, projectRequest[project_request_body]);
                    let requestParamData = record[request_history_param];
                    let shortRequestParamJsonObject = {};
                    shortJsonContent(shortRequestParamJsonObject, requestParamData);
                    let requestParamHash = iteratorGenHash(shortRequestParamJsonObject);
                    let formRequestParamData = {};
                    parseJsonToFilledTable(formRequestParamData, shortRequestParamJsonObject, projectRequest[project_request_param]);
                    let requestPathVariableData = record[request_history_path_variable];
                    let shortRequestPathVariableJsonObject = {};
                    shortJsonContent(shortRequestPathVariableJsonObject, requestPathVariableData);
                    let requestPathVariableHash = iteratorGenHash(shortRequestPathVariableJsonObject);
                    let formRequestPathVariableData = {};
                    parseJsonToFilledTable(formRequestPathVariableData, shortRequestPathVariableJsonObject, projectRequest[project_request_path_variable]);
                    
                    let responseData = {};
                    let shortResponseJsonObject = {};
                    let responseHash = "";
                    let formResponseData = {};
                    let responseDemo = "";
                    if (record[project_request_jsonflg]) {
                        responseData = JSON.parse(record[request_history_response_content]);
                        shortJsonContent(shortResponseJsonObject, responseData);
                        responseHash = iteratorGenHash(shortResponseJsonObject);
                        parseJsonToFilledTable(formResponseData, shortResponseJsonObject, projectRequest[project_request_response_content]);

                        responseDemo = JSON.stringify(shortResponseJsonObject);
                    } else {
                        responseDemo = record[request_history_response_content];
                    }

                    let shortResponseHeadJsonObject = {};
                    let formResponseHeadData = {};
                    let responseHead = record[request_history_response_head];
                    shortJsonContent(shortResponseHeadJsonObject, responseHead);
                    parseJsonToFilledTable(formResponseHeadData, shortResponseHeadJsonObject, projectRequest[project_request_response_head]);

                    let shortResponseCookieJsonObject = {};
                    let formResponseCookieData = {};
                    let responseCookie = record[request_history_response_cookie];
                    shortJsonContent(shortResponseCookieJsonObject, responseCookie);
                    parseJsonToFilledTable(formResponseCookieData, shortResponseCookieJsonObject, projectRequest[project_request_response_cookie]);

                    this.setState({
                        showFlg: true,
                        prj,
                        env: record[request_history_env],
                        title: projectRequest[project_request_title],
                        description: projectRequest[project_request_desc],
                        selectedFolder: projectRequest[project_request_fold],
                        requestUri: uri,
                        requestMethod: method,
                        isResponseJson: record[project_request_jsonflg],
                        isResponseHtml: record[request_history_htmlFlg],
                        isResponsePic: record[project_request_picflg],
                        isResponseFile: record[request_history_fileFlg],
                        formRequestHeadData,
                        requestHeaderHash,
                        formRequestBodyData,
                        requestBodyHash,
                        formRequestParamData,
                        requestParamHash,
                        formRequestPathVariableData,
                        requestPathVariableHash,
                        formResponseData,
                        formResponseHeadData,
                        formResponseCookieData,
                        responseHash,
                        responseDemo,
                    });
                } else {
                    this.simpleBootByRequestHistoryRecord(record, prj, method, uri);
                }
            });
        }
    }

    initByIteratorPrjEnv = async (iteratorId: string, prj: string, env: string) => {
        let folders;
        if (isStringEmpty(iteratorId)) {
            folders = await getProjectFolders(this.props.clientType, prj);
        } else {
            folders = await getIteratorFolders(this.props.clientType, iteratorId, prj);
        }
        this.setState({folders})

        this.getEnvValueData(prj, env);
        if (isStringEmpty(this.state.iteratorId)) {
            this.refreshVersionIteratorData(prj);
        }
    }

    simpleBootByRequestHistoryRecord = (historyRecord: any, prj : string, method : string, uri : string, isExportDoc : boolean) => {
        let requestHeadData = historyRecord[request_history_head];
        let requestHeaderHash = iteratorGenHash(requestHeadData);
        let formRequestHeadData = {};
        parseJsonToTable(formRequestHeadData, requestHeadData);
        let requestBodyData = historyRecord[request_history_body];
        let requestFileData = historyRecord[request_history_file];
        let requestBodyHash = iteratorBodyGenHash(requestBodyData, requestFileData);
        let formRequestBodyData = retParseBodyJsonToTable(requestBodyData, requestFileData);

        let requestParamData = historyRecord[request_history_param];
        let requestParamHash = iteratorGenHash(requestParamData);
        let formRequestParamData = {};
        parseJsonToTable(formRequestParamData, requestParamData);

        let requestPathVariableData = historyRecord[request_history_path_variable];
        let requestPathVariableHash = iteratorGenHash(requestPathVariableData);
        let formRequestPathVariableData = {};
        parseJsonToTable(formRequestPathVariableData, requestPathVariableData);
        let responseData = {};
        let responseHash = "";
        let formResponseData = {};
        let responseDemo = "";
        if (historyRecord[request_history_jsonFlg]) {
            responseData = JSON.parse(historyRecord[request_history_response_content]);
            responseHash = iteratorGenHash(responseData);
            parseJsonToTable(formResponseData, responseData);
            responseDemo = JSON.stringify(responseData);
        } else {
            responseDemo = historyRecord[request_history_response_content];
        }

        let formResponseHeadData = {};
        let responseHead = historyRecord[request_history_response_head];
        parseJsonToTable(formResponseHeadData, responseHead);

        let formResponseCookieData = {};
        let responseCookie = historyRecord[request_history_response_cookie];
        parseJsonToTable(formResponseCookieData, responseCookie);

        this.setState({
            showFlg: true,
            prj,
            env: historyRecord[request_history_env],
            requestUri: uri,
            requestMethod: method,
            isResponseJson: historyRecord[request_history_jsonFlg],
            isResponseHtml: historyRecord[request_history_htmlFlg],
            isResponsePic: historyRecord[request_history_picFlg],
            isResponseFile: historyRecord[request_history_fileFlg],
            formRequestHeadData,
            requestHeaderHash,
            formRequestBodyData,
            requestBodyHash,
            formRequestParamData,
            requestParamHash,
            formRequestPathVariableData,
            requestPathVariableHash,
            formResponseData,
            formResponseHeadData,
            formResponseCookieData,
            responseHash,
            responseDemo,
            isExportDoc
        });
    }

    handleRequestProject = async (prj) => {
        let folders;
        if (isStringEmpty(this.state.iteratorId)) {
            folders = await getProjectFolders(this.props.clientType, prj);
        } else {
            folders = await getIteratorFolders(this.props.clientType, this.state.iteratorId, prj);
        }
        this.setState({folders, prj})
    }

    handleCreateIterator = () => {
        let windowId = uuidv4();
        createWindow('#' + VERSION_ITERATOR_ADD_ROUTE, windowId)
        .then(()=>{
            this.refreshVersionIteratorData(this.state.prj);
        })
    }

    handleSetVersionIterator = async (value) => {
        this.state.iteratorId = value;
        let folders;
        if (isStringEmpty(this.state.iteratorId)) {
            folders = await getProjectFolders(this.props.clientType, this.state.prj);
        } else {
            folders = await getIteratorFolders(this.props.clientType, this.state.iteratorId, this.state.prj);
        }
        let selectedVersionIterator = await getRemoteVersionIterator(this.props.clientType, value);
        this.setState({selectedVersionIterator, folders})
        if (!isStringEmpty(this.props.match.params.historyId)) {
            let historyId = Number(this.props.match.params.historyId);
            this.initFromRequestHistory(historyId);
        }
    }

    handleSave = async () => {
        if (isStringEmpty(this.state.title)){
            message.error(langTrans("request save check1"));
            return;
        }
        if (isStringEmpty(this.state.prj)){
            message.error(langTrans("request save check2"));
            return;
        }
        //新增接口时的校验
        if (isStringEmpty(this.props.match.params.historyId)) {
            if (isStringEmpty(this.state.iteratorId)) {
                message.error(langTrans("request save check3"));
                return;
            }
            if (isStringEmpty(this.state.requestUri)) {
                message.error(langTrans("request save check4"));
                return;
            }
            if (this.state.requestUri.substring(0, 1) === "/") {
                message.error(langTrans("request save check5"));
                return;
            }
            if (isStringEmpty(this.state.responseDemo)) {
                message.error(langTrans("request save check6"));
                return;
            }
        }

        let whitekeys : Array<any> = [];
        let formResponseDataCopy = cloneDeep(this.state.formResponseData);

        while(true) {
            this.state.stopFlg = true;
            this.parseJsonToStruct(whitekeys, [], "", formResponseDataCopy, formResponseDataCopy);
            if(this.state.stopFlg) break;
        }

        let folderName = this.state.selectedFolder;
        let simpleFolderName = folderName.replaceAll(FoldSourcePrj, "").replaceAll(FoldSourceIterator, "");

        //新增（只能新增迭代接口）
        if (isStringEmpty(this.props.match.params.historyId)) {
            this.state.requestHeaderHash = iteratorGenHash(cleanJson(this.state.formRequestHeadData));
            this.state.requestBodyHash = iteratorGenHash(cleanJson(this.state.formRequestBodyData));
            this.state.requestParamHash = iteratorGenHash(cleanJson(this.state.formRequestParamData));
            this.state.requestPathVariableHash = iteratorGenHash(cleanJson(this.state.formRequestPathVariableData));
            this.state.responseHash = iteratorGenHash(cleanJson(this.state.formResponseData));
            this.state.isResponseJson = true;
            this.state.isResponseHtml = false;

            //新增迭代接口
            await addVersionIteratorRequest(
                this.props.clientType, this.props.teamId, 
                this.state.iteratorId, this.state.prj, this.state.requestMethod, this.state.requestUri, this.state.sort,
                this.state.title, this.state.description, simpleFolderName, 
                this.state.formRequestHeadData, this.state.requestHeaderHash, 
                this.state.formRequestBodyData, this.state.requestBodyHash, 
                this.state.formRequestParamData, this.state.requestParamHash, 
                this.state.formRequestPathVariableData, this.state.requestPathVariableHash, 
                this.state.formResponseData, this.state.formResponseHeadData, this.state.formResponseCookieData, this.state.responseHash, this.state.responseDemo,
                this.state.isResponseJson, this.state.isResponseHtml, this.state.isResponsePic, this.state.isResponseFile, this.state.isExportDoc,
                this.props.device
            );
            message.success(langTrans("request save result1"));
            this.props.history.push("#/version_iterator_request/" + this.state.iteratorId + "/" + this.state.prj + "/" + this.state.requestMethod + "/" + encode(this.state.requestUri));
        } else {
            //编辑
            if (isStringEmpty(this.state.iteratorId)){
                //编辑项目接口
                await addProjectRequest(
                    this.props.clientType, this.props.teamId, 
                    this.state.prj, this.state.requestMethod, this.state.requestUri,
                    this.state.title, this.state.description, simpleFolderName,
                    this.state.formRequestHeadData, this.state.requestHeaderHash, 
                    this.state.formRequestBodyData, this.state.requestBodyHash, 
                    this.state.formRequestParamData, this.state.requestParamHash, 
                    this.state.formRequestPathVariableData, this.state.requestPathVariableHash, 
                    this.state.formResponseData, this.state.formResponseHeadData, this.state.formResponseCookieData, this.state.responseHash, this.state.responseDemo,
                    this.state.isResponseJson, this.state.isResponseHtml, this.state.isResponsePic, this.state.isResponseFile, 
                    this.props.device
                );
                message.success(langTrans("request save result2"));
                this.props.history.push("/project_requests/" + this.state.prj);
            } else {
                //编辑迭代接口
                await addVersionIteratorRequest(
                    this.props.clientType, this.props.teamId,
                    this.state.iteratorId, this.state.prj, this.state.requestMethod, this.state.requestUri, this.state.sort,
                    this.state.title, this.state.description, simpleFolderName, 
                    this.state.formRequestHeadData, this.state.requestHeaderHash, 
                    this.state.formRequestBodyData, this.state.requestBodyHash, 
                    this.state.formRequestParamData, this.state.requestParamHash, 
                    this.state.formRequestPathVariableData, this.state.requestPathVariableHash, 
                    this.state.formResponseData, this.state.formResponseHeadData, this.state.formResponseCookieData, this.state.responseHash, this.state.responseDemo,
                    this.state.isResponseJson, this.state.isResponseHtml, this.state.isResponsePic, this.state.isResponseFile, this.state.isExportDoc,
                    this.props.device
                );
                message.success(langTrans("request save result2"));
                this.props.history.push("/version_iterator_requests/" + this.state.iteratorId);
            }
        }
    }

    parseJsonToStruct = (whiteKeys : Array<any>, parentKeys : Array<string>, parentKey : string, parseJsonToTableResultCopy : object, content : object) => {
        let isPrimimaryObject = true;
        for(let key in content) {
            let type = content[key][TABLE_FIELD_TYPE];
            if ((type === "Object" || type === "Array") && !whiteKeys.includes(key)) {
                this.state.stopFlg = false;
                parentKeys.push(key);
                this.parseJsonToStruct(whiteKeys, parentKeys, key, parseJsonToTableResultCopy, content[key]);
                parentKeys.pop();
                isPrimimaryObject = false;
            }
        }
        if (isPrimimaryObject){
            whiteKeys.push(parentKey);
            this.handlePrimimaryObject(parentKeys, parentKey, parseJsonToTableResultCopy, content);
        }
    }

    handlePrimimaryObject = (parentKeys : Array<string>, parentKey : string, parseJsonToTableResultCopy : object, content : object) : void => {
        let hash = genHash(content);
        let newObject = {};
        newObject[TABLE_FIELD_NAME] = parentKey + "@" + hash;
        newObject[TABLE_FIELD_VALUE] = content;
        addJsonFragement(newObject);

        let replaceObj = parseJsonToTableResultCopy;
        let i = 0;
        for(let _key of parentKeys) {
            i ++;
            if ( i === parentKeys.length ) {
                replaceObj[_key] = {};
                replaceObj[_key][TABLE_FIELD_NAME] = parentKey + "@" + hash;
                replaceObj[_key][TABLE_FIELD_TYPE] = TABLE_FIELD_TYPE_REF;
            }
            replaceObj = replaceObj[_key];
        }
    }

    getNavs() {
        return [
            {
                key: 'uris',
                label: langTrans("network tab1"),
                children: <JsonSavePathVariTableContainer 
                    readOnly={ !isStringEmpty(this.props.match.params.historyId) } 
                    object={this.state.formRequestPathVariableData} 
                    cb={obj=>this.setState({formRequestPathVariableData: obj})} />,
            },
            {
                key: 'params',
                label: langTrans("network tab2"),
                children: <JsonSaveParamTableContainer 
                    readOnly={ !isStringEmpty(this.props.match.params.historyId) } 
                    object={this.state.formRequestParamData} 
                    cb={obj=>this.setState({formRequestParamData: obj})} />,
            },
            {
                key: 'headers',
                label: langTrans("network tab3"),
                children: <JsonSaveHeaderTableContainer 
                    readOnly={ !isStringEmpty(this.props.match.params.historyId) } 
                    contentType={ this.state.contentType }
                    object={this.state.formRequestHeadData} 
                    cb={ obj => this.setState({formRequestHeadData: obj, contentType: obj[CONTENT_TYPE][TABLE_FIELD_VALUE]})} />,
            },
            {
                key: 'body',
                label: langTrans("network tab4"),
                children: <JsonSaveBodyTableContainer 
                    readOnly={ !isStringEmpty(this.props.match.params.historyId) } 
                    contentType={ this.state.contentType }
                    object={this.state.formRequestBodyData} 
                    cb={obj=>this.setState({formRequestBodyData: obj})} />,
            },
        ];
    }

    getEnvValueData = async (prj: string, env: string) => {
        if(!(isStringEmpty(prj) || isStringEmpty(env))) {
            let env_vars;
            if (isStringEmpty(this.state.iteratorId)) {
                env_vars = await getPrjEnvValues(prj, env, this.props.clientType);
            } else {
                env_vars = await getIteratorEnvValues(this.state.iteratorId, prj, env, this.props.clientType);
            }
            if(env_vars.length === 0) {
              message.error("项目和环境已被删除，该请求无法保存到迭代");
              return;
            }
            for(let env_value : any of env_vars) {
              if(env_value[env_var_pname] === ENV_VALUE_API_HOST) {
                let requestHost = env_value[env_var_pvalue];
                if (isStringEmpty(requestHost)) {
                  message.error("环境变量" + ENV_VALUE_API_HOST + "项目和环境已被删除，该请求无法保存到迭代");
                  return;
                }
                this.setState({
                  requestHost,
                  prj,
                  env,
                });
              }
            }
        }
    }

    refreshVersionIteratorData = async (prj : string) => {
        let versionIterators = await getOpenVersionIteratorsByPrj(this.props.clientType, prj);
        let versionIteratorsSelector = [];
        for(let _index in versionIterators) {
            let versionIteratorsItem = {};

            let uuid = versionIterators[_index][version_iterator_uuid];
            let title = versionIterators[_index][version_iterator_name];
            versionIteratorsItem.label = title;
            versionIteratorsItem.value = uuid;
            versionIteratorsSelector.push(versionIteratorsItem);
        }
        this.setState({versionIteratorsSelector});
    }

    render() : ReactNode {
        return (
            <Layout>
                <Header style={{ padding: 0 }}>
                    {langTrans("request save title")}
                </Header>
                {this.state.showFlg ? 
                <Content style={{ padding: '0 16px' }}>
                    <Breadcrumb style={{ margin: '16px 0' }} items={[
                        { title: langTrans("request save bread1") }, 
                        { title: langTrans("request save bread2") }
                    ]} />
                    <Flex vertical gap="middle">
                        <Flex justify="space-between" align="center">
                            <Descriptions items={ [
                            {
                                key: 'prj',
                                label: langTrans("request save select1"),
                                children: isStringEmpty(this.props.match.params.historyId) ? 
                                <Select
                                    value={this.state.prj}
                                    placeholder={langTrans("request save tip1")}
                                    style={{ width: 174 }}
                                    options={ this.state.prjsSelectector }
                                    onChange={ this.handleRequestProject }
                                />
                                : 
                                (this.props.prjs.find(row => row.value === this.state.prj) ? this.props.prjs.find(row => row.value === this.state.prj).label : ""),
                            },
                            {
                                key: isStringEmpty(this.state.iteratorId) ? 'env' : 'iterator',
                                label: isStringEmpty(this.state.iteratorId) ? langTrans("request save select2") : langTrans("request save select3"),
                                children: isStringEmpty(this.state.iteratorId) ? 
                                (this.props.envs.find(row => row.value === this.state.env) ? this.props.envs.find(row => row.value === this.state.env).label : "") 
                                : 
                                (Object.keys(this.state.selectedVersionIterator).length > 0 ? this.state.selectedVersionIterator[version_iterator_name] : ""),
                            }
                            ] } />
                        </Flex>
                        <Flex justify="flex-start" align="center" gap="middle">
                            <Form layout="inline">
                                <Form.Item label={langTrans("request save select4")}>
                                    <Input value={this.state.title} onChange={event=>this.setState({title: event.target.value})} placeholder={langTrans("request save desc")} />
                                </Form.Item>

                                {isStringEmpty(this.state.iteratorId) ? 
                                <Form.Item label={langTrans("request save select6")}>
                                    <Select
                                        showSearch
                                        allowClear
                                        placeholder={langTrans("request save tip6")}
                                        optionFilterProp="label"
                                        style={{minWidth: 160}}
                                        onChange={this.handleSetVersionIterator}
                                        value={this.state.iteratorId}
                                        
                                        dropdownRender={(menu) => (
                                            <>
                                            {menu}
                                            <Divider style={{ margin: '8px 0' }} />
                                            <Button type="link" onClick={this.handleCreateIterator}>{langTrans("request save tip62")}</Button>
                                            </>
                                        )}
                                        options={this.state.versionIteratorsSelector}
                                    />
                                </Form.Item>
                                : null }
                                <FolderSelector 
                                    versionIterator={ this.state.iteratorId }
                                    prj={ this.state.prj }
                                    value={ this.state.selectedFolder }
                                    setValue={ value => this.setState({selectedFolder: value}) }
                                    refreshFolders={ async () => {
                                        let folders;
                                        if (isStringEmpty(this.state.iteratorId)) {
                                            folders = await getProjectFolders(this.props.clientType, this.state.prj);
                                        } else {
                                            folders = await getIteratorFolders(this.props.clientType, this.state.iteratorId, this.state.prj);
                                        }
                                        this.setState({folders, selectedFolder: ""})
                                    }}
                                    folders={ this.state.folders }
                                />
                                {!isStringEmpty(this.state.iteratorId) ? 
                                <Form.Item label={langTrans("request save checkbox1")}>
                                    <Checkbox checked={this.state.isExportDoc} onChange={e => this.setState({isExportDoc: e.target.checked})} />
                                </Form.Item>
                                 : null}
                            </Form>
                        </Flex>
                        <Flex>
                            <Select 
                                style={{borderRadius: 0, width: 118}} 
                                size='large' 
                                disabled={ !isStringEmpty(this.props.match.params.historyId) }
                                onChange={ value => this.setState({requestMethod: value}) }
                                value={ this.state.requestMethod }>
                                <Select.Option value={ REQUEST_METHOD_POST }>{ REQUEST_METHOD_POST }</Select.Option>
                                <Select.Option value={ REQUEST_METHOD_GET }>{ REQUEST_METHOD_GET }</Select.Option>
                            </Select>
                            <Input 
                                style={{borderRadius: 0}} 
                                prefix={ isStringEmpty(this.state.requestHost) ? "{{" + ENV_VALUE_API_HOST + "}}" : this.state.requestHost } 
                                disabled={ !isStringEmpty(this.props.match.params.historyId) }
                                value={ this.state.requestUri } 
                                onChange={event => this.setState({requestUri: event.target.value})}
                                size='large' />
                            <Button 
                                size='large' 
                                type="primary" 
                                style={{borderRadius: 0}} 
                                onClick={ this.handleSave }
                                >{langTrans("request save btn")}</Button>
                        </Flex>
                        <TextArea placeholder={langTrans("request save desc")} value={this.state.description} onChange={event=>this.setState({description: event.target.value})} autoSize />
                        <Tabs defaultActiveKey={ this.state.requestMethod === REQUEST_METHOD_POST ? "body" : "params" } items={ this.getNavs() } />
                        {this.state.formResponseHeadData != null && Object.keys(this.state.formResponseHeadData).length > 0 ? 
                        <>
                            <Divider orientation="left">{langTrans("request save response header")}</Divider>
                            <Flex>
                                <JsonSaveResponseHeaderTableContainer 
                                    readOnly={ !isStringEmpty(this.props.match.params.historyId) } 
                                    object={this.state.formResponseHeadData} 
                                    cb={ obj => this.setState({formResponseHeadData: obj})} />
                            </Flex>
                        </>
                        : null }
                        {this.state.formResponseCookieData != null && Object.keys(this.state.formResponseCookieData).length > 0 ? 
                        <>
                            <Divider orientation="left">{langTrans("request save response cookie")}</Divider>
                            <Flex>
                                <JsonSaveResponseCookieTableContainer 
                                    readOnly={ !isStringEmpty(this.props.match.params.historyId) } 
                                    object={this.state.formResponseCookieData} 
                                    cb={ obj => this.setState({formResponseCookieData: obj})} />
                            </Flex>
                        </>
                        : null }
                        <Divider orientation="left">{langTrans("request save response content")}</Divider>
                        <Flex>
                            {this.state.isResponseJson ? 
                            <JsonSaveResponseTableComponent 
                            readOnly={ !isStringEmpty(this.props.match.params.historyId) } 
                            object={ this.state.formResponseData } 
                            jsonStr={ this.state.responseDemo }
                            cb={(obj, demo) => this.setState({formResponseData: obj, responseDemo: demo})} />
                            : null}
                            {this.state.isResponsePic ? 
                            <Flex style={ {
                                minHeight: 136,
                                width: "100%",
                                overflowY: this.state.isResponsePic ? "auto":"scroll",
                                alignItems: "center",
                                justifyContent: "center",
                                } }>
                                    <img src={this.state.responseDemo} />
                            </Flex>
                            : null}
                            {this.state.isResponseHtml ? 
                            <TextArea
                                value={this.state.responseDemo}
                                readOnly={ true }
                                autoSize={{ minRows: 5 }}
                            />
                            : null}
                            {this.state.isResponseFile ? 
                                <Flex style={ {
                                    height: 26,
                                    width: "100%",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    } }>
                                        { this.state.responseDemo }
                                </Flex> 
                            : null}
                            
                        </Flex>
                    </Flex>
                </Content>
                : null}
                <Footer style={{ textAlign: 'center' }}>
                ApiChain ©{new Date().getFullYear()} Created by 方海亮
                </Footer>
            </Layout>
        )
    }
}

function mapStateToProps (state) {
    return {
        envs: state.env.list,
        prjs: state.prj.list, 
        device : state.device,
        teamId: state.device.teamId,
        clientType: state.device.clientType,
    }
}
  
export default connect(mapStateToProps)(RequestSaveContainer);