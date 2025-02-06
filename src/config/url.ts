import { getLang } from '../lang/i18n';

export function getProjectUrl() {
    if (getLang() === 'zh-CN' || getLang() === 'zh-TW') {
        return "https://gitee.com/onlinetool/mypostman";
    } else {
        return "https://github.com/jiangliuer326442/ApiChain";
    }
}

export function getWikiUrl() {
    if (getLang() === 'zh-CN' || getLang() === 'zh-TW') {
        return getProjectUrl() + "/wikis/pages";
    } else {
        return getProjectUrl() + "/wiki";
    }
}

export function getWikiWeatherReportUrl() {
    if (getLang() === 'zh-CN' || getLang() === 'zh-TW') {
        return getWikiUrl() + "?sort_id=12874416&doc_id=6200813";
    } else {
        return getWikiUrl() + "/%E5%85%A5%E9%97%A8%E6%95%99%E7%A8%8B1%EF%BC%9A%E7%94%A8%E4%BB%BB%E6%84%8F%E5%9F%8E%E5%B8%82%E6%9F%A5%E8%AF%A2%E5%A4%A9%E6%B0%94%E9%A2%84%E6%8A%A5-ApiChain%E5%9F%BA%E6%9C%AC%E4%BD%BF%E7%94%A8";
    }
}

export function getWikiUserRegisterUrl() {
    if (getLang() === 'zh-CN' || getLang() === 'zh-TW') {
        return getWikiUrl() + "?sort_id=13336691&doc_id=6200813";
    } else {
        return getWikiUrl() + "/%E5%85%A5%E9%97%A8%E6%95%99%E7%A8%8B2%EF%BC%9A%E7%94%A8%E6%88%B7%E6%B3%A8%E5%86%8C%E7%99%BB%E5%BD%95%E9%89%B4%E6%9D%83-ApiChain%E9%AB%98%E9%98%B6%E4%BD%BF%E7%94%A8";
    }
}

export function getWikiConceptUrl() {
    if (getLang() === 'zh-CN' || getLang() === 'zh-TW') {
        return getWikiUrl() + "?sort_id=12874413&doc_id=6200813";
    } else {
        return getWikiUrl() + "/%E7%9B%B8%E5%85%B3%E6%9C%AF%E8%AF%AD";
    }
}

export function getWikiEnv() {
    if (getLang() === 'zh-CN' || getLang() === 'zh-TW') {
        return getWikiUrl() + "?sort_id=12874443&doc_id=6200813";
    } else {
        return getWikiUrl() + "/%E7%8E%AF%E5%A2%83%E5%8F%98%E9%87%8F";
    }
}

export function getWikiSendRequest() {
    if (getLang() === 'zh-CN' || getLang() === 'zh-TW') {
        return getWikiUrl() + "?sort_id=12874444&doc_id=6200813";
    } else {
        return getWikiUrl() + "/%E5%8F%91%E9%80%81%E7%BD%91%E7%BB%9C%E8%AF%B7%E6%B1%82";
    }
}

export function getWikiUnittest() {
    if (getLang() === 'zh-CN' || getLang() === 'zh-TW') {
        return getWikiUrl() + "?sort_id=12874445&doc_id=6200813";
    } else {
        return getWikiUrl() + "/%E7%BC%96%E5%86%99%E8%BF%AD%E4%BB%A3%E5%8D%95%E6%B5%8B%E7%94%A8%E4%BE%8B";
    }
}

export function getWikiProject() {
    if (getLang() === 'zh-CN' || getLang() === 'zh-TW') {
        return getWikiUrl() + "?sort_id=12874446&doc_id=6200813";
    } else {
        return getWikiUrl() + "/%E4%BB%8E%E8%BF%AD%E4%BB%A3%E5%88%B0%E9%A1%B9%E7%9B%AE";
    }
}

export function getDemoDatabaseFile() {
    if (getLang() === 'zh-CN' || getLang() === 'zh-TW') {
        return STATIC_URL + "demo_database_zh.json";
    } else {
        return STATIC_URL + "demo_database_en.json";
    }
}

const HOST_PAY = "http://pay.fanghailiang.cn/pay/";

const STATIC_URL = "http://cdn.fanghailiang.cn/";

export const PayJumpUrl = HOST_PAY + "jump/";

export const PayQueryUrl = HOST_PAY + "query/";

export const DownloadDemoPostMan = STATIC_URL + "demo_postman.json";