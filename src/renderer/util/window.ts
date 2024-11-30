import { v4 as uuidv4 } from 'uuid';

import { ChannelsOpenWindowStr } from '../../config/channel';

export function createWindow(windowUrl : string) {
    let windowId = uuidv4();
    window.electron.ipcRenderer.sendMessage(ChannelsOpenWindowStr, windowId, windowUrl);
    return windowId;
}