import { ipcMain } from 'electron';

import { PayJumpUrl, PayQueryUrl } from '../../../config/global_config';
import { 
    ChannelsVipStr, 
    ChannelsVipGenUrlStr, 
    ChannelsVipCkCodeStr, 
    ChannelsVipDoCkCodeStr 
} from '../../../config/channel';
import { getUuid } from '../../store/config/user';
import { 
    genEncryptString, 
    getOutTradeNo, 
    isVip, 
    setExpireTime, 
    getExpireTime, 
    getLatestProduct, 
    genDecryptString,
    incBuyTimes, 
} from '../../store/config/vip';
import { isStringEmpty } from '../../../renderer/util';

export default function (){

    ipcMain.on(ChannelsVipStr, (event, action, productName, payMethod) => {

        if (action !== ChannelsVipGenUrlStr) return;

        if (productName !== "product4" && productName !== "product5" && productName !== "product6" && productName !== "product7" && productName !== "product8") {
            return ;
        }
        if (payMethod !== "alipay" && payMethod !== "wxpay") {
            return ;
        }

        let money = "1000";
        if (productName === "product4") {
            money = "10";
        } else if (productName === "product5") {
            money = "100";
        } else if (productName === "product6") {
            money = "200";
        } else if (productName === "product7") {
            money = "1";
        } else if (productName === "product8") {
            money = "5";
        }

        let encryptString = genEncryptString(productName, payMethod);
        let url = PayJumpUrl + encryptString
        event.reply(ChannelsVipStr, ChannelsVipGenUrlStr, money, url);
    });

    ipcMain.on(ChannelsVipStr, (event, action) => {

        if (action !== ChannelsVipCkCodeStr) return;

        let url = "";
        //拿订单号
        let tradeNo = getOutTradeNo();
        if (!isStringEmpty(tradeNo)) {
            url = PayQueryUrl + tradeNo;
        }
        let product = getLatestProduct();

        event.reply(ChannelsVipStr, ChannelsVipCkCodeStr, product, url);
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