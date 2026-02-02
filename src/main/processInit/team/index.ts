import { ipcMain, app, dialog } from 'electron';
import Store from 'electron-store';

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
    ArgsCreateTeamSuccess
} from '../../../config/startArgs';
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

export default async function (uuid : string, store : Store){
    ipcMain.on(ChannelsTeamStr, async (event, action, clientHost) => {

        if (action !== ChannelsTeamTestHostStr) return;

        let errorMessage = await pingHost(uuid, clientHost, store);
        if (isStringEmpty(errorMessage)) {
            setClientHost(clientHost, store);
            let teamListResult = await postRequest(uuid, TEAM_LIST_URL, {}, store)
            let errorMessage = teamListResult[0];
            let teamList = teamListResult[1];
            if (isStringEmpty(errorMessage)) {
                event.reply(
                    ChannelsTeamStr, 
                    ChannelsTeamTestHostResultStr, 
                    "",
                    teamList
                );
                return;
            }
        } else {
            event.reply(ChannelsTeamStr, ChannelsTeamTestHostResultStr, errorMessage, []);
        }

    })

    ipcMain.on(ChannelsTeamStr, async (event, action, teamType, uname, teamId, teamName, applyReason, users, dbJson) => {

        if (action !== ChannelsTeamSetInfoStr) return;
        let responseTeamId = "";
        let errorMessage = "";

        if (teamType === "create") {

            let result = await postRequest(uuid, TEAM_CREATE_URL, {
                "teamName": teamName,
                "uname": uname,
                "users": users,
                "dbJson": dbJson,
            }, store)

            errorMessage = result[0];
            responseTeamId = result[1];

            if (isStringEmpty(errorMessage) && !isStringEmpty(responseTeamId)) {
                setClientInfo("team", responseTeamId, store);
                app.relaunch({
                    args: process.argv.slice(1).concat([
                        '--action=' + ArgsCreateTeamSuccess,
                        '--tmpTeamId=' + responseTeamId
                    ])
                });
                app.exit(0);
            } else {
                dialog.showErrorBox('error', errorMessage)
            }

        } else {
            let result = await postRequest(uuid, TEAM_JOIN_URL, {
                "uname": uname,
                "teamId": teamId,
                "applyReason": applyReason
            }, store)

            errorMessage = result[0];
            responseTeamId = result[1];
            // let _teamName = "";
            // if (isStringEmpty(errorMessage) && !isStringEmpty(responseTeamId)) {
            //     setClientInfo("team", responseTeamId, store)
            //     let ret = await postRequest(uuid, TEAM_QUERY_NAME, {teamId: responseTeamId}, store)
            //     _teamName = ret[1];
            // }
    
            event.reply(ChannelsTeamStr, ChannelsTeamSetInfoResultStr, errorMessage, responseTeamId, _teamName);
        }

    });
}