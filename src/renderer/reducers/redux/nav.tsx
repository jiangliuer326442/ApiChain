import {
  NETWORK,
} from '@conf/global_config';

import {
  INTERNET_REQUEST,
} from '@conf/routers';

import { 
  SET_NAV_COLLAPSED,
  SET_AI_COLLAPSED,
  SET_AI_MESSAGE,
} from '@conf/redux';

export default function (state = {
    selected: [ NETWORK, INTERNET_REQUEST ],
    collapsed: false,
    aiBoxOpenFlg: true,
    messageText: "",
    messageCode: "",
}, action : object) {
  switch(action.type) {
    case SET_NAV_COLLAPSED:
      return Object.assign({}, state, {
        collapsed: action.collapsed
      });
    case SET_AI_COLLAPSED:
      return Object.assign({}, state, {
        collapsed: action.collapsed,
        aiBoxOpenFlg: action.aiBoxOpenFlg,
        messageText: "",
        messageCode: ""
      });
    case SET_AI_MESSAGE:
      return Object.assign({}, state, {
        collapsed: true,
        aiBoxOpenFlg: true,
        messageText: action.messageText,
        messageCode: action.messageCode,
      });
    default:
      return state;
  }
}