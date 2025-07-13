import { cloneDeep } from 'lodash';

import RequestSendTips from '@clazz/RequestSendTips';
import { isStringEmpty, getType } from "@rutil/index";
import { 
    TABLE_FIELD_TYPE, 
    TABLE_FIELD_REMARK, 
    TABLE_FIELD_VALUE, 
    TABLE_FIELD_NECESSARY 
} from '@rutil/json';
import { 
    UNITTEST_STEP_CURRENT,
    UNITTEST_STEP_RESPONSE,
    UNITTEST_STEP_RESPONSE_HEADER,
    UNITTEST_STEP_RESPONSE_COOKIE,
    UNITTEST_STEP_PROJECT_CURRENT,
    UNITTEST_STEP_POINTED,
    UNITTEST_DATASOURCE_TYPE_ENV,
    UNITTEST_DATASOURCE_TYPE_REF,
    UNITTEST_STEP_PROJECT_POINTED,
    UNITTEST_STEP_BODY,
    UNITTEST_STEP_PARAM,
    UNITTEST_STEP_PATH_VARIABLE,
    UNITTEST_STEP_HEADER,
} from '@conf/unittest';

import {
    UNITTEST_FUNCTION_ANY_EVAL,
    UNITTEST_FUNCTION_ARRAY_RANDOM,
    UNITTEST_FUNCTION_ARRAY_FIRST,
    UNITTEST_FUNCTION_ARRAY_LAST,
} from '@conf/envKeys';

import { 
    TABLE_REQUEST_HISTORY_FIELDS,
} from '@conf/db';

import { getSingleExecutorStep } from '@act/unittest';

let request_history_response_content = TABLE_REQUEST_HISTORY_FIELDS.FIELD_RESPONSE_CONTENT;
let request_history_response_header = TABLE_REQUEST_HISTORY_FIELDS.FIELD_RESPONSE_HEAD;
let request_history_response_cookie = TABLE_REQUEST_HISTORY_FIELDS.FIELD_RESPONSE_COOKIE;
let request_history_body = TABLE_REQUEST_HISTORY_FIELDS.FIELD_REQUEST_BODY;
let request_history_header = TABLE_REQUEST_HISTORY_FIELDS.FIELD_REQUEST_HEADER;
let request_history_param = TABLE_REQUEST_HISTORY_FIELDS.FIELD_REQUEST_PARAM;
let request_history_path_variable = TABLE_REQUEST_HISTORY_FIELDS.FIELD_REQUEST_PATH_VARIABLE;

export default class {

    private project: string;

    private dataSourceJson: Object = {};

    private envVarTips : RequestSendTips;

    private env : string = "";

    //当前项目
    private currentProject : string;

    //当前迭代
    private currentIteration : string;

    //当前单测
    private currentUnittest : string;

    //数据源类型 引用步骤参数 或者 环境变量 & 固定值
    private dataSourceType : string | null = null;
    //选择框 选中的步骤
    private selectedStep = UNITTEST_STEP_CURRENT;
    //选择框 步骤数据源来源
    private selectedDataSource : string = UNITTEST_STEP_RESPONSE;
    //选择框 选中的项目
    private selectedProject = UNITTEST_STEP_PROJECT_CURRENT;
    //最终填写的表达式
    private assertPrev : string | null = null;

    private dispatch : any;

    private randomVal : any;

    constructor(iteration: string, unittest: string, dispatch : any) {
        this.currentIteration = iteration;
        this.currentUnittest = unittest;
        this.dispatch = dispatch;
        this.randomVal = Math.random();
    }

    setProject(project: string) {
        this.project = project;
        this.currentProject = project;
        this.envVarTips = new RequestSendTips();
        this.envVarTips.init(this.currentProject, this.env, this.currentIteration, this.currentUnittest, this.dispatch, env_vars => {});
    }

    setContent(param: string) {
        let content = cloneDeep(param);
        if (getType(content) === "String") {
            this.parseFromStandardExpression(content);
        } else {
            //环境变量 & 固定值
            this.dataSourceType = UNITTEST_DATASOURCE_TYPE_ENV;
            this.assertPrev = content;
        }
    }

    setEnv(env: string) {
        this.env = env;
    }

    getDataSourceType() : string | null {
        return this.dataSourceType;
    }

    setDataSourceType(dataSourceType: string) {
        this.dataSourceType = dataSourceType;
    }

    getSelectedStep() : string {
        return this.selectedStep;
    }

    getSelectedDataSource() : string {
        return this.selectedDataSource;
    }

    setSelectedProject(selectedProject : string) {
        this.selectedProject = selectedProject;
        if (this.selectedProject !== UNITTEST_STEP_PROJECT_CURRENT) {
            this.currentProject = this.selectedProject.substring(UNITTEST_STEP_PROJECT_POINTED.length);
        }
        this.envVarTips.init(this.currentProject, "", this.currentIteration, this.currentUnittest, this.dispatch, env_vars => {});
    }

    getSelectedProject() : string {
        return this.selectedProject;
    }

    getAssertPrev() : string | null {
        return this.assertPrev;
    }

    setDataSourceJson(dataSourceJson : Object) { 
        this.dataSourceJson = dataSourceJson;
    }

    getTips(text : string, cb: (result: Array<any>) => void) : void {
        let result : Array<any> = [];
        if (isStringEmpty(text)) {
            cb(result);
        }
        //环境变量 & 固定值
        if (this.dataSourceType === UNITTEST_DATASOURCE_TYPE_ENV) {
            if (text.indexOf("{{") === 0) {
                this.envVarTips.getTips(envKeys => {
                    let searchContent = text.substring(2);
                    let responseTips : Array<any> = [];
                    for (let envKey of envKeys) {
                        if (!isStringEmpty(searchContent) && envKey.toLowerCase().indexOf(searchContent.toLowerCase()) < 0) {
                            continue;
                        }
                        let responseTipItem : any = {};
                        responseTipItem.value = "{{" + envKey + "}}";
                        responseTipItem.label = envKey;
                        responseTips.push(responseTipItem);
                    }
                    cb(responseTips);
                });
            }
        } else {
            let jsonObject : any = cloneDeep(this.dataSourceJson);
            let textArr = this.splitStr(text);

            let tipsBefore = "";
            let structType;

            if (textArr.length > 1) {
                for (let i = 0; i < textArr.length - 1; i++) {
                    let objectKey = textArr[i];
                    //函数
                    if (objectKey.indexOf('*') === 0) {
                        structType = "Object";
                    } else {
                        jsonObject = jsonObject[objectKey];
                        structType = jsonObject[TABLE_FIELD_TYPE];
                    }
                    tipsBefore += objectKey + ".";
                    text = text.substring(tipsBefore.length);
                }
            } 
            if (isStringEmpty(structType)) {
                structType = getType(jsonObject);
            }

            if (structType === "Array") {
                let item : any = {};
                item.label = UNITTEST_FUNCTION_ARRAY_FIRST;
                item.value = tipsBefore + UNITTEST_FUNCTION_ARRAY_FIRST;
                result.push(item);

                item = {};
                item.label = UNITTEST_FUNCTION_ARRAY_LAST;
                item.value = tipsBefore + UNITTEST_FUNCTION_ARRAY_LAST;
                result.push(item);

                item = {};
                item.label = UNITTEST_FUNCTION_ARRAY_RANDOM;
                item.value = tipsBefore + UNITTEST_FUNCTION_ARRAY_RANDOM;
                result.push(item);
            } else {
                delete jsonObject[TABLE_FIELD_TYPE];
                delete jsonObject[TABLE_FIELD_REMARK];
                delete jsonObject[TABLE_FIELD_VALUE];
                delete jsonObject[TABLE_FIELD_NECESSARY];
                let tips = Object.keys(jsonObject).filter(key => (key.toLowerCase().indexOf(text) >= 0));
                for(let tip of tips) {
                    let item : any = {};
                    item.label = tip;
                    item.value = tipsBefore + tip;
                    result.push(item);
                }

                let item : any = {};
                item = {};
                item.label = UNITTEST_FUNCTION_ANY_EVAL;
                item.value = tipsBefore + UNITTEST_FUNCTION_ANY_EVAL;
                result.push(item);
            }
        }

        cb(result);
    }

    splitStr(str : string) {
        let arr = str.split(".");
        let result = [];
        let lock = false;
        let appendStr = "";
        let leftBracketsNum = 0;
        let rightBracketsNum = 0;
        for (let item of arr) {
            if (item[0] !== "*" && !lock) {
                result.push(item);
                continue;
            }
            if (item[0] === "*") {
                lock = true;
            }

            leftBracketsNum += item.split("(").length - 1;
            rightBracketsNum += item.split(")").length - 1;
            appendStr += item;
            if (leftBracketsNum === rightBracketsNum) {
                lock = false;
                result.push(appendStr)
                appendStr = "";
                leftBracketsNum = 0;
                rightBracketsNum = 0;
            } else {
                appendStr += ".";
            }
        }
        return result;
    }

    async getValue(envVarTips: RequestSendTips,
        paramData : object, pathVariableData : object, headData : object, bodyData : object, responseHeaderData : object, responseCookieData : object, responseData : object, 
        unittest_uuid : string, unittest_executor_batch : string) {
        //环境变量 固定值
        if (this.dataSourceType === UNITTEST_DATASOURCE_TYPE_ENV) {
            if (this.assertPrev === undefined) return "";
            if (getType(this.assertPrev) === "Number") return this.assertPrev;
            let value = this.assertPrev as String;
            let beginIndex = value.indexOf("{{");
            let endIndex = value.indexOf("}}");
            if (beginIndex >= 0 && endIndex >= 0 && beginIndex < endIndex) {
                let envValueKey = value.substring(beginIndex + 2, endIndex);
                //指定项目环境变量
                if (envValueKey.indexOf(UNITTEST_STEP_PROJECT_POINTED) === 0) {
                    return "";
                } else {
                    let tmp = envVarTips.getVarByKey(envValueKey, this.env);
                    //当前项目环境变量
                    value = tmp === undefined ? "" : tmp as string;
                }
            }
            return value;
        } else {
            //当前步骤
            if (this.selectedStep === UNITTEST_STEP_CURRENT) {
                //数据来源
                let dataSource : any;
                if (this.selectedDataSource === UNITTEST_STEP_PARAM) {
                    //当前步骤param
                    dataSource = paramData;
                } else if (this.selectedDataSource === UNITTEST_STEP_PATH_VARIABLE) {
                    //当前步骤pathVariable
                    dataSource = pathVariableData;
                } else if (this.selectedDataSource === UNITTEST_STEP_HEADER) {
                    //当前步骤header
                    dataSource = headData;
                } else if (this.selectedDataSource === UNITTEST_STEP_BODY) {
                    //当前步骤body
                    dataSource = bodyData;
                } else if (this.selectedDataSource === UNITTEST_STEP_RESPONSE_HEADER) {
                    dataSource = responseHeaderData;
                } else if (this.selectedDataSource === UNITTEST_STEP_RESPONSE_COOKIE) {
                    dataSource = responseCookieData;
                } else {
                    //当前步骤返回值
                    dataSource = responseData;
                }
                let pathArr : Array<string> = this.assertPrev?.split('.') as Array<string>;
                return this.getDataSourceByPathArr(dataSource, pathArr);
            } else {
                let stepId = this.selectedStep.substring(UNITTEST_STEP_POINTED.length);
                let unitTestExecutorRow = await getSingleExecutorStep(this.currentIteration, unittest_uuid, unittest_executor_batch, stepId);
                if (unitTestExecutorRow !== null) {
                    //数据来源
                    let dataSource : any;
                    if (this.selectedDataSource === UNITTEST_STEP_PARAM) {
                        //指定步骤param
                        dataSource = unitTestExecutorRow[request_history_param];
                    } else if (this.selectedDataSource === UNITTEST_STEP_PATH_VARIABLE) {
                        //指定步骤pathVariable
                        dataSource = unitTestExecutorRow[request_history_path_variable];
                    } else if (this.selectedDataSource === UNITTEST_STEP_HEADER) {
                        //指定步骤header
                        dataSource = unitTestExecutorRow[request_history_header];
                    } else if (this.selectedDataSource === UNITTEST_STEP_BODY) {
                        //指定步骤body
                        dataSource = unitTestExecutorRow[request_history_body];
                    } else if (this.selectedDataSource === UNITTEST_STEP_RESPONSE_HEADER) {
                        dataSource = unitTestExecutorRow[request_history_response_header];
                    } else if (this.selectedDataSource === UNITTEST_STEP_RESPONSE_COOKIE) {
                        dataSource = unitTestExecutorRow[request_history_response_cookie];
                    } else {
                        //指定步骤response
                        dataSource = JSON.parse(unitTestExecutorRow[request_history_response_content]);
                    }
                    let pathArr = this.splitStr(this.assertPrev);
                    return this.getDataSourceByPathArr(dataSource, pathArr);
                }
     
                return "";
            }
        }
    }

    private getDataSourceByPathArr(dataSource, pathArr) {
        for(let _pathKey of pathArr) {
            let currentFuncName = this.getFuncName(_pathKey);
            if (currentFuncName === this.getFuncName(UNITTEST_FUNCTION_ARRAY_FIRST)) {
                let length = dataSource.length;
                if (length > 0) {
                    dataSource = dataSource[0];
                } else {
                    dataSource = "";
                }
            } else if (currentFuncName === this.getFuncName(UNITTEST_FUNCTION_ARRAY_LAST)) {
                let length = dataSource.length;
                if (length > 0) {
                    dataSource = dataSource[length - 1];
                } else {
                    dataSource = "";
                }
            } else if (currentFuncName === this.getFuncName(UNITTEST_FUNCTION_ARRAY_RANDOM)) {
                if (dataSource.length > 0) {
                    dataSource = dataSource[Math.floor(this.randomVal*(dataSource.length))];
                } else {
                    dataSource = "";
                }
            } else if (currentFuncName === this.getFuncName(UNITTEST_FUNCTION_ANY_EVAL)) {
                let $$ = dataSource;
                let params = _pathKey.substring(currentFuncName.length + 2, _pathKey.length - 2);
                return eval(params);
            } else {
                dataSource = dataSource[_pathKey];
            }
        }
        return dataSource;
    }

    private getFuncName(str: string) : string {
        return str.split("(")[0];
    }

    private trimContent = (content: string) : string => {
        let index1 = content.indexOf('{{');
        let index2 = content.indexOf('}}');
        if (index1 < index2) {
            let ret = content.substring(index1 + 2, index2);
            return ret;
        } else {
            return content;
        }
    }

    private parseFromStandardExpression(content : string) {
        if (!isStringEmpty(content) || content === "") {
            //步骤
            if (content.indexOf(UNITTEST_STEP_CURRENT) > 0 || content.indexOf(UNITTEST_STEP_POINTED) > 0) {
                this.dataSourceType = UNITTEST_DATASOURCE_TYPE_REF;
                this.selectedDataSource = this.trimContent(content).split('.')[1];
                this.assertPrev = "";
                for (let _index in this.trimContent(content).split('.')) {
                    if (_index > 1) {
                        this.assertPrev += this.trimContent(content).split('.')[_index] + ".";
                    }
                }
                this.assertPrev = this.assertPrev.substring(0, this.assertPrev.length - 1);
            } else {
                //环境变量 & 固定值
                this.dataSourceType = UNITTEST_DATASOURCE_TYPE_ENV;
                if (content.indexOf("{{") !== 0) {
                    //固定值
                    this.assertPrev = content;
                } else {
                    //环境变量
                    let tempArr = this.trimContent(content).split('.');
                    if (tempArr.length > 1) {
                        this.selectedProject = tempArr[0];
                        //环境变量 key
                        this.assertPrev = "{{" + tempArr[1] + "}}";
                    } else {
                        //环境变量 key
                        this.assertPrev = "{{" + tempArr[0] + "}}";
                    }
                }
            }

            if (content.indexOf(UNITTEST_STEP_POINTED) > 0) {
                this.selectedStep = this.trimContent(content).split('.')[0];
            } else {
                this.selectedStep = UNITTEST_STEP_CURRENT;
            }

            if (this.selectedProject !== UNITTEST_STEP_PROJECT_CURRENT) {
                this.currentProject = this.selectedProject.substring(UNITTEST_STEP_PROJECT_POINTED.length);
            }
        }
    }

}