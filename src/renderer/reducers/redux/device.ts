import { 
  UUID, 
  BUY_TIMES, 
  APPNAME, 
  DEFAULT_RUNNER_URL,
  DEFAULT_RUNNER_VERSION,
  USERCOUNTRY,
  USERLANG,
  APPVERSION, 
  VIP_FLG, 
  CKCODE_FLG,
  CKCODE_URL,
  EXPIRE_TIME, 
  CLIENT_TYPE,
  CLIENT_HOST,
  TEAM_NAME,
  TEAM_ID,
} from '@conf/storage';

import { CLIENT_TYPE_SINGLE } from '@conf/team';
import { SET_DEVICE_INFO } from '@conf/redux';
import { isStringEmpty } from '@rutil/index';

export default function (state = {
  uuid: "",
  appName: "",
  defaultRunnerUrl: "",
  defaultRunnerVersion: "",
  appVersion: "",
  userCountry: "",
  userLang: "",
  vipFlg: false,
  showCkCode: false,
  ckCodeUrl: "",
  expireTime: 0,
  clientType: CLIENT_TYPE_SINGLE,
  clientHost: "",
  teamName: "",
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

      if (action.showCkCode !== undefined) {
        sessionStorage.setItem(CKCODE_FLG, action.showCkCode ? "1" : "0");
        newState.showCkCode = action.showCkCode;
      }

      if (action.ckCodeUrl !== undefined) {
        sessionStorage.setItem(CKCODE_URL, action.ckCodeUrl);
        newState.ckCodeUrl = action.ckCodeUrl;
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

      if (action.defaultRunnerUrl !== undefined) {
        sessionStorage.setItem(DEFAULT_RUNNER_URL, action.defaultRunnerUrl);
        newState.defaultRunnerUrl = action.defaultRunnerUrl;
      }

      if (action.minServerVersion !== undefined) {
        sessionStorage.setItem(DEFAULT_RUNNER_VERSION, action.minServerVersion);
        newState.defaultRunnerVersion = action.minServerVersion;
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

      if (action.clientType !== undefined) {
        sessionStorage.setItem(CLIENT_TYPE, action.clientType);
        newState.clientType = action.clientType;
      }

      if (action.clientHost !== undefined) {
        sessionStorage.setItem(CLIENT_HOST, action.clientHost);
        newState.clientHost = action.clientHost;
      }

      if (action.teamName !== undefined) {
        sessionStorage.setItem(TEAM_NAME, action.teamName);
        newState.teamName = action.teamName;
      }

      if (action.teamId !== undefined) {
        sessionStorage.setItem(TEAM_ID, action.teamId);
        newState.teamId = action.teamId;
      }
      
      return Object.assign({}, state, newState);
  }else if(state.uuid === "") {
    state.uuid = isStringEmpty(sessionStorage.getItem(UUID)) ? "" : sessionStorage.getItem(UUID) as string;
    state.vipFlg = isStringEmpty(sessionStorage.getItem(VIP_FLG)) ? false : (sessionStorage.getItem(VIP_FLG) === "1" ? true : false);
    state.showCkCode = isStringEmpty(sessionStorage.getItem(CKCODE_FLG)) ? false : (sessionStorage.getItem(CKCODE_FLG) === "1" ? true : false);
    state.ckCodeUrl = isStringEmpty(sessionStorage.getItem(CKCODE_URL)) ? "" : sessionStorage.getItem(CKCODE_URL) as string;
    state.expireTime = isStringEmpty(sessionStorage.getItem(EXPIRE_TIME)) ? 0 : Number(sessionStorage.getItem(EXPIRE_TIME));
    state.appName = isStringEmpty(sessionStorage.getItem(APPNAME)) ? "" : sessionStorage.getItem(APPNAME) as string;
    state.defaultRunnerUrl = isStringEmpty(sessionStorage.getItem(DEFAULT_RUNNER_URL)) ? "" : sessionStorage.getItem(DEFAULT_RUNNER_URL) as string;
    state.defaultRunnerVersion = isStringEmpty(sessionStorage.getItem(DEFAULT_RUNNER_VERSION)) ? "" : sessionStorage.getItem(DEFAULT_RUNNER_VERSION) as string;
    state.appVersion = isStringEmpty(sessionStorage.getItem(APPVERSION)) ? "" : sessionStorage.getItem(APPVERSION) as string;
    state.buyTimes = isStringEmpty(sessionStorage.getItem(BUY_TIMES)) ? 0 : Number(sessionStorage.getItem(BUY_TIMES));
    if (state.expireTime < Date.now()) {
      state.vipFlg = false
    }
    state.clientType = isStringEmpty(sessionStorage.getItem(CLIENT_TYPE)) ? CLIENT_TYPE_SINGLE : sessionStorage.getItem(CLIENT_TYPE) as string;
    state.clientHost = isStringEmpty(sessionStorage.getItem(CLIENT_HOST)) ? "" : sessionStorage.getItem(CLIENT_HOST) as string;
    state.teamName = isStringEmpty(sessionStorage.getItem(TEAM_NAME)) ? "" : sessionStorage.getItem(TEAM_NAME) as string;
    state.teamId = isStringEmpty(sessionStorage.getItem(TEAM_ID)) ? "" : sessionStorage.getItem(TEAM_ID) as string;
  }
  return state;
}