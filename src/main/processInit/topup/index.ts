import { ipcMain, shell } from 'electron';
import log from 'electron-log';

import contractConfig from '../../../config/contract.json';
import { 
    ChannelsVipStr, 
    ChannelsVipGenUrlStr, 
    ChannelsVipCkCodeStr, 
    ChannelsVipDoCkCodeStr,
    ChannelsVipCloseCkCodeStr,
} from '../../../config/channel';
import { 
    AI_TOKEN_SET_URL, 
} from '../../../config/team';
import { getUuid } from '../../store/config/user';
import {
    getOutTradeNo, 
    isVip, 
    setExpireTime, 
    getExpireTime, 
    getLatestProduct, 
    genDecryptString,
    incBuyTimes, 
    clearVipCacheFlg,
    genCheckCodeUrl,
    getCheckCodeUrl,
} from '../../store/config/vip';
import { isStringEmpty } from '../../../renderer/util';
import { 
    postRequest
} from '../../util/teamUtil'

const { usdEthRate } = contractConfig;

export default function (){

    ipcMain.on(ChannelsVipStr, async (event, action, productName, payMethod) => {

        if (action !== ChannelsVipGenUrlStr) return;

        if (
            productName !== "product9" && 
            productName !== "product10" && 
            productName !== "product11" && 
            productName !== "product12" && 
            productName !== "product13" &&
            productName !== "token1" && 
            productName !== "token2" && 
            productName !== "token3"
        ) {
            return ;
        }
        if (payMethod !== "alipay" && payMethod !== "wxpay" && payMethod !== "dollerpay") {
            return ;
        }

        let money = "1000";
        if (payMethod === "dollerpay") {
            if (productName === "product9") {
                money = "2";
            } else if (productName === "product10") {
                money = "14";
            } else if (productName === "product11") {
                money = "28";
            }
            if (productName.indexOf("product") >= 0) {
                money = money * 1000000 * usdEthRate / 1000000;
            }
            event.reply(ChannelsVipStr, ChannelsVipGenUrlStr, money);
        } else {
            if (productName === "product9") {
                money = "10";
            } else if (productName === "product10") {
                money = "100";
            } else if (productName === "product11") {
                money = "200";
            } else if (productName === "product12") {
                money = "1";
            } else if (productName === "product13") {
                money = "5";
            } else if (productName === "token1") {
                money = "10";
            } else if (productName === "token2") {
                money = "50";
            } else if (productName === "token3") {
                money = "100";
            }
            let url = await genCheckCodeUrl(productName, payMethod);
            await shell.openExternal(url)
            event.reply(ChannelsVipStr, ChannelsVipGenUrlStr, money);
        }
    });

    ipcMain.on(ChannelsVipStr, async (event, action) => {

        if (action !== ChannelsVipCkCodeStr) return;

        let url = "";
        //拿订单号
        let tradeNo = getOutTradeNo();
        if (!isStringEmpty(tradeNo)) {
            url = await getCheckCodeUrl();
        }
        let product = getLatestProduct();

        event.reply(ChannelsVipStr, ChannelsVipCkCodeStr, product, url);
    });

    ipcMain.on(ChannelsVipStr, (event, action) => {
        if (action !== ChannelsVipCloseCkCodeStr) return;

        clearVipCacheFlg();
    });

    ipcMain.on(ChannelsVipStr, async (event, action, ckCode) => {
        if (action !== ChannelsVipDoCkCodeStr) return;

        let ret = genDecryptString(ckCode);
        if (ret[0] == "member") {
            let days = ret[1];
            if (isStringEmpty(days)) {
                //核销失败
                event.reply(ChannelsVipStr, ChannelsVipDoCkCodeStr, false);
                return;
            }
            let expireTime = 0;
            if (isVip()) {
                expireTime = getExpireTime();
                expireTime += 86400 * 1000 * Number(days);
            } else {
                expireTime = Date.now() + 86400 * 1000 * Number(days);
            }
    
            //设置会员过期时间
            setExpireTime(expireTime);
            //累计购买次数
            let buyTimes = incBuyTimes();
    
            //核销成功
            event.reply(ChannelsVipStr, ChannelsVipDoCkCodeStr, true, getUuid(), expireTime, buyTimes);
        } else if (ret[0] == "chat_token") {
            let apiKey = ret[1];
            let orderNo = ret[2];
            await postRequest(AI_TOKEN_SET_URL, {
                token: apiKey,
                orderNo,
            })
            //核销成功
            event.reply(ChannelsVipStr, ChannelsVipDoCkCodeStr, true, getUuid(), apiKey, orderNo);
        }

    });
}