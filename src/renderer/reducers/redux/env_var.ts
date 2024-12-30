import {
  SHOW_ADD_PROPERTY_MODEL,
  SHOW_EDIT_PROPERTY_MODEL,
  GET_ENV_VALS
} from '@conf/redux';

import {
    PRJ, ENV
} from '@conf/storage';

import { 
    TABLE_ENV_VAR_FIELDS,
} from '@conf/db';

let env_var_pname = TABLE_ENV_VAR_FIELDS.FIELD_PARAM_NAME;

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
        case GET_ENV_VALS:
            let list : any[] = [];
            action.env_vars.map(envVar => {
                envVar.key = envVar[env_var_pname];
                list.push(envVar);
            });
            localStorage.setItem(PRJ, action.prj);
            localStorage.setItem(ENV, action.env);
            return Object.assign({}, state, {
              prj: action.prj,
              env: action.env,
              iterator: action.iterator,
              unittest: action.unittest,
              list,
            });
        case SHOW_ADD_PROPERTY_MODEL:
            return Object.assign({}, state, {
              showAddPropertyModelFlg : action.open,
              pname: "",
              pvalue: "",
              premark: "",
        });
        case SHOW_EDIT_PROPERTY_MODEL:
          return Object.assign({}, state, {
            showAddPropertyModelFlg : action.open,
            pname : action.pname,
            pvalue : action.pvalue,
            premark : action.premark,
          });
        default:
            state.prj = localStorage.getItem(PRJ);
            state.env = localStorage.getItem(ENV);
            return state;
    }
}