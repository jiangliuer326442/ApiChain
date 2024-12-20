import { getdayjs, mixedSort } from '../../util';

import { UNAME } from '../../../config/db';

import { 
  SHOW_ADD_PRJ_MODEL,
  SHOW_EDIT_PRJ_MODEL,
  GET_PRJS
} from '../../../config/redux';

import { 
  TABLE_MICRO_SERVICE_FIELDS,
} from '../../../config/db';
let prj_label = TABLE_MICRO_SERVICE_FIELDS.FIELD_LABEL;
let prj_remark = TABLE_MICRO_SERVICE_FIELDS.FIELD_REMARK;
let prj_ctime = TABLE_MICRO_SERVICE_FIELDS.FIELD_CTIME;

export default function (state = {
    projectListColumn: [
        {
            title: '项目标识',
            dataIndex: prj_label,
        },
        {
            title: '备注',
            dataIndex: prj_remark,
        },
        {
            title: '创建人',
            dataIndex: UNAME,
        },
        {
              title: '创建时间',
              dataIndex: prj_ctime,
              render: (time) => { return getdayjs(time).format("YYYY-MM-DD")},
        },
    ],
    showAddPrjModelFlg: false,
    prj: "",
    remark: "",
    list: [],
    selector: [],
  }, action : object) {
    switch(action.type) {
        case SHOW_ADD_PRJ_MODEL:
            return Object.assign({}, state, {
                showAddPrjModelFlg : action.open,
                prj: "",
                remark: "",
            });
        case SHOW_EDIT_PRJ_MODEL:
          return Object.assign({}, state, {
            showAddPrjModelFlg : action.open,
            prj : action.prj,
            remark : action.remark,
          });
        case GET_PRJS:
          mixedSort(action.prjs, prj_label);
          let list = [];
          action.prjs.map(prj => {
              prj.key = prj[prj_label];
              list.push(prj);
          });
          let selector = [];
          action.prjs.map(prj => {
            let item = {};
            item.label = prj[prj_remark];
            item.value = prj[prj_label];
            selector.push(item);
          });
          return Object.assign({}, state, {
              list,
              selector
          });
        default:
            return state;
    }
  }