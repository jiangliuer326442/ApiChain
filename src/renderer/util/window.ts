import { ChannelsOpenWindowStr } from '../../config/channel';

export function createWindow(windowUrl : string, windowId : string) {
    return new Promise((resolve, reject) => {
        let windowListener = window.electron.ipcRenderer.on(ChannelsOpenWindowStr, (receivedWindowId) => {
            if(windowId === receivedWindowId) {
                windowListener(); //收到消息，移除监听器
                resolve({});
            }
        });

        window.electron.ipcRenderer.sendMessage(ChannelsOpenWindowStr, windowId, windowUrl);
    });
}