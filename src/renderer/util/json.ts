import md5 from 'js-md5';
import { cloneDeep } from 'lodash';

import { getType, isStringEmpty } from './';
import { TABLE_JSON_FRAGEMENT_FIELDS } from '../../config/db';
import { CONTENT_TYPE } from '../../config/global_config';

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

export function retShortJsonContent(jsonObject : object) : object {
    let shortJsonObject = {};
    shortJsonContent(shortJsonObject, jsonObject);
    return shortJsonObject;
}

export function shortJsonContent(shortJsonObject : any, jsonObject : any){
    for(let _key in jsonObject) {
        let type = getType(jsonObject[_key]);
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
    for(let key in content) {
        if(isInnerKey(key)) {
            continue;
        }
        let necessary = 0;
        if(getType(content[key][TABLE_FIELD_NECESSARY]) !== "Undefined") {
            necessary = content[key][TABLE_FIELD_NECESSARY];
        }
        let remark = "";
        if(getType(content[key][TABLE_FIELD_REMARK]) !== "Undefined") {
            remark = content[key][TABLE_FIELD_REMARK];
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
        let type = content[key][TABLE_FIELD_TYPE];
        obj["key"] = parentKeys.join(".") + (parentKey === "" ? "" : ".") + key;
        obj[TABLE_FIELD_NAME] = key;
        obj[TABLE_FIELD_TYPE] = type;
        obj[TABLE_FIELD_NECESSARY] = necessary;
        obj[TABLE_FIELD_REMARK] = remark;
        obj[TABLE_FIELD_VALUE] = getType(content[key][TABLE_FIELD_VALUE]) === "Undefined" ? null : content[key][TABLE_FIELD_VALUE];
        if (type === "Object" || type === "Array") {
            obj["children"] = [];
        }
        result.push(obj);
        content[key][TABLE_FIELD_REMARK] = remark;
        if (type === "Object" || type === "Array") {
            parentKeys.push(key);
            await parseJsonToChildren(parentKeys, key, obj["children"], content[key], cb);
            parentKeys.pop();
        }
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
    let shortBodyObject = {};
    shortJsonContent(shortBodyObject, bodyObject);
    let genHash = innerIteratorGenHash("", shortBodyObject);
    for (let _key in fileObject) {
        genHash += _key;
    }
    genHash = md5(genHash);
    return genHash;
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
            let value = "";
            for (let _key2 in _currentObject) {                
                if (!isInnerKey(_key2)) {
                    delFlg = false;
                }
            }
            if (delFlg) {
                _currentObject = [value];
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