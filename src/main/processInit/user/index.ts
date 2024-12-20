import log from 'electron-log';
import { ipcMain, IpcMainEvent } from 'electron';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs-extra';
import { 
  ChannelsUserInfoStr, 
  ChannelsUserInfoPingStr, 
  ChannelsUserInfoSetUserinfoStr 
} from '../../../config/channel';
import { registerUser, getUUID, getUName, getRTime } from '../../store/config/user';
import { isVip, getExpireTime, getBuyTimes } from '../../store/config/vip';
import { osLocaleSync } from '../../third_party/os-locale';
import { uuidPath, writeFile } from '../uuid';
import { genUUID, getIpV4 } from '../../util/util';

let readayEvent : IpcMainEvent | null = null;
let intervalId : NodeJS.Timeout;

async function notifyUserInfo() {
  if(readayEvent !== null) {
    let uuid = getUUID();
    let uname = getUName();
    let rtime = getRTime();
    let ip = getIpV4();
    let vipFlg = isVip();
    let expireTime = getExpireTime();
    let buyTimes = getBuyTimes();

    let lang = osLocaleSync();

    readayEvent.reply(ChannelsUserInfoStr, ChannelsUserInfoSetUserinfoStr, 
      uuid, lang, uname, ip, rtime, vipFlg, expireTime, buyTimes
    );
    clearInterval(intervalId);
  }
}

export default function() {
  ipcMain.on(ChannelsUserInfoStr, (event, action) => {
    if(action === ChannelsUserInfoPingStr) {
      readayEvent = event;
    }
  });
  if(fs.existsSync(uuidPath)){
    intervalId = setInterval(notifyUserInfo, 1000);
  } else {
    genUUID().then(async uuid => {
        let salt = uuidv4() as string;
        registerUser(uuid, salt);
        writeFile(uuid, salt);
        intervalId = setInterval(notifyUserInfo, 1000);
    }).catch(err => log.error(err));
  }
}