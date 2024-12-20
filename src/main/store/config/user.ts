import log from 'electron-log';

import getCache from './index';
import { isStringEmpty } from '../../../renderer/util';

const TABLE_NAME = "user";
let cache_uuid = "";
let cache_uname = "";
let cache_rtime = 0;

export function registerUser(uuid:string, salt:string) {
    cache_uuid = uuid;
    cache_uname = require('os').userInfo().username;
    cache_rtime = Date.now();
    let cache = getCache(salt);
    cache.set(TABLE_NAME + ".uuid", cache_uuid);
    cache.set(TABLE_NAME + '.username', cache_uname);
    cache.set(TABLE_NAME + '.registerTime', cache_rtime);
    log.debug(cache.get(TABLE_NAME));
}

export function getUUID() : string {
    if(cache_uuid !== "") {
        return cache_uuid;
    }
    let cache = getCache("");
    let uuid = cache.get(TABLE_NAME + ".uuid") as string;
    cache_uuid = uuid;
    return cache_uuid;
}

export function getUName() : string {
    if(cache_uname !== "") {
        return cache_uname;
    }
    let cache = getCache("");
    cache_uname = cache.get(TABLE_NAME + ".username") as string;
    return cache_uname;
}

export function getRTime() : number {
    if(cache_rtime !== 0) {
        return cache_rtime;
    }
    let cache = getCache("");
    cache_rtime = cache.get(TABLE_NAME + ".registerTime") as number;
    return cache_rtime;
}