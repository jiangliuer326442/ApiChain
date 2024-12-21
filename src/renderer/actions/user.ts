import { TABLE_USER_NAME, TABLE_USER_FIELDS } from '../../config/db';

let user_uid = TABLE_USER_FIELDS.FIELD_UID;
let user_ip = TABLE_USER_FIELDS.FIELD_IP;
let user_uname = TABLE_USER_FIELDS.FIELD_UNAME;
let user_rtime = TABLE_USER_FIELDS.FIELD_REGTIME;
let user_country = TABLE_USER_FIELDS.FIELD_COUNTRY;
let user_lang = TABLE_USER_FIELDS.FIELD_LANG;
let user_ctime = TABLE_USER_FIELDS.FIELD_CTIME;
let user_delFlg = TABLE_USER_FIELDS.FIELD_DELFLG;

export async function getUser(uid : string) {
    let user = await window.db[TABLE_USER_NAME]
    .where(user_uid).equals(uid)
    .first();
    if (user !== undefined && user[user_delFlg] === 0) {
        return user;
    }
    return null;
}

export async function getUsers() {
    let users = await window.db[TABLE_USER_NAME]
    .where(user_delFlg).equals(0)
    .reverse()
    .toArray();
    let map = new Map();
    
    users.forEach(item => {
        map.set(item[user_uid], item[user_uname]);
    });
    return map;
}

export async function setUserName(uid : string, uname : string) {
    let user = await window.db[TABLE_USER_NAME]
    .where(user_uid).equals(uid)
    .first();
    if (user === undefined || user[user_delFlg] === 1) {
        return;
    }
    user[user_uname] = uname;
    console.debug(user);
    await window.db[TABLE_USER_NAME].put(user);
}

export async function addUser(uid : string, uname : string, ip : string, rtime : number, country : string, lang : string) {
    let user : any = {};
    user[user_uid] = uid;
    user[user_uname] = uname;
    user[user_ip] = ip;
    user[user_rtime] = rtime;
    user[user_country] = country;
    user[user_lang] = lang;
    user[user_ctime] = Date.now();
    user[user_delFlg] = 0;
    console.debug(user);
    await window.db[TABLE_USER_NAME].put(user);
}