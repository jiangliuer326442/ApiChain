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
    DataTypeJsonObject
} from '@conf/global_config'
import { 
    getIteratorEnvValues, 
    getPrjEnvValues,
    getGlobalEnvValues,
} from '@act/env_value';
import { 
    getType, 
    isStringEmpty, 
    getNowdayjs,
} from '@rutil/index';
import {
    TABLE_FIELD_TYPE
} from "@rutil/json";

export default class {

    private env: string = ""; 

    private prj: string = "";

    private iteration: string = "";

    private unittest: string = "";

    private clientType: any = null;

    private cb: (envKeyVar: Array<any>) => void = () => {};

    private envKeyVarMap: Map<string, string> = new Map();

    private env_var_type = "";

    init(
        prj : string, 
        env : string, 
        iteration : string, 
        unittest : string,
        clientType : string,
        cb : (envKeyVar: Array<any>) => void
    ) {  
        if (this.prj !== prj || this.env !== env) {
            this.env_vars = [];
            this.envKeyVarMap = new Map();
        }
        if (env == null) {
            env = "";
        }
        this.prj = prj;
        this.env = env;
        this.iteration = iteration;
        this.unittest = unittest;
        this.clientType = clientType;
        this.cb = cb;
        if (isStringEmpty(this.prj) && isStringEmpty(this.iteration) && isStringEmpty(this.unittest)) {
            this.env_var_type = "global";
        } else if (!isStringEmpty(this.prj) && isStringEmpty(this.iteration) && isStringEmpty(this.unittest)) {
            this.env_var_type = "prj";
        } else if (!isStringEmpty(this.iteration) && isStringEmpty(this.unittest)) {
            this.env_var_type = "iterator";
        } else if (isStringEmpty(this.iteration) && !isStringEmpty(this.unittest)) {
            this.env_var_type = "unittest";
        }
    }

    initIterator(
        prj : string,
        iteration : string,
        clientType : any, 
    ) {  
        this.init(prj, "", iteration, "", clientType, env_vars => {})
    }

    initProject(
        prj : string,
        env : string,
        clientType : any,
    ) {
        this.init(prj, env, "", "", clientType, env_vars => {})
    }

    initGlobal(
        env : string,
        clientType : any,
    ) {
        this.init("", env, "", "", clientType, env_vars => {})
    }

    async getTips() : Promise<Set<string>> {
        if (this.envKeyVarMap.size === 0) {
            let env_vars = await this.getEnvValues(this.prj, this.env, this.iteration, "", "");
            this.envKeyVarMap = env_vars;
            this.cb(env_vars);
            return this.getTipsByEnvVars();
        } else {
            return this.getTipsByEnvVars();
        }
    }

    async getHost() : Promise<string> {
        if (this.envKeyVarMap.size === 0) {
            let env_vars = await this.getEnvValues(this.prj, this.env, this.iteration, "", "");
            this.envKeyVarMap = env_vars;
            return this.getApiHost();
        } else {
            return this.getApiHost();
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

        return this.envKeyVarMap.get(key);
    }

    private async getEnvValues(prj, env, iterator, unittest, pname) : Promise<Map<string, string>> {
        if (this.env_var_type === "iterator") {
            let result = await getIteratorEnvValues(iterator, prj, env, this.clientType);
            return result;
        } else if (this.env_var_type === "prj") {
            let result = await getPrjEnvValues(prj, env, this.clientType);
            return result;
        } else if (this.env_var_type === "global") {
            let result = await getGlobalEnvValues(env, this.clientType);
            return result;
        }
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
        return this.envKeyVarMap.get(ENV_VALUE_API_HOST) as string;
    }

    private getTipsByEnvVars() : Set<string> {
        let envKeys = new Set(this.envKeyVarMap.keys());
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