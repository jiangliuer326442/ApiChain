import {
  SHOW_ADD_PROPERTY_MODEL,
  SHOW_EDIT_PROPERTY_MODEL,
  GET_ENV_VALS,
  GET_ITERATOR
} from '@conf/redux';

import {
    PRJ, ENV, ITERATOR
} from '@conf/storage';

import { isStringEmpty } from '@rutil/index';

export default function (state = {
    showAddPropertyModelFlg: false,
    env: "",
    prj: "",
    iterator: "",
    unittest: "",
    pname: "",
    pvalue: "",
    list: []
  }, action : any) {
    switch(action.type) {
        case GET_ITERATOR:
            localStorage.setItem(ITERATOR, action.iterator);
            return Object.assign({}, state, {
              iterator: action.iterator,
              unittest: action.unittest,
            });
        case GET_ENV_VALS:
            localStorage.setItem(PRJ, action.prj);
            localStorage.setItem(ENV, action.env);
            return Object.assign({}, state, {
              prj: action.prj,
              env: action.env,
              iterator: action.iterator,
              unittest: action.unittest,
            });
        case SHOW_ADD_PROPERTY_MODEL:
            return Object.assign({}, state, {
              showAddPropertyModelFlg : action.open,
              prj: isStringEmpty(action.prj) ? "" : action.prj,
              iterator: isStringEmpty(action.iterator) ? "" : action.iterator,
              unittest: isStringEmpty(action.unittest) ? "" : action.unittest,
              pname: "",
              pvalue: "",
              premark: "",
        });
        case SHOW_EDIT_PROPERTY_MODEL:
          return Object.assign({}, state, {
            showAddPropertyModelFlg : action.open,
            prj: isStringEmpty(action.prj) ? "" : action.prj,
            iterator: isStringEmpty(action.iterator) ? "" : action.iterator,
            unittest: isStringEmpty(action.unittest) ? "" : action.unittest,
            pname : action.pname,
            pvalue : action.pvalue,
            premark : action.premark,
          });
        default:
            state.prj = localStorage.getItem(PRJ);
            state.env = localStorage.getItem(ENV);
            state.iterator = localStorage.getItem(ITERATOR);
            return state;
    }
}