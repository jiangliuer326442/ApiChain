import { isStringEmpty } from '../../../renderer/util';
import { CLIENT_TYPE_SINGLE } from '../../../config/team';

import getCache from './index';

export const TABLE_NAME = "team.info";

//版本类型 single 单机版 team 联网版
const TEAM_CLIENT_TYPE = TABLE_NAME + ".type";

//服务器地址
const TEAM_CLIENT_HOST = TABLE_NAME + ".host";

//团队ID
const TEAM_CLIENT_TEAMID = TABLE_NAME + ".teamId";

export function getClientType() : string {
    let cache = getCache("");
    let clientType = cache.get(TEAM_CLIENT_TYPE) as string;
    if (isStringEmpty(clientType)) {
        return CLIENT_TYPE_SINGLE;
    }
    return clientType;
}

export function getClientHost() : string {
    let cache = getCache("");
    let clientHost = cache.get(TEAM_CLIENT_HOST) as string;
    if (isStringEmpty(clientHost)) {
        return "";
    }
    return clientHost;
}

export function getTeamId() : string {
    let cache = getCache("");
    let clientTeam = cache.get(TEAM_CLIENT_TEAMID) as string;
    if (isStringEmpty(clientTeam)) {
        return "";
    }
    return clientTeam;
}

export function setClientHost(clientHost : string) {
    let cache = getCache("");
    cache.set(TEAM_CLIENT_HOST, clientHost);
}

export function setClientInfo(clientType : string, teamId : string) {
    let cache = getCache("");
    cache.set(TEAM_CLIENT_TYPE, clientType);
    cache.set(TEAM_CLIENT_TEAMID, teamId);
}