import {
    OS_ENV_VALUE_SET_URL,
    TEAM_APPLY_USERS_URL,
} from '@conf/team';
import { sendTeamMessage } from '@act/message';

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

export async function getApplyUsers() {
    return await sendTeamMessage(TEAM_APPLY_USERS_URL, {});
}