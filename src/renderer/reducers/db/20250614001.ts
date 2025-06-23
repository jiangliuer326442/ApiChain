import { 
    FIELD_ID,
    TABLE_USER_NAME, TABLE_USER_FIELDS,
    TABLE_ENV_NAME, TABLE_ENV_FIELDS, 
    TABLE_MICRO_SERVICE_NAME, TABLE_MICRO_SERVICE_FIELDS,
    TABLE_ENV_VAR_NAME, TABLE_ENV_VAR_FIELDS,
    TABLE_ENV_KEY_NAME, TABLE_ENV_KEY_FIELDS,
    TABLE_VERSION_ITERATION_NAME, TABLE_VERSION_ITERATION_FIELDS,
    TABLE_REQUEST_HISTORY_NAME, TABLE_REQUEST_HISTORY_FIELDS,
    TABLE_JSON_FRAGEMENT_NAME, TABLE_JSON_FRAGEMENT_FIELDS,
    TABLE_VERSION_ITERATION_FOLD_NAME, TABLE_VERSION_ITERATION_FOLD_FIELDS,
    TABLE_VERSION_ITERATION_REQUEST_NAME, TABLE_VERSION_ITERATION_REQUEST_FIELDS,
    TABLE_PROJECT_REQUEST_NAME, TABLE_PROJECT_REQUEST_FIELDS,
    TABLE_UNITTEST_FOLD_NAME, TABLE_UNITTEST_FOLD_FIELDS,
    TABLE_UNITTEST_NAME, TABLE_UNITTEST_FIELDS,
    TABLE_UNITTEST_STEPS_NAME,TABLE_UNITTEST_STEPS_FIELDS,
    TABLE_UNITTEST_EXECUTOR_NAME, TABLE_UNITTEST_EXECUTOR_FIELDS,
    TABLE_UNITTEST_EXECUTOR_REPORT_NAME, TABLE_UNITTEST_EXECUTOR_REPORT_FIELDS,
    TABLE_UNITTEST_STEP_ASSERTS_NAME, TABLE_UNITTEST_STEP_ASSERT_FIELDS,
} from '../../../config/db';

let user_uid = TABLE_USER_FIELDS.FIELD_UID;
let user_ctime = TABLE_USER_FIELDS.FIELD_CTIME;
let user_delFlg = TABLE_USER_FIELDS.FIELD_DELFLG;

let env_label = TABLE_ENV_FIELDS.FIELD_LABEL;
let env_ctime = TABLE_ENV_FIELDS.FIELD_CTIME;
let env_delFlg = TABLE_ENV_FIELDS.FIELD_DELFLG;

let micro_service_label = TABLE_MICRO_SERVICE_FIELDS.FIELD_LABEL;
let micro_service_ctime = TABLE_MICRO_SERVICE_FIELDS.FIELD_CTIME;
let micro_service_delFlg = TABLE_MICRO_SERVICE_FIELDS.FIELD_DELFLG;

let env_key_micro_service = TABLE_ENV_KEY_FIELDS.FIELD_MICRO_SERVICE_LABEL;
let env_key_pname = TABLE_ENV_KEY_FIELDS.FIELD_PARAM_NAME;
let env_key_ctime = TABLE_ENV_KEY_FIELDS.FIELD_CTIME;
let env_key_delFlg = TABLE_ENV_KEY_FIELDS.FIELD_DELFLG;

let env_var_env = TABLE_ENV_VAR_FIELDS.FIELD_ENV_LABEL;
let env_var_micro_service = TABLE_ENV_VAR_FIELDS.FIELD_MICRO_SERVICE_LABEL;
let env_var_iteration = TABLE_ENV_VAR_FIELDS.FIELD_ITERATION;
let env_var_unittest = TABLE_ENV_VAR_FIELDS.FIELD_UNITTEST;
let env_var_pname = TABLE_ENV_VAR_FIELDS.FIELD_PARAM_NAME;

let version_iteration_uuid = TABLE_VERSION_ITERATION_FIELDS.FIELD_UUID;
let version_iteration_delFlg = TABLE_VERSION_ITERATION_FIELDS.FIELD_DELFLG;
let version_iteration_openFlg = TABLE_VERSION_ITERATION_FIELDS.FIELD_OPENFLG;
let version_iteration_prjects = TABLE_VERSION_ITERATION_FIELDS.FIELD_PROJECTS;
let version_iteration_ctime = TABLE_VERSION_ITERATION_FIELDS.FIELD_CTIME;

let request_history_env = TABLE_REQUEST_HISTORY_FIELDS.FIELD_ENV_LABEL;
let request_history_micro_service = TABLE_REQUEST_HISTORY_FIELDS.FIELD_MICRO_SERVICE_LABEL;
let request_history_delFlg = TABLE_REQUEST_HISTORY_FIELDS.FIELD_DELFLG;
let request_history_ctime = TABLE_REQUEST_HISTORY_FIELDS.FIELD_CTIME;

let json_fragement_name = TABLE_JSON_FRAGEMENT_FIELDS.FIELD_NAME;
let json_fragement_hash = TABLE_JSON_FRAGEMENT_FIELDS.FIELD_HASH;
let json_fragement_delFlg = TABLE_JSON_FRAGEMENT_FIELDS.FIELD_DELFLG;

let version_iteration_folder_uuid = TABLE_VERSION_ITERATION_FOLD_FIELDS.FIELD_ITERATOR_UUID;
let version_iteration_folder_project = TABLE_VERSION_ITERATION_FOLD_FIELDS.FIELD_PROJECT;
let version_iteration_folder_name = TABLE_VERSION_ITERATION_FOLD_FIELDS.FIELD_FOLD_NAME;
let version_iteration_folder_delFlg = TABLE_VERSION_ITERATION_FOLD_FIELDS.FIELD_DELFLG;
let version_iteration_folder_ctime = TABLE_VERSION_ITERATION_FOLD_FIELDS.FIELD_CTIME;

let iteration_request_iteration_uuid = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_ITERATOR_UUID;
let iteration_request_project = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_MICRO_SERVICE_LABEL;
let iteration_request_method = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_REQUEST_METHOD;
let iteration_request_uri = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_URI;
let iteration_request_fold = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_FOLD;
let iteration_request_delFlg = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_DELFLG;
let iteration_request_ctime = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_CTIME;

let project_request_project = TABLE_PROJECT_REQUEST_FIELDS.FIELD_PROJECT_LABEL;
let project_request_method = TABLE_PROJECT_REQUEST_FIELDS.FIELD_REQUEST_METHOD;
let project_request_uri = TABLE_PROJECT_REQUEST_FIELDS.FIELD_URI;
let project_request_fold = TABLE_PROJECT_REQUEST_FIELDS.FIELD_FOLD;
let project_request_delFlg = TABLE_PROJECT_REQUEST_FIELDS.FIELD_DELFLG;
let project_request_ctime = TABLE_PROJECT_REQUEST_FIELDS.FIELD_CTIME;

let unittest_folder_iterator = TABLE_UNITTEST_FOLD_FIELDS.FIELD_ITERATOR;
let unittest_folder_project = TABLE_UNITTEST_FOLD_FIELDS.FIELD_PROJECT;
let unittest_folder_name = TABLE_UNITTEST_FOLD_FIELDS.FIELD_FOLD_NAME;
let unittest_folder_delFlg = TABLE_UNITTEST_FOLD_FIELDS.FIELD_DELFLG;
let unittest_folder_cuid = TABLE_UNITTEST_FOLD_FIELDS.FIELD_CUID;
let unittest_folder_ctime = TABLE_UNITTEST_FOLD_FIELDS.FIELD_CTIME;

let field_unittest_uuid = TABLE_UNITTEST_FIELDS.FIELD_UUID;
let unittest_iterator_uuid = TABLE_UNITTEST_FIELDS.FIELD_ITERATOR_UUID;
let unittest_projects = TABLE_UNITTEST_FIELDS.FIELD_PROJECTS;
let unittest_collectFlg = TABLE_UNITTEST_FIELDS.FIELD_COLLECT;
let unittest_fold = TABLE_UNITTEST_FIELDS.FIELD_FOLD_NAME;
let unittest_delFlg = TABLE_UNITTEST_FIELDS.FIELD_DELFLG;
let unittest_cuid = TABLE_UNITTEST_FIELDS.FIELD_CUID;
let unittest_ctime = TABLE_UNITTEST_FIELDS.FIELD_CTIME;

let unittest_step_uuid = TABLE_UNITTEST_STEPS_FIELDS.FIELD_UUID;
let unittest_step_iterator_uuid = TABLE_UNITTEST_STEPS_FIELDS.FIELD_ITERATOR_UUID;
let unittest_step_unittest_uuid = TABLE_UNITTEST_STEPS_FIELDS.FIELD_UNITTEST_UUID;
let unittest_step_delFlg = TABLE_UNITTEST_STEPS_FIELDS.FIELD_DELFLG;
let unittest_step_sort = TABLE_UNITTEST_STEPS_FIELDS.FIELD_SORT;

let unittest_step_assert_iterator = TABLE_UNITTEST_STEP_ASSERT_FIELDS.FIELD_ITERATOR_UUID;
let unittest_step_assert_unittest = TABLE_UNITTEST_STEP_ASSERT_FIELDS.FIELD_UNITTEST_UUID;
let unittest_step_assert_step = TABLE_UNITTEST_STEP_ASSERT_FIELDS.FIELD_STEP_UUID;
let unittest_step_assert_uuid = TABLE_UNITTEST_STEP_ASSERT_FIELDS.FIELD_UUID;
let unittest_step_assert_delFlg = TABLE_UNITTEST_STEP_ASSERT_FIELDS.FIELD_DELFLG;
let unittest_step_assert_ctime = TABLE_UNITTEST_STEP_ASSERT_FIELDS.FIELD_CTIME;

let unittest_executor_batch = TABLE_UNITTEST_EXECUTOR_FIELDS.FIELD_BATCH_UUID;
let unittest_executor_iterator = TABLE_UNITTEST_EXECUTOR_FIELDS.FIELD_ITERATOR_UUID;
let unittest_executor_unittest = TABLE_UNITTEST_EXECUTOR_FIELDS.FIELD_UNITTEST_UUID;
let unittest_executor_step = TABLE_UNITTEST_EXECUTOR_FIELDS.FIELD_STEPS_UUID;
let unittest_executor_delFlg = TABLE_UNITTEST_EXECUTOR_FIELDS.FIELD_DELFLG;
let unittest_executor_ctime = TABLE_UNITTEST_EXECUTOR_FIELDS.FIELD_CTIME;

let unittest_report_iterator = TABLE_UNITTEST_EXECUTOR_REPORT_FIELDS.FIELD_ITERATOR_UUID;
let unittest_report_env = TABLE_UNITTEST_EXECUTOR_REPORT_FIELDS.FIELD_ENV;
let unittest_report_unittest = TABLE_UNITTEST_EXECUTOR_REPORT_FIELDS.FIELD_UNITTEST_UUID;
let unittest_report_batch = TABLE_UNITTEST_EXECUTOR_REPORT_FIELDS.FIELD_BATCH_UUID;
let unittest_report_delFlg = TABLE_UNITTEST_EXECUTOR_FIELDS.FIELD_DELFLG;
let unittest_report_ctime = TABLE_UNITTEST_EXECUTOR_FIELDS.FIELD_CTIME;

let tables : any = {};
tables[TABLE_USER_NAME] = "&" + user_uid + ", [" + user_delFlg + "+" + user_ctime + "]";
tables[TABLE_ENV_NAME] = "&" + env_label + ", [" + env_delFlg + "+" + env_ctime + "]";
tables[TABLE_MICRO_SERVICE_NAME] = "&" + micro_service_label + ", [" + micro_service_delFlg + "+" + micro_service_ctime + "]";
tables[TABLE_ENV_KEY_NAME] = "&[" + env_key_micro_service + "+" + env_key_pname + "], [" + env_key_delFlg + "+" + env_key_micro_service + "+" + env_key_ctime + "]";
tables[TABLE_ENV_VAR_NAME] = "&[" + env_var_env + "+" + env_var_micro_service + "+" + env_var_iteration + "+" + env_var_unittest + "+" + env_var_pname + "], [" + env_var_micro_service + "+" + env_var_iteration + "+" + env_var_unittest + "+" + env_var_pname + "]";
tables[TABLE_VERSION_ITERATION_NAME] = "&" + version_iteration_uuid 
+ ", *" + version_iteration_prjects
+ ", [" + version_iteration_prjects + "+" + version_iteration_delFlg + "+" + version_iteration_ctime + "]" 
+ ", [" + version_iteration_openFlg + "+" + version_iteration_delFlg + "+" + version_iteration_ctime + "]" 
+ ", [" + version_iteration_delFlg + "+" + version_iteration_ctime + "]";
tables[TABLE_REQUEST_HISTORY_NAME] = "++" + FIELD_ID + ", [" + request_history_delFlg + "+" + request_history_env + "+" + request_history_micro_service + "+" + request_history_ctime + "]";
tables[TABLE_JSON_FRAGEMENT_NAME] = "&[" + json_fragement_name + "+" + json_fragement_hash + "], [" + json_fragement_delFlg + "+" + json_fragement_name + "+" + json_fragement_hash + "]";
tables[TABLE_VERSION_ITERATION_FOLD_NAME] = "&[" + version_iteration_folder_uuid + "+" + version_iteration_folder_project + "+" + version_iteration_folder_name + "], [" + version_iteration_folder_delFlg + "+" + version_iteration_folder_uuid + "+" + version_iteration_folder_project + "+" + version_iteration_folder_ctime + "]";
tables[TABLE_VERSION_ITERATION_REQUEST_NAME] = "&[" + iteration_request_iteration_uuid + "+" + iteration_request_project + "+" + iteration_request_method + "+" + iteration_request_uri + "], [" + iteration_request_delFlg + "+" + iteration_request_iteration_uuid + "+" + iteration_request_fold + "+" + iteration_request_ctime + "], [" + iteration_request_delFlg + "+" + iteration_request_project + "+" + iteration_request_method + "+" + iteration_request_uri + "+" + iteration_request_ctime + "]";
tables[TABLE_PROJECT_REQUEST_NAME] = "&[" + project_request_project + "+" + project_request_method + "+" + project_request_uri + "], [" + project_request_delFlg + "+" + project_request_project + "+" + project_request_fold + "+" + project_request_ctime + "]";
tables[TABLE_UNITTEST_FOLD_NAME] = "&[" + unittest_folder_iterator + "+" + unittest_folder_name + "], [" + unittest_folder_delFlg + "+" + unittest_folder_iterator + "+" + unittest_folder_ctime + "], " +
"&[" + unittest_folder_project + "+" + unittest_folder_name + "], [" + unittest_folder_delFlg + "+" + unittest_folder_project + "+" + unittest_folder_ctime + "]" + "";
tables[TABLE_UNITTEST_NAME] = "&" + field_unittest_uuid 
+ ", *" + unittest_projects
+ ", [" + unittest_delFlg + "+" + unittest_iterator_uuid + "+" + unittest_ctime + "]" 
+ ", [" + unittest_delFlg + "+" + unittest_iterator_uuid + "+" + unittest_fold + "+" + unittest_ctime + "], [" 
+ unittest_projects + "+" + unittest_collectFlg + "+" + unittest_delFlg + "+" + unittest_ctime + "]" 
+ ", [" + unittest_projects + "+" + unittest_collectFlg + "+" + unittest_delFlg + "+" + unittest_fold + "+" + unittest_ctime + "]";
tables[TABLE_UNITTEST_STEPS_NAME] = "&" + unittest_step_uuid + ", "
+ "[" + unittest_step_delFlg + "+" + unittest_step_iterator_uuid + "+" + unittest_step_unittest_uuid + "+" + unittest_step_sort + "]";
tables[TABLE_UNITTEST_STEP_ASSERTS_NAME] = "&" + unittest_step_assert_uuid + ", "
+ "[" + unittest_step_assert_delFlg + "+" + unittest_step_assert_iterator + "+" + unittest_step_assert_unittest + "+" + unittest_step_assert_step + "+" + unittest_step_assert_ctime + "]";
tables[TABLE_UNITTEST_EXECUTOR_NAME] = "&[" + unittest_executor_iterator + "+" + unittest_executor_unittest + "+" + unittest_executor_batch + "+" + unittest_executor_step + "], " 
+ "[" + unittest_executor_delFlg + "+" + unittest_executor_iterator + "+" + unittest_executor_unittest + "+" + unittest_executor_ctime + "]";
tables[TABLE_UNITTEST_EXECUTOR_REPORT_NAME] = "&[" + unittest_report_iterator + "+" + unittest_report_unittest + "+" + unittest_report_batch + "], " 
+ "[" + unittest_report_delFlg + "+" + unittest_report_iterator + "+" + unittest_report_unittest + "+" + unittest_report_env + "+" + unittest_report_ctime + "]";

window.db.version(201).stores(tables).upgrade (async trans => {
});