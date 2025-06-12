import { v4 as uuidv4 } from 'uuid';

import getCache from './index';
import { getUuid } from './user';
import { base64Decode, base64Encode, getPackageJson } from '../../util/util'
import { isStringEmpty } from '../../../renderer/util';

export const TABLE_NAME = "vip.status";

//最新的 VIP 订单号
const VIP_LATEST_TRADE = TABLE_NAME + ".tradeNo";

//最新的 商品
const VIP_LATEST_PRODUCT = TABLE_NAME + ".product";

//最新的 支付方式
const VIP_LATEST_PAYMETHOD = TABLE_NAME + ".paymethod";

//购买次数
const VIP_BUY_TIMES = TABLE_NAME + ".buy.times";

//会员过期时间
const VIP_END_TIME = TABLE_NAME + ".endTime";

export function getOutTradeNo() : string {
    let cache = getCache("");
    let latestTradeNo = cache.get(VIP_LATEST_TRADE) as string;
    if (latestTradeNo === null) {
        return "";
    }
    return latestTradeNo;
}

export function getLatestProduct() : string {
    let cache = getCache("");
    let latestProductNo = cache.get(VIP_LATEST_PRODUCT) as string;
    if (latestProductNo === null) {
        return "";
    }
    return latestProductNo;
}

export function getLatestPayMethod() : string {
    let cache = getCache("");
    let latestPayMethod = cache.get(VIP_LATEST_PAYMETHOD) as string;
    if (latestPayMethod === null) {
        return "";
    }
    return latestPayMethod;
}

export function isShowCkcode() {
    let cache = getCache("");
    let myOrderNo = cache.get(VIP_LATEST_TRADE);
    let myProductName = cache.get(VIP_LATEST_PRODUCT);
    return !isStringEmpty(myOrderNo) && !isStringEmpty(myProductName);
}

export function isVip() {
    let expireTime = getExpireTime();
    return (expireTime >= Date.now());
}

export function getBuyTimes() {
    let cache = getCache("");
    let boughtTimes = cache.get(VIP_BUY_TIMES);
    if (typeof boughtTimes === 'number') {
        return boughtTimes;
    }
    if (isStringEmpty(boughtTimes)) {
        return 0;
    }
    return Number(boughtTimes);
}

export function incBuyTimes() {
    let oldBuyTimes = getBuyTimes();
    let newBuyTimes = oldBuyTimes + 1;
    let cache = getCache("");
    cache.set(VIP_BUY_TIMES, newBuyTimes);
    return newBuyTimes;
}

export function getExpireTime() {
    let cache = getCache("");
    let expireTime = cache.get(VIP_END_TIME);
    if (expireTime === null) {
        return 0;
    }
    return Number(expireTime);
}

export function giftVip(days : number) {
    let expireTime = Date.now() + 86400 * 1000 * days;
    setExpireTime(expireTime);
}

export function setExpireTime(expireTime : number) {
    let cache = getCache("");
    cache.set(VIP_END_TIME, expireTime);
}

export function genDecryptString(base64Str : string) : string {
    let line = base64Decode(base64Str);
    if (isStringEmpty(line)) {
        return "";
    }
    let lineArr = line.split(":");
    let productName = lineArr[0];
    let productDays = lineArr[1];
    let timestamp = lineArr[2];
    let payMethod = lineArr[3];
    let orderNo = lineArr[4];
    let uid = lineArr[5];

    let myUid = getUuid();

    if (uid !== myUid) {
        return "";
    }

    let cache = getCache("");
    let myOrderNo = cache.get(VIP_LATEST_TRADE);
    let myProductName = cache.get(VIP_LATEST_PRODUCT);
    if (myProductName !== productName) {
        return "";
    }
    if (myOrderNo !== orderNo) {
        return "";
    }
    clearVipCacheFlg();

    return productDays;
}

export function clearVipCacheFlg() {
    let cache = getCache("");
    cache.delete(VIP_LATEST_TRADE);
    cache.delete(VIP_LATEST_PRODUCT);
    cache.delete(VIP_LATEST_PAYMETHOD);
}

export function getCheckCodeUrl() {
    let cache = getCache("");
    let packageJson = getPackageJson();
    let myOrderNo = cache.get(VIP_LATEST_TRADE);
    let url = packageJson.payQueryUrl + myOrderNo;
    return url;
}

export function genCheckCodeUrl(productName : string, payMethod : string) {
    let outTradeNo = uuidv4() as string;
    let cache = getCache("");
    cache.set(VIP_LATEST_TRADE, outTradeNo);
    cache.set(VIP_LATEST_PRODUCT, productName);
    cache.set(VIP_LATEST_PAYMETHOD, payMethod);

    let url = genEncryptString(outTradeNo, productName, payMethod);
    return url;
}

function genEncryptString(outTradeNo : string, productName : string, payMethod : string) : string {
    let param = getUuid();
    let packageJson = getPackageJson();

    let encryptString = productName + ":" + payMethod + ":" + outTradeNo + ":" + param;
    let data = base64Encode(encryptString)
    let url = packageJson.payJumpUrl + data;
    return url;
}