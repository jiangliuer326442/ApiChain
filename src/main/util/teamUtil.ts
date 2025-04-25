import { osLocale } from '../third_party/os-locale';
import { doRequest } from './util'
import { isStringEmpty } from '../../renderer/util';
import {
    CONTENT_TYPE_URLENCODE
} from '../../config/contentType';
import {
    CONTENT_TYPE,
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

export async function pingHost(clientHost : string|null) {
    if (clientHost === null) {
        clientHost = getClientHost();
    }
    if (isStringEmpty(clientHost)) {
        return false;
    }
    let url = clientHost + PING_URL;
    let result = await doRequest("get", url, {}, {}, null, new Map());

    let response = result[1];

    if (response?.status === 200) {
        if (response.data.status === 1) {
            return true;
        }
    }
    return false;
}

export async function postRequest(urlPrefix : string, postData : object) {

    let clientHost = getClientHost();

    let lang = await osLocale();
    let userLang = lang.split("-")[0];
    let userCountry = lang.split("-")[1];
    
    let headData : any = {}
    headData[CONTENT_TYPE] = CONTENT_TYPE_URLENCODE;
    headData[SYS_LANG] = userLang;
    headData[SYS_COUNTRY] = userCountry;
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