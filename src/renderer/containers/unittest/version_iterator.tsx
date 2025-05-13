import { Component, ReactNode } from 'react';
import { connect } from 'react-redux';
import { 
    Breadcrumb, Layout, Flex, Dropdown,
    Popconfirm, Table, Space, Button, 
    Select, Form, message, Typography
} from "antd";
import type { MenuProps } from 'antd';
import { 
    EditOutlined, 
    MergeOutlined, 
    DeleteOutlined, 
    MoreOutlined
} from '@ant-design/icons';

import { 
    TABLE_UNITTEST_FIELDS,
    TABLE_VERSION_ITERATION_FIELDS,
    TABLE_UNITTEST_STEPS_FIELDS,
    TABLE_UNITTEST_EXECUTOR_REPORT_FIELDS,
    UNAME, TABLE_UNITTEST_STEPS_NAME,
} from '@conf/db';
import { getWikiUnittest } from '@conf/url';
import {
    UNITTEST_RESULT_SUCCESS,
    UNITTEST_RESULT_FAILURE,
} from '@conf/unittest';
import {
    SHOW_ADD_UNITTEST_MODEL,
    SHOW_EDIT_UNITTEST_MODEL
} from '@conf/redux';
import { UNITTEST_ENV } from '@conf/storage';
import { getdayjs, isStringEmpty } from '@rutil/index';
import { getEnvs } from '@act/env';
import {
    getIterationUnitTests, 
    delUnitTest, 
    delUnitTestStep,
    executeIteratorUnitTest,
    continueIteratorExecuteUnitTest,
    copyFromIteratorToProject,
    copyFromProjectToIterator,
    batchMoveIteratorUnittest,
} from '@act/unittest';
import { getUnitTestRequests } from '@act/version_iterator_requests';
import { getOpenVersionIterators } from '@act/version_iterator';
import { buildUnitTestStepFromRequest } from '@act/unittest_step';
import PayModel from '@comp/topup';
import SingleUnitTestReport from '@comp/unittest/single_unittest_report';
import AddUnittestComponent from '@comp/unittest/add_unittest';
import { langTrans } from '@lang/i18n';

const { Text, Link } = Typography;
const { Header, Content, Footer } = Layout;

let version_iterator_uuid = TABLE_VERSION_ITERATION_FIELDS.FIELD_UUID;
let version_iterator_title = TABLE_VERSION_ITERATION_FIELDS.FIELD_NAME;

let unittest_uuid = TABLE_UNITTEST_FIELDS.FIELD_UUID;
let unittest_collectFlg = TABLE_UNITTEST_FIELDS.FIELD_COLLECT;
let unittest_title = TABLE_UNITTEST_FIELDS.FIELD_TITLE;
let unittest_folder = TABLE_UNITTEST_FIELDS.FIELD_FOLD_NAME;
let unittest_ctime = TABLE_UNITTEST_FIELDS.FIELD_CTIME;

let unittest_step_unittest_uuid = TABLE_UNITTEST_STEPS_FIELDS.FIELD_UNITTEST_UUID;
let unittest_step_project = TABLE_UNITTEST_STEPS_FIELDS.FIELD_MICRO_SERVICE_LABEL;
let unittest_step_uri = TABLE_UNITTEST_STEPS_FIELDS.FIELD_URI;
let unittest_step_uuid = TABLE_UNITTEST_STEPS_FIELDS.FIELD_UUID;
let unittest_step_request_head = TABLE_UNITTEST_STEPS_FIELDS.FIELD_REQUEST_HEADER;
let unittest_step_request_body = TABLE_UNITTEST_STEPS_FIELDS.FIELD_REQUEST_BODY;
let unittest_step_request_param = TABLE_UNITTEST_STEPS_FIELDS.FIELD_REQUEST_PARAM;
let unittest_step_request_path_variable = TABLE_UNITTEST_STEPS_FIELDS.FIELD_REQUEST_PATH_VARIABLE;

let unittest_report_result = TABLE_UNITTEST_EXECUTOR_REPORT_FIELDS.FIELD_RESULT;
let unittest_report_env = TABLE_UNITTEST_EXECUTOR_REPORT_FIELDS.FIELD_ENV;
let unittest_report_step = TABLE_UNITTEST_EXECUTOR_REPORT_FIELDS.FIELD_STEP;
let unittest_report_batch = TABLE_UNITTEST_EXECUTOR_REPORT_FIELDS.FIELD_BATCH_UUID;
let unittest_report_cost_time = TABLE_UNITTEST_EXECUTOR_REPORT_FIELDS.FIELD_COST_TIME;

class UnittestListVersion extends Component {

    constructor(props) {
        super(props);
        let iteratorId = props.match.params.id;
        this.state = {
            executeFlg: true,
            column: [
                {
                  title: langTrans("prj unittest table field1"),
                  dataIndex: unittest_title,
                  render: (title) => {
                    return title;
                  }
                },
                {
                    title: langTrans("prj unittest table field2"),
                    dataIndex: unittest_report_result,
                    render: (result, record) => {
                        //整体
                        if (record[unittest_folder] !== undefined) {
                            if (result === undefined) {
                                return <span style={{color:"yellow"}}>{langTrans("prj unittest status1")}</span>;
                            } else if (result === UNITTEST_RESULT_SUCCESS) {
                                return <span style={{color:"green"}}>{langTrans("prj unittest status2")}</span>;
                            } else if (result === UNITTEST_RESULT_FAILURE) {
                                return <span style={{color:"red"}}>{langTrans("prj unittest status3")}</span>;
                            } else {
                                return <span style={{color:"yellow"}}>{langTrans("prj unittest status4")}</span>;
                            }
                        } else {
                            if (result === undefined) {
                                return <span style={{color:"yellow"}}>{langTrans("prj unittest status1")}</span>;
                            } else if (result) {
                                return <span style={{color:"green"}}>{langTrans("prj unittest status2")}</span>;
                            } else {
                                return <span style={{color:"red"}}>{langTrans("prj unittest status3")}</span>;
                            }
                        }
                    }
                },
                {
                    title: langTrans("prj unittest table field3"),
                    dataIndex: unittest_report_cost_time,
                    render: (cost_time, record) => {
                        let result = record[unittest_report_result];
                        if (result === "success" || result === true) {
                            return cost_time + langTrans("prj unittest costtime");
                        } else if (result) {
                            return "--";
                        }
                    }
                },
                {
                  title: langTrans("prj unittest table field4"),
                  dataIndex: UNAME,
                },
                {
                  title: langTrans("prj unittest table field5"),
                  dataIndex: unittest_ctime,
                  render: (time) => { return getdayjs(time).format("YYYY-MM-DD") },
                },
                {
                    title: langTrans("prj unittest table field6"),
                    dataIndex: 'operater',
                    render: (_, record) => {
                        //整体
                        if (record[unittest_folder] !== undefined) {
                            let unittestUuid = record[unittest_uuid];
                            return (
                                <Space>
                                    <Button type="link" href={ "#/version_iterator_tests_step_add/" + this.state.iteratorId + "/" + unittestUuid }>{langTrans("version unittest act1")}</Button>
                                    {record.result !== undefined ? 
                                    <Button type='text' href={ '#/unittest_executor_record/' + record[unittest_report_env] + '/' + this.state.iteratorId + '/' + unittestUuid }>{langTrans("prj unittest act2")}</Button>
                                    : null}
                                    <Dropdown menu={this.getMoreUnittest(record)}>
                                        <Button type="text" icon={<MoreOutlined />} />
                                    </Dropdown>
                                </Space>
                            );
                        } else {
                            //整体单测的 uuid
                            let valueUnittestStepUnittestUuid = record[unittest_step_unittest_uuid];
                            //当前步骤的 uuid
                            let valueUnittestStepUuid = record[unittest_step_uuid];
                            //报告中的下一步
                            let valueUnittestReportStep = record[unittest_report_step];
                            return (
                                <Space>
                                    {valueUnittestStepUuid === valueUnittestReportStep ? 
                                    <Button type="link" onClick={async ()=>{
                                        this.setState({
                                            executeFlg: false,
                                            unittestUuid: "",
                                            batchUuid: "",
                                        });

                                        let batchUuid = await continueIteratorExecuteUnitTest(
                                            this.state.iteratorId, 
                                            valueUnittestStepUnittestUuid, 
                                            record[unittest_report_batch], 
                                            valueUnittestReportStep, 
                                            record[unittest_report_env], 
                                            this.props.dispatch,
                                            (batchUuid : string, stepUuid : string) => {
                                                this.setState({ unittestUuid: valueUnittestStepUnittestUuid, batchUuid, stepUuid})
                                            }
                                        );

                                        this.setState({
                                            unittestUuid: valueUnittestStepUnittestUuid,
                                            batchUuid,
                                        })
                                    }}>{langTrans("prj unittest act3")}</Button>
                                    : null}
                                    <Button 
                                        type='link' 
                                        href={ "#/version_iterator_tests_step_edit/" + this.state.iteratorId + "/" + valueUnittestStepUnittestUuid + "/" + valueUnittestStepUuid }
                                    >{langTrans("prj unittest act4")}</Button>
                                    <Button type="text" onClick={async ()=>{
                                        let request = (await getUnitTestRequests(record[unittest_step_project], this.state.iteratorId, record[unittest_step_uri]))[0];
                                        let stepRequest = await buildUnitTestStepFromRequest(request);
                                        let unit_test_step = await window.db[TABLE_UNITTEST_STEPS_NAME]
                                        .where(unittest_step_uuid).equals(valueUnittestStepUuid)
                                        .first();
                                        unit_test_step[unittest_step_request_head] = stepRequest.requestHead;
                                        unit_test_step[unittest_step_request_body] = stepRequest.requestBody;
                                        unit_test_step[unittest_step_request_param] = stepRequest.requestParam;
                                        unit_test_step[unittest_step_request_path_variable] = stepRequest.requestPathVariable;
                                        await window.db[TABLE_UNITTEST_STEPS_NAME].put(unit_test_step);
                                        message.success("重置步骤 " + unit_test_step[unittest_title] + " 的参数成功");
                                        getIterationUnitTests(this.state.iteratorId, this.state.folder, this.state.env, this.props.dispatch);
                                    }}>{langTrans("version unittest act4")}</Button>
                                    <Dropdown menu={this.getMoreStep(record)}>
                                        <Button type="text" icon={<MoreOutlined />} />
                                    </Dropdown>
                                </Space>
                            );
                        }
                    }
                },
            ],
            iteratorId,
            unittestUuid: "", 
            batchUuid: "",
            stepUuid: "",
            env: localStorage.getItem(UNITTEST_ENV) ? localStorage.getItem(UNITTEST_ENV) : null,
            folder: null,
            showPay: false,
            versionIterators: [],
            selectedUnittests: [],
        };
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        let nextIteratorId = nextProps.match.params.id;
        let prevIteratorId = prevState.iteratorId;
        if (nextIteratorId !== prevIteratorId) {
            return {
                iteratorId: nextIteratorId,
                unittestUuid: "",
                batchUuid: "",
            };
        }

        return null;
    }

    async componentDidMount(): void {
        if(this.props.envs.length === 0) {
            getEnvs(this.props.clientType, this.props.dispatch);
        }
        getIterationUnitTests(this.state.iteratorId, this.state.folder, this.state.env, this.props.dispatch);
        this.setMovedIteratos();
    }

    async componentDidUpdate(prevProps) {  
        if (this.props.match.params.id !== prevProps.match.params.id) { 
            getIterationUnitTests(this.state.iteratorId, this.state.folder, this.state.env, this.props.dispatch);
            this.setMovedIteratos();
        }
    }

    setMovedIteratos = async () => {
        let versionIterators = (await getOpenVersionIterators(this.props.dispatch))
        .filter(item => item[version_iterator_uuid] != this.state.iteratorId)
        .map(item => {
            return {value: item[version_iterator_uuid], label: item[version_iterator_title]}
        });
        this.setState({ versionIterators });
    }

    getMoreStep = (record : any) : MenuProps => {
        if (record[unittest_folder] === undefined) {
            //整体单测的 uuid
            let valueUnittestStepUnittestUuid = record[unittest_step_unittest_uuid];
            //当前步骤的 uuid
            let valueUnittestStepUuid = record[unittest_step_uuid];

            return {'items': [{
                key: "1",
                danger: true,
                label: (
                    <Popconfirm
                        title={langTrans("version unittest del title")}
                        description={langTrans("version unittest del desc")}
                        onConfirm={e => {
                            delUnitTestStep(valueUnittestStepUuid, ()=>{
                                getIterationUnitTests(this.state.iteratorId, this.state.folder, this.state.env, this.props.dispatch);
                            });
                        }}
                        okText={langTrans("version unittest del sure")}
                        cancelText={langTrans("version unittest del cancel")}>
                        <Button danger type="link" icon={<DeleteOutlined />}>{langTrans("prj unittest act5")}</Button>
                    </Popconfirm>
                ),
            }]};
        } else {
            return {'items': [] };
        }
    }

    getMoreUnittest = (record : any) : MenuProps => {
        if (record[unittest_folder] !== undefined) {
            return {'items': [{
                key: "1",
                label: <Button type='link' icon={<EditOutlined />} onClick={()=>this.editUnitTestClick(record)}>{langTrans("prj unittest act4")}</Button>,
            },{
                key: "2",
                danger: true,
                label:  <Popconfirm
                            title={langTrans("prj unittest del title")}
                            description={langTrans("prj unittest del desc")}
                            onConfirm={e => {
                                delUnitTest(record, ()=>{
                                    getIterationUnitTests(this.state.iteratorId, this.state.folder, this.state.env, this.props.dispatch);
                                });
                            }}
                            okText={langTrans("prj unittest del sure")}
                            cancelText={langTrans("prj unittest del cancel")}
                            >
                            <Button danger type="link" icon={<DeleteOutlined />}>{langTrans("prj unittest act5")}</Button>
                        </Popconfirm>,
            },{
                key: "3",
                danger: (record[unittest_collectFlg] ? true : false),
                label: (record[unittest_collectFlg] ? 
                    <Popconfirm
                        title={langTrans("version unittest remove title")}
                        description={langTrans("version unittest remove desc")}
                        onConfirm={e => {
                            this.undoExportUnitTestClick(record);
                        }}
                        okText={langTrans("version unittest remove sure")}
                        cancelText={langTrans("version unittest remove cancel")}
                        >
                        <Button danger type='link' icon={<MergeOutlined />}>{langTrans("version unittest act3")}</Button>
                    </Popconfirm> 
                : 
                    <Button type='text' icon={<MergeOutlined />} onClick={()=>this.exportUnitTestClick(record)}>{langTrans("version unittest act2")}</Button>),
            }]};
        } else {
            return {'items': [] };
        }
    }

    setEnvironmentChange = (value: string) => {
        this.setState({env: value});
        getIterationUnitTests(this.state.iteratorId, this.state.folder, value, this.props.dispatch);
    }

    setFolderChange = (value: string) => {
        let selectedFolder;
        if (value === undefined) {
            selectedFolder = null;
        } else {
            selectedFolder = value;
        }
        this.setState({folder: value});
        getIterationUnitTests(this.state.iteratorId, selectedFolder, this.state.env, this.props.dispatch);
    }

    undoExportUnitTestClick = (record) => {
        let unittestId = record[unittest_uuid];
        copyFromProjectToIterator(unittestId, ()=>{
            message.success(langTrans("unittest export revoke success"));
            getIterationUnitTests(this.state.iteratorId, this.state.folder, this.state.env, this.props.dispatch);
        });
    }

    exportUnitTestClick = (record) => {
        let iteratorId = this.state.iteratorId;
        let unittestId = record[unittest_uuid];
        copyFromIteratorToProject(iteratorId, unittestId, this.props.device, ()=>{
            message.success(langTrans("unittest export success"));
            getIterationUnitTests(iteratorId, this.state.folder, this.state.env, this.props.dispatch);
        });
    }

    editUnitTestClick = (record) => {
        this.props.dispatch({
            type: SHOW_EDIT_UNITTEST_MODEL,
            iteratorId: this.state.iteratorId,
            unitTestUuid: record[unittest_uuid],
            title: record[unittest_title],
            folder: record[unittest_folder],
            open: true
        });
    }

    addUnitTestClick = () => {
        this.props.dispatch({
            type: SHOW_ADD_UNITTEST_MODEL,
            iteratorId: this.state.iteratorId,
            unitTestUuid: "",
            open: true
        });
    }

    setSelectedUnittests = newSelectedUnittests => {
        let filteredUnittestKeys = newSelectedUnittests.filter(item => item.indexOf("$$") === -1);
        this.setState({selectedUnittests: filteredUnittestKeys});
    }

    render() : ReactNode {
        return (
            <Layout>
                <Header style={{ padding: 0 }}>
                    {langTrans("version unittest title")} <Text type="secondary"><Link href={getWikiUnittest()}>{langTrans("version unittest link")}</Link></Text>
                </Header>
                <Content style={{ padding: '0 16px' }}>
                    <AddUnittestComponent refreshCb={() => getIterationUnitTests(this.state.iteratorId, this.state.folder, this.state.env, this.props.dispatch)} />
                    <Breadcrumb style={{ margin: '16px 0' }} items={[
                        { title: langTrans("version unittest bread1") }, 
                        { title: langTrans("version unittest bread2") }
                    ]} />
                    <PayModel showPay={this.state.showPay} cb={showPay => this.setState({showPay})} />
                    <Flex justify="space-between" align="center" style={{marginBottom: 16}}>
                        <Form layout="inline">
                            <Form.Item label={langTrans("prj unittest operator1")}>
                                <Select
                                    value={ this.state.env }
                                    onChange={this.setEnvironmentChange}
                                    style={{ width: 120 }}
                                    options={this.props.envs.map(item => {
                                        return {value: item.label, label: item.remark}
                                    })}
                                />
                            </Form.Item>
                            <Form.Item label={langTrans("prj unittest operator2")}>
                                <Select allowClear
                                    value={ this.state.folder }
                                    onChange={this.setFolderChange}
                                    style={{ width: 120 }}
                                    options={this.state.iteratorId in this.props.folders && this.props.folders[this.state.iteratorId].map(item => {
                                        return { value: item, label: item }
                                    })}
                                />
                            </Form.Item>
                            <Form.Item label={langTrans("version unittest operator1")}>
                                <Select allowClear
                                    style={{minWidth: 130}}
                                    onChange={ value => {
                                        if (isStringEmpty(value)) {
                                            return;
                                        }
                                        batchMoveIteratorUnittest(this.state.iteratorId, this.state.selectedUnittests, value, () => {
                                            this.state.selectedUnittests = [];
                                            message.success("移动迭代成功");
                                            getIterationUnitTests(this.state.iteratorId, this.state.folder, this.state.env, this.props.dispatch);
                                        });
                                    }}
                                    options={ this.state.versionIterators }
                                />
                            </Form.Item>
                            <Form.Item>
                                <Button 
                                    type="primary"  
                                    disabled={!this.state.executeFlg || this.state.selectedUnittests.length === 0} 
                                    onClick={() => {
                                        if (!this.props.device.vipFlg) {
                                            this.setState({
                                                showPay: true,
                                            });
                                            return;
                                        }
                                        if (isStringEmpty(this.state.env)) {
                                            message.error(langTrans("unittest env check"));
                                            return;
                                        }

                                        localStorage.setItem(UNITTEST_ENV, this.state.env);

                                        for (let unittestUuid of this.state.selectedUnittests) {
                                            this.setState({
                                                executeFlg: false,
                                                unittestUuid,
                                                batchUuid: "",
                                            });
                                            let currentUnitTest = this.props.unittest[this.state.iteratorId].find(item => item[unittest_uuid] === unittestUuid);
                                            executeIteratorUnitTest(
                                                this.state.iteratorId, unittestUuid, currentUnitTest.children, this.state.env, this.props.dispatch, 
                                                (batchUuid : string, stepUuid : string) => {
                                                    this.setState({ unittestUuid, batchUuid, stepUuid})
                                                }
                                            );
                                        }
                                    }}
                                >{langTrans("prj unittest btn")}</Button>
                            </Form.Item>
                        </Form>
                        <Button type="link" onClick={this.addUnitTestClick}>{langTrans("version unittest btn")}</Button>
                    </Flex>
                    <SingleUnitTestReport 
                        iteratorId={ this.state.iteratorId }
                        unittestUuid={ this.state.unittestUuid }
                        batchUuid={ this.state.batchUuid }
                        stepUuid={ this.state.stepUuid }
                        env={ this.state.env }
                        cb={ () => {
                            this.setState({executeFlg: true});
                            getIterationUnitTests(this.state.iteratorId, this.state.folder, this.state.env, this.props.dispatch);
                        } }
                        />
                    <Table 
                        rowSelection={{selectedRowKeys: this.state.selectedUnittests, onChange: this.setSelectedUnittests}}
                        columns={this.state.column} 
                        dataSource={this.props.unittest[this.state.iteratorId] ? this.props.unittest[this.state.iteratorId] : []} 
                        />
                </Content>
                <Footer style={{ textAlign: 'center' }}>
                ApiChain ©{new Date().getFullYear()} Created by 方海亮
                </Footer>
            </Layout>
        )
    }

}

function mapStateToProps (state) {
    return {
        device : state.device,
        unittest: state.unittest.list,
        folders: state.unittest.folders,
        envs: state.env.list,
        clientType: state.device.clientType,
    }
}
      
export default connect(mapStateToProps)(UnittestListVersion);