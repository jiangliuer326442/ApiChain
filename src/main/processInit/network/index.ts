import { ipcMain, IpcMainEvent } from 'electron';

import { 
    ChannelsAxioBreidgeStr, 
    ChannelsAxioBreidgeSendStr, 
    ChannelsAxioBreidgeReplyStr,
    ChannelsAxioTeanSendStr,
    ChannelsAxioTeamReplyStr,
} from '../../../config/channel';

import { doRequest } from '../../util/util';
import { postRequest } from '../../util/teamUtil';

export default function() {

    ipcMain.on(ChannelsAxioBreidgeStr, async (event : IpcMainEvent, action, method : string, url : string, headData, postData, fileData) => {
        if(action !== ChannelsAxioBreidgeSendStr) return;
        let cookieMap = new Map();
        let btime = Date.now();
        let result = await doRequest(method, url, headData, postData, fileData, cookieMap);
        let etime = Date.now();
        let targetUrl = result[0];
        let response = result[1];
        let errorMessage = result[2];

        if (response != null) {
            if ('headers' in response) {
                
            } else {
                response = response[1];
                if (response != null) {
                    if ('headers' in response) {
                    
                    } else {
                        response = response[1];
        
                    }
                }
            }
        }

        if (response != null && Object.keys(response.headers).length > 0) {
            for(let _key in response.headers) {
                if (_key === "date" || _key === "connection" || _key === "transfer-encoding" 
                || _key === "cache-control" || _key === "last-modified" || _key === "server" 
                || _key === "vary" || _key === "set-cookie" || _key === "access-control-allow-credentials"
                || _key === "access-control-allow-headers" || _key === "access-control-allow-methods"
                || _key === "access-control-allow-origin" || _key === "access-control-max-age") {
                    delete response.headers[_key];
                }
            }
        }

        if (response?.status !== 200) {
            errorMessage = response?.statusText;
        }

        event.reply(ChannelsAxioBreidgeStr, ChannelsAxioBreidgeReplyStr, url, targetUrl, response?.status, (etime - btime), errorMessage, Object.fromEntries(cookieMap), response?.headers, response?.data);
    });

    ipcMain.on(ChannelsAxioBreidgeStr, async (event : IpcMainEvent, action, url : string, postData) => {
        if(action !== ChannelsAxioTeanSendStr) return;

        let result = await postRequest(url, postData);

        let errorMessage = result[0];
        let response = result[1];

        event.reply(ChannelsAxioBreidgeStr, ChannelsAxioTeamReplyStr, url, errorMessage, response);
    });
}