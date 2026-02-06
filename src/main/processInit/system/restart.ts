import { app, ipcMain } from 'electron';

import { ChannelsRestartAppStr } from '../../../config/channel';

export default function (){
    ipcMain.on(ChannelsRestartAppStr, (event) => {
          app.relaunch();
          app.exit(0);
    });
}