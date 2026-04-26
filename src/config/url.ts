import { getLang } from '../lang/i18n';

export function getProjectUrl() {
    if (IS_CHINA_BUILD || (getLang() === 'zh-CN' || getLang() === 'zh-TW')) {
        return "https://gitee.com/onlinetool/apichain";
    } else {
        return "https://github.com/jiangliuer326442/ApiChain";
    }
}

export function getDbDownloadUrl() {
    if (getLang() === 'zh-CN' || getLang() === 'zh-TW') {
        return "https://gitee.com/onlinetool/apichain/raw/main/db/dump-apichain-zh.sql";
    } else {
        return "https://raw.githubusercontent.com/jiangliuer326442/ApiChain/refs/heads/main/db/dump-apichain-zh.sql";
    }
}

export function getWikiAiAssistant() {
    if (getLang() === 'zh-CN' || getLang() === 'zh-TW') {
        return getWikiUrl() + "/AI%20%E5%9C%A8%E6%8E%A5%E5%8F%A3%E7%AE%A1%E7%90%86%E5%B7%A5%E5%85%B7%E4%B8%AD%E7%9A%84%E9%9D%A9%E6%96%B0%E5%BA%94%E7%94%A8%E4%B8%8E%E4%BD%BF%E7%94%A8%E6%8C%87%E5%8D%97";
    } else {
        return getWikiUrl() + "/6.-Innovative-Applications-and-Usage-Guide-of-AI-in-API-Management-Tools";
    }
}

export function getWikiSendRequest() {
    if (getLang() === 'zh-CN' || getLang() === 'zh-TW') {
        return getWikiUrl() + "/%E4%B8%8D%E5%8F%AA%E6%98%AF%E5%8F%91%E8%AF%B7%E6%B1%82%EF%BC%8C%E6%9B%B4%E6%98%AF%E5%85%A8%E9%93%BE%E8%B7%AF%E7%B2%BE%E7%BB%86%E5%8C%96%E7%AE%A1%E7%90%86";
    } else {
        return getWikiUrl() + "/4.-More-Than-Just-Sending-Requests:-Full%E2%80%90Link-Refined-Management";
    }
}

export function getWikiUnittest() {
    if (getLang() === 'zh-CN' || getLang() === 'zh-TW') {
        return getWikiUrl() + "/%E5%91%8A%E5%88%AB%E2%80%9C%E5%8D%95%E8%BA%AB%E7%8B%97%E2%80%9D%E5%BC%8F%E6%8E%A5%E5%8F%A3%E6%B5%8B%E8%AF%95%20";
    } else {
        return getWikiUrl() + "/5.-Say-Goodbye-to-%22Lone-Wolf%22-API-Testing";
    }
}

function getWikiUrl() {
    if (getLang() === 'zh-CN' || getLang() === 'zh-TW') {
        return getProjectUrl() + "/wikis";
    } else {
        return getProjectUrl() + "/wiki";
    }
}