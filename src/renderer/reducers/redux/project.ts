import { getdayjs, mixedSort } from '@rutil/index';

import { UNAME } from '@conf/db';

import { 
  SHOW_ADD_PRJ_MODEL,
  SHOW_EDIT_PRJ_MODEL,
  GET_PRJS
} from '@conf/redux';

import { 
  TABLE_MICRO_SERVICE_FIELDS,
} from '@conf/db';
import { langTrans } from '@lang/i18n';
let prj_label = TABLE_MICRO_SERVICE_FIELDS.FIELD_LABEL;
let prj_remark = TABLE_MICRO_SERVICE_FIELDS.FIELD_REMARK;
let prj_ctime = TABLE_MICRO_SERVICE_FIELDS.FIELD_CTIME;

export default function (state = {
    projectListColumn: [
        {
            title: langTrans("prj table1"),
            dataIndex: prj_label,
        },
        {
            title: langTrans("prj table2"),
            dataIndex: prj_remark,
        },
        {
            title: langTrans("prj table3"),
            dataIndex: UNAME,
        },
        {
              title: langTrans("prj table4"),
              dataIndex: prj_ctime,
              render: (time) => { return getdayjs(time).format("YYYY-MM-DD")},
        },
    ],
    showAddPrjModelFlg: false,
    prj: "",
    remark: "",
    programming: "",
    framework: "",
    list: [],
  }, action : object) {
    switch(action.type) {
        case SHOW_ADD_PRJ_MODEL:
            return Object.assign({}, state, {
                showAddPrjModelFlg : action.open,
                prj: "",
                remark: "",
                programming: "",
                framework: "",
            });
        case SHOW_EDIT_PRJ_MODEL:
          return Object.assign({}, state, {
            showAddPrjModelFlg : action.open,
            prj : action.prj,
            remark : action.remark,
            programming: action.programming,
            framework: action.framework,
          });
        case GET_PRJS:
          mixedSort(action.prjs, prj_label);
          const list = action.prjs.map(item => ({
            value: item[prj_label],
            label: item[prj_remark]
          }));
          return Object.assign({}, state, {
              list
          });
        default:
            return state;
    }
  }