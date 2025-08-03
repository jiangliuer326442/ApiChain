import os from 'os';

import { md5, getDeviceId } from '../../util/util';

let cache_uid = "";
let cache_salt = "";
let cache_uname = "";

export function getUuid() : string {
    if (cache_uid === "") {
        const deviceId = getDeviceId();
        cache_uid = deviceId;
    }

    return cache_uid;
}

export function getUname() : string {
    if (cache_uname === "") {
        const username = os.userInfo().username;
        cache_uname = username;
    }

    return cache_uname;
}

export function getSalt() : string {
    if (cache_salt === "") {
        const deviceId = getDeviceId();
        cache_salt = md5(deviceId).substring(0, 16);
    }

    return cache_salt;
}