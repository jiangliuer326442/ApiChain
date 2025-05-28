import { Component, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import JsonView from 'react-json-view';
import { Descriptions, Typography } from "antd";
import type { DescriptionsProps } from 'antd';
import { cloneDeep } from 'lodash';

import { getdayjs, isStringEmpty } from '@rutil/index';
import {
    REQUEST_METHOD_GET,
    REQUEST_METHOD_POST
} from '@conf/global_config';
import { ENV_VALUE_API_HOST } from '@conf/envKeys';
import {
    TABLE_UNITTEST_FIELDS,
    TABLE_ENV_FIELDS,
    TABLE_UNITTEST_STEPS_FIELDS,
    TABLE_UNITTEST_STEP_ASSERT_FIELDS,
    TABLE_UNITTEST_EXECUTOR_FIELDS,
    TABLE_REQUEST_HISTORY_FIELDS,
    TABLE_UNITTEST_EXECUTOR_REPORT_FIELDS,
    TABLE_VERSION_ITERATION_FIELDS,
    TABLE_MICRO_SERVICE_FIELDS,
    TABLE_ENV_VAR_FIELDS,
} from '@conf/db';

import {
    getSingleUnittest,
    getSingleExecutorReport,
    getSingleExecutorStep,
    getUnitTestStepAsserts,
} from '@act/unittest';
import {
    getPrjEnvValuesByPage
} from '@act/env_value';
import { langFormat, langTrans } from '@lang/i18n';

const { Text } = Typography;

let version_iterator_uuid = TABLE_VERSION_ITERATION_FIELDS.FIELD_UUID;
let version_iterator_prjs = TABLE_VERSION_ITERATION_FIELDS.FIELD_PROJECTS;
let env_var_pvalue = TABLE_ENV_VAR_FIELDS.FIELD_PARAM_VAR;
let env_var_prj = TABLE_ENV_VAR_FIELDS.FIELD_MICRO_SERVICE_LABEL;

let unittest_uuid = TABLE_UNITTEST_FIELDS.FIELD_UUID;
let unittest_iterator = TABLE_UNITTEST_FIELDS.FIELD_ITERATOR_UUID;
let unittest_title = TABLE_UNITTEST_FIELDS.FIELD_TITLE;

let prj_label = TABLE_MICRO_SERVICE_FIELDS.FIELD_LABEL;

let env_label = TABLE_ENV_FIELDS.FIELD_LABEL;
let env_remark = TABLE_ENV_FIELDS.FIELD_REMARK;

let request_history_uri = TABLE_REQUEST_HISTORY_FIELDS.FIELD_URI;
let request_history_json_flg = TABLE_REQUEST_HISTORY_FIELDS.FIELD_JSONFLG;
let request_history_response_header = TABLE_REQUEST_HISTORY_FIELDS.FIELD_RESPONSE_HEAD;
let request_history_response_cookie = TABLE_REQUEST_HISTORY_FIELDS.FIELD_RESPONSE_COOKIE;
let request_history_response_content = TABLE_REQUEST_HISTORY_FIELDS.FIELD_RESPONSE_CONTENT;
let request_history_body = TABLE_REQUEST_HISTORY_FIELDS.FIELD_REQUEST_BODY;
let request_history_param = TABLE_REQUEST_HISTORY_FIELDS.FIELD_REQUEST_PARAM;
let request_history_path_variable = TABLE_REQUEST_HISTORY_FIELDS.FIELD_REQUEST_PATH_VARIABLE;

let unittest_step_uuid = TABLE_UNITTEST_STEPS_FIELDS.FIELD_UUID;
let unittest_step_title = TABLE_UNITTEST_STEPS_FIELDS.FIELD_TITLE;
let unittest_step_sort = TABLE_UNITTEST_STEPS_FIELDS.FIELD_SORT;
let unittest_step_request_method = TABLE_UNITTEST_STEPS_FIELDS.FIELD_REQUEST_METHOD;
let unittest_step_prj = TABLE_UNITTEST_STEPS_FIELDS.FIELD_MICRO_SERVICE_LABEL;

let unittest_step_assert_title = TABLE_UNITTEST_STEP_ASSERT_FIELDS.FIELD_TITLE;
let unittest_step_assert_left = TABLE_UNITTEST_STEP_ASSERT_FIELDS.FIELD_ASSERT_LEFT;
let unittest_step_assert_operator = TABLE_UNITTEST_STEP_ASSERT_FIELDS.FIELD_ASSERT_OPERATOR;
let unittest_step_assert_right = TABLE_UNITTEST_STEP_ASSERT_FIELDS.FIELD_ASSERT_RIGHT;

let unittest_executor_history_id = TABLE_UNITTEST_EXECUTOR_FIELDS.FIELD_HISTORY_ID;
let unittest_executor_cost_time = TABLE_UNITTEST_EXECUTOR_FIELDS.FIELD_COST_TIME;
let unittest_executor_assert_left = TABLE_UNITTEST_EXECUTOR_FIELDS.FIELD_ASSERT_LEFT;
let unittest_executor_assert_right = TABLE_UNITTEST_EXECUTOR_FIELDS.FIELD_ASSERT_RIGHT;
let unittest_executor_result = TABLE_UNITTEST_EXECUTOR_FIELDS.FIELD_RESULT;

let unittest_report_env = TABLE_UNITTEST_EXECUTOR_REPORT_FIELDS.FIELD_ENV;
let unittest_report_result = TABLE_UNITTEST_EXECUTOR_REPORT_FIELDS.FIELD_RESULT;
let unittest_report_cost_time = TABLE_UNITTEST_EXECUTOR_REPORT_FIELDS.FIELD_COST_TIME;
let unittest_report_failure_reason = TABLE_UNITTEST_EXECUTOR_REPORT_FIELDS.FIELD_REASON;
let unittest_report_ctime = TABLE_UNITTEST_EXECUTOR_REPORT_FIELDS.FIELD_CTIME;

class SingleUnitTestReport extends Component {

    constructor(props) {
        super(props);

        this.state = {
            recentUnittestUuid: "",
            recentBatchUuid: "",
            recentUnitTestReport: {},
            selectedUnitTest: {},
            recentStepResult: [],
            openFlg: false,
        };
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        if (isStringEmpty(nextProps.batchUuid)) {
            return {
                recentUnittestUuid: "",
                recentBatchUuid: "",
                recentUnitTestReport: {},
                recentStepResult: [],
                openFlg: false
            }
        }
        return null;
    }

    async componentDidUpdate(prevProps, prevState) {
        if (this.props.batchUuid !== "" && (
            this.props.batchUuid !== prevProps.batchUuid || this.props.stepUuid !== prevProps.stepUuid
        )) {
            let prjs;
            if (isStringEmpty(this.props.iteratorId)) {
                prjs = this.props.prjs.map(row => row[prj_label]);
            } else {
                prjs = this.props.versionIterators.find(row => row[version_iterator_uuid] === this.props.iteratorId)[version_iterator_prjs]
            }
            
            let promises = []
            for(let prj of prjs) {
                promises.push(getPrjEnvValuesByPage(prj, this.props.env, ENV_VALUE_API_HOST, this.props.clientType, {
                    current: 1,
                    pageSize: 1,
                }));
            }
            let values = await Promise.all(promises);
            let hosts : any = {};
            for (let _value of values) {
                if (_value.length === 0) continue;
                hosts[_value[0][env_var_prj]] =  _value[0][env_var_pvalue];
            }
            this.buildRecentExecutorResult( this.props.iteratorId, this.props.unittestUuid, this.props.batchUuid, hosts);
        }
    }

    getDescriptions = () : Promise<DescriptionsProps['items']> => {
        let selectedEnv = this.props.envs.find(row => row[env_label] === this.state.recentUnitTestReport[unittest_report_env]);
        return [
            {
                key: '1',
                label: langTrans("unittest report desc1"),
                children: this.state.selectedUnitTest[unittest_title],
            },
            {
                key: '2',
                label: langTrans("unittest report desc2"),
                children: selectedEnv[env_remark],
            },
            {
                key: '3',
                label: langTrans("unittest report desc3"),
                children: this.state.recentUnitTestReport[unittest_report_result] === "success" ? <span style={{color:"green"}}>{langTrans("unittest report success")}</span> : (this.state.recentUnitTestReport[unittest_report_result] === "failure" ? <span style={{color:"red"}}>{langTrans("unittest report fail")}</span> : <span style={{color:"yellow"}}>{langTrans("prj unittest status4")}</span>),
            },
            {
                key: '4',
                label: langTrans("unittest report desc4"),
                children: this.state.recentUnitTestReport[unittest_report_cost_time] + langTrans("prj unittest costtime"),
            },
            {
                key: '5',
                label: langTrans("unittest report desc5"),
                children: this.state.recentUnitTestReport[unittest_report_result] ? "--" : this.state.recentUnitTestReport[unittest_report_failure_reason],
            },
            {
                key: '6',
                label: langTrans("unittest report desc6"),
                children: getdayjs(this.state.recentUnitTestReport[unittest_report_ctime]).format("YYYY-MM-DD HH:mm:ss"),
            },
        ];
    }

    buildRecentExecutorResult = async (iteratorId: string, unittestUuid : string, batchUuid : string, hosts : any) => {
        let selectedUnitTest = await getSingleUnittest(unittestUuid, this.props.env, iteratorId);
        //单测报告
        let unitTestReport = await getSingleExecutorReport(iteratorId, unittestUuid, batchUuid);
        let steps = cloneDeep(selectedUnitTest.children);
        let fakeIteratorId = selectedUnitTest[unittest_iterator];
        if (steps === undefined) steps = [];

        let stepExecutorResult = [];
        for (let _step of steps) {
            let stepUuid = _step[unittest_step_uuid];

            let stepTitle = _step[unittest_step_title];
            let stepSort = _step[unittest_step_sort];
            let prj = _step[unittest_step_prj];
            let method = _step[unittest_step_request_method];
            let unitTestAsserts = await getUnitTestStepAsserts(fakeIteratorId, unittestUuid, stepUuid);
            let singleExecutorStep = await getSingleExecutorStep(iteratorId, unittestUuid, batchUuid, stepUuid);
            if (singleExecutorStep !== null) {
                let historyId = singleExecutorStep[unittest_executor_history_id];
                let url = isStringEmpty(hosts[prj]) ? singleExecutorStep[request_history_uri] : hosts[prj] + singleExecutorStep[request_history_uri];
                let data = {};
                let responseContent = {};
                if (singleExecutorStep[request_history_json_flg]) {
                    responseContent = JSON.parse(singleExecutorStep[request_history_response_content]);
                }
                let responseHeader = singleExecutorStep[request_history_response_header];
                let responseCookie = singleExecutorStep[request_history_response_cookie];
                let assertResult = singleExecutorStep[unittest_executor_result];
                let costTime = singleExecutorStep[unittest_executor_cost_time];
                if (method === REQUEST_METHOD_POST) {
                    data = singleExecutorStep[request_history_body];
                } else if (method === REQUEST_METHOD_GET) {
                    data = singleExecutorStep[request_history_param];
                }
                if (Object.keys(data).length === 0) {
                    data = singleExecutorStep[request_history_path_variable];
                }
                let assertLeftArr = singleExecutorStep[unittest_executor_assert_left];
                let assertRightArr = singleExecutorStep[unittest_executor_assert_right];
                let stepExecutorItem : any = {};
                stepExecutorItem.key = stepUuid;
                stepExecutorItem.title = stepTitle;
                stepExecutorItem.sort = stepSort;
                stepExecutorItem.url = url;
                stepExecutorItem.historyId = historyId;
                stepExecutorItem.input = data;
                stepExecutorItem.output = {
                    header: responseHeader,
                    cookie: responseCookie,
                    content: responseContent
                };
                stepExecutorItem.assertArr = unitTestAsserts;
                stepExecutorItem.assertLeftArr = assertLeftArr;
                stepExecutorItem.assertRightArr = assertRightArr;
                stepExecutorItem.assertResult = assertResult;
                stepExecutorItem.costTime = costTime;
                stepExecutorResult.push(stepExecutorItem);
            }
        }

        this.setState({
            recentUnittestUuid: unittestUuid,
            recentBatchUuid: batchUuid,
            selectedUnitTest,
            recentStepResult: stepExecutorResult,
            openFlg: true, 
            recentUnitTestReport: unitTestReport,
        });

        this.props.cb();
    }

    render() : ReactNode {
        return (this.state.openFlg ? 
            <>
                <Descriptions title={langTrans("unittest report title")} items={this.getDescriptions()} />
                {this.state.recentStepResult.map((item, index) => {
                    const items: DescriptionsProps['items'] = [
                        {
                            key: '1',
                            label: langTrans("unittest report step field1"),
                            children: <Text copyable={{text: item.url}}><Link to={"/internet_request_send_by_history/" + item.historyId}>{ item.url }</Link></Text>,
                        },
                        {
                            key: '2',
                            label: langTrans("unittest report step field2"),
                            children: <JsonView 
                                src={item.input}   
                                name="response"
                                theme={ "bright" }
                                collapsed={false}  
                                indentWidth={4}  
                                iconStyle="triangle"
                                enableClipboard={true}
                                displayObjectSize={false}
                                displayDataTypes={false}
                                collapseStringsAfterLength={40}  />,
                        },
                        {
                            key: '3',
                            label: langTrans("unittest report step field3"),
                            children: <JsonView 
                                src={item.output}   
                                name="response"
                                theme={ "bright" }
                                collapsed={true}  
                                indentWidth={4}  
                                iconStyle="triangle"
                                enableClipboard={true}
                                displayObjectSize={false}
                                displayDataTypes={false}
                                collapseStringsAfterLength={40}  />,
                        },
                        {
                            key: '4',
                            label: langTrans("unittest report step field4"),
                            children: item.assertResult ? <span style={{color:"green"}}>{langTrans("unittest report success")}</span> : <span style={{color:"red"}}>{langTrans("unittest report fail")}</span>,
                        },
                        {
                            key: '5',
                            label: langTrans("unittest report step field5"),
                            children: item.assertResult ? item.costTime + " " + langTrans("prj unittest costtime") : " -- ",
                        },
                    ];
                    for (let _index in item.assertArr) {
                        let assertLeft = item.assertLeftArr[_index];
                        if (typeof assertLeft === "number") {
                            assertLeft = assertLeft.toString(); 
                        }
                        if (isStringEmpty(assertLeft)) continue;
                        let _indexNumber = Number(_index) + 1;
                        items.push({
                            key : 50 + _index,
                            label: langTrans("unittest report step field6") + _indexNumber + "：",
                            children: "[" + item.assertArr[_index][unittest_step_assert_operator] + "] " + item.assertArr[_index][unittest_step_assert_title],
                        });
                        items.push({
                            key : 51 + _index,
                            label: langTrans("unittest report step field7"),
                            children: item.assertArr[_index][unittest_step_assert_left] + " -> " + item.assertLeftArr[_index],
                        });
                        items.push({
                            key : 52 + _index,
                            label: langTrans("unittest report step field8"),
                            children: item.assertArr[_index][unittest_step_assert_right] + " -> " + item.assertRightArr[_index] 
                        });
                    }
                    return (<Descriptions key={item.key} column={1}  title={langFormat("unittest report step title", {
                        sort: item.sort,
                        title: item.title,
                    })} items={items} />)
                })}
            </>
        : null)
    }
}

function mapStateToProps (state) {
    return {
        clientType: state.device.clientType,
        unittest: state.unittest.list,
        prjs: state.prj.list,
        envs: state.env.list,
        versionIterators: state['version_iterator'].list,
    }
}
      
export default connect(mapStateToProps)(SingleUnitTestReport);