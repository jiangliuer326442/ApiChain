import { getdayjs } from '@rutil/index';

import { UNAME } from '@conf/db';
import { 
  SHOW_ADD_ENV_MODEL,
  SHOW_EDIT_ENV_MODEL,
  GET_ENVS
} from '@conf/redux';
import { langTrans } from '@lang/i18n';

export default function (state = {
    envListColumn: [
        {
            title: langTrans("env table1"),
            dataIndex: 'label',
            key: 'label',
          },
          {
            title: langTrans("env table2"),
            dataIndex: 'remark',
            key: 'remark',
          },
          {
            title: langTrans("env table3"),
            dataIndex: UNAME,
            key: UNAME,
          },
          {
              title: langTrans("env table4"),
              dataIndex: 'create_time',
              key: 'create_time',
              render: (time) => { return getdayjs(time).format("YYYY-MM-DD") },
          },
    ],
    showAddEnvModelFlg: false,
    env: "",
    remark: "",
    requestDevice: 0,
    list: []
  }, action : object) {
    switch(action.type) {
        case SHOW_ADD_ENV_MODEL:
            return Object.assign({}, state, {
                showAddEnvModelFlg : action.open,
                env: "",
                remark: "",
                requestDevice: 0,
            });
        case SHOW_EDIT_ENV_MODEL:
          return Object.assign({}, state, {
            showAddEnvModelFlg : action.open,
            env : action.env,
            remark : action.remark,
            requestDevice : action.requestDevice
          });
        case GET_ENVS:
          const list = action.envs.map(item => ({
            value: item.label,
            label: item.remark
          }));
          return Object.assign({}, state, {
              list
          });
        default:
            return state;
    }
}