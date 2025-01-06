import { Component, ReactNode } from 'react';
import { connect } from 'react-redux';
import { 
    Breadcrumb, Layout, Flex, Dropdown,
    Popconfirm, Table, Space, Button, 
    Select, Form, message
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
    UNAME,
} from '@conf/db';
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
import { getOpenVersionIterators } from '@act/version_iterator';
import PayModel from '@comp/topup';
import SingleUnitTestReport from '@comp/unittest/single_unittest_report';
import AddUnittestComponent from '@comp/unittest/add_unittest';
import e from 'express';

const { Header, Content, Footer } = Layout;

let version_iterator_uuid = TABLE_VERSION_ITERATION_FIELDS.FIELD_UUID;
let version_iterator_title = TABLE_VERSION_ITERATION_FIELDS.FIELD_NAME;

let unittest_uuid = TABLE_UNITTEST_FIELDS.FIELD_UUID;
let unittest_collectFlg = TABLE_UNITTEST_FIELDS.FIELD_COLLECT;
let unittest_title = TABLE_UNITTEST_FIELDS.FIELD_TITLE;
let unittest_folder = TABLE_UNITTEST_FIELDS.FIELD_FOLD_NAME;
let unittest_ctime = TABLE_UNITTEST_FIELDS.FIELD_CTIME;

let unittest_step_unittest_uuid = TABLE_UNITTEST_STEPS_FIELDS.FIELD_UNITTEST_UUID;
let unittest_step_uuid = TABLE_UNITTEST_STEPS_FIELDS.FIELD_UUID;

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
                  title: '测试用例',
                  dataIndex: unittest_title,
                  render: (title) => {
                    return title;
                  }
                },
                {
                    title: '执行结果',
                    dataIndex: unittest_report_result,
                    render: (result, record) => {
                        //整体
                        if (record[unittest_folder] !== undefined) {
                            if (result === undefined) {
                                return <span style={{color:"yellow"}}>未执行</span>;
                            } else if (result === UNITTEST_RESULT_SUCCESS) {
                                return <span style={{color:"green"}}>成功</span>;
                            } else if (result === UNITTEST_RESULT_FAILURE) {
                                return <span style={{color:"red"}}>失败</span>;
                            } else {
                                return <span style={{color:"yellow"}}>未知</span>;
                            }
                        } else {
                            if (result === undefined) {
                                return <span style={{color:"yellow"}}>未执行</span>;
                            } else if (result) {
                                return <span style={{color:"green"}}>成功</span>;
                            } else {
                                return <span style={{color:"red"}}>失败</span>;
                            }
                        }
                    }
                },
                {
                    title: '消耗时间',
                    dataIndex: unittest_report_cost_time,
                    render: (cost_time, record) => {
                        let result = record[unittest_report_result];
                        if (result === "success" || result === true) {
                            return cost_time + "毫秒";
                        } else if (result) {
                            return "--";
                        }
                    }
                },
                {
                  title: '创建人',
                  dataIndex: UNAME,
                },
                {
                  title: '创建时间',
                  dataIndex: unittest_ctime,
                  render: (time) => { return getdayjs(time).format("YYYY-MM-DD") },
                },
                {
                    title: '操作',
                    dataIndex: 'operater',
                    render: (_, record) => {
                        //整体
                        if (record[unittest_folder] !== undefined) {
                            let unittestUuid = record[unittest_uuid];
                            return (
                                <Space>
                                    <Button type="link" href={ "#/version_iterator_tests_step_add/" + this.state.iteratorId + "/" + unittestUuid }>添加步骤</Button>
                                    {record.result !== undefined ? 
                                    <Button type='text' href={ '#/unittest_executor_record/' + record[unittest_report_env] + '/' + iteratorId + '/' + unittestUuid }>执行记录</Button>
                                    : null}
                                    <Dropdown menu={this.getMore(record)}>
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
                                            iteratorId, 
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
                                    }}>继续执行</Button>
                                    : null}
                                    <Button icon={<EditOutlined />} type='link' href={ "#/version_iterator_tests_step_edit/" + this.state.iteratorId + "/" + valueUnittestStepUnittestUuid + "/" + valueUnittestStepUuid } />
                                    <Popconfirm
                                        title="删除测试用例步骤"
                                        description="确定删除该步骤吗？"
                                        onConfirm={e => {
                                            delUnitTestStep(valueUnittestStepUuid, ()=>{
                                                getIterationUnitTests(this.state.iteratorId, this.state.folder, this.state.env, this.props.dispatch);
                                            });
                                        }}
                                        okText="删除"
                                        cancelText="取消">
                                        <Button danger type="link" icon={<DeleteOutlined />} />
                                    </Popconfirm>
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
            getEnvs(this.props.dispatch);
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
        let versionIterators = (await getOpenVersionIterators())
        .filter(item => item[version_iterator_uuid] != this.state.iteratorId)
        .map(item => {
            return {value: item[version_iterator_uuid], label: item[version_iterator_title]}
        });
        this.setState({ versionIterators });
    }

    getMore = (record : any) : MenuProps => {
        if (record[unittest_folder] !== undefined) {
            return {'items': [{
                key: "1",
                label: <Button type='link' icon={<EditOutlined />} onClick={()=>this.editUnitTestClick(record)}>编辑</Button>,
            },{
                key: "2",
                danger: true,
                label:  <Popconfirm
                            title="删除测试用例"
                            description="确定删除该测试用例吗？"
                            onConfirm={e => {
                                delUnitTest(record, ()=>{
                                    getIterationUnitTests(this.state.iteratorId, this.state.folder, this.state.env, this.props.dispatch);
                                });
                            }}
                            okText="删除"
                            cancelText="取消"
                            >
                            <Button danger type="link" icon={<DeleteOutlined />}>删除</Button>
                        </Popconfirm>,
            },{
                key: "3",
                danger: (record[unittest_collectFlg] ? true : false),
                label: (record[unittest_collectFlg] ? 
                    <Popconfirm
                        title="从项目移除测试用例"
                        description="确定从项目移除该测试用例吗？"
                        onConfirm={e => {
                            this.undoExportUnitTestClick(record);
                        }}
                        okText="移除"
                        cancelText="取消"
                        >
                        <Button danger type='link' icon={<MergeOutlined />}>从项目移除</Button>
                    </Popconfirm> 
                : 
                    <Button type='text' icon={<MergeOutlined />} onClick={()=>this.exportUnitTestClick(record)}>导出到项目</Button>),
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
            message.success("已成功从项目删除该单测");
            getIterationUnitTests(this.state.iteratorId, this.state.folder, this.state.env, this.props.dispatch);
        });
    }

    exportUnitTestClick = (record) => {
        let iteratorId = this.state.iteratorId;
        let unittestId = record[unittest_uuid];
        copyFromIteratorToProject(iteratorId, unittestId, this.props.device, ()=>{
            message.success("导出单测到项目成功");
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
                    迭代单测列表
                </Header>
                <Content style={{ padding: '0 16px' }}>
                    <AddUnittestComponent refreshCb={() => getIterationUnitTests(this.state.iteratorId, this.state.folder, this.state.env, this.props.dispatch)} />
                    <Breadcrumb style={{ margin: '16px 0' }} items={[
                        { title: '迭代' }, 
                        { title: '单测列表' }
                    ]} />
                    <PayModel showPay={this.state.showPay} cb={showPay => this.setState({showPay})} />
                    <Flex justify="space-between" align="center" style={{marginBottom: 16}}>
                        <Form layout="inline">
                            <Form.Item label="选择环境">
                                <Select
                                    value={ this.state.env }
                                    onChange={this.setEnvironmentChange}
                                    style={{ width: 120 }}
                                    options={this.props.envs.map(item => {
                                        return {value: item.label, label: item.remark}
                                    })}
                                />
                            </Form.Item>
                            <Form.Item label="选择文件夹">
                                <Select allowClear
                                    value={ this.state.folder }
                                    onChange={this.setFolderChange}
                                    style={{ width: 120 }}
                                    options={this.state.iteratorId in this.props.folders && this.props.folders[this.state.iteratorId].map(item => {
                                        return { value: item, label: item }
                                    })}
                                />
                            </Form.Item>
                            <Form.Item label="移动到迭代">
                                <Select
                                    style={{minWidth: 130}}
                                    onChange={ value => {
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
                                            message.error("需要选择服务器环境");
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
                                >执行用例</Button>
                            </Form.Item>
                        </Form>
                        <Button type="link" onClick={this.addUnitTestClick}>添加单测</Button>
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
    }
}
      
export default connect(mapStateToProps)(UnittestListVersion);