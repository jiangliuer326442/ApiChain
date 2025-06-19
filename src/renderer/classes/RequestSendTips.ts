import { v4 as uuidv4 } from 'uuid';

import { 
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
    getIteratorEnvValues, 
    getPrjEnvValues,
    getGlobalEnvValues,
} from '@act/env_value';
import { 
    isStringEmpty, 
    getNowdayjs,
} from '@rutil/index';

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
        env : string,
        iteration : string,
        clientType : any, 
    ) {  
        this.init(prj, env, iteration, "", clientType, env_vars => {})
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