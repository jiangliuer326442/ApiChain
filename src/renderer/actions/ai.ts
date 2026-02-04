import { getMapValueOrDefault } from '@rutil/index';
import { sendTeamMessage } from '@act/message';
import { getUsers } from '@act/user';
import { 
    CLIENT_TYPE_TEAM,
    AI_TOKENS_GET_URL,
    AI_LANGUAGE_MODELS_URL, 
    AI_VECTOR_MODELS_URL, 
    AI_RE_VECTOR_MODELS_URL,
    AI_TOKENS_CHANGE_URL,
    AI_TOKENS_GAS_QUERY_URL,
    AI_BIG_MODELS_URL,
} from '@conf/team';

export async function getBigModels() {
    return await sendTeamMessage(AI_LANGUAGE_MODELS_URL, {});
}

export async function getTeamSetting() {
    return await sendTeamMessage(AI_BIG_MODELS_URL, {key: "OPENAI_API_KEY"});
}

export async function vectorModels() {
    return await sendTeamMessage(AI_VECTOR_MODELS_URL, {});
}

export async function reVectorModels() {
    return await sendTeamMessage(AI_RE_VECTOR_MODELS_URL, {});
}

export async function enableToken(tokenName : string) {
    await sendTeamMessage(AI_TOKENS_CHANGE_URL, {tokenName});
}

export async function queryRemainGas(tokenName : string) {
    await sendTeamMessage(AI_TOKENS_GAS_QUERY_URL, {tokenName});
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