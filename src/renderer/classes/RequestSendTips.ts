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
    getProjectKeys,
    getIteratorKeys,
    getUnittestKeys,
} from '@act/keys';
import { 
    getIteratorEnvValues, 
    getPrjEnvValues,
    getUnittestEnvValues,
} from '@act/env_value';
import {
    getNowdayjs,
} from '@rutil/index';

export default class {

    private env_var_type: 'project' | 'iterator' | 'unittest'; 

    private prj: string = "";

    private teamId: string = "";

    private iteration: string = "";

    private unittest: string = "";

    private clientType: string = "";

    private env_keys = [];

    private envvars = new Map<string, string>();

    init(
        type: 'project' | 'iterator' | 'unittest',
        prj : string, 
        iteration : string, 
        unittest : string,
        clientType : string,
        teamId : string
    ) {  
        this.env_var_type = type;

        if (this.prj !== prj || this.iteration !== iteration) {
            this.env_keys = [];
            this.envvars = new Map<string, string>();
        }
        this.prj = prj;
        this.teamId = teamId;
        this.iteration = iteration;
        this.unittest = unittest;
        this.clientType = clientType;
    }

    async getTips() : Promise<Set<string>> {
        if (this.env_keys.length === 0) {
            let envKeys;
            if (this.env_var_type === "project") {
              envKeys = await getProjectKeys(this.clientType, this.teamId, this.prj);
            } else if (this.env_var_type === "iterator") {
              envKeys = await getIteratorKeys(this.clientType, this.teamId, this.iteration, this.prj);
            } else if (this.env_var_type === "unittest") {
              envKeys = await getUnittestKeys(this.clientType, this.teamId, this.unittest, this.prj);
            }
            this.env_keys = envKeys;
            console.log("envKeys", envKeys);

            return this.getTipsByEnvVars();
        } else {
            return this.getTipsByEnvVars();
        }
    }

    async getVarByKey(key : string, env : string) : string | number | undefined {
        if (this.envvars.size === 0) {
            if (this.env_var_type === "project") {
                this.envvars = await getPrjEnvValues(this.prj, env, this.teamId, this.clientType);
            } else if (this.env_var_type === "iterator") {
                this.envvars = await getIteratorEnvValues(this.iteration, this.prj, env, this.clientType);
            } else if (this.env_var_type === "unittest") {
                this.envvars = await getUnittestEnvValues(this.unittest, this.prj, env, this.clientType);
            }
        }

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

        return this.envvars.get(key);
    }
    
    private getTipsByEnvVars() : Set<string> {
        let envKeys = new Set(this.env_keys);
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