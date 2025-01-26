import { v4 as uuidv4 } from 'uuid';
import { cloneDeep } from 'lodash';

import { 
    ENV_VALUE_API_HOST,
    ENV_VALUE_RANDOM_STRING,
    ENV_VALUE_APP_VERSION,
    ENV_VALUE_EMAIL,
    ENV_VALUE_AGE,
    ENV_VALUE_RANDOM_INT,
    ENV_VALUE_RANDOM_LONG,
    ENV_VALUE_CURRENT_DATETIME_STR,
    ENV_VALUE_CURRENT_DATE_STR,
    ENV_VALUE_CURRENT_DATETIME_INT,
    ENV_VALUE_CURRENT_DATE_IMT,
    ENV_VALUE_CURRENT_TIMESTAMP_SECOND,
    ENV_VALUE_CURRENT_TIMESTAMP_MICRO,
} from "@conf/envKeys";
import { 
  TABLE_ENV_VAR_FIELDS,
} from '@conf/db';
import {
    DataTypeJsonObject
} from '@conf/global_config'
import { getEnvValues, getKeys } from '@act/env_value';
import { 
    getType, 
    isStringEmpty, 
    getNowdayjs,
} from '@rutil/index';
import {
    TABLE_FIELD_TYPE
} from "@rutil/json";

let env_var_pname = TABLE_ENV_VAR_FIELDS.FIELD_PARAM_NAME;
let env_var_pvalue = TABLE_ENV_VAR_FIELDS.FIELD_PARAM_VAR;

export default class {

    private env: string = ""; 

    private prj: string = "";

    private iteration: string = "";

    private unittest: string = "";

    private dispatch: any = null;

    private cb: (envKeyVar: Array<any>) => void = () => {};

    private env_vars: Array<any> = [];

    private envKeyVar: Map<string, string> = new Map();

    init(
        prj : string, 
        env : string, 
        iteration : string, 
        unittest : string,
        dispatch : any, 
        cb : (envKeyVar: Array<any>) => void
    ) {  
        if (this.prj !== prj || this.env !== env) {
            this.env_vars = [];
            this.envKeyVar = new Map();
        }
        this.prj = prj;
        this.env = env;
        this.iteration = iteration;
        this.unittest = unittest;
        this.dispatch = dispatch;
        this.cb = cb;
    }

    getTips(cb: (result: Array<string>) => void) : void {
        if (this.env_vars.length === 0) {
            if (isStringEmpty(this.prj)) {
                this.prj = "";
            }
            if (isStringEmpty(this.env)) {
                getKeys(this.prj, this.iteration).then(keys => {
                    cb(this.appendEnvKeys(keys))
                });
                return;
            }
            getEnvValues(this.prj, this.env, this.iteration, "", "", this.dispatch, env_vars => {
                this.env_vars = env_vars;
                cb(this.getTipsByEnvVars());
                this.cb(env_vars);
            });
        } else {
            cb(this.getTipsByEnvVars());
        }
    }

    async getHostAsync() : Promise<string> {
        if (this.env_vars.length === 0) {
            let env_vars = await getEnvValues(this.prj, this.env, this.iteration, "", "", this.dispatch, _ => {});
            this.env_vars = env_vars;
            return this.getApiHost();
        } else {
            return this.getApiHost();
        }
    }

    getHost(cb: (result: string) => void) : void { 
        if (this.env_vars.length === 0) {
            getEnvValues(this.prj, this.env, this.iteration, "", "", this.dispatch, env_vars => {
                this.env_vars = env_vars;
                cb(this.getApiHost());
            });
        } else {
            cb(this.getApiHost());
        }
    }

    iteratorGetVarByKey(postData : any, format : any) : any {
        postData = cloneDeep (postData);
        this.iteratorGetEnvValue(postData, format);
        return postData;
    }

    getVarByKey(key : string) : string | number | undefined {
        if (key === ENV_VALUE_RANDOM_STRING) {
            return "ApiChain_" + uuidv4();
        }

        if (key === ENV_VALUE_EMAIL) {
            return uuidv4().replaceAll("-", "") + "@email.com";
        }

        if (key === ENV_VALUE_AGE) {
            return getNowdayjs().valueOf() % 120;
        }

        if (key === ENV_VALUE_APP_VERSION) {
            let unixTimeStr = getNowdayjs().unix().toString();
            let bigVersion = unixTimeStr.substring(0, 3);
            let middleVersion = unixTimeStr.substring(3, 6);
            let lastVersion = unixTimeStr.substring(6);
            return bigVersion + "." + middleVersion + "." + lastVersion;
        }

        if (key === ENV_VALUE_CURRENT_DATETIME_STR) {
            return getNowdayjs().format("YYYY-MM-DD HH:mm:ss");
        }

        if (key === ENV_VALUE_CURRENT_DATE_STR) {
            return getNowdayjs().format("YYYY-MM-DD");
        }

        if (key === ENV_VALUE_CURRENT_DATETIME_INT) {
            return getNowdayjs().format("YYYYMMDDHHmmss");
        }

        if (key === ENV_VALUE_CURRENT_DATE_IMT) {
            return getNowdayjs().format("YYYYMMDD");
        }

        if (key === ENV_VALUE_CURRENT_TIMESTAMP_SECOND) {
            return getNowdayjs().unix().toString();
        }

        if (key === ENV_VALUE_CURRENT_TIMESTAMP_MICRO) {
            return (Date.now() * 1000).toString();
        }

        if (key === ENV_VALUE_RANDOM_INT) {
            return (Math.trunc(Math.random() * 2147483647)).toString();
        }

        if (key === ENV_VALUE_RANDOM_LONG) {
            return (Date.now()).toString();
        }

        return this.envKeyVar.get(key);
    }

    private iteratorGetEnvValue(postData : any, format : any) {
        for (let _key in postData) {
            let value = postData[_key];
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
                        this.iteratorGetEnvValue(_item, null);
                    } else {
                        let beginIndex = value[_index].indexOf("{{");
                        let endIndex = value[_index].indexOf("}}");
                        if (beginIndex >= 0 && endIndex >= 0 && beginIndex < endIndex) {
                            let envValueKey = value[_index].substring(beginIndex + 2, endIndex);
                            value[_index] = this.getVarByKey(envValueKey);
                        }
                    }
                }
            } else if (getType(value) === "Object") {
                this.iteratorGetEnvValue(value, null);
            } else if (getType(value) === "String") {
                let beginIndex = value.indexOf("{{");
                let endIndex = value.indexOf("}}");
                if (beginIndex >= 0 && endIndex >= 0 && beginIndex < endIndex) {
                    let envValueKey = value.substring(beginIndex + 2, endIndex);
                    value = this.getVarByKey(envValueKey);
                    postData[_key] = value;
                }
            }

            if (isJsonString) {
                postData[_key] = JSON.stringify(value);
            }
        }
    }

    private getApiHost() : string {
        this.getTipsByEnvVars();
        return this.envKeyVar.get(ENV_VALUE_API_HOST) as string;
    }

    private getTipsByEnvVars() : Set<string> {
        let envKeys = new Set<string>;
        for(let env_value of this.env_vars) {
            let tip_key = env_value[env_var_pname];
            envKeys.add(tip_key);
            this.envKeyVar.set(env_value[env_var_pname], env_value[env_var_pvalue]);
        }
        return this.appendEnvKeys(envKeys);
    }

    private appendEnvKeys(envKeys : Set<string>) : Set<string> {
        envKeys.add(ENV_VALUE_RANDOM_STRING);
        envKeys.add(ENV_VALUE_RANDOM_INT);
        envKeys.add(ENV_VALUE_RANDOM_LONG);
        envKeys.add(ENV_VALUE_CURRENT_DATETIME_STR);
        envKeys.add(ENV_VALUE_CURRENT_DATE_STR);
        envKeys.add(ENV_VALUE_CURRENT_DATETIME_INT);
        envKeys.add(ENV_VALUE_CURRENT_DATE_IMT);
        envKeys.add(ENV_VALUE_CURRENT_TIMESTAMP_SECOND);
        envKeys.add(ENV_VALUE_CURRENT_TIMESTAMP_MICRO);
        envKeys.add(ENV_VALUE_APP_VERSION);
        envKeys.add(ENV_VALUE_EMAIL);
        envKeys.add(ENV_VALUE_AGE);
        return envKeys;
    }

}