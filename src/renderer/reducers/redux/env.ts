import { getdayjs } from '../../util';

import { UNAME } from '../../../config/db';
import { 
  SHOW_ADD_ENV_MODEL,
  SHOW_EDIT_ENV_MODEL,
  GET_ENVS
} from '../../../config/redux';

export default function (state = {
    envListColumn: [
        {
            title: '环境标识',
            dataIndex: 'label',
            key: 'label',
          },
          {
            title: '备注',
            dataIndex: 'remark',
            key: 'remark',
          },
          {
            title: '创建人',
            dataIndex: UNAME,
            key: UNAME,
          },
          {
              title: '创建时间',
              dataIndex: 'create_time',
              key: 'create_time',
              render: (time) => { return getdayjs(time).format("YYYY-MM-DD") },
          },
    ],
    showAddEnvModelFlg: false,
    env: "",
    remark: "",
    list: []
  }, action : object) {
    switch(action.type) {
        case SHOW_ADD_ENV_MODEL:
            return Object.assign({}, state, {
                showAddEnvModelFlg : action.open,
                env: "",
                remark: "",
            });
        case SHOW_EDIT_ENV_MODEL:
          return Object.assign({}, state, {
            showAddEnvModelFlg : action.open,
            env : action.env,
            remark : action.remark,
          });
        case GET_ENVS:
          let list = [];
          action.envs.map(env => {
              env.key = env.label;
              list.push(env);
          });
          return Object.assign({}, state, {
              list
          });
        default:
            return state;
    }
}