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
    rsaEncrypt,
    rsaDecrypt
} from '../../util/util';
import {
    getClientType,
} from '../../store/config/team'

export default function (privateKey : string, publicKey : string, store : Store){

    ipcMain.on(ChannelsEncryptStr, async (event, action, content) => {

        if (action !== ChannelsEncryptEncrypt) return;

        let encryptContent = rsaEncrypt(content, publicKey);

        event.reply(ChannelsEncryptStr, ChannelsEncryptEncryptResult, encryptContent);

    });

    ipcMain.on(ChannelsEncryptStr, async (event, action, keyvarEncryptContent) => {
        if (action !== ChannelsEncryptDecrypt) return;

        const clientType = getClientType(store);
        let dataContent : any = {};

        Object.keys(keyvarEncryptContent).forEach(key => {
            const encryptContent = keyvarEncryptContent[key];
            if (clientType === CLIENT_TYPE_SINGLE) {
                dataContent[key] = rsaDecrypt(encryptContent, privateKey);
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