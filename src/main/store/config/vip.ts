import { v4 as uuidv4 } from 'uuid';
import { sm2 } from 'sm-crypto';
import { ethers } from 'ethers';
import log from 'electron-log';
import crypto from 'crypto';

import getCache from './index';
import { getUuid, getSalt } from './user';
import { base64Decode, base64Encode, getPackageJson } from '../../util/util'
import { isStringEmpty } from '../../../renderer/util';

export const TABLE_NAME = "vip.status";

//最新的 VIP 订单号
const VIP_LATEST_TRADE = TABLE_NAME + ".tradeNo";

//最新的 VIP 使用的网络
const VIP_LATEST_CHAIN = TABLE_NAME + ".chainId";

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

export async function isShowCkcode() {
    let cache = getCache("");
    let myOrderNo = cache.get(VIP_LATEST_TRADE);
    let myProductName = cache.get(VIP_LATEST_PRODUCT);
    let payMethod = cache.get(VIP_LATEST_PAYMETHOD);
    if (!isStringEmpty(myOrderNo) && !isStringEmpty(myProductName)) {
        let returnType = null;
        if (myProductName.indexOf("product") >= 0) {
            returnType = "member";
        } else if (productName.indexOf("token") >= 0) {
            returnType = "chat_token";
        }
        let params = await getCheckCodeUrl();
        
        return [true, returnType, payMethod, params]
    }
    return [false, null, "", ""]
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

export function setContractChain(chainId : string) {
    let cache = getCache("");
    cache.set(VIP_LATEST_CHAIN, chainId);
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

export function genDecryptString(base64Str : string) {
    let cache = getCache("");
    const key = crypto.createHash('md5').update(getUuid()).digest('hex').substring(0, 16);
    const decipher = crypto.createDecipheriv('aes-128-ecb', Buffer.from(key), null);
    let decrypted = decipher.update(base64Str, 'base64', 'utf8');
    decrypted += decipher.final('utf8');
    let line = decrypted;
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

    let myOrderNo = cache.get(VIP_LATEST_TRADE);
    let myProductName = cache.get(VIP_LATEST_PRODUCT);
    if (myProductName !== productName) {
        return ["", "", ""];
    }
    if (myOrderNo !== orderNo) {
        return ["", "", ""];
    }
    clearVipCacheFlg();

    return [returnType, returnContent, orderNo];
}

export function clearVipCacheFlg() {
    let cache = getCache("");
    cache.delete(VIP_LATEST_TRADE);
    cache.delete(VIP_LATEST_PRODUCT);
    cache.delete(VIP_LATEST_PAYMETHOD);
}

export async function getCheckCodeUrl() {
    let cache = getCache("");
    let packageJson = await getPackageJson();
    let myOrderNo = cache.get(VIP_LATEST_TRADE);
    const plaintext = myOrderNo;
    const privateKey = getSalt();
    const publicKey = getUuid();
    const signature = sm2.doSignature(plaintext, privateKey, {
        hash: true,
        der: false  
    });
    const data = base64Encode(plaintext + "&" + publicKey + "&" + signature)
    let url = packageJson.payQueryUrl + data;
    return url;
}

export async function genCheckCodeUrl(productName : string, payMethod : string) {
    let outTradeNo = uuidv4() as string;
    let cache = getCache("");
    cache.set(VIP_LATEST_TRADE, outTradeNo);
    cache.set(VIP_LATEST_PRODUCT, productName);
    cache.set(VIP_LATEST_PAYMETHOD, payMethod);

    if (payMethod === "dollerpay") {
        let prams = genEncryptString2(outTradeNo, productName, payMethod);
        return prams;
    } else {
        let url = await genEncryptString(outTradeNo, productName, payMethod);
        return url;
    }
}

async function genEncryptString(outTradeNo : string, productName : string, payMethod : string) : Promise<string> {
    const privateKey = getSalt();
    const publicKey = getUuid();
    const plaintext = productName + ":" + payMethod + ":" + outTradeNo;
    const signature = sm2.doSignature(plaintext, privateKey, {
        hash: true,
        der: false  
    });
    const data = base64Encode(plaintext + "&" + publicKey + "&" + signature)
    let packageJson = await getPackageJson();
    return packageJson.payJumpUrl + data;
}

function genEncryptString2(outTradeNo : string, productName : string, payMethod : string) : string {
    const privateKey = getSalt();
    const publicKey = getUuid();
    const plaintext = productName + ":" + payMethod + ":" + outTradeNo;
    const signature = sm2.doSignature(plaintext, privateKey, {
        hash: true,
        der: false  
    });
    const data = base64Encode(plaintext + "&" + publicKey + "&" + signature)
    return data;
}