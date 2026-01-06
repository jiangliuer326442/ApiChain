import os from 'os';

let cache_uname = "";

export function getUname() : string {
    if (cache_uname === "") {
        const username = os.userInfo().username;
        cache_uname = username;
    }

    return cache_uname;
}