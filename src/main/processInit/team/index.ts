import { ipcMain } from 'electron';

import { 
    ChannelsTeamStr, 
    ChannelsTeamSetInfoStr, 
} from '../../../config/channel';
import { 
    setClientInfo
} from '../../store/config/team';

export default function (){
    ipcMain.on(ChannelsTeamStr, (event, action, clientType, clientHost, teamId) => {

        if (action !== ChannelsTeamSetInfoStr) return;

        setClientInfo(clientType, clientHost, teamId);
    });
}