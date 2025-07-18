import log from 'electron-log';
import { BrowserWindow, ipcMain, app, dialog } from 'electron';
import fs from 'fs-extra';
import * as Showdown from 'showdown';

import {
    substr
} from '../../../renderer/util/index';
import {
    setAccess,
    getAccess
} from '../../store/config/doc';
import { getIpV4 } from '../../util/util';
import { isVip } from '../../store/config/vip';
import { 
    TABLE_ENV_FIELDS,
    TABLE_ENV_VAR_FIELDS,
    TABLE_VERSION_ITERATION_FIELDS, 
    TABLE_VERSION_ITERATION_REQUEST_FIELDS,
    TABLE_MICRO_SERVICE_FIELDS,
} from '../../../config/db';
import { GLobalPort } from '../../../config/global_config';
import {
    ChannelsMarkdownLongStr,
    ChannelsMarkdownStr, 
    ChannelsMarkdownShowStr,
    ChannelsMarkdownQueryStr,
    ChannelsMarkdownQueryResultStr,
    ChannelsMarkdownSaveMarkdownStr, 
    ChannelsMarkdownAccessSetStr,
    ChannelsMarkdownAccessGetStr,
    ChannelsMarkdownSaveHtmlStr,
    ChannelsMarkdownAccessSetResultStr,
} from '../../../config/channel';

import { isStringEmpty, getType } from '../../../renderer/util';
import { 
    TABLE_FIELD_NAME, 
    TABLE_FIELD_REMARK, 
    TABLE_FIELD_TYPE, 
    TABLE_FIELD_VALUE, 
    TABLE_FIELD_NECESSARY, 
    TABLE_FIELD_LEVEL,
    prettyJson, isInnerKey
} from '../../../renderer/util/json';
import { langTrans } from '../../../lang/i18n';

let version_iterator_uuid = TABLE_VERSION_ITERATION_FIELDS.FIELD_UUID;
let version_iterator_title = TABLE_VERSION_ITERATION_FIELDS.FIELD_NAME;
let version_iterator_open = TABLE_VERSION_ITERATION_FIELDS.FIELD_OPENFLG;
let version_iterator_del = TABLE_VERSION_ITERATION_FIELDS.FIELD_DELFLG;
let version_iterator_content = TABLE_VERSION_ITERATION_FIELDS.FIELD_CONTENT;

let prj_label = TABLE_MICRO_SERVICE_FIELDS.FIELD_LABEL;
let prj_remark = TABLE_MICRO_SERVICE_FIELDS.FIELD_REMARK;

let env_label = TABLE_ENV_FIELDS.FIELD_LABEL;
let env_remark = TABLE_ENV_FIELDS.FIELD_REMARK;

let iteration_request_fold = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_FOLD;
let iteration_request_prj = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_MICRO_SERVICE_LABEL;
let iteration_request_method = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_REQUEST_METHOD;
let iteration_request_uri = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_URI;
let iteration_request_title = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_TITLE;
let iteration_request_desc = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_DESC;
let iteration_request_header = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_REQUEST_HEADER;
let iteration_request_body = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_REQUEST_BODY;
let iteration_request_param = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_REQUEST_PARAM;
let iteration_request_path_variable = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_REQUEST_PATH_VARIABLE;
let iteration_response_content = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_RESPONSE_CONTENT;
let iteration_response_head = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_RESPONSE_HEAD;
let iteration_response_cookie = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_RESPONSE_COOKIE;
let iteration_response_demo = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_RESPONSE_DEMO;
let iteration_request_jsonFlg = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_JSONFLG;
let iteration_request_htmlFlg = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_HTMLFLG;
let iteration_request_picFlg = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_PICFLG;
let iteration_request_fileFlg = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_FILEFLG;

let window : BrowserWindow;

let iteratorId;

let res;

/**
 * 迭代生成返回值文档
 * @param returnList 返回的数据列表
 * @param parentKey 父级key
 * @param jsonObject 迭代的对象
 */
function iteratorObjectToArr(returnList, jsonObject, level) {
    for (let _key in jsonObject) {
        if (isInnerKey(_key)) continue;

        let _object = jsonObject[_key];
        let fieldName = _key;
        let remark = _object[TABLE_FIELD_REMARK];
        let type = _object[TABLE_FIELD_TYPE];
        let necessary = _object[TABLE_FIELD_NECESSARY];
        let value = _object[TABLE_FIELD_VALUE] ? _object[TABLE_FIELD_VALUE] : "";
        let _item : any = {};
        _item[TABLE_FIELD_NAME] = fieldName;
        _item[TABLE_FIELD_REMARK] = remark;
        _item[TABLE_FIELD_TYPE] = type;
        _item[TABLE_FIELD_NECESSARY] = necessary;
        _item[TABLE_FIELD_LEVEL] = level;
        _item[TABLE_FIELD_VALUE] = value;
        returnList.push(_item);

        if (getType(_object) === "Object") {
            iteratorObjectToArr(returnList, _object, level + 1);
            //回退 fieldName
            if (fieldName.indexOf('.') > 0) {
                let fieldArr = fieldName.split('.');
                let newFieldName = "";
                for (let _i = 0; _i < fieldArr.length - 1; _i++) {
                    newFieldName += "." + fieldArr[_i];
                }
                fieldName = newFieldName;
            } else {
                fieldName = "";
            }
        }
    }
}

export function getMarkdownContentByIteratorId(paramIteratorId : string, paramRes) {

    window.webContents.send(ChannelsMarkdownLongStr, ChannelsMarkdownQueryStr, paramIteratorId);

    iteratorId = paramIteratorId;
    res = paramRes;
}

export default function (mainWindow : BrowserWindow){

    window = mainWindow;

    //设置文档可见性
    ipcMain.on(ChannelsMarkdownStr, (event, action : string,  iteratorId : string, visibility : boolean) => {
        if (action !== ChannelsMarkdownAccessSetStr) return;
        setAccess(iteratorId, visibility);
        event.reply(ChannelsMarkdownStr, ChannelsMarkdownAccessSetResultStr, iteratorId, visibility);
    });

    //获取文档可见性
    ipcMain.on(ChannelsMarkdownStr, (event, action : string,  iteratorId : string) => {
        if (action !== ChannelsMarkdownAccessGetStr) return;
        let access = getAccess(iteratorId);
        event.reply(ChannelsMarkdownStr, ChannelsMarkdownAccessSetResultStr, iteratorId, access);
    });

    //查询文档内容
    ipcMain.on(ChannelsMarkdownLongStr, (event, action, versionIteration, version_iteration_requests, prjs, envs, envVars) => {
        if (action !== ChannelsMarkdownQueryResultStr) return;
        //迭代已经关闭，没有权限
        if (versionIteration === undefined || versionIteration[version_iterator_del] === 1 || versionIteration[version_iterator_open] === 0) {
            const data = {
                code: 404,
                message: '该迭代已关闭',
            };
            res.json(data);
            return;
        }

        //不是会员，迭代文档停止共享
        if (!isVip()) {
            const data = {
                code: 403,
                message: '对方没有开通会员，已停止迭代文档的共享',
            };
            res.json(data);
            return;
        }

        let iterationUUID = versionIteration[version_iterator_uuid];
        if (iterationUUID === iteratorId) {
            let access = getAccess(iterationUUID);
            if (!access) {
                const data = {
                    code: 403,
                    message: '该迭代已停止共享',
                };
                res.json(data);
                return;
            }

            let iteratorTitle = versionIteration[version_iterator_title];
            let markdownContent = getMarkDownContent(versionIteration, version_iteration_requests, prjs, envs, envVars);
            const data = {
                code: 1000,
                message: '',
                data: {
                    title: iteratorTitle,
                    markdown: markdownContent
                }
            };
            res.json(data);
        } else {
            const data = {
                code: 500,
                message: '服务器错误',
            };
            res.json(data);
            return;
        }
    });

    //导出迭代文档
    ipcMain.on(ChannelsMarkdownStr, (event, action, versionIteration, version_iteration_requests, prjs, envs, envVars) => {
        if (action !== ChannelsMarkdownSaveHtmlStr) return;

        let iterationTitle = versionIteration[version_iterator_title];

        let filePath = dialog.showSaveDialogSync({
            title: langTrans("doc save method1"),
            defaultPath: app.getPath("desktop") + "/" + iterationTitle + ".html",
            filters: [
                { name: langTrans("doc save filter1"), extensions: ["html"] }
            ]
        });

        if (filePath === undefined) return;

        let markdownContent = getMarkDownContent(versionIteration, version_iteration_requests, prjs, envs, envVars);

        let converter = new Showdown.Converter({
            omitExtraWLInCodeBlocks: true,
            parseImgDimensions: true,
            tables: true,
            tablesHeaderId: true,
            underline: true,
            simplifiedAutoLink: true,
            strikethrough: true,
            tasklists: true,
        });

        let html = converter.makeHtml(markdownContent);
        html = "<meta charset=\"UTF-8\">\n<style>\nimg {width: 40%;}\ntable { width: 100%; }\ntable { border-collapse: collapse; }\ntable thead { height: 29px; }\ntable thead th { border: 1px solid #525252; }\ntable tbody { height: 24px; }\ntable th { text-align: center; }\ntable td { text-align: left; }</style>\n\n" + html;

        fs.writeFile(filePath, html, err => {
            if (err != null) {
                log.error(langTrans("doc save failure1"), err);
            }
        });
    });

    ipcMain.on(ChannelsMarkdownStr, (event, action, versionIteration, version_iteration_requests, prjs, envs, envVars) => {
        if (action !== ChannelsMarkdownSaveMarkdownStr) return;

        let iterationTitle = versionIteration[version_iterator_title];

        let filePath = dialog.showSaveDialogSync({
            title: langTrans("doc save method2"),
            defaultPath: app.getPath("desktop") + "/" + iterationTitle + ".md",
            filters: [
                { name: langTrans("doc save filter2"), extensions: ["md"] }
            ]
        });

        if (filePath === undefined) return;

        let markdownContent = getMarkDownContent(versionIteration, version_iteration_requests, prjs, envs, envVars);
        fs.writeFile(filePath, markdownContent, err => {
            if (err != null) {
                log.error(langTrans("doc save failure2"), err);
            }
        });
    });

    //展示迭代文档
    ipcMain.on(ChannelsMarkdownStr, (event, action, versionIteration, version_iteration_requests, prjs, envs, envVars) => {
        
        if (action !== ChannelsMarkdownShowStr) return;

        let iterationUUID = versionIteration[version_iterator_uuid];
        let markdownContent = getMarkDownContent(versionIteration, version_iteration_requests, prjs, envs, envVars);

        event.reply(ChannelsMarkdownStr, action, iterationUUID, versionIteration[version_iterator_title], markdownContent);
    });

}

function getMarkDownContent(versionIteration, version_iteration_requests, prjs, envs, envVars : any) : string {
    let iterationUUID = versionIteration[version_iterator_uuid];
    let ip = getIpV4();
    let markdownContent = "";

    let formattedRequests : any = {};
    for(let version_iteration_request of version_iteration_requests ) {
        let _prj = version_iteration_request[iteration_request_prj];
    
        if (!(_prj in formattedRequests)) {
            formattedRequests[_prj] = {};
        }
    
        let _fold = version_iteration_request[iteration_request_fold];
    
        if (!(_fold in formattedRequests[_prj])) {
            formattedRequests[_prj][_fold] = [];
        }
    
        formattedRequests[_prj][_fold].push(version_iteration_request);
    }

    //迭代标题
    markdownContent += "# " + versionIteration[version_iterator_title] + "\n\n";
    
    //迭代内容
    markdownContent += versionIteration[version_iterator_content] + "\n\n";

    markdownContent += "***\n\n";
    
    Object.keys(formattedRequests).map(_prj => {

        if (!prjs.find(row => row[prj_label] === _prj)) return;
    
        let _prjName = prjs.find(row => row[prj_label] === _prj)[prj_remark];
    
        //项目
        markdownContent += "\n## " + _prjName + "\n\n";

        for (let _env of envs) {
            let envHost = envVars[_prj][_env[env_label]];
            if (isStringEmpty(envHost)) {
                continue;
            }
            markdownContent += _env[env_remark] + "：" + envHost + "\n\n" ;
        }
        markdownContent += langTrans("doc mockserver") + "：" + "http://" + ip + ":" + GLobalPort + "/mockserver/" + iterationUUID + "/" + _prj + "/" + "\n\n" ;
        markdownContent += "\n";
    
        Object.keys(formattedRequests[_prj]).map(_fold => {

            let nextLevel;
            if (!isStringEmpty(_fold)) {
                //文件夹
                markdownContent += "### " + " /" + _fold + "\n\n";
                nextLevel = "#### ";
            } else {
                nextLevel = "### ";
            }
    
            formattedRequests[_prj][_fold].map(_request => {
    
                //接口名称
                markdownContent += nextLevel + _request[iteration_request_title] + "\n\n";
    
                //接口 uri
                markdownContent +=  "uri：" + _request[iteration_request_method] + " " + _request[iteration_request_uri] + "\n\n";
                if (!isStringEmpty(_request[iteration_request_desc])) {
                    for (let rowText of _request[iteration_request_desc].split("\n")) {
                        markdownContent += "> " + rowText + "\n\n";
                    }
                    markdownContent += "\n\n";
                }

                let pathVariable = _request[iteration_request_path_variable];
                if (pathVariable != null && Object.keys(pathVariable).length > 0) {
                    markdownContent += "**uri 参数：**\n";
                    Object.keys(pathVariable).map(_pathVariableKey => {
                        let _pathVariableObj = pathVariable[_pathVariableKey];
                        let _value = substr(_pathVariableObj[TABLE_FIELD_VALUE], 50);
                        let _level = _pathVariableObj[TABLE_FIELD_LEVEL];
                        for (let i=0; i< _level - 1; i ++) {
                            markdownContent += "  ";
                        }
                        markdownContent += "- " + _pathVariableKey + "（" + _pathVariableObj[TABLE_FIELD_TYPE] + " - " + _pathVariableObj[TABLE_FIELD_REMARK] + " - " + (_pathVariableObj[TABLE_FIELD_NECESSARY] == 1 ? langTrans("doc necessary"): langTrans("doc unnecessary")) + " - " + _value + "）\n";
                    });
                    markdownContent += "\n";
                }

                let param = _request[iteration_request_param];
                if (Object.keys(param).length > 0) {
                    markdownContent += "**param：**\n";
                    Object.keys(param).map(_paramKey => {
                        let _paramObj = param[_paramKey];
                        let _value = substr(_paramObj[TABLE_FIELD_VALUE], 50);
                        let _level = _paramObj[TABLE_FIELD_LEVEL];
                        for (let i=0; i< _level - 1; i ++) {
                            markdownContent += "  ";
                        }
                        markdownContent += "- " + _paramKey + "（" + _paramObj[TABLE_FIELD_TYPE] + " - " + _paramObj[TABLE_FIELD_REMARK] + " - " + (_paramObj[TABLE_FIELD_NECESSARY] == 1 ? langTrans("doc necessary"): langTrans("doc unnecessary")) + " - " + _value + "）\n";
                    });
                    markdownContent += "\n";
                }

                let header = _request[iteration_request_header];
                if (Object.keys(header).length > 0) {
                    markdownContent += "**Header：**\n";
                    Object.keys(header).map(_headerKey => {
                        let _headerObj = header[_headerKey];
                        let _value = substr(_headerObj[TABLE_FIELD_VALUE], 50);
                        let _level = _headerObj[TABLE_FIELD_LEVEL];
                        for (let i=0; i< _level - 1; i ++) {
                            markdownContent += "  ";
                        }
                        markdownContent += "- " + _headerKey + "（" + _headerObj[TABLE_FIELD_TYPE] + " - " + _headerObj[TABLE_FIELD_REMARK] + " - " + (_headerObj[TABLE_FIELD_NECESSARY] == 1 ? langTrans("doc necessary"): langTrans("doc unnecessary")) + " - " + _value + "）\n";
                    });
                    markdownContent += "\n";
                }

                let bodyList = [];
                iteratorObjectToArr(bodyList, _request[iteration_request_body], 1);

                if (bodyList.length > 0) {
                    markdownContent += "**Body：**\n";
                    bodyList.map(_bodyItem => {
                        let _value = "";
                        if (_bodyItem[TABLE_FIELD_TYPE] === "File") {
                            _value = substr(_bodyItem[TABLE_FIELD_VALUE].name, 35);
                        } else {
                            _value = _bodyItem[TABLE_FIELD_VALUE];
                        }
                        let _level = _bodyItem[TABLE_FIELD_LEVEL];
                        for (let i = 0; i< _level - 1; i ++) {
                            markdownContent += "  ";
                        }
                        markdownContent += "- " + _bodyItem[TABLE_FIELD_NAME] + "（" + _bodyItem[TABLE_FIELD_TYPE] + " - " + _bodyItem[TABLE_FIELD_REMARK] + " - " + (_bodyItem[TABLE_FIELD_NECESSARY] == 1 ? langTrans("doc necessary"): langTrans("doc unnecessary")) + " - " + _value + "）\n";
                    })
                    markdownContent += "\n";
                }

                let responseHeadList = [];
                iteratorObjectToArr(responseHeadList, _request[iteration_response_head], 1);
                if (responseHeadList.length > 0) {
                    markdownContent += "**" + langTrans("request save response header") + "：**\n";
                    markdownContent += "| " + langTrans("network table1") + "       | " + langTrans("network table2") + " | " + langTrans("network table3") + " | " + langTrans("network table6") + " |\n";
                    markdownContent += "| ------------ | -------- | ---- | ----------------------- |\n";
                    responseHeadList.map(_responseHeadItem => {
                        let _value = substr(_responseHeadItem[TABLE_FIELD_VALUE], 35);
                        markdownContent += "| " + _responseHeadItem[TABLE_FIELD_NAME] + " | " + _responseHeadItem[TABLE_FIELD_TYPE] + " | " + _responseHeadItem[TABLE_FIELD_REMARK] + " | " + _value + " |\n";
                    })
                    markdownContent += "\n";
                }

                let responseCookieList = [];
                iteratorObjectToArr(responseCookieList, _request[iteration_response_cookie], 1);
                if (responseCookieList.length > 0) {
                    markdownContent += "**" + langTrans("request save response cookie") + "：**\n";
                    responseCookieList.map(_responseCookieItem => {
                        let _value = substr(_responseCookieItem[TABLE_FIELD_VALUE], 50);
                        let _level = _responseCookieItem[TABLE_FIELD_LEVEL];
                        for (let i=0; i< _level - 1; i ++) {
                            markdownContent += "  ";
                        }
                        markdownContent += "- " + _responseCookieItem[TABLE_FIELD_NAME] + "（" + _responseCookieItem[TABLE_FIELD_TYPE] + " - " + _responseCookieItem[TABLE_FIELD_REMARK] + " - " + _value + "）\n";
                    })
                    markdownContent += "\n";
                }

                let responseList = [];
                iteratorObjectToArr(responseList, _request[iteration_response_content], 1);
    
                if (_request[iteration_request_jsonFlg] && responseList.length > 0) {
                    markdownContent += "**" + langTrans("doc response content") + "：**\n";
                    responseList.map(_responseItem => {
                        let _value = substr(_responseItem[TABLE_FIELD_VALUE], 50);
                        let _level = _responseItem[TABLE_FIELD_LEVEL];
                        for (let i=0; i< _level - 1; i ++) {
                            markdownContent += "  ";
                        }
                        markdownContent += "- " + _responseItem[TABLE_FIELD_NAME] + "（" + _responseItem[TABLE_FIELD_TYPE] + " - " + _responseItem[TABLE_FIELD_REMARK] + " - " + _value + "）\n";
                    })

                    markdownContent += "\n";
                }
    
                if (_request[iteration_request_jsonFlg] || _request[iteration_request_htmlFlg] || _request[iteration_request_picFlg] || _request[iteration_request_fileFlg]) {
                    markdownContent += langTrans("doc response demo") + "：\n\n";
                    if (_request[iteration_request_jsonFlg]) {
                        markdownContent += "```json\n";
                        markdownContent += prettyJson(JSON.parse(_request[iteration_response_demo])) + "\n";
                        markdownContent += "```\n";
                    }
    
                    if (_request[iteration_request_htmlFlg]) {
                        markdownContent += "```html\n";
                        markdownContent += substr(_request[iteration_response_demo], 100) + "\n";
                        markdownContent += "```\n";
                    }
    
                    if (_request[iteration_request_picFlg]) {
                        markdownContent += "![" + _request[iteration_request_title] + "](" + _request[iteration_response_demo] + ")";
                        markdownContent += "\n";
                    }
    
                    if (_request[iteration_request_fileFlg]) {
                        markdownContent += "\n";
                        markdownContent += _request[iteration_response_demo];
                        markdownContent += "\n";
                    }
                }
            });
        });

        markdownContent += "***\n\n";
    });

    return markdownContent;
}