import {
  NETWORK,
} from '@conf/global_config';

import {
  INTERNET_REQUEST,
} from '@conf/routers';

import { 
  SET_NAV_COLLAPSED,
} from '@conf/redux';

export default function (state = {
    selected: [ NETWORK, INTERNET_REQUEST ],
    collapsed: false,
}, action : object) {
  switch(action.type) {
    case SET_NAV_COLLAPSED:
      let newCollapsed = action.collapsed;
      return Object.assign({}, state, {
        collapsed: newCollapsed
      });

    default:
      return state;
  }
}