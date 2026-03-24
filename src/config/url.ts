import { getLang } from '../lang/i18n';

export function getProjectUrl() {
    if (IS_CHINA_BUILD || (getLang() === 'zh-CN' || getLang() === 'zh-TW')) {
        return "https://gitee.com/onlinetool/apichain";
    } else {
        return "https://github.com/jiangliuer326442/ApiChain";
    }
}

export function getWikiTeamVersion() {
    if (getLang() === 'zh-CN' || getLang() === 'zh-TW') {
        return getWikiUrl() + "?sort_id=14607635&doc_id=6200813";
    } else {
        return getWikiUrl() + "/2.Team-Edition";
    }
}

export function getWikiAiAssistant() {
    if (getLang() === 'zh-CN' || getLang() === 'zh-TW') {
        return getWikiUrl() + "?sort_id=14607636&doc_id=6200813";
    } else {
        return getWikiUrl() + "/3.AI-Assistant";
    }
}

export function getWikiEnv() {
    if (getLang() === 'zh-CN' || getLang() === 'zh-TW') {
        return getWikiUrl() + "?sort_id=12874443&doc_id=6200813";
    } else {
        return getWikiUrl() + "/6.-Environment-variables";
    }
}

export function getWikiSendRequest() {
    if (getLang() === 'zh-CN' || getLang() === 'zh-TW') {
        return getWikiUrl() + "?sort_id=12874444&doc_id=6200813";
    } else {
        return getWikiUrl() + "/7.Sending-network-requests";
    }
}

export function getWikiUnittest() {
    if (getLang() === 'zh-CN' || getLang() === 'zh-TW') {
        return getWikiUrl() + "?sort_id=12874445&doc_id=6200813";
    } else {
        return getWikiUrl() + "/8.-Writing-iterative-unit-test-cases";
    }
}

export function getWikiProject() {
    if (getLang() === 'zh-CN' || getLang() === 'zh-TW') {
        return getWikiUrl() + "?sort_id=12874446&doc_id=6200813";
    } else {
        return getWikiUrl() + "/9.-From-Iteration-to-Project";
    }
}

function getWikiUrl() {
    if (getLang() === 'zh-CN' || getLang() === 'zh-TW') {
        return getProjectUrl() + "/wikis/pages";
    } else {
        return getProjectUrl() + "/wiki";
    }
}