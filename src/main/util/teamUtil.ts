import semver from 'semver';
import Store from 'electron-store';

import { osLocale } from '../third_party/os-locale';
import { doRequest, getPackageJson, md5 } from './util'
import { isStringEmpty } from '../../renderer/util';
import {
    CONTENT_TYPE_URLENCODE
} from '../../config/contentType';
import {
    CONTENT_TYPE,
    SYS_CLIENT_VERSION,
    SYS_LANG,
    SYS_TEAM,
    SYS_COUNTRY,
    REQUEST_METHOD_POST,
    SYS_UID,
} from '../../config/global_config'
import {
    PING_URL,
} from '../../config/team'
import { 
    getTeamId,
    getClientHost
} from '../store/config/team';
import { langFormat } from '../../lang/i18n';

export async function pingHost(uuid : string, clientHost : string|null, store : Store) {
    if (clientHost === null) {
        clientHost = getClientHost(store);
    }
    if (isStringEmpty(clientHost)) {
        return "error";
    }
    let packageJson = await getPackageJson();
    let result = await postRequest2(uuid, clientHost, PING_URL, {}, store);
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

export async function postRequest(uuid : string, urlPrefix : string, postData : object, store : Store) {
    let clientHost = getClientHost(store);
    return await postRequest2(uuid, clientHost, urlPrefix, postData, store);
}

async function postRequest2(uuid : string, clientHost : string, urlPrefix : string, postData : object, store : Store) {
    let lang = await osLocale();
    let userLang = lang.split("-")[0];
    let userCountry = lang.split("-")[1];
    let packageJson = await getPackageJson();
    
    let headData : any = {}
    headData[CONTENT_TYPE] = CONTENT_TYPE_URLENCODE;
    headData[SYS_LANG] = userLang;
    headData[SYS_COUNTRY] = userCountry;
    headData[SYS_CLIENT_VERSION] = packageJson.version;
    headData[SYS_UID] = md5(uuid);
    headData[SYS_TEAM] = getTeamId(store);

    let url = clientHost + urlPrefix;

    let result = await doRequest(REQUEST_METHOD_POST, url, headData, postData, null, new Map());

    let response = result[1];
    let errorMessage = result[2];
    if (response != null) {
        if ('headers' in response) {
            if (response?.status !== 200) {
                errorMessage = response?.statusText;
            }
        } else {
            errorMessage = response[2];
            response = response[1];
            if (response != null) {
                if ('headers' in response) {
                    if (response?.status !== 200) {
                        errorMessage = response?.statusText;
                    }
                } else {
                    response = response[1];
                    if (response?.status !== 200) {
                        errorMessage = response?.statusText;
                    }
                }
            }
        }
    }


    let data = null;
    if (isStringEmpty(errorMessage)) {
        if (response.data.status === 1) {
            data = response.data.data;
        } else {
            errorMessage = response.data.message;
        }
    }
    return [errorMessage, data];
}