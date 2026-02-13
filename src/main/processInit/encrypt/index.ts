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
    fernetEncrypt,
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
            const key = md5(getTeamId(store));
            console.log("key", key);
            encryptContent = fernetEncrypt(content, key)
        }

        event.reply(ChannelsEncryptStr, ChannelsEncryptEncryptResult, encryptContent);

    });

    ipcMain.on(ChannelsEncryptStr, async (event, action, encryptContent) => {

        if (action !== ChannelsEncryptDecrypt) return;

        const clientType = getClientType(store);
        let content;
        if (clientType === CLIENT_TYPE_SINGLE) {
            content = rsaDecrypt2(encryptContent, privateKey);
        } else {
            const key = md5(getTeamId(store));
            content = fernetDecrypt(encryptContent, key);
        }

        event.reply(ChannelsEncryptStr, ChannelsEncryptDecryptResult, content);
        
    });

}