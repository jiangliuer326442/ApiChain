import {
  SHOW_ADD_PROPERTY_MODEL,
  SHOW_EDIT_PROPERTY_MODEL,
  GET_ENV_VALS
} from '../../../config/redux';

import {
    PRJ, ENV
} from '../../../config/global_config';

import { 
    TABLE_ENV_VAR_FIELDS,
} from '../../../config/db';

let env_var_pname = TABLE_ENV_VAR_FIELDS.FIELD_PARAM_NAME;
let env_var_pval = TABLE_ENV_VAR_FIELDS.FIELD_PARAM_VAR;

export default function (state = {
    showAddPropertyModelFlg: false,
    env: "",
    prj: "",
    iterator: "",
    pname: "",
    pvalue: "",
    list: []
  }, action : object) {
    switch(action.type) {
        case GET_ENV_VALS:
            let list = [];
            action.env_vars.map(envVar => {
                envVar.key = envVar[env_var_pname] + envVar[env_var_pval];
                list.push(envVar);
            });
            localStorage.setItem(PRJ, action.prj);
            localStorage.setItem(ENV, action.env);
            return Object.assign({}, state, {
              prj: action.prj,
              env: action.env,
              iterator: action.iterator,
              list
            });
        case SHOW_ADD_PROPERTY_MODEL:
            return Object.assign({}, state, {
              showAddPropertyModelFlg : action.open,
              pname: "",
              pvalue: "",
        });
        case SHOW_EDIT_PROPERTY_MODEL:
          return Object.assign({}, state, {
            showAddPropertyModelFlg : action.open,
            pname : action.pname,
            pvalue : action.pvalue,
          });
        default:
            state.prj = localStorage.getItem(PRJ);
            state.env = localStorage.getItem(ENV);
            return state;
    }
}