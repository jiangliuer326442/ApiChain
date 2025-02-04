import getCache from './index';

export const TABLE_NAME = "vip.mockserver.access";

export function setAccess(id:string, access:boolean) {
    let cache = getCache("");
    cache.set(TABLE_NAME + "." + id, access);
}

export function getAccess(id:string) : boolean {
    let cache = getCache("");
    let result = cache.get(TABLE_NAME + "." + id);
    if (result === null || result === "" || result === undefined) {
        result = false;
    }
    return result as boolean;
}