import Store from 'electron-store';
import { ipcMain, shell } from 'electron';
import { 
    ChannelsVipStr, 
    ChannelsVipGenUrlStr, 
    ChannelsVipCkCodeStr, 
    ChannelsVipDoCkCodeStr,
    ChannelsVipCloseCkCodeStr,
} from '../../../config/channel';
import {
    getOutTradeNo, 
    clearVipCacheFlg,
    genCheckCodeUrl,
    getCheckCodeUrl,
} from '../../store/config/vip';
import { isStringEmpty } from '../../../renderer/util';
import { topUpCallback } from '../../logic/topup';

export default function (privateKey : string, publicKey : string, store: Store){

    ipcMain.on(ChannelsVipStr, async (event, action, productName, payMethod, contractChain) => {

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
        let url = await genCheckCodeUrl(productName, payMethod, privateKey, publicKey, store);
        await shell.openExternal(url)
        event.reply(ChannelsVipStr, ChannelsVipGenUrlStr, money);
    });

    ipcMain.on(ChannelsVipStr, async (event, action) => {

        if (action !== ChannelsVipCkCodeStr) return;

        //拿订单号
        let tradeNo = getOutTradeNo(store);
        if (isStringEmpty(tradeNo)) {
            return;
        }
        const url = await getCheckCodeUrl(store);
        await shell.openExternal(url)
    });

    ipcMain.on(ChannelsVipStr, (event, action) => {
        if (action !== ChannelsVipCloseCkCodeStr) return;

        clearVipCacheFlg(store);
    });

    ipcMain.on(ChannelsVipStr, async (event, action, ckCode) => {
        if (action !== ChannelsVipDoCkCodeStr) return;
        topUpCallback(ckCode, privateKey, 
            () => {
                event.reply(ChannelsVipStr, ChannelsVipDoCkCodeStr, false);
            },
            (uid, expireTime, buyTimes) => {
                event.reply(ChannelsVipStr, ChannelsVipDoCkCodeStr, true, uid, expireTime, buyTimes);
            },
            (uid, apiKey, orderNo) => {
                event.reply(ChannelsVipStr, ChannelsVipDoCkCodeStr, true, uid, apiKey, orderNo);
            },
            store);
    });
}