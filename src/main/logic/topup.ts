import Store from 'electron-store';
import { 
    AI_TOKEN_SET_URL, 
} from '../../config/team';
import {
    isVip,
    setExpireTime, 
    getExpireTime, 
    incBuyTimes, 
    genDecryptString
} from '../store/config/vip'
import { 
    postRequest
} from '../util/teamUtil'
import {
    getUid
} from '../util/util';
import { isStringEmpty } from '../../renderer/util';

export async function topUpCallback(
    ckCode : string, 
    privateKey : string, 
    memberFailFunc : () => void, //会员失败回调
    memberSuccessFunc : (uid : string, expireTime : number, buyTimes : number) => void, //会员成功回调
    aiSuccessFunc : (uid : string, apiKey : string, orderNo : string) => void, //ai key购买成功回调
    store: Store
) {
    let uid = getUid(privateKey);
    let ret = genDecryptString(ckCode, uid, store);
    if (ret[0] == "member") {
        let days = ret[1];
        if (isStringEmpty(days)) {
            //核销失败
            memberFailFunc();
            return;
        }
        let expireTime = 0;
        if (isVip(store)) {
            expireTime = getExpireTime(store);
            expireTime += 86400 * 1000 * Number(days);
        } else {
            expireTime = Date.now() + 86400 * 1000 * Number(days);
        }

        //设置会员过期时间
        setExpireTime(expireTime, store);
        //累计购买次数
        let buyTimes = incBuyTimes(store);

        //核销成功
        memberSuccessFunc(uid, expireTime, buyTimes);
    } else if (ret[0] == "chat_token") {
        let apiKey = ret[1];
        let orderNo = ret[2];
        await postRequest(privateKey, AI_TOKEN_SET_URL, {
            token: apiKey,
            orderNo,
        }, store)
        //核销成功
        aiSuccessFunc(uid, apiKey, orderNo);
    }
}