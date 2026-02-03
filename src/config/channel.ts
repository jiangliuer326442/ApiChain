export type ChannelsUserInfo = 'pipeline_init_userinfo';
export const ChannelsUserInfoStr = 'pipeline_init_userinfo';
export const ChannelsUserInfoPingStr = 'ping';
export const ChannelsUserInfoSetUserinfoStr = 'set_userinfo';
export const ChannelsUserInfoSetAppinfoStr = 'set_appinfo';

export type ChannelsOpenWindow = 'pipeline_open_window';
export const ChannelsOpenWindowStr = 'pipeline_open_window';



/**
 * 外部访问请求迭代文案数据
 */
export type ChannelsMarkdownLong = 'pipeline_markdown_long';
export const ChannelsMarkdownLongStr = 'pipeline_markdown_long';
export const ChannelsMarkdownQueryStr = 'pipeline_markdown_query';
export const ChannelsMarkdownQueryResultStr = 'pipeline_markdown_query_result';


export type ChannelsMarkdown = 'pipeline_markdown';
export const ChannelsMarkdownStr = 'pipeline_markdown';

/**
 * 内部访问请求迭代文案数据
 */
export const ChannelsMarkdownShowStr = 'pipeline_markdown_show';

/**
 * 设置、查询markdown是否开启
 */
export const ChannelsMarkdownAccessSetStr = 'pipeline_markdown_set_accessable';
export const ChannelsMarkdownAccessGetStr = 'pipeline_markdown_get_accessable';
export const ChannelsMarkdownAccessSetResultStr = 'pipeline_markdown_result_accessable';

/**
 * 导出 markdown 文件
 */
export const ChannelsMarkdownSaveMarkdownStr = 'pipeline_markdown_save_markdown';

/**
 * 导出 HTML 文件
 */
export const ChannelsMarkdownSaveHtmlStr = 'pipeline_markdown_save_html';



/**
 * 前端mock服务器网络请求
 */
export type ChannelssMockServerLong = 'pipeline_mockserver_long';
export const ChannelsMockServerLongStr = 'pipeline_mockserver_long';
export const ChannelsMockServerQueryStr = 'pipeline_mockserver_query';
export const ChannelsMockServerQueryResultStr = 'pipeline_mockserver_query_result';

/**
 * 设置、查询mock服务器是否开启
 */
export type ChannelssMockServer = 'pipeline_mockserver';
export const ChannelsMockServerStr = 'pipeline_mockserver';
export const ChannelsMockServerAccessSetStr = 'pipeline_mockserver_set_accessable';
export const ChannelsMockServerAccessGetStr = 'pipeline_mockserver_get_accessable';
export const ChannelsMockServerAccessSetResultStr = 'pipeline_mockserver_result_accessable';



export type ChannelsDbLong = 'pipeline_database_long';
export const ChannelsDbLongStr = 'pipeline_database_long';

/**
 * 清理数据库冗余
 */
export const ChannelsDbTrunkStr = 'pipeline_database_trunk';
export const ChannelsDbTrunkSuccessStr = 'pipeline_database_trunk_success';

/**
 * 备份、还原 数据库
 */
export const ChannelsDbExportStr = 'pipeline_database_export';
export const ChannelsDbWriteStr = 'pipeline_database_write';
export const ChannelsDbImportStr = 'pipeline_database_import';
export const ChannelsDbImportSuccessStr = 'pipeline_database_import_success';

/**
 * 备份还原项目
 */
export type ChannelsDb = 'pipeline_database';
export const ChannelsDbStr = 'pipeline_database';
export const ChannelsDbProjectExportStr = 'pipeline_database_projects_export';
export const ChannelsDbProjectExportResultStr = 'pipeline_database_projects_export_result';
export const ChannelsDbProjectImportStr = 'pipeline_database_projects_import';
export const ChannelsDbProjectImportResultStr = 'pipeline_database_projects_import_result';

/**
 * 应用刷新/重启
 */
export type ChannelsRestartApp = 'pipeline_restart';
export const ChannelsRestartAppStr = 'pipeline_restart';
export type ChannelsMessage = 'pipeline_message';
export const ChannelsMessageStr = 'pipeline_message';
export const ChannelsMessageErrorStr = 'pipeline_message_error';
export const ChannelsMessageInfoStr = 'pipeline_message_info';
export type ChannelsLoadApp = 'pipeline_reload';
export const ChannelsLoadAppStr = 'pipeline_reload';


export type ChannelsPostman = 'pipeline_postman';

export const ChannelsPostmanStr = 'pipeline_postman';

export const ChannelsPostmanOutStr = 'pipeline_postman_out';

export const ChannelsPostmanInStr = 'pipeline_postman_in';

export type ChannelsAutoUpgrade = 'pipeline_autoupgrade';

export const ChannelsAutoUpgradeStr = 'pipeline_autoupgrade';

export const ChannelsAutoUpgradeCheckStr = 'pipeline_autoupgrade_check';

export const ChannelsAutoUpgradeNewVersionStr = 'pipeline_autoupgrade_newversion';

//当前已是最新版本，无需更新。
export const ChannelsAutoUpgradeLatestStr = 'pipeline_autoupgrade_latest';

export const ChannelsAutoUpgradeDownloadStr = 'pipeline_autoupgrade_download';

export type ChannelsVip = 'pipeline_vip';

export const ChannelsVipStr = 'pipeline_vip';

export const ChannelsVipGenUrlStr = 'pipeline_vip_genurl';

export const ChannelsVipCkCodeStr = 'pipeline_vip_ckcode';

export const ChannelsVipCloseCkCodeStr = 'pipeline_vip_closeck';

export type ChannelsAxioBreidge = "axio_bridge";

export const ChannelsAxioBreidgeStr = "axio_bridge";

export const ChannelsAxioBreidgeSendStr = 'axio_bridge_send';

export const ChannelsAxioBreidgeReplyStr = 'axio_bridge_reply';

export const ChannelsAxioTeanSendStr = 'axio_team_send';

export const ChannelsAxioTeamReplyStr = 'axio_team_reply';

export type ChannelsTeam = 'pipeline_team';

export const ChannelsTeamStr = 'pipeline_team';

export const ChannelsTeamTestHostStr = 'pipeline_test_host';

export const ChannelsTeamTestHostResultStr = 'pipeline_test_host_result';

export const ChannelsTeamSetInfoStr = 'pipeline_set_team_info';

export const ChannelsTeamSetInfoResultStr = 'pipeline_set_team_info_result';