import { 
  UUID, 
  BUY_TIMES, 
  APPNAME, 
  USERCOUNTRY,
  USERLANG,
  HTML, 
  APPVERSION, 
  VIP_FLG, 
  EXPIRE_TIME, 
  CLIENT_TYPE,
  CLIENT_HOST,
  TEAM_SERVER_VALID,
  TEAM_ID,
} from '@conf/storage';

import { SET_DEVICE_INFO } from '@conf/redux';
import { isStringEmpty } from '@rutil/index';

export default function (state = {
  uuid: "",
  html: "",
  appName: "",
  appVersion: "",
  userCountry: "",
  userLang: "",
  vipFlg: false,
  expireTime: 0,
  clientType: "single",
  clientHost: "",
  teamServerValid: false,
  teamId: "",
  buyTimes: 0,
}, action : any) {
  if(action.type === SET_DEVICE_INFO) {
      let newState : any = {};

      if (action.uuid !== undefined) {
        sessionStorage.setItem(UUID, action.uuid);
        newState.uuid = action.uuid;
      }

      if (action.buyTimes !== undefined) {
        sessionStorage.setItem(BUY_TIMES, action.buyTimes);
        newState.buyTimes = action.buyTimes;
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

      if (action.userCountry !== undefined) {
        sessionStorage.setItem(USERCOUNTRY, action.userCountry);
        newState.userCountry = action.userCountry;
      }

      if (action.userLang !== undefined) {
        sessionStorage.setItem(USERLANG, action.userLang);
        newState.userLang = action.userLang;
      }

      if (action.appVersion !== undefined) {
        sessionStorage.setItem(APPVERSION, action.appVersion);
        newState.appVersion = action.appVersion;
      }

      if (action.html !== undefined) {
        sessionStorage.setItem(HTML, action.html);
        newState.html = action.html;
      }

      if (action.clientType !== undefined) {
        sessionStorage.setItem(CLIENT_TYPE, action.clientType);
        newState.clientType = action.clientType;
      }

      if (action.clientHost !== undefined) {
        sessionStorage.setItem(CLIENT_HOST, action.clientHost);
        newState.clientHost = action.clientHost;
      }

      if (action.teamServerValid !== undefined) {
        sessionStorage.setItem(TEAM_SERVER_VALID, action.teamServerValid ? "1" : "0");
        newState.teamServerValid = action.teamServerValid;
      }

      if (action.teamId !== undefined) {
        sessionStorage.setItem(TEAM_ID, action.teamId);
        newState.teamId = action.teamId;
      }
      
      return Object.assign({}, state, newState);
  }else if(state.uuid === "") {
    state.uuid = isStringEmpty(sessionStorage.getItem(UUID)) ? "" : sessionStorage.getItem(UUID) as string;
    state.vipFlg = isStringEmpty(sessionStorage.getItem(VIP_FLG)) ? false : (sessionStorage.getItem(VIP_FLG) === "1" ? true : false);
    state.expireTime = isStringEmpty(sessionStorage.getItem(EXPIRE_TIME)) ? 0 : Number(sessionStorage.getItem(EXPIRE_TIME));
    state.appName = isStringEmpty(sessionStorage.getItem(APPNAME)) ? "" : sessionStorage.getItem(APPNAME) as string;
    state.appVersion = isStringEmpty(sessionStorage.getItem(APPVERSION)) ? "" : sessionStorage.getItem(APPVERSION) as string;
    state.buyTimes = isStringEmpty(sessionStorage.getItem(BUY_TIMES)) ? 0 : Number(sessionStorage.getItem(BUY_TIMES));
    state.html = isStringEmpty(sessionStorage.getItem(HTML)) ? "" : sessionStorage.getItem(HTML) as string;
    if (state.expireTime < Date.now()) {
      state.vipFlg = false
    }
    state.clientType = isStringEmpty(sessionStorage.getItem(CLIENT_TYPE)) ? "single" : sessionStorage.getItem(CLIENT_TYPE) as string;
    state.clientHost = isStringEmpty(sessionStorage.getItem(CLIENT_HOST)) ? "" : sessionStorage.getItem(CLIENT_HOST) as string;
    state.teamServerValid = isStringEmpty(sessionStorage.getItem(TEAM_SERVER_VALID)) ? false : (sessionStorage.getItem(TEAM_SERVER_VALID) === "1" ? true : false);
    state.teamId = isStringEmpty(sessionStorage.getItem(TEAM_ID)) ? "" : sessionStorage.getItem(TEAM_ID) as string;
  }
  return state;
}