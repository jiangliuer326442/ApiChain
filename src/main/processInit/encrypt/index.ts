import Store from 'electron-store';
import { ipcMain } from 'electron';

import { 
    ChannelsEncryptStr, 
    ChannelsEncryptEncrypt, 
    ChannelsEncryptEncryptResult, 
    ChannelsEncryptDecrypt,
    ChannelsEncryptDecryptResult,
} from '../../../config/channel';
import {
    CLIENT_TYPE_SINGLE
} from '../../../config/team';
import {
    md5,
    fernetDecrypt,
    rsaEncrypt2,
    rsaDecrypt2
} from '../../util/util';
import {
    getClientType,
    getTeamId,
} from '../../store/config/team'

export default function (privateKey : string, publicKey : string, store : Store){

    ipcMain.on(ChannelsEncryptStr, async (event, action, content) => {

        if (action !== ChannelsEncryptEncrypt) return;

        const clientType = getClientType(store);
        let encryptContent;
        if (clientType === CLIENT_TYPE_SINGLE) {
            encryptContent = rsaEncrypt2(content, publicKey);
        } else {
            //团队版服务端加密去
            // const key = md5(getTeamId(store));
            // encryptContent = fernetEncrypt(content, key)
            encryptContent = content;
        }

        event.reply(ChannelsEncryptStr, ChannelsEncryptEncryptResult, encryptContent);

    });

    ipcMain.on(ChannelsEncryptStr, async (event, action, keyvarEncryptContent) => {
        if (action !== ChannelsEncryptDecrypt) return;

        const clientType = getClientType(store);
        let dataContent : any = {};

        Object.keys(keyvarEncryptContent).forEach(key => {
            const encryptContent = keyvarEncryptContent[key];
            if (clientType === CLIENT_TYPE_SINGLE) {
                dataContent[key] = rsaDecrypt2(encryptContent, privateKey);
            } else {
                //团队版服务端解密去
                // const key = md5(getTeamId(store));
                // content = fernetDecrypt(encryptContent, key);
                dataContent[key] = encryptContent;
            }
        });

        event.reply(ChannelsEncryptStr, ChannelsEncryptDecryptResult, dataContent);
        
    });

}