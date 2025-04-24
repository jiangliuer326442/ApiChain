import { ipcMain } from 'electron';

import { osLocale } from '../../third_party/os-locale';
import { 
    doRequest,
    readPublicKey,
} from '../../util/util';
import { 
    ChannelsTeamStr, 
    ChannelsTeamSetInfoStr, 
    ChannelsTeamSetInfoResultStr,
    ChannelsTeamTestHostStr,
    ChannelsTeamTestHostResultStr,
} from '../../../config/channel';
import {
    PING_URL,
    TEAM_CREATE_URL,
    TEAM_JOIN_URL,
} from '../../../config/team';
import { 
    getClientHost,
    setClientHost,
    setClientInfo
} from '../../store/config/team';
import { isStringEmpty } from '../../../renderer/util';

export default async function (){

    let lang = await osLocale();
    let userLang = lang.split("-")[0];
    let userCountry = lang.split("-")[1];

    ipcMain.on(ChannelsTeamStr, async (event, action, clientHost) => {

        if (action !== ChannelsTeamTestHostStr) return;

        let url = clientHost + PING_URL;
        let result = await doRequest("get", url, {}, {}, null, new Map());

        let response = result[1];

        if (response?.status === 200) {
            if (response.data.status === 1) {
                setClientHost(clientHost);
                event.reply(ChannelsTeamStr, ChannelsTeamTestHostResultStr, 1);
                return;
            }
        }

        event.reply(ChannelsTeamStr, ChannelsTeamTestHostResultStr, 0);
    })

    ipcMain.on(ChannelsTeamStr, async (event, action, teamType, uid, uname, teamId, teamName, users) => {

        if (action !== ChannelsTeamSetInfoStr) return;

        let publicKeyContent = readPublicKey();

        let clientHost = getClientHost();

        let responseTeamId = "";
        let errorMessage = "";

        if (teamType === "create") {
            let url = clientHost + TEAM_CREATE_URL;

            let result = await doRequest("post", url, {
                "Sys-Lang": userLang,
                "Sys-Country": userCountry,
            }, {
                "uid": uid,
                "uname": uname,
                "publicKey": publicKeyContent,
                "teamName": teamName,
                "users": users,
            }, null, new Map());

            let response = result[1];
            errorMessage = result[2];
            if (response?.status !== 200) {
                errorMessage = response?.statusText;
            }
            if (isStringEmpty(errorMessage)) {
                if (response.data.status === 1) {
                    responseTeamId = response.data.data;
                } else {
                    errorMessage = response.data.message;
                }
            }
        }

        event.reply(ChannelsTeamStr, ChannelsTeamSetInfoResultStr, errorMessage, responseTeamId);
    });
}