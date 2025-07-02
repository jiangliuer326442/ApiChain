import { TABLE_USER_NAME, TABLE_USER_FIELDS } from '@conf/db';
import {
    CLIENT_TYPE_SINGLE,
    CLIENT_TYPE_TEAM,
    USERS_ALL_URL,
    USERS_GET_URL,
    USERS_SET_MY_UNAME_URL,
    USERS_SET_MY_INFO_URL
} from '@conf/team';
import { sendTeamMessage } from '@act/message';

let user_uid = TABLE_USER_FIELDS.FIELD_UID;
let user_ip = TABLE_USER_FIELDS.FIELD_IP;
let user_uname = TABLE_USER_FIELDS.FIELD_UNAME;
let user_country = TABLE_USER_FIELDS.FIELD_COUNTRY;
let user_lang = TABLE_USER_FIELDS.FIELD_LANG;
let user_ctime = TABLE_USER_FIELDS.FIELD_CTIME;
let user_delFlg = TABLE_USER_FIELDS.FIELD_DELFLG;

export async function getUser(clientType : string, uid : string) {
    if (clientType === CLIENT_TYPE_SINGLE) {
        let user = await window.db[TABLE_USER_NAME]
        .where(user_uid).equals(uid)
        .first();
        if (user !== undefined && user[user_delFlg] === 0) {
            return user;
        }
        return null;
    } else {
        return await sendTeamMessage(USERS_GET_URL, {uid});
    }
}

export async function getUsers(clientType : string) {
    let users;

    if (clientType === CLIENT_TYPE_SINGLE) {
        users = await window.db[TABLE_USER_NAME]
        .where(user_delFlg).equals(0)
        .reverse()
        .toArray();
    } else {
        let ret = await sendTeamMessage(USERS_ALL_URL, {});
        users = ret.list;
    }

    let map = new Map();
    users.forEach(item => {
        map.set(item[user_uid], item[user_uname]);
    });
    return map;
}

export async function setUserName(teamId : string, clientType : string, uid : string, uname : string) {
    if (clientType === CLIENT_TYPE_TEAM) {
        await sendTeamMessage(USERS_SET_MY_UNAME_URL, {uname});
    }

    let user = await window.db[TABLE_USER_NAME]
    .where(user_uid).equals(uid)
    .reverse()
    .first();
    if (user === undefined || user[user_delFlg] === 1) {
        return;
    }
    user[user_uname] = uname;
    if (clientType === CLIENT_TYPE_SINGLE) {
        user.upload_flg = 0;
        user.team_id = "";
    } else {
        user.upload_flg = 1;
        user.team_id = teamId;
    }
    await window.db[TABLE_USER_NAME].put(user);
}

export async function addUser(uid : string, uname : string, ip : string, country : string, lang : string) {
    let user : any = {};
    user[user_uid] = uid;
    user[user_uname] = uname;
    user[user_ip] = ip;
    user[user_country] = country;
    user[user_lang] = lang;
    user[user_ctime] = Date.now();
    user[user_delFlg] = 0;
    user.upload_flg = 0;
    user.team_id = "";
    await window.db[TABLE_USER_NAME].put(user);
}

export async function setUserCountryLangIp(clientType : string, teamId : string, uid : string, country : string, lang : string, ip : string) {
    if (clientType === CLIENT_TYPE_TEAM) {
        await sendTeamMessage(USERS_SET_MY_INFO_URL, {ip, country, lang});
    }
    let user = await getUser(clientType, uid);
    user[user_delFlg] = 0;
    user[user_country] = country;
    user[user_lang] = lang;
    user[user_ip] = ip;
    if (clientType === CLIENT_TYPE_SINGLE) {
        user.upload_flg = 0;
        user.team_id = "";
    } else {
        user.upload_flg = 1;
        user.team_id = teamId;
    }
    await window.db[TABLE_USER_NAME].put(user);
}