import semver from 'semver';

import { osLocale } from '../third_party/os-locale';
import { doRequest, getPackageJson } from './util'
import { isStringEmpty } from '../../renderer/util';
import {
    CONTENT_TYPE_URLENCODE
} from '../../config/contentType';
import {
    CONTENT_TYPE,
    SYS_CLIENT_VERSION,
    SYS_LANG,
    SYS_COUNTRY,
    SYS_UID,
} from '../../config/global_config'
import {
    PING_URL,
} from '../../config/team'
import { 
    getClientHost
} from '../store/config/team';
import { 
    getUuid
} from '../store/config/user'
import { langFormat } from '../../lang/i18n';

export async function pingHost(clientHost : string|null) {
    if (clientHost === null) {
        clientHost = getClientHost();
    }
    let packageJson = await getPackageJson();
    let result = await postRequest2(clientHost, PING_URL, {});
    let errorMessage = result[0];
    let serverVersion = result[1];
    if (isStringEmpty(errorMessage)) {
        let minServerVersion = packageJson.minServerVersion;
        if (semver.lt(serverVersion, minServerVersion)) {
            return langFormat("low server version", {
                "serverVersion": serverVersion,
                "minServerVersion": minServerVersion,
            });
        }
    }

    return errorMessage;
}

export async function postRequest(urlPrefix : string, postData : object) {
    let clientHost = getClientHost();
    return await postRequest2(clientHost, urlPrefix, postData);
}

async function postRequest2(clientHost : string, urlPrefix : string, postData : object) {
    let lang = await osLocale();
    let userLang = lang.split("-")[0];
    let userCountry = lang.split("-")[1];
    let packageJson = await getPackageJson();
    
    let headData : any = {}
    headData[CONTENT_TYPE] = CONTENT_TYPE_URLENCODE;
    headData[SYS_LANG] = userLang;
    headData[SYS_COUNTRY] = userCountry;
    headData[SYS_CLIENT_VERSION] = packageJson.version;
    headData[SYS_UID] = getUuid();

    let url = clientHost + urlPrefix;

    let result = await doRequest("post", url, headData, postData, null, new Map());

    let response = result[1];
    let errorMessage = result[2];
    let data = null;
    if (response?.status !== 200) {
        errorMessage = response?.statusText;
    }
    if (isStringEmpty(errorMessage)) {
        if (response.data.status === 1) {
            data = response.data.data;
        } else {
            errorMessage = response.data.message;
        }
    }
    return [errorMessage, data];
}