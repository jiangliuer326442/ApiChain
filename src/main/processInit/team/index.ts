import { ipcMain } from 'electron';

import {
    readPublicKey,
} from '../../util/util';
import { 
    postRequest,
    pingHost
} from '../../util/teamUtil'
import { 
    ChannelsTeamStr, 
    ChannelsTeamSetInfoStr, 
    ChannelsTeamSetInfoResultStr,
    ChannelsTeamTestHostStr,
    ChannelsTeamTestHostResultStr,
} from '../../../config/channel';
import {
    TEAM_CREATE_URL,
    TEAM_JOIN_URL,
    TEAM_LIST_URL,
} from '../../../config/team';
import {
    setClientHost,
    setClientInfo
} from '../../store/config/team';
import { isStringEmpty } from '../../../renderer/util';

export default async function (){
    ipcMain.on(ChannelsTeamStr, async (event, action, clientHost) => {

        if (action !== ChannelsTeamTestHostStr) return;

        let result = await pingHost(clientHost);
        if (result) {
            setClientHost(clientHost);
            let teamListResult = await postRequest(TEAM_LIST_URL, {})
            let errorMessage = teamListResult[0];
            let teamList = teamListResult[1];
            if (isStringEmpty(errorMessage)) {
                event.reply(
                    ChannelsTeamStr, 
                    ChannelsTeamTestHostResultStr, 
                    1,
                    teamList
                );
                return;
            }
        }
        event.reply(ChannelsTeamStr, ChannelsTeamTestHostResultStr, 0, []);

    })

    ipcMain.on(ChannelsTeamStr, async (event, action, teamType, uname, teamId, teamName, users) => {

        if (action !== ChannelsTeamSetInfoStr) return;

        let publicKeyContent = readPublicKey();

        let responseTeamId = "";
        let errorMessage = "";

        if (teamType === "create") {

            let result = await postRequest(TEAM_CREATE_URL, {
                "uname": uname,
                "publicKey": publicKeyContent,
                "teamName": teamName,
                "users": users,
            })

            errorMessage = result[0];
            responseTeamId = result[1];
        } else {
            let result = await postRequest(TEAM_JOIN_URL, {
                "uname": uname,
                "publicKey": publicKeyContent,
                "teamId": teamId,
                "users": users,
            })

            errorMessage = result[0];
            responseTeamId = result[1];
        }

        if (isStringEmpty(errorMessage) && !isStringEmpty(responseTeamId)) {
            setClientInfo("team", responseTeamId)
        }

        event.reply(ChannelsTeamStr, ChannelsTeamSetInfoResultStr, errorMessage, responseTeamId);
    });
}