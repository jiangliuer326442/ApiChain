import { TABLE_PROJECT_REQUEST_PARAMS_NAME, TABLE_PROJECT_REQUEST_PARAMS_FIELDS } from "@conf/db";
import { 
    CLIENT_TYPE_TEAM, CLIENT_TYPE_SINGLE,
    REQUEST_COMMON_SET_URL,
    REQUEST_COMMON_GET_URL,
} from "@conf/team";
import { sendTeamMessage } from '@act/message';

let project_request_common_project = TABLE_PROJECT_REQUEST_PARAMS_FIELDS.FIELD_MICRO_SERVICE_LABEL;
let project_request_common_del_flg = TABLE_PROJECT_REQUEST_PARAMS_FIELDS.FIELD_DELFLG;
let project_request_common_header = TABLE_PROJECT_REQUEST_PARAMS_FIELDS.FIELD_REQUEST_HEADER;
let project_request_common_body = TABLE_PROJECT_REQUEST_PARAMS_FIELDS.FIELD_REQUEST_BODY;
let project_request_common_param = TABLE_PROJECT_REQUEST_PARAMS_FIELDS.FIELD_REQUEST_PARAM;
let project_request_common_pathvariable = TABLE_PROJECT_REQUEST_PARAMS_FIELDS.FIELD_REQUEST_PATH_VARIABLE;
let project_request_common_cuid = TABLE_PROJECT_REQUEST_PARAMS_FIELDS.FIELD_CUID;
let project_request_common_ctime = TABLE_PROJECT_REQUEST_PARAMS_FIELDS.FIELD_CTIME;

export async function getRequestCommon(clientType : string, project : string) {
    let requestCommon;
    if (clientType === CLIENT_TYPE_TEAM) {
        requestCommon = await sendTeamMessage(REQUEST_COMMON_GET_URL, {prj: project});
    } else {

        requestCommon = await window.db[TABLE_PROJECT_REQUEST_PARAMS_NAME]
        .where(project_request_common_project).equals(project)
        .reverse()
        .first();

        if (requestCommon === undefined || requestCommon[project_request_common_del_flg] === 1) return null;
    }
    return requestCommon;
}

export async function setRequestCommon(
    clientType : string, teamId : string, project : string, 
    header : object, body : object, param : object, pathVariable : object, 
    device : object) {
    if (clientType === CLIENT_TYPE_TEAM) {
        await sendTeamMessage(REQUEST_COMMON_SET_URL, {
            prj: project, 
            header: JSON.stringify(header), 
            body: JSON.stringify(body), 
            param: JSON.stringify(param), 
            pathVariable: JSON.stringify(pathVariable)
        });
    }

    let request_common : any = {};
    request_common[project_request_common_project] = project;
    request_common[project_request_common_header] = header;
    request_common[project_request_common_body] = body;
    request_common[project_request_common_param] = param;
    request_common[project_request_common_pathvariable] = pathVariable;
    request_common[project_request_common_cuid] = device.uuid;
    request_common[project_request_common_ctime] = Date.now();
    request_common[project_request_common_del_flg] = 0;
    if (clientType === CLIENT_TYPE_SINGLE) {
        request_common.upload_flg = 0;
        request_common.team_id = "";
    } else {
        request_common.upload_flg = 1;
        request_common.team_id = teamId;
    }
    await window.db[TABLE_PROJECT_REQUEST_PARAMS_NAME].put(request_common);
}