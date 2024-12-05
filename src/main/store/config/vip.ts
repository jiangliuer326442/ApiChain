import log from 'electron-log';
import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';

import { getUUID } from './user';
import { getSalt } from '../../processInit/uuid';
import { base64Encode, base64Decode } from '../../util/util';

import getCache from './index';

const TABLE_NAME = "vip.status";

//最新的 VIP 订单号
const VIP_LATEST_TRADE = TABLE_NAME + ".tradeNo";

//最新的 商品
const VIP_LATEST_PRODUCT = TABLE_NAME + ".product";

//会员过期时间
const VIP_END_TIME = TABLE_NAME + ".endTime";

let key : any = null;
let iv : any = null;

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

export function isVip() {
    let expireTime = getExpireTime();
    return (expireTime >= Date.now());
}

export function getExpireTime() {
    let cache = getCache("");
    let expireTime = cache.get(VIP_END_TIME);
    if (expireTime === null) {
        return 0;
    }
    return Number(expireTime);
}

export function setExpireTime(expireTime : number) {
    let cache = getCache("");
    cache.set(VIP_END_TIME, expireTime);
}

export function genDecryptString(base64Str : string) : string {
    let line = decrypt(base64Str);
    let lineArr = line.split(":");
    let productName = lineArr[0];
    let productDays = lineArr[1];
    let timestamp = lineArr[2];
    let payMethod = lineArr[3];
    let orderNo = lineArr[4];
    let uid = lineArr[5];

    let myUid = getUUID();
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
    cache.delete(VIP_LATEST_TRADE);
    cache.delete(VIP_LATEST_PRODUCT);

    return productDays;
}

export function genEncryptString(productName : string, payMethod : string) : string {
    let outTradeNo = uuidv4() as string;
    let param = getUUID();

    let cache = getCache("");
    cache.set(VIP_LATEST_TRADE, outTradeNo);
    cache.set(VIP_LATEST_PRODUCT, productName);

    let encryptString = encrypt(productName + ":" + payMethod + ":" + outTradeNo + ":" + param);
    
    let myKey = key.toString("hex");
    let myIv = iv.toString("hex");
    let data = myKey + "||" + myIv + "||" + encryptString;
    const buffer = Buffer.from(data);
    let ret = buffer.toString('base64');
    return ret;
}

//解密
function decrypt(base64Str : string) : string {
    let encryptedText = Buffer.from(base64Str, 'base64');
    genKeyIv();
    let decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
}

//加密
function encrypt(content : string) : string {
    genKeyIv();
    let cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
    let encrypted = cipher.update(content);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    let result = encrypted.toString("hex");
    return result;

}

function genKeyIv() {
    if (key === null && iv === null) {
        let uid = getUUID();
        let salt = getSalt();
    
        key = crypto.scryptSync(uid, salt, 32);
        iv = crypto.scryptSync(salt, uid, 16);  
    }
}