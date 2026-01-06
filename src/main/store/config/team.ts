import Store from 'electron-store';

import { isStringEmpty } from '../../../renderer/util';
import { CLIENT_TYPE_SINGLE } from '../../../config/team';

export const TABLE_NAME = "team.info";

//版本类型 single 单机版 team 联网版
const TEAM_CLIENT_TYPE = TABLE_NAME + ".type";

//服务器地址
const TEAM_CLIENT_HOST = TABLE_NAME + ".host";

//团队ID
const TEAM_CLIENT_TEAMID = TABLE_NAME + ".teamId";

export function getClientType(store : Store) : string {
    let clientType = store.get(TEAM_CLIENT_TYPE) as string;
    if (isStringEmpty(clientType)) {
        return CLIENT_TYPE_SINGLE;
    }
    return clientType;
}

export function getClientHost(store : Store) : string {
    let clientHost = store.get(TEAM_CLIENT_HOST) as string;
    if (isStringEmpty(clientHost)) {
        return "";
    }
    return clientHost;
}

export function getTeamId(store : Store) : string {
    let clientTeam = store.get(TEAM_CLIENT_TEAMID) as string;
    if (isStringEmpty(clientTeam)) {
        return "";
    }
    return clientTeam;
}

export function setClientHost(clientHost : string, store : Store) {
    store.set(TEAM_CLIENT_HOST, clientHost);
}

export function setClientInfo(clientType : string, teamId : string, store : Store) {
    store.set(TEAM_CLIENT_TYPE, clientType);
    store.set(TEAM_CLIENT_TEAMID, teamId);
}