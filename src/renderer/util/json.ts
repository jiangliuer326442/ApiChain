import md5 from 'js-md5';
import { cloneDeep } from 'lodash';

import RequestSendTips from '../classes/RequestSendTips';
import { getType, isJsonString, isStringEmpty, getMapValueOrDefault } from './index';
import { TABLE_JSON_FRAGEMENT_FIELDS } from '../../config/db';
import { CONTENT_TYPE, DataTypeJsonObject, KEY_SEPARATOR } from '../../config/global_config';

import { getJsonFragment } from '../actions/request_save';

let json_fragement_remark = TABLE_JSON_FRAGEMENT_FIELDS.FIELD_REMARK;

export const TABLE_FIELD_NAME = "$$name$$";
export const TABLE_FIELD_REMARK = "$$remark$$";
export const TABLE_FIELD_TYPE = "$$type$$";
export const TABLE_FIELD_NECESSARY = "$$necessary$$";
export const TABLE_FIELD_LEVEL = "$$level$$";
export const TABLE_FIELD_VALUE = "$$value$$";

export const TABLE_FIELD_TYPE_REF = "Ref";

let json_fragement_fields = TABLE_JSON_FRAGEMENT_FIELDS.FIELD_FIELDS;

export async function getEnvVarsIterator(data : any, format : any, env : string, requestSendTips : RequestSendTips) {
    data = cloneDeep (data);
    await innterGetEnvVarsIterator(data, format, env, requestSendTips);
    return data;
}

export function retShortJsonContent(jsonObject : object) : object {
    let shortJsonObject = {};
    shortJsonContent(shortJsonObject, jsonObject);
    return shortJsonObject;
}

export function shortJsonContent(shortJsonObject : any, jsonObject : any){
    for(let _key in jsonObject) {
        let type = getType(jsonObject[_key]);
        let stringifyJsonFlg = false;
        if (type === "String" && isJsonString(jsonObject[_key])) {

            jsonObject[_key] = JSON.parse(jsonObject[_key]);
            type = getType(jsonObject[_key]);
            stringifyJsonFlg = true;
        }
        if (type === "Object") {
            shortJsonObject[_key] = jsonObject[_key];
            shortJsonContent(shortJsonObject[_key], jsonObject[_key]);
        } else if (type === "Array" && jsonObject[_key].length > 0) {
            if (getType(jsonObject[_key][0]) === "Object") {
                let newArr = [ jsonObject[_key][0] ];
                shortJsonObject[_key] = newArr;
                shortJsonContent(shortJsonObject[_key][0], jsonObject[_key][0]);
            } else if (getType(jsonObject[_key][0]) === "Undefined") {

            } else {
                let newArr = [ jsonObject[_key][0] ];
                shortJsonObject[_key] = newArr;
            }
        } else if (type === "Null") {

        } else {
            if (getType(jsonObject[_key]) === "Number") {
                jsonObject[_key] = jsonObject[_key].toString();
            }
            //不对 content-type 的字符串进行缩减
            if (getType(jsonObject[_key]) === "Boolean" || _key === CONTENT_TYPE || jsonObject[_key].length <= 50) {
                shortJsonObject[_key] = jsonObject[_key];
            } else {
                shortJsonObject[_key] = jsonObject[_key].substring(0, 50) + "...";
            }
        }
        if (stringifyJsonFlg) {
            shortJsonObject[_key] = JSON.stringify(jsonObject[_key]);
        }
    }
}

export function retParseBodyJsonToTable(bodyObject : any, fileObject : any) {
    let formRequestBodyData : any = {};
    parseJsonToTable(formRequestBodyData, bodyObject);
    for (let _key in fileObject) {
        let _item : any = {};
        _item[TABLE_FIELD_REMARK] = "";
        _item[TABLE_FIELD_TYPE] = "File";
        _item[TABLE_FIELD_VALUE] = fileObject[_key];
        formRequestBodyData[_key] = _item;
    }
    return formRequestBodyData;
}

export function parseJsonToTable(parseResult : any, jsonObject : any) {
    for(let _key in jsonObject) {
        let type = getType(jsonObject[_key]);
        if (type === "Object") {
            parseResult[_key] = {};
            parseResult[_key][TABLE_FIELD_REMARK] = "";
            parseResult[_key][TABLE_FIELD_TYPE] = type;
            parseJsonToTable(parseResult[_key], jsonObject[_key]);
        } else if (type === "Array" && jsonObject[_key].length > 0) {
            parseResult[_key] = {};
            parseResult[_key][TABLE_FIELD_REMARK] = "";
            parseResult[_key][TABLE_FIELD_TYPE] = type;
            if (getType(jsonObject[_key][0]) === "Object") {
                parseJsonToTable(parseResult[_key], jsonObject[_key][0]);
            }
        } else {
            parseResult[_key] = {};
            parseResult[_key][TABLE_FIELD_REMARK] = "";
            parseResult[_key][TABLE_FIELD_TYPE] = type;
            parseResult[_key][TABLE_FIELD_VALUE] = jsonObject[_key];
        }
    }
}

export function isInnerKey(key : string) {
    return key === TABLE_FIELD_REMARK || key === TABLE_FIELD_TYPE || key === TABLE_FIELD_VALUE || key === TABLE_FIELD_NECESSARY;
}

export function cleanJson(inJsonObject : any) {
    let copyInJsonObject = cloneDeep(inJsonObject);
    let outJsonObject : any = {};
    innerCleanJson(outJsonObject, copyInJsonObject);
    return outJsonObject;
}

export function parseJsonToFilledTable(parseResult : any, jsonObject : any, filledObject : any) {
    if (!filledObject) {
        filledObject = null;
    }
    for(let _key in jsonObject) {
        let type = getType(jsonObject[_key]);
        if (filledObject && filledObject[_key] && filledObject[_key][TABLE_FIELD_TYPE]) {
            type = filledObject[_key][TABLE_FIELD_TYPE];
        }
        if (type === "Object") {
            parseResult[_key] = {};
            parseResult[_key][TABLE_FIELD_REMARK] = "";
            parseResult[_key][TABLE_FIELD_TYPE] = type;
            parseResult[_key][TABLE_FIELD_NECESSARY] = 0;
            parseJsonToFilledTable(parseResult[_key], jsonObject[_key], (filledObject && filledObject[_key]) ? filledObject[_key] : null);
        } else if (type === "Array" && jsonObject[_key].length > 0) {
            parseResult[_key] = {};
            parseResult[_key][TABLE_FIELD_REMARK] = "";
            parseResult[_key][TABLE_FIELD_TYPE] = type;
            parseResult[_key][TABLE_FIELD_NECESSARY] = 0;
            if (getType(jsonObject[_key][0]) === "Object") {
                parseJsonToFilledTable(parseResult[_key], jsonObject[_key][0], (filledObject && filledObject[_key]) ? filledObject[_key] : null);
            } else {
                parseResult[_key][TABLE_FIELD_VALUE] = {};
                parseResult[_key][TABLE_FIELD_VALUE][TABLE_FIELD_REMARK] = "";
                parseResult[_key][TABLE_FIELD_VALUE][TABLE_FIELD_TYPE] = getType(jsonObject[_key][0]);
                parseResult[_key][TABLE_FIELD_VALUE][TABLE_FIELD_NECESSARY] = 0;
                parseResult[_key][TABLE_FIELD_VALUE][TABLE_FIELD_VALUE] = jsonObject[_key][0];
            }
        } else {
            parseResult[_key] = {};
            parseResult[_key][TABLE_FIELD_REMARK] = (filledObject && filledObject.hasOwnProperty(_key) && filledObject[_key].hasOwnProperty(TABLE_FIELD_REMARK)) ? filledObject[_key][TABLE_FIELD_REMARK] : "";
            parseResult[_key][TABLE_FIELD_TYPE] = type;
            parseResult[_key][TABLE_FIELD_NECESSARY] = (filledObject && filledObject.hasOwnProperty(_key) && filledObject[_key].hasOwnProperty(TABLE_FIELD_NECESSARY)) ? filledObject[_key][TABLE_FIELD_NECESSARY] : 1;
            parseResult[_key][TABLE_FIELD_VALUE] = jsonObject[_key];
        }
    }
}

export async function parseJsonToChildren(parentKeys, parentKey, result, content, cb) {
    let json_fragment = await cb(parentKey, content);

    if (content[TABLE_FIELD_TYPE] === "Array" && content[TABLE_FIELD_VALUE] !== undefined) {
        let _obj = content[TABLE_FIELD_VALUE];
        if (_obj.length > 0) {
            await innerParseJsonToChildrend(_obj, json_fragment, "0", parentKeys, parentKey, result, cb);
        }
    } else {
        for(let key in content) {
            if(isInnerKey(key)) {
                continue;
            }
            let _obj = content[key];
            await innerParseJsonToChildrend(_obj, json_fragment, key, parentKeys, parentKey, result, cb);
        }
    }
}

async function innerParseJsonToChildrend(
    _obj : any, 
    json_fragment : any,
    key : string | null,
    parentKeys, parentKey,
    result,
    cb
) {
    let necessary = 0;
    if(getType(_obj[TABLE_FIELD_NECESSARY]) !== "Undefined") {
        necessary = _obj[TABLE_FIELD_NECESSARY];
    }
    let remark = "";
    if(getType(_obj[TABLE_FIELD_REMARK]) !== "Undefined") {
        remark = _obj[TABLE_FIELD_REMARK];
    }
    if ( json_fragment !== undefined ) {
        let json_fragment_obj = json_fragment[json_fragement_fields][key];
        if (json_fragment_obj[TABLE_FIELD_TYPE] === "String" || json_fragment_obj[TABLE_FIELD_TYPE] === "Number") {
            remark = json_fragment_obj[TABLE_FIELD_REMARK];
        } else if (json_fragment_obj[TABLE_FIELD_TYPE] === TABLE_FIELD_TYPE_REF) {
            let tmp_fragement_name = json_fragment_obj[TABLE_FIELD_NAME];
            let tmp_fragement_name_arr = tmp_fragement_name.split('@');
            let fragement_name = tmp_fragement_name_arr[0];
            let fragement_hash = tmp_fragement_name_arr[1];
            let tmp_json_fragment = await getJsonFragment(fragement_name, fragement_hash);
            remark = tmp_json_fragment !== undefined ? tmp_json_fragment[json_fragement_remark] : '';
        }
    }

    let obj : any = {};
    let type = _obj[TABLE_FIELD_TYPE];
    obj["key"] = parentKeys.join(KEY_SEPARATOR) + (parentKey === "" ? "" : KEY_SEPARATOR) + key;
    obj[TABLE_FIELD_NAME] = key;
    obj[TABLE_FIELD_TYPE] = type;
    obj[TABLE_FIELD_NECESSARY] = necessary;
    obj[TABLE_FIELD_REMARK] = remark;
    obj[TABLE_FIELD_VALUE] = (
        getType(_obj[TABLE_FIELD_VALUE]) === "Undefined" || 
        type === "Object" || 
        type === "Array"
    ) ? null : _obj[TABLE_FIELD_VALUE];
    if (type === "Object" || type === "Array") {
        obj["children"] = [];
    }
    result.push(obj);
    if (type === "Object" || type === "Array") {
        parentKeys.push(key);
        await parseJsonToChildren(parentKeys, key, obj["children"], _obj, cb);
        parentKeys.pop();
    }
}

export function genHash(jsonObject : object) : string {
    let hash = ""
    for(let _key in jsonObject) {
        if(isInnerKey(_key)) {

        } else {
            hash = hash + _key;
        }
    }
    if (isStringEmpty(hash)) {
        return "";
    } else {
        return md5(hash);
    }
}

export function prettyJson(jsonObject : Object) : string {
    return JSON.stringify(jsonObject, null, 2);
}

export function iteratorGenHash(originObject : Object) : string {
    let shortObject = {};
    shortJsonContent(shortObject, originObject);
    let genHash = innerIteratorGenHash("", shortObject);
    genHash = md5(genHash);
    return genHash;
}

export function iteratorBodyGenHash(bodyObject : Object, fileObject : Object) : string {
    let genHash = innerIteratorGenHash("", bodyObject);
    for (let _key in fileObject) {
        genHash += _key;
    }
    genHash = md5(genHash);
    return genHash;
}

export async function buildJsonString(formObjectDefine : any) {
    let jsonStringKeys = new Set<String>();
    for (let _key in formObjectDefine) {
        let _val = formObjectDefine[_key];
        if (_val[TABLE_FIELD_TYPE] === DataTypeJsonObject) {
            jsonStringKeys.add(_key);
            let formRequestBodyJsonStringObject;
            if (getType(_val[TABLE_FIELD_VALUE]) === "String") {
                formRequestBodyJsonStringObject = JSON.parse(_val[TABLE_FIELD_VALUE]);
            } else {
                formRequestBodyJsonStringObject = _val[TABLE_FIELD_VALUE];
            }
            _val[TABLE_FIELD_TYPE] =  getType(formRequestBodyJsonStringObject);
            _val[TABLE_FIELD_VALUE] = "";
            let formRequestBodyJsonStringParsedData : any = {};
            let wrappedObject : any = {};
            wrappedObject[_key] = formRequestBodyJsonStringObject;
            parseJsonToFilledTable(formRequestBodyJsonStringParsedData, wrappedObject, null);
            _val = formRequestBodyJsonStringParsedData[_key];
            formObjectDefine[_key] = _val;
        }
    }
    let parseJsonToChildrenResult : Array<any> = [];
    await parseJsonToChildren([], "", parseJsonToChildrenResult, formObjectDefine, async (_1, _2) => undefined);

    let returnObject = cleanJson(formObjectDefine);

    for (let _key in returnObject) {
        if (jsonStringKeys.has(_key)) {
            returnObject[_key] = JSON.stringify(returnObject[_key]);
        }
    }

    return {
        formObjectDefine,
        parseJsonToChildrenResult,
        returnObject,
        jsonStringKeys,
    };
}

function innerIteratorGenHash(hash, object) {
    let genHash = hash;
    for (let key in object) {
        genHash += key;
        if (getType(object[key]) === "Object") {
            genHash += innerIteratorGenHash(hash, object[key]);
        } else if (getType(object[key]) === "Array" && object[key].length > 0 && getType(object[key][0] === "Object")) {
            genHash += innerIteratorGenHash(hash, object[key][0]);
        }
    }
    return genHash;
}

function innerCleanJson(outJsonObject : any, inJsonObject : any) {
	for (let _key in inJsonObject) {
		let _currentObject = inJsonObject[_key];
        let _currentObjectType = _currentObject[TABLE_FIELD_TYPE];
		let delFlg = true;
        if (_currentObjectType === "Array") {
            for (let _key2 in _currentObject) {                
                if (!isInnerKey(_key2)) {
                    delFlg = false;
                }
            }
            if (delFlg) {
                _currentObject = [_currentObject[TABLE_FIELD_VALUE][TABLE_FIELD_VALUE]];
            } else {
                delete _currentObject[TABLE_FIELD_REMARK];
                delete _currentObject[TABLE_FIELD_TYPE];
                delete _currentObject[TABLE_FIELD_NECESSARY];
                _currentObject = [_currentObject];
            }
            outJsonObject[_key] = _currentObject;
            if (!delFlg) {
                innerCleanJson(outJsonObject[_key][0], _currentObject[0]);
            }
        } else {
            let value = "";
            for (let _key2 in _currentObject) {
                if (_key2 === TABLE_FIELD_VALUE) {
                    value = _currentObject[_key2];
                } 
                
                if (!isInnerKey(_key2)) {
                    delFlg = false;
                }
            }
            if (delFlg) {
                _currentObject = value;
            } else {
                delete _currentObject[TABLE_FIELD_REMARK];
                delete _currentObject[TABLE_FIELD_TYPE];
                delete _currentObject[TABLE_FIELD_NECESSARY];
            }
            outJsonObject[_key] = _currentObject;
            if (!delFlg) {
                innerCleanJson(outJsonObject[_key], inJsonObject[_key]);
            }
        }
	}
}

async function innterGetEnvVarsIterator(data : any, format : any, env : string, requestSendTips : RequestSendTips) {
    for (let _key in data) {
        let value = data[_key];
        let isJsonString = false;
        if (format != null && format.hasOwnProperty(_key)) {
            if (format[_key][TABLE_FIELD_TYPE].toLowerCase() === DataTypeJsonObject.toLowerCase()) {
                isJsonString = true;
            }
        }
        if (isJsonString && getType(value) === "String") {
            value = JSON.parse(value);
        }

        if (getType(value) === "Array") {
            for (let _index in value) {
                let _item = value[_index];
                if (getType(_item) === "Object") {
                    await innterGetEnvVarsIterator(_item, null, env, requestSendTips);
                } else {
                    let beginIndex = value[_index].indexOf("{{");
                    let endIndex = value[_index].indexOf("}}");
                    if (beginIndex >= 0 && endIndex >= 0 && beginIndex < endIndex) {
                        let envValueKey = value[_index].substring(beginIndex + 2, endIndex);
                        value[_index] = getMapValueOrDefault(envvars, envValueKey, "");
                    }
                }
            }
        } else if (getType(value) === "Object") {
            await innterGetEnvVarsIterator(value, null, env, requestSendTips);
        } else if (getType(value) === "String") {
            let beginIndex = value.indexOf("{{");
            let endIndex = value.indexOf("}}");
            if (beginIndex >= 0 && endIndex >= 0 && beginIndex < endIndex) {
                let envValueKey = value.substring(beginIndex + 2, endIndex);
                data[_key] = await requestSendTips.getVarByKey(envValueKey, env);
            }
        }

        if (isJsonString) {
            data[_key] = JSON.stringify(value);
        }
    }
}