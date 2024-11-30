import { ipcMain, IpcMainEvent } from 'electron';
import axios from 'axios';
import fs from 'fs-extra';
import log from 'electron-log';

import { 
    ChannelsAxioBreidgeStr, 
    ChannelsAxioBreidgeSendStr, 
    ChannelsAxioBreidgeReplyStr 
} from '../../../config/channel';

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
                if ('headers' in response) {
                
                } else {
                    response = response[1];
    
                }
            }
        }

        if (Object.keys(response.headers).length > 0) {
            for(let _key in response.headers) {
                if (_key === "date" || _key === "connection" || _key === "transfer-encoding" 
                || _key === "cache-control" || _key === "last-modified" || _key === "server" 
                || _key === "vary") {
                    delete response.headers[_key];
                }
            }
        }

        if (response?.status !== 200) {
            errorMessage = response?.statusText;
        }

        event.reply(ChannelsAxioBreidgeStr, ChannelsAxioBreidgeReplyStr, url, targetUrl, response?.status, (etime - btime), errorMessage, Object.fromEntries(cookieMap), response?.headers, response?.data);
    });
}

async function doRequest(method : any, url : string, headData : any, postData : any, fileData : any, cookieMap : any) {
    let response = null;
    let errorMessage = "";
    let hasError = false;

    if (method === 'get') {
        response = await axios.get(url, {
            headers: headData,
            maxRedirects: 0,
        }).catch(async error => {
            hasError = true;
            // 检查错误是否是重定向
            if ('response' in error && 'status' in error.response && error.response.status === 302) {
                handleCookie(error.response, cookieMap);
                url = error.response.headers.location;
                return await doRequest(method, url, headData, postData, fileData, cookieMap);
            } else {
                errorMessage = error.message;
                return [url, error.response, error.message];
            }
        });
    } else if (method === 'post') {
        if (fileData === null) {
            response = await axios.post(url, postData, {
                headers: headData,
                maxRedirects: 0,
            }).catch(async error => {
                hasError = true;
                // 检查错误是否是重定向
                if ('response' in error && 'status' in error.response && error.response.status === 302) {
                    handleCookie(error.response, cookieMap);
                    url = error.response.headers.location;
                    return await doRequest(method, url, headData, postData, fileData, cookieMap);
                } else {
                    errorMessage = error.message;
                    return [url, error.response, error.message];
                }
            });
        } else {
            let formData = new FormData();

            for (let _key in postData) {
                formData.append(_key, postData[_key]);
            }

            for (let _key in fileData) {
                let _file = fileData[_key];
                let _path = _file.path;
                const blob = fs.readFileSync(_path, null);
                const blobFile = new Blob([blob], { type: _file.type });  
                formData.append(_key, blobFile, _file.name);
            }

            response = await axios.post(url, formData, {
                headers: headData,
                maxRedirects: 0,
            }).catch(async error => {
                hasError = true;
                // 检查错误是否是重定向
                if ('response' in error && 'status' in error.response && error.response.status === 302) {
                    handleCookie(error.response, cookieMap);
                    url = error.response.headers.location;
                    return await doRequest(method, url, headData, formData, fileData, cookieMap);
                } else {
                    errorMessage = error.message;
                    return [url, error.response, error.message];
                }
            });
        }
    }
    if (response != null && !hasError) { 
        handleCookie(response, cookieMap);
    }
    return [url, response, ""];
}

function handleCookie(response : any, cookieMap : any) {
    if ('headers' in response && 'set-cookie' in response.headers) {
        for (let cookieRow of response.headers['set-cookie']) {
            let cookieArr = cookieRow.split('; ')[0].split("=");
            cookieMap.set(cookieArr[0], cookieArr[1]);
        }
    }
}