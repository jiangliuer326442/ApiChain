import os from 'os';
import { sm2 } from 'sm-crypto';

import { getDeviceId } from '../../util/util';

let cache_uid = "";
let cache_salt = "";
let cache_uname = "";

export function getUuid() : string {
    if (cache_uid === "") {
        const salt = getSalt();
        cache_uid = sm2.getPublicKeyFromPrivateKey(salt);
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
        cache_salt = deviceId.replaceAll("-", "");
    }

    return cache_salt;
}