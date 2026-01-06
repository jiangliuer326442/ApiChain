import { v4 as uuidv4 } from 'uuid';
import Store from 'electron-store';

import { getPackageJson, rsaEncrypt, fernetDecrypt } from '../../util/util'
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

export function getOutTradeNo(store : Store) : string {
    let latestTradeNo = store.get(VIP_LATEST_TRADE) as string;
    if (latestTradeNo === null) {
        return "";
    }
    return latestTradeNo;
}

export function getLatestProduct(store : Store) : string {
    let latestProductNo = store.get(VIP_LATEST_PRODUCT) as string;
    if (latestProductNo === null) {
        return "";
    }
    return latestProductNo;
}

export function getLatestPayMethod(store : Store) : string {
    let latestPayMethod = store.get(VIP_LATEST_PAYMETHOD) as string;
    if (latestPayMethod === null) {
        return "";
    }
    return latestPayMethod;
}

export async function isShowCkcode(privateKey : string, publicKey : string, store : Store) {
    let myOrderNo = store.get(VIP_LATEST_TRADE);
    let myProductName = store.get(VIP_LATEST_PRODUCT);
    let payMethod = store.get(VIP_LATEST_PAYMETHOD);
    if (!isStringEmpty(myOrderNo) && !isStringEmpty(myProductName)) {
        let returnType = null;
        if (myProductName.indexOf("product") >= 0) {
            returnType = "member";
        } else if (myProductName.indexOf("token") >= 0) {
            returnType = "chat_token";
        }
        let params = await getCheckCodeUrl(privateKey, publicKey, store);
        
        return [true, returnType, payMethod, params]
    }
    return [false, null, "", ""]
}

export function isVip(store : Store) {
    let expireTime = getExpireTime(store);
    return (expireTime >= Date.now());
}

export function getBuyTimes(store : Store) {
    let boughtTimes = store.get(VIP_BUY_TIMES);
    if (typeof boughtTimes === 'number') {
        return boughtTimes;
    }
    if (isStringEmpty(boughtTimes)) {
        return 0;
    }
    return Number(boughtTimes);
}

export function incBuyTimes(store : Store) {
    let oldBuyTimes = getBuyTimes(store);
    let newBuyTimes = oldBuyTimes + 1;
    store.set(VIP_BUY_TIMES, newBuyTimes);
    return newBuyTimes;
}

export function getExpireTime(store : Store) {
    let expireTime = store.get(VIP_END_TIME);
    if (expireTime === null) {
        return 0;
    }
    return Number(expireTime);
}

export function giftVip(days : number, store : Store) {
    let expireTime = Date.now() + 86400 * 1000 * days;
    setExpireTime(expireTime, store);
}

export function setExpireTime(expireTime : number, store : Store) {
    store.set(VIP_END_TIME, expireTime);
}

export function genDecryptString(base64Str : string, uid : string, store : Store) {
    let line = fernetDecrypt(base64Str, uid);
    if (isStringEmpty(line)) {
        return ["", "", ""];
    }
    let lineArr = line.split(":");
    let productName = lineArr[0];
    let returnType = "";
    let returnContent = "";
    if (productName.indexOf("product") >= 0) {
        let productDays = lineArr[1];
        returnType = "member";
        returnContent = productDays;
    } else if (productName.indexOf("token") >= 0) {
        let apiKey = lineArr[1];
        returnType = "chat_token";
        returnContent = apiKey;
    }
    let orderNo = lineArr[4];

    let myOrderNo = store.get(VIP_LATEST_TRADE);
    let myProductName = store.get(VIP_LATEST_PRODUCT);
    if (myProductName !== productName) {
        return ["", "", ""];
    }
    if (myOrderNo !== orderNo) {
        return ["", "", ""];
    }
    clearVipCacheFlg(store);

    return [returnType, returnContent, orderNo];
}

export function clearVipCacheFlg(store : Store) {
    store.delete(VIP_LATEST_TRADE);
    store.delete(VIP_LATEST_PRODUCT);
    store.delete(VIP_LATEST_PAYMETHOD);
}

export async function getCheckCodeUrl(privateKey : string, publicKey : string, store : Store) {
    let packageJson = await getPackageJson();
    let myOrderNo = store.get(VIP_LATEST_TRADE);
    let data = rsaEncrypt(myOrderNo, publicKey, privateKey);
    let url = packageJson.payQueryUrl + data;
    return url;
}

export async function genCheckCodeUrl(productName : string, payMethod : string, privateKey : string, publicKey : string, store : Store) {
    let outTradeNo = uuidv4() as string;
    store.set(VIP_LATEST_TRADE, outTradeNo);
    store.set(VIP_LATEST_PRODUCT, productName);
    store.set(VIP_LATEST_PAYMETHOD, payMethod);

    return await genEncryptString(outTradeNo, productName, payMethod, privateKey, publicKey);
}

async function genEncryptString(outTradeNo : string, productName : string, payMethod : string, privateKey : string, publicKey : string) : Promise<string> {
    const plaintext = productName + ":" + payMethod + ":" + outTradeNo;
    let data = rsaEncrypt(plaintext, publicKey, privateKey);
    let packageJson = await getPackageJson();
    return packageJson.payJumpUrl + data;
}