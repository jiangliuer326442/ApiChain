import { TABLE_MICRO_SERVICE_NAME, TABLE_MICRO_SERVICE_FIELDS } from '../../config/db';
import { GET_PRJS } from '../../config/redux';

let prj_label = TABLE_MICRO_SERVICE_FIELDS.FIELD_LABEL;
let prj_remark = TABLE_MICRO_SERVICE_FIELDS.FIELD_REMARK;
let prj_cuid = TABLE_MICRO_SERVICE_FIELDS.FIELD_CUID;
let prj_cuname = TABLE_MICRO_SERVICE_FIELDS.FIELD_CUNAME;
let prj_ctime = TABLE_MICRO_SERVICE_FIELDS.FIELD_CTIME;
let prj_delFlg = TABLE_MICRO_SERVICE_FIELDS.FIELD_DELFLG;

export async function getPrjs(dispatch) {
    let prjs = await window.db[TABLE_MICRO_SERVICE_NAME]
    .where(prj_delFlg).equals(0)
    .reverse()
    .toArray();

    if (dispatch !== null) {
        dispatch({
            type: GET_PRJS,
            prjs
        });
    }
    return prjs;
}

export async function delPrj(row, cb) {
    let label = row[prj_label];

    let prj = await window.db[TABLE_MICRO_SERVICE_NAME]
    .where(prj_label).equals(label)
    .first();

    if (prj !== undefined) {
        prj[prj_label] = label;
        prj[prj_delFlg] = 1;
        await window.db[TABLE_MICRO_SERVICE_NAME].put(prj);
        cb();
    }
}

export async function addPrj(prjName : string, remark : string, device : object, cb) {
    let prj = {};
    prj[prj_label] = prjName;
    prj[prj_remark] = remark;
    prj[prj_cuid] = device.uuid;
    prj[prj_cuname] = device.uname;
    prj[prj_ctime] = Date.now();
    prj[prj_delFlg] = 0;
    await window.db[TABLE_MICRO_SERVICE_NAME].put(prj);
    cb();
}