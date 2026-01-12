import { getMapValueOrDefault } from '@rutil/index';
import { getUsers } from '@act/user';
import {
    OS_ENV_VALUE_SET_URL,
    AI_TOKENS_GET_URL,
    AI_BIG_MODELS_URL,
    AI_TOKENS_GAS_QUERY_URL,
    AI_TOKENS_CHANGE_URL,
    CLIENT_TYPE_TEAM 
} from '@conf/team';
import { sendTeamMessage } from '@act/message';

export async function getTeamSetting() {
    return await sendTeamMessage(AI_BIG_MODELS_URL, {key: "OPENAI_API_KEY"});
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

export async function setProvider(provider : string) {
    await sendTeamMessage(OS_ENV_VALUE_SET_URL, {
        key: "CHAT_PROVIDER",
        value: provider
    });
}

export async function setBaseUrl(provider : string, baseUrl : string) {
    await sendTeamMessage(OS_ENV_VALUE_SET_URL, {
        key: provider + "_OPENAI_BASE_URL",
        value: baseUrl
    });
}

export async function setChatModel(provider : string, chatModel : string) {
    await sendTeamMessage(OS_ENV_VALUE_SET_URL, {
        key: provider + "_OPENAI_CHAT_MODEL",
        value: chatModel
    });
}

export async function setApiKey(provider : string, apiKey : string) {
    await sendTeamMessage(OS_ENV_VALUE_SET_URL, {
        key: provider + "_OPENAI_API_KEY",
        value: apiKey
    });
}