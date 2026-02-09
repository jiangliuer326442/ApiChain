import { ipcMain, app } from 'electron';
import log from 'electron-log';
import Store from 'electron-store';

import { 
    postRequest,
    pingHost
} from '../../util/teamUtil'
import { 
    ChannelsTeamStr, 
    ChannelsTeamSetInfoStr, 
    ChannelsTeamTestHostStr,
    ChannelsTeamTestHostResultStr,
    ChannelsTeamListStr,
    ChannelsTeamListResultStr,
    ChannelsMessageStr,
    ChannelsMessageErrorStr,
    ChannelsMessageInfoStr,
} from '../../../config/channel';
import {
    ArgsCreateTeamSuccess,
    ArgsJoinTeamSuccess
} from '../../../config/startArgs';
import {
    TEAM_CREATE_URL,
    TEAM_JOIN_URL,
    TEAM_LIST_URL,
    CLIENT_TYPE_TEAM,
    CLIENT_TYPE_SINGLE,
} from '../../../config/team';
import {
    setClientHost,
    setClientInfo
} from '../../store/config/team';
import { isStringEmpty } from '../../../renderer/util';
import { langTrans } from '../../../lang/i18n';

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

    ipcMain.on(ChannelsTeamStr, async (event, action, clientHost) => {

        if (action !== ChannelsTeamListStr) return;

        let teamListResult = await postRequest(uuid, TEAM_LIST_URL, {}, store)
        let errorMessage = teamListResult[0];
        let teamList = teamListResult[1];
        if (isStringEmpty(errorMessage)) {
            event.reply(
                ChannelsTeamStr, 
                ChannelsTeamListResultStr,
                "",
                teamList
            );
            return;
        } else {
            event.reply(ChannelsTeamStr, ChannelsTeamListResultStr, errorMessage, []);
        }

    })

    ipcMain.on(ChannelsTeamStr, async (event, action, teamType, uname, teamId, teamName, applyReason, users, dbJson) => {

        if (action !== ChannelsTeamSetInfoStr) return;
        let errorMessage = "";

        if (teamType === "create") {

            let result = await postRequest(uuid, TEAM_CREATE_URL, {
                "teamName": teamName,
                "uname": uname,
                "users": users,
                "dbJson": dbJson,
            }, store)

            errorMessage = result[0];
            const responseTeamId = result[1];

            if (isStringEmpty(errorMessage) && !isStringEmpty(responseTeamId)) {
                setClientInfo(CLIENT_TYPE_TEAM, responseTeamId, store);
                app.relaunch({
                    args: process.argv.slice(1).concat([
                        '--action=' + ArgsCreateTeamSuccess,
                        '--tmpTeamId=' + responseTeamId
                    ])
                });
                app.exit(0);
            } else {
                event.reply(ChannelsMessageStr, ChannelsMessageErrorStr, errorMessage);
            }

        } else {
            let result = await postRequest(uuid, TEAM_JOIN_URL, {
                "uname": uname,
                "teamId": teamId,
                "applyReason": applyReason
            }, store)

            errorMessage = result[0];
            let responseContent = result[1];
            if (!isStringEmpty(errorMessage)) {
                event.reply(ChannelsMessageStr, ChannelsMessageErrorStr, errorMessage);
            } else {
                log.info("responseContent", responseContent);
                if (responseContent.result == 3) {
                    let responseTeamId = responseContent.teamId;
                    setClientInfo(CLIENT_TYPE_TEAM, responseTeamId, store);
                    app.relaunch({
                        args: process.argv.slice(1).concat([
                            '--action=' + ArgsJoinTeamSuccess,
                            '--tmpTeamId=' + responseTeamId
                        ])
                    });
                    app.exit(0);
                } else if (responseContent.result == 1) {
                    setClientInfo(CLIENT_TYPE_SINGLE, null, store)
                    event.reply(ChannelsMessageStr, ChannelsMessageInfoStr, langTrans("team join waiting"));
                }
            }
            // let _teamName = "";
            // if (isStringEmpty(errorMessage) && !isStringEmpty(responseTeamId)) {
            //     setClientInfo("team", responseTeamId, store)
            //     let ret = await postRequest(uuid, TEAM_QUERY_NAME, {teamId: responseTeamId}, store)
            //     _teamName = ret[1];
            // }
        }

    });
}