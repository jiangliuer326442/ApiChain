import { 
    FIELD_ID,
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
} from '../../../config/db';

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
let iteration_request_delFlg = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_DELFLG;
let iteration_request_ctime = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_CTIME;

let project_request_project = TABLE_PROJECT_REQUEST_FIELDS.FIELD_PROJECT_LABEL;
let project_request_method = TABLE_PROJECT_REQUEST_FIELDS.FIELD_REQUEST_METHOD;
let project_request_uri = TABLE_PROJECT_REQUEST_FIELDS.FIELD_URI;
let project_request_delFlg = TABLE_PROJECT_REQUEST_FIELDS.FIELD_DELFLG;
let project_request_ctime = TABLE_PROJECT_REQUEST_FIELDS.FIELD_CTIME;

let version_iteration_test_folder_iterator = TABLE_UNITTEST_FOLD_FIELDS.FIELD_ITERATOR_UUID;
let version_iteration_test_folder_name = TABLE_UNITTEST_FOLD_FIELDS.FIELD_FOLD_NAME;
let version_iteration_test_folder_delFlg = TABLE_UNITTEST_FOLD_FIELDS.FIELD_DELFLG;
let version_iteration_test_folder_ctime = TABLE_UNITTEST_FOLD_FIELDS.FIELD_CTIME;

let field_unittest_uuid = TABLE_UNITTEST_FIELDS.FIELD_UUID;
let unittest_iterator_uuid = TABLE_UNITTEST_FIELDS.FIELD_ITERATOR_UUID;
let unittest_fold = TABLE_UNITTEST_FIELDS.FIELD_FOLD_NAME;
let unittest_delFlg = TABLE_UNITTEST_FIELDS.FIELD_DELFLG;
let unittest_ctime = TABLE_UNITTEST_FIELDS.FIELD_CTIME;

let unittest_step_uuid = TABLE_UNITTEST_STEPS_FIELDS.FIELD_UUID;
let unittest_step_iterator_uuid = TABLE_UNITTEST_STEPS_FIELDS.FIELD_ITERATOR_UUID;
let unittest_step_unittest_uuid = TABLE_UNITTEST_STEPS_FIELDS.FIELD_UNITTEST_UUID;
let unittest_step_delFlg = TABLE_UNITTEST_STEPS_FIELDS.FIELD_DELFLG;
let unittest_step_sort = TABLE_UNITTEST_STEPS_FIELDS.FIELD_SORT;

let unittest_executor_batch = TABLE_UNITTEST_EXECUTOR_FIELDS.FIELD_BATCH_UUID;
let unittest_executor_iterator = TABLE_UNITTEST_EXECUTOR_FIELDS.FIELD_ITERATOR_UUID;
let unittest_executor_unittest = TABLE_UNITTEST_EXECUTOR_FIELDS.FIELD_UNITTEST_UUID;
let unittest_executor_step = TABLE_UNITTEST_EXECUTOR_FIELDS.FIELD_STEPS_UUID;
let unittest_executor_delFlg = TABLE_UNITTEST_EXECUTOR_FIELDS.FIELD_DELFLG;
let unittest_executor_ctime = TABLE_UNITTEST_EXECUTOR_FIELDS.FIELD_CTIME;

let tables : any = {};
tables[TABLE_ENV_NAME] = "&" + env_label + ", [" + env_delFlg + "+" + env_ctime + "]";
tables[TABLE_MICRO_SERVICE_NAME] = "&" + micro_service_label + ", [" + micro_service_delFlg + "+" + micro_service_ctime + "]";
tables[TABLE_ENV_KEY_NAME] = "&[" + env_key_micro_service + "+" + env_key_pname + "], [" + env_key_delFlg + "+" + env_key_micro_service + "+" + env_key_ctime + "]";
tables[TABLE_ENV_VAR_NAME] = "&[" + env_var_env + "+" + env_var_micro_service + "+" + env_var_pname + "], [" + env_var_micro_service + "+" + env_var_pname + "]";
tables[TABLE_VERSION_ITERATION_NAME] = "&" + version_iteration_uuid 
+ ", *" + version_iteration_prjects
+ ", [" + version_iteration_prjects + "+" + version_iteration_delFlg + "+" + version_iteration_ctime + "]" 
+ ", [" + version_iteration_openFlg + "+" + version_iteration_delFlg + "+" + version_iteration_ctime + "]" 
+ ", [" + version_iteration_delFlg + "+" + version_iteration_ctime + "]";
tables[TABLE_REQUEST_HISTORY_NAME] = "++" + FIELD_ID + ", [" + request_history_delFlg + "+" + request_history_env + "+" + request_history_micro_service + "+" + request_history_ctime + "]";
tables[TABLE_JSON_FRAGEMENT_NAME] = "&[" + json_fragement_name + "+" + json_fragement_hash + "], [" + json_fragement_delFlg + "+" + json_fragement_name + "+" + json_fragement_hash + "]";
tables[TABLE_VERSION_ITERATION_FOLD_NAME] = "&[" + version_iteration_folder_uuid + "+" + version_iteration_folder_project + "+" + version_iteration_folder_name + "], [" + version_iteration_folder_delFlg + "+" + version_iteration_folder_uuid + "+" + version_iteration_folder_project + "+" + version_iteration_folder_ctime + "]";
tables[TABLE_VERSION_ITERATION_REQUEST_NAME] = "&[" + iteration_request_iteration_uuid + "+" + iteration_request_project + "+" + iteration_request_method + "+" + iteration_request_uri + "], [" + iteration_request_delFlg + "+" + iteration_request_iteration_uuid + "+" + iteration_request_ctime + "], [" + iteration_request_delFlg + "+" + iteration_request_project + "+" + iteration_request_method + "+" + iteration_request_uri + "+" + iteration_request_ctime + "]";
tables[TABLE_PROJECT_REQUEST_NAME] = "&[" + project_request_project + "+" + project_request_method + "+" + project_request_uri + "], [" + project_request_delFlg + "+" + project_request_project + "+" + project_request_ctime + "]";
tables[TABLE_UNITTEST_FOLD_NAME] = "&[" + version_iteration_test_folder_iterator + "+" + version_iteration_test_folder_name + "], [" + version_iteration_test_folder_delFlg + "+" + version_iteration_test_folder_iterator + "+" + version_iteration_test_folder_ctime + "]";
tables[TABLE_UNITTEST_NAME] = "&" + field_unittest_uuid 
+ ", [" + unittest_delFlg + "+" + unittest_iterator_uuid + "+" + unittest_ctime + "]" 
+ ", [" + unittest_delFlg + "+" + unittest_iterator_uuid + "+" + unittest_fold + "+" + unittest_ctime + "]";
tables[TABLE_UNITTEST_STEPS_NAME] = "&" + unittest_step_uuid + ", "
+ "[" + unittest_step_delFlg + "+" + unittest_step_iterator_uuid + "+" + unittest_step_unittest_uuid + "+" + unittest_step_sort + "]";
tables[TABLE_UNITTEST_EXECUTOR_NAME] = "&[" + unittest_executor_iterator + "+" + unittest_executor_unittest + "+" + unittest_executor_batch + "+" + unittest_executor_step + "], " 
+ "[" + unittest_executor_delFlg + "+" + unittest_executor_iterator + "+" + unittest_executor_unittest + "+" + unittest_executor_ctime + "]";

db.version(11).stores(tables).upgrade (async trans => {
});