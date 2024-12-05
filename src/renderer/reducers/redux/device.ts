import { UUID, UNAME, REG_TIME, APPNAME, HTML, IP, APPVERSION, VIP_FLG, EXPIRE_TIME, } from '../../../config/global_config';
import { SET_DEVICE_INFO } from '../../../config/redux';
import { isStringEmpty } from '../../util';

export default function (state = {
  uuid: "",
  uname: "",
  html: "",
  ip: "",
  appName: "",
  appVersion: "",
  rtime: 0,
  vipFlg: false,
  expireTime: 0,
}, action : any) {
  if(action.type === SET_DEVICE_INFO) {
      let newState : any = {};

      if (action.uuid !== undefined) {
        sessionStorage.setItem(UUID, action.uuid);
        newState.uuid = action.uuid;
      }

      if (action.uname !== undefined) {
        sessionStorage.setItem(UNAME, action.uname);
        newState.uname = action.uname;
      }

      if (action.rtime !== undefined) {
        sessionStorage.setItem(REG_TIME, action.rtime);
        newState.rtime = action.rtime;
      }

      if (action.vipFlg !== undefined) {
        sessionStorage.setItem(VIP_FLG, action.vipFlg ? "1" : "0");
        newState.vipFlg = action.vipFlg;
      }

      if (action.expireTime !== undefined) {
        sessionStorage.setItem(EXPIRE_TIME, action.expireTime);
        newState.expireTime = action.expireTime;
      }

      if (action.appName !== undefined) {
        sessionStorage.setItem(APPNAME, action.appName);
        newState.appName = action.appName;
      }

      if (action.appVersion !== undefined) {
        sessionStorage.setItem(APPVERSION, action.appVersion);
        newState.appVersion = action.appVersion;
      }

      if (action.html !== undefined) {
        sessionStorage.setItem(HTML, action.html);
        newState.html = action.html;
      }

      if (action.ip !== undefined) {
        sessionStorage.setItem(IP, action.ip);
        newState.ip = action.ip;
      }
      
      return Object.assign({}, state, newState);
  }else if(state.uuid === "") {
    state.uuid = isStringEmpty(sessionStorage.getItem(UUID)) ? "" : sessionStorage.getItem(UUID) as string;
    state.uname = isStringEmpty(sessionStorage.getItem(UNAME)) ? "" : sessionStorage.getItem(UNAME) as string;
    state.rtime = isStringEmpty(sessionStorage.getItem(REG_TIME)) ? 0 : Number(sessionStorage.getItem(REG_TIME));
    state.vipFlg = isStringEmpty(sessionStorage.getItem(VIP_FLG)) ? false : (sessionStorage.getItem(VIP_FLG) === "1" ? true : false);
    state.expireTime = isStringEmpty(sessionStorage.getItem(EXPIRE_TIME)) ? 0 : Number(sessionStorage.getItem(EXPIRE_TIME));
    state.appName = isStringEmpty(sessionStorage.getItem(APPNAME)) ? "" : sessionStorage.getItem(APPNAME) as string;
    state.appVersion = isStringEmpty(sessionStorage.getItem(APPVERSION)) ? "" : sessionStorage.getItem(APPVERSION) as string;
    state.html = isStringEmpty(sessionStorage.getItem(HTML)) ? "" : sessionStorage.getItem(HTML) as string;
    state.ip = isStringEmpty(sessionStorage.getItem(IP)) ? "" : sessionStorage.getItem(IP) as string;
    if (state.expireTime < Date.now()) {
      state.vipFlg = false
    }
  }
  return state;
}