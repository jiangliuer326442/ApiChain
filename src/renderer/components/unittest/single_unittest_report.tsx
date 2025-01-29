import { Component, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import JsonView from 'react-json-view';
import { Descriptions, Typography } from "antd";
import type { DescriptionsProps } from 'antd';
import { cloneDeep } from 'lodash';

import { getdayjs, isStringEmpty } from '../../util';
import {
    REQUEST_METHOD_GET,
    REQUEST_METHOD_POST
} from '../../../config/global_config';
import { ENV_VALUE_API_HOST } from '../../../config/envKeys';
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
} from '../../../config/db';

import {
    getSingleUnittest,
    getSingleExecutorReport,
    getSingleExecutorStep,
    getUnitTestStepAsserts,
} from '../../actions/unittest';
import {
    getEnvValues
} from '../../actions/env_value';

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
                promises.push(getEnvValues(prj, this.props.env, this.props.iteratorId, "", ENV_VALUE_API_HOST, this.props.dispatch, result => {}));
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
                label: '测试用例',
                children: this.state.selectedUnitTest[unittest_title],
            },
            {
                key: '2',
                label: '运行环境',
                children: selectedEnv[env_remark],
            },
            {
                key: '3',
                label: '执行结果',
                children: this.state.recentUnitTestReport[unittest_report_result] === "success" ? <span style={{color:"green"}}>成功</span> : (this.state.recentUnitTestReport[unittest_report_result] === "failure" ? <span style={{color:"red"}}>失败</span> : <span style={{color:"yellow"}}>未知</span>),
            },
            {
                key: '4',
                label: '接口耗时',
                children: this.state.recentUnitTestReport[unittest_report_cost_time] + "毫秒",
            },
            {
                key: '5',
                label: '错误信息',
                children: this.state.recentUnitTestReport[unittest_report_result] ? "--" : this.state.recentUnitTestReport[unittest_report_failure_reason],
            },
            {
                key: '6',
                label: '执行时间',
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
                <Descriptions title="最近一次测试用例执行结果：" items={this.getDescriptions()} />
                {this.state.recentStepResult.map((item, index) => {
                    const items: DescriptionsProps['items'] = [
                        {
                            key: '1',
                            label: '请求地址',
                            children: <Text copyable={{text: item.url}}><Link to={"/internet_request_send_by_history/" + item.historyId}>{ item.url }</Link></Text>,
                        },
                        {
                            key: '2',
                            label: '流入',
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
                            label: '流出',
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
                            label: '结果',
                            children: item.assertResult ? <span style={{color:"green"}}>成功</span> : <span style={{color:"red"}}>失败</span>,
                        },
                        {
                            key: '5',
                            label: '耗时',
                            children: item.assertResult ? item.costTime + " 毫秒" : " -- ",
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
                            label: "断言" + _indexNumber + "：",
                            children: "[" + item.assertArr[_index][unittest_step_assert_operator] + "] " + item.assertArr[_index][unittest_step_assert_title],
                        });
                        items.push({
                            key : 51 + _index,
                            label: "操作符👈：",
                            children: item.assertArr[_index][unittest_step_assert_left] + " -> " + item.assertLeftArr[_index],
                        });
                        items.push({
                            key : 52 + _index,
                            label: "操作符👉：",
                            children: item.assertArr[_index][unittest_step_assert_right] + " -> " + item.assertRightArr[_index] 
                        });
                    }
                    return (<Descriptions key={item.key} column={1}  title={"步骤 " + item.sort + " ：" + item.title} items={items} />)
                })}
            </>
        : null)
    }
}

function mapStateToProps (state) {
    return {
        unittest: state.unittest.list,
        prjs: state.prj.list,
        envs: state.env.list,
        versionIterators: state['version_iterator'].list,
    }
}
      
export default connect(mapStateToProps)(SingleUnitTestReport);