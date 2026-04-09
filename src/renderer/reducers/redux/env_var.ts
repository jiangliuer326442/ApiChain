import {
  SHOW_ADD_PROPERTY_MODEL,
  SHOW_EDIT_PROPERTY_MODEL,
  GET_ENV_VALS,
  GET_ITERATOR,
  GET_PRJ,
  GET_ENV,
} from '@conf/redux';

import {
    ENV, ITERATOR
} from '@conf/storage';

import { isStringEmpty } from '@rutil/index';

export default function (state = {
    showAddPropertyModelFlg: false,
    env: "",
    prj: "",
    iterator: "",
    unittest: "",
    source: "",
    pname: "",
    pvalue: "",
    premark: "",
    encryptFlg: 0,
    list: []
  }, action : any) {
    switch(action.type) {
        case GET_ITERATOR:
          console.log("11111");
            localStorage.setItem(ITERATOR, action.iterator);
            return Object.assign({}, state, {
              iterator: action.iterator,
              unittest: action.unittest,
            });
        case GET_ENV:
          console.log("222222");
            localStorage.setItem(ENV, action.env);
            return Object.assign({}, state, {
              env: action.env,
            });
        case GET_PRJ:
          console.log("333333");
            return Object.assign({}, state, {
              prj: action.prj,
            });
        case GET_ENV_VALS:
          console.log("4444444");
            localStorage.setItem(ENV, action.env);
            return Object.assign({}, state, {
              prj: action.prj,
              env: action.env,
              iterator: action.iterator,
              unittest: action.unittest,
            });
        case SHOW_ADD_PROPERTY_MODEL:
          localStorage.setItem(ITERATOR, action.iteration);
          return Object.assign({}, state, {
            showAddPropertyModelFlg : action.open,
            prj: isStringEmpty(action.prj) ? "" : action.prj,
            iterator: isStringEmpty(action.iteration) ? "" : action.iteration,
            unittest: isStringEmpty(action.unittest) ? "" : action.unittest,
            source: "",
            pname: "",
            pvalue: "",
            premark: "",
            encryptFlg: 0,
        });
        case SHOW_EDIT_PROPERTY_MODEL:
          console.log("66666666");
          return Object.assign({}, state, {
            showAddPropertyModelFlg : action.open,
            prj: isStringEmpty(action.prj) ? "" : action.prj,
            iterator: isStringEmpty(action.iterator) ? "" : action.iterator,
            unittest: isStringEmpty(action.unittest) ? "" : action.unittest,
            source: isStringEmpty(action.source) ? "" : action.source,
            pname : action.pname,
            pvalue : action.pvalue,
            premark : action.premark,
            encryptFlg: action.encryptFlg,
          });
        default:
            state.env = localStorage.getItem(ENV);
            state.iterator = localStorage.getItem(ITERATOR);
            return state;
    }
}