import { sendTeamMessage } from '@act/message';
import { mixedSort } from '@rutil/index';
import { TABLE_MICRO_SERVICE_NAME, TABLE_MICRO_SERVICE_FIELDS, UNAME } from '@conf/db';
import { GET_PRJS } from '@conf/redux';
import { 
    CLIENT_TYPE_SINGLE, 
    CLIENT_TYPE_TEAM, PRJS_LIST_URL, 
    PRJS_SET_URL, 
    PRJS_DEL_URL,
    PRJS_ALL_LIST_URL,
} from '@conf/team';
import { getUsers } from '@act/user';

let prj_label = TABLE_MICRO_SERVICE_FIELDS.FIELD_LABEL;
let prj_remark = TABLE_MICRO_SERVICE_FIELDS.FIELD_REMARK;
let prj_program = TABLE_MICRO_SERVICE_FIELDS.FIELD_PROGRAM;
let prj_frame = TABLE_MICRO_SERVICE_FIELDS.FIELD_FRAME;
let prj_cuid = TABLE_MICRO_SERVICE_FIELDS.FIELD_CUID;
let prj_ctime = TABLE_MICRO_SERVICE_FIELDS.FIELD_CTIME;
let prj_delFlg = TABLE_MICRO_SERVICE_FIELDS.FIELD_DELFLG;

export async function getPrjsByPage(clientType : string, pagination : any) {
    let datas = [];
    let page = pagination.current;
    let pageSize = pagination.pageSize;

    if (clientType === CLIENT_TYPE_SINGLE) {
        const offset = (page - 1) * pageSize;
        let count = await window.db[TABLE_MICRO_SERVICE_NAME]
        .where(prj_delFlg).equals(0)
        .count();
        pagination.total = count;

        datas = await window.db[TABLE_MICRO_SERVICE_NAME]
        .where(prj_delFlg).equals(0)
        .offset(offset)
        .limit(pageSize)
        .reverse()
        .toArray();

        let users = await getUsers(clientType);
        datas.forEach(item => {
            item[UNAME] = users.get(item[prj_cuid]);
        });
    } else {
        let result = await sendTeamMessage(PRJS_LIST_URL, pagination);
        let count = result.count;
        pagination.total = count;
        datas = result.list;
    }

    return datas;
}

export async function getPrjs(clientType : string, dispatch) {
    let prjs;

    if (clientType === CLIENT_TYPE_SINGLE) {
        prjs = await window.db[TABLE_MICRO_SERVICE_NAME]
        .where(prj_delFlg).equals(0)
        .reverse()
        .toArray();

        mixedSort(prjs, prj_remark);
    } else {
        let ret = await sendTeamMessage(PRJS_ALL_LIST_URL, {});
        prjs = ret.list;
    }

    if (dispatch !== null) {
        dispatch({
            type: GET_PRJS,
            prjs
        });
    }
    
    return prjs;
}

export async function delPrj(clientType: string, teamId : string, row) {
    let label = row[prj_label];

    if (clientType === CLIENT_TYPE_TEAM) {
        await sendTeamMessage(PRJS_DEL_URL, {label});
    }

    let prj = await window.db[TABLE_MICRO_SERVICE_NAME]
    .where(prj_label).equals(label)
    .first();

    if (prj === undefined) return;

    prj[prj_label] = label;
    prj[prj_delFlg] = 1;

    if (clientType === CLIENT_TYPE_SINGLE) {
        prj.upload_flg = 0;
        prj.team_id = "";
    } else {
        prj.upload_flg = 1;
        prj.team_id = teamId;
    }

    await window.db[TABLE_MICRO_SERVICE_NAME].put(prj);
}

export async function addPrj(
    clientType : string, teamId : string, 
    prjName : string, 
    remark : string, 
    programming : string, 
    framework : string, 
    device : object
) {
    if (clientType === CLIENT_TYPE_TEAM) {
        console.log("2222222222")
        await sendTeamMessage(PRJS_SET_URL, {
            label: prjName, remark, programming, framework
        });
    }

    let prj : any = {};
    prj[prj_label] = prjName;
    prj[prj_remark] = remark;
    prj[prj_program] = programming;
    prj[prj_frame] = framework;
    prj[prj_cuid] = device.uuid;
    prj[prj_ctime] = Date.now();
    prj[prj_delFlg] = 0;
    if (clientType === CLIENT_TYPE_SINGLE) {
        prj.upload_flg = 0;
        prj.team_id = "";
    } else {
        prj.upload_flg = 1;
        prj.team_id = teamId;
    }
    await window.db[TABLE_MICRO_SERVICE_NAME].put(prj);
}