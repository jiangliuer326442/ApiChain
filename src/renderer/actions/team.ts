import {
    OS_ENV_VALUE_SET_URL,
    TEAM_APPLY_USERS_URL,
    TEAM_APPLY_URL,
    TEAM_APPLY_REFUSE_URL,
    TEAM_MEMBERS_URL,
    TEAM_MEMBER_UNAME_URL,
    TEAM_MEMBER_AWAY_URL,
    TEAM_MEMBER_ADMIN_URL,
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

export async function getTeamMembers(teamId: string) {
    return await sendTeamMessage(TEAM_MEMBERS_URL, {teamId});
}

export async function applyUser(tuid: string, tname: string) {
    return await sendTeamMessage(TEAM_APPLY_URL, {
        tuid: tuid,
        tname: tname,
    });
}

export async function refuseUser(tuid: string, refuseReason: string) {
    return await sendTeamMessage(TEAM_APPLY_REFUSE_URL, {
        tuid,
        refuseReason,
    });
}

export async function setMemberName(teamId: string, tuid: string, tname: string) {
    return await sendTeamMessage(TEAM_MEMBER_UNAME_URL, {
        teamId,
        tuid,
        tname,
    });
}

export async function setMemberAway(teamId: string, tuid: string) {
    return await sendTeamMessage(TEAM_MEMBER_AWAY_URL, {
        teamId,
        tuid,
    });
}

export async function setMemberAdmin(teamId: string, tuid: string) {
    return await sendTeamMessage(TEAM_MEMBER_ADMIN_URL, {
        teamId,
        tuid,
    });
}