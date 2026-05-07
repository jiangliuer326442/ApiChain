import Store from 'electron-store';

import { getTeamId } from './team';

import { md5, fernetDecrypt } from '../../util/util';
import { isStringEmpty } from '../../../renderer/util';

export const TABLE_NAME = "ai.info";

const AI_PROVIDER = TABLE_NAME + ".provider";

const AI_BASEURL = TABLE_NAME + ".baseUrl";

const AI_CHAT_MODEL = TABLE_NAME + ".chatModel";

const AI_API_KEY = TABLE_NAME + ".apiKey";

export function setLangguageModel(langguageModel : any, store : Store) {
    const key = md5(getTeamId(store));
    let encryptContent = langguageModel.apiKey;
    let decryptContent = fernetDecrypt(encryptContent, key);

    store.set(AI_PROVIDER, langguageModel.provider);
    store.set(AI_BASEURL, langguageModel.baseUrl);
    store.set(AI_CHAT_MODEL, langguageModel.chatModel);
    store.set(AI_API_KEY, decryptContent);
}

export function cleanLangguageModel(store : Store) {
    store.delete(AI_PROVIDER);
    store.delete(AI_BASEURL);
    store.delete(AI_CHAT_MODEL);
    store.delete(AI_API_KEY);
}

export function getLangguageModel(store : Store) {
    const provider = store.get(AI_PROVIDER);
    if (isStringEmpty(provider)) {
        return null;
    }
    const baseUrl = store.get(AI_BASEURL);
    const chatModel = store.get(AI_CHAT_MODEL);
    const apiKey = store.get(AI_API_KEY);
    return {
        provider,
        baseUrl,
        chatModel,
        apiKey
    };
}