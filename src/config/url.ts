import { getLang } from '../lang/i18n';

export function getProjectUrl() {
    console.log("getLang", getLang());
    if (getLang() === 'zh-CN') {
        return "https://gitee.com/onlinetool/mypostman";
    } else {
        return "https://github.com/jiangliuer326442/ApiChain";
    }
}

export function getWikiUrl() {
    return getProjectUrl() + "/wikis"
}

export function getWikiWeatherReportUrl() {
    return getWikiUrl() + "/%E5%85%A5%E9%97%A8%E6%95%99%E7%A8%8B1%EF%BC%9A%E7%94%A8%E4%BB%BB%E6%84%8F%E5%9F%8E%E5%B8%82%E6%9F%A5%E8%AF%A2%E5%A4%A9%E6%B0%94%E9%A2%84%E6%8A%A5-ApiChain%E5%9F%BA%E6%9C%AC%E4%BD%BF%E7%94%A8";
}

export function getWikiUserRegisterUrl() {
    return getWikiUrl() + "/%E5%85%A5%E9%97%A8%E6%95%99%E7%A8%8B2%EF%BC%9A%E7%94%A8%E6%88%B7%E6%B3%A8%E5%86%8C%E7%99%BB%E5%BD%95%E9%89%B4%E6%9D%83-ApiChain%E9%AB%98%E9%98%B6%E4%BD%BF%E7%94%A8";
}

export function getWikiConceptUrl() {
    return getWikiUrl() + "/%E7%9B%B8%E5%85%B3%E6%9C%AF%E8%AF%AD";
}

const HOST_PAY = "http://pay.fanghailiang.cn/pay/";

const STATIC_URL = "http://cdn.fanghailiang.cn/";

export const PayJumpUrl = HOST_PAY + "jump/";

export const PayQueryUrl = HOST_PAY + "query/";

export const DownloadDemoDatabase = STATIC_URL + "demo_database.json";

export const DownloadDemoPostMan = STATIC_URL + "demo_postman.json";