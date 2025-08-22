import { getMapValueOrDefault } from '@rutil/index';
import { getUsers } from '@act/user';
import {
    OS_ENV_VALUE_SET_URL,
    AI_TOKENS_GET_URL,
    OS_ENV_VALUE_GET_URL,
    AI_TOKENS_GAS_QUERY_URL,
    AI_TOKENS_CHANGE_URL,
    CLIENT_TYPE_TEAM 
} from '@conf/team';
import { sendTeamMessage } from '@act/message';

export async function getTeamSetting() {
    let ret1 = await sendTeamMessage(OS_ENV_VALUE_GET_URL, {key: "OPENAI_API_KEY"});
    let ret2 = await sendTeamMessage(OS_ENV_VALUE_GET_URL, {key: "OPENAI_BASE_URL"});
    return {
        apiKey: ret1 ? ret1 : "", 
        baseUrl: ret2 ? ret2 : "",
    };
}

export async function queryRemainGas(tokenName : string) {
    await sendTeamMessage(AI_TOKENS_GAS_QUERY_URL, {tokenName});
}

export async function enableToken(tokenName : string) {
    await sendTeamMessage(AI_TOKENS_CHANGE_URL, {tokenName});
}

export async function getTokens() {
    let users = await getUsers(CLIENT_TYPE_TEAM);
    let response = await sendTeamMessage(AI_TOKENS_GET_URL, {});
    let tokens = response.list;
    for (let token of tokens) {
        let createUid = token["create_uid"];
        token["create_name"] = getMapValueOrDefault(users, createUid, "");
    }
    return tokens;
}

export async function setBaseUrl(baseUrl : string) {
    await sendTeamMessage(OS_ENV_VALUE_SET_URL, {
        key: "OPENAI_BASE_URL",
        value: baseUrl
    });
}