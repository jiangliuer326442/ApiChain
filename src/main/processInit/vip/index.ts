import { ipcMain } from 'electron';

import { 
    ChannelsVipStr, 
    ChannelsVipGenUrlStr, 
    ChannelsVipCkCodeStr, 
    ChannelsVipDoCkCodeStr,
    ChannelsVipCloseCkCodeStr,
} from '../../../config/channel';
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
} from '../../store/config/vip';
import { isStringEmpty } from '../../../renderer/util';
import { getPackageJson } from '../../util/util';

export default function (){

    ipcMain.on(ChannelsVipStr, (event, action, productName, payMethod) => {

        if (action !== ChannelsVipGenUrlStr) return;

        if (productName !== "product9" && productName !== "product10" && productName !== "product11" && productName !== "product12" && productName !== "product13") {
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
            }
        }

        let url = genCheckCodeUrl(productName, payMethod);
        event.reply(ChannelsVipStr, ChannelsVipGenUrlStr, money, url);
    });

    ipcMain.on(ChannelsVipStr, (event, action) => {

        if (action !== ChannelsVipCkCodeStr) return;

        let packageJson = getPackageJson();

        let url = "";
        //拿订单号
        let tradeNo = getOutTradeNo();
        if (!isStringEmpty(tradeNo)) {
            url = packageJson.payQueryUrl + tradeNo;
        }
        let product = getLatestProduct();

        event.reply(ChannelsVipStr, ChannelsVipCkCodeStr, product, url);
    });

    ipcMain.on(ChannelsVipStr, (event, action) => {
        if (action !== ChannelsVipCloseCkCodeStr) return;

        clearVipCacheFlg();
    });

    ipcMain.on(ChannelsVipStr, (event, action, ckCode) => {
        if (action !== ChannelsVipDoCkCodeStr) return;

        let days = genDecryptString(ckCode);
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

    });
}