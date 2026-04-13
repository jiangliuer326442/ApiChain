import { Component, ReactNode } from 'react';
import { connect } from 'react-redux';
import { 
    Breadcrumb, Layout, Flex, Dropdown,
    Popconfirm, Table, Space, Button, 
    Select, Form, message, Typography,
    Modal, Input,
} from "antd";
import type { MenuProps } from 'antd';
import { 
    EditOutlined, 
    MergeOutlined, 
    DeleteOutlined, 
    MoreOutlined,
    ClearOutlined,
    DotChartOutlined,
    CameraOutlined
} from '@ant-design/icons';

import { EMPTY_STRING } from '@conf/global_config';
import { 
    TABLE_UNITTEST_FIELDS,
    TABLE_VERSION_ITERATION_FIELDS,
    TABLE_UNITTEST_STEPS_FIELDS,
    TABLE_UNITTEST_EXECUTOR_REPORT_FIELDS,
    UNAME,
} from '@conf/db';
import { getWikiUnittest } from '@conf/url';
import {
    UNITTEST_RESULT_SUCCESS,
    UNITTEST_RESULT_FAILURE,
} from '@conf/unittest';
import {
    SHOW_ADD_UNITTEST_MODEL,
    GET_ITERATOR_TESTS,
    SHOW_EDIT_UNITTEST_MODEL,
    GET_ENV
} from '@conf/redux';
import { getdayjs, isStringEmpty } from '@rutil/index';
import { getEnvs } from '@act/env';
import {
    getIterationUnitTests, 
    delUnitTest, 
    executeIteratorUnitTest,
    copyFromIteratorToProject,
    copyFromProjectToIterator,
    batchMoveUnittest,
} from '@act/unittest';
import {
    delUnitTestStep,
} from '@act/unittest_step';
import {
    addUnittestTemplate,
} from '@act/unittest_template';
import PayMemberModel from '@comp/topup/member';
import SingleUnitTestReport from '@comp/unittest/single_unittest_report';
import AddUnittestComponent from '@comp/unittest/add_unittest';
import { langTrans } from '@lang/i18n';
import { cloneDeep } from 'lodash';

const { Text, Link } = Typography;
const { Header, Content, Footer } = Layout;

let version_iterator_uuid = TABLE_VERSION_ITERATION_FIELDS.FIELD_UUID;
let version_iterator_title = TABLE_VERSION_ITERATION_FIELDS.FIELD_NAME;

let unittest_uuid = TABLE_UNITTEST_FIELDS.FIELD_UUID;
let unittest_collectFlg = TABLE_UNITTEST_FIELDS.FIELD_COLLECT;
let unittest_refer = TABLE_UNITTEST_FIELDS.FIELD_REFER_FROM;
let unittest_clean = TABLE_UNITTEST_FIELDS.FIELD_CLEANNER;
let unittest_title = TABLE_UNITTEST_FIELDS.FIELD_TITLE;
let unittest_folder = TABLE_UNITTEST_FIELDS.FIELD_FOLD_NAME;
let unittest_ctime = TABLE_UNITTEST_FIELDS.FIELD_CTIME;

let unittest_step_unittest_uuid = TABLE_UNITTEST_STEPS_FIELDS.FIELD_UNITTEST_UUID;
let unittest_step_uuid = TABLE_UNITTEST_STEPS_FIELDS.FIELD_UUID;

let unittest_report_result = TABLE_UNITTEST_EXECUTOR_REPORT_FIELDS.FIELD_RESULT;
let unittest_report_env = TABLE_UNITTEST_EXECUTOR_REPORT_FIELDS.FIELD_ENV;
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
                            return (
                                <Space>
                                {record["source"] == "db" &&
                                <>
                                    <Button 
                                        type='link' 
                                        href={ "#/version_iterator_tests_step_edit/" + this.state.iteratorId + "/" + valueUnittestStepUnittestUuid + "/" + valueUnittestStepUuid }
                                    >{langTrans("prj unittest act4")}</Button>
                                    <Dropdown menu={this.getMoreStep(record)}>
                                        <Button type="text" icon={<MoreOutlined />} />
                                    </Dropdown>
                                </>
                                }
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
            folder: null,
            showPay: false,
            addTemplateTile: "",
            addTemplateDialog: false,
            loadingFlg: false,
            selectedUnittests: [],
            selectedSteps: [],
            selectedStepsUnitest: "",
            selectedKeys: [],
            movedIterator: "",
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
                movedIterator: "",
            };
        }

        return null;
    }

    async componentDidMount(): void {
        if(this.props.envs.length === 0) {
            getEnvs(this.props.clientType, this.props.dispatch);
        }
        getIterationUnitTests(
            this.props.clientType,
            this.state.iteratorId, 
            this.state.folder,
            this.props.env,
            this.props.dispatch
        );
    }

    async componentDidUpdate(prevProps) {  
        if (this.props.match.params.id !== prevProps.match.params.id) { 
            getIterationUnitTests(
                this.props.clientType, 
                this.state.iteratorId, 
                this.state.folder, 
                this.props.env, 
                this.props.dispatch
            );
        }
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
                        onConfirm={async e => {
                            await delUnitTestStep(this.state.iteratorId, valueUnittestStepUnittestUuid, valueUnittestStepUuid);
                            getIterationUnitTests(
                                this.props.clientType,
                                this.state.iteratorId, 
                                this.state.folder, 
                                this.props.env, 
                                this.props.dispatch
                            );
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
            let items = [{
                key: "1",
                label: <Button type='link' icon={<EditOutlined />} onClick={()=>this.editUnitTestClick(record)}>
                    {langTrans("prj unittest act4")}
                    </Button>,
            },{
                key: "2",
                label: <Button type="link" icon={<DotChartOutlined />} href={`#/unittest_envvars/${this.state.iteratorId}/${record[unittest_uuid]}/${EMPTY_STRING}`}>
                    {langTrans("prj unittest act1")}
                    </Button>,
            },{
                key: "3",
                danger: true,
                label:  <Popconfirm
                            title={langTrans("prj unittest del title")}
                            description={langTrans("prj unittest del desc")}
                            onConfirm={async e => {
                                await delUnitTest(record);
                                getIterationUnitTests(
                                    this.props.clientType, 
                                    this.state.iteratorId, 
                                    this.state.folder, 
                                    this.props.env, 
                                    this.props.dispatch
                                );
                            }}
                            okText={langTrans("prj unittest del sure")}
                            cancelText={langTrans("prj unittest del cancel")}
                            >
                            <Button danger type="link" icon={<DeleteOutlined />}>{langTrans("prj unittest act5")}</Button>
                        </Popconfirm>,
            },{
                key: "4",
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
                        <Button danger type='link' loading={this.state.loadingFlg} icon={<MergeOutlined />}>{langTrans("version unittest act3")}</Button>
                    </Popconfirm> 
                : 
                    <Button type='text' icon={<MergeOutlined />} onClick={()=>this.exportUnitTestClick(record)}>{langTrans("version unittest act2")}</Button>),
            }];
            if (isStringEmpty(record[unittest_refer])) {
                items.push({
                    key: "5",
                    label: <Button type='text' loading={this.state.loadingFlg} icon={<CameraOutlined />} onClick={()=>this.exportStepsClick(record)}>{langTrans("version unittest act5")}</Button>
                });
            }
            if (isStringEmpty(record[unittest_clean])) {
                items.push({
                    key: "6",
                    label: <Button type='text' icon={<ClearOutlined />} href={`#/version_iterator_tests_clean_add/${this.state.iteratorId}/${record[unittest_uuid]}`}>{langTrans("version unittest act6")}</Button>
                });
            } else {
                items.push({
                    key: "6",
                    label: <Button type='text' icon={<ClearOutlined />} href={`#/version_iterator_tests_clean_edit/${this.state.iteratorId}/${record[unittest_uuid]}/${record[unittest_clean]}`}>{langTrans("version unittest act6")}</Button>
                });
            }
            return {'items': items};
        } else {
            return {'items': [] };
        }
    }

    setEnvironmentChange = (value: string) => {
        if (isStringEmpty(value)) {
            this.props.dispatch({
                type: GET_ITERATOR_TESTS,
                iteratorId: this.state.iteratorId,
                unitTests: [],
                folders: null,
            });
        } else {
            getIterationUnitTests(
                this.props.clientType, 
                this.state.iteratorId, 
                this.state.folder, 
                value, 
                this.props.dispatch
            );
        }
        this.props.dispatch({
            type: GET_ENV,
            env: value
        });
    }

    setFolderChange = (value: string) => {
        let selectedFolder;
        if (value === undefined) {
            selectedFolder = null;
        } else {
            selectedFolder = value;
        }
        this.setState({folder: value});
        getIterationUnitTests(
            this.props.clientType, 
            this.state.iteratorId, 
            selectedFolder, 
            this.props.env, 
            this.props.dispatch
        );
    }

    undoExportUnitTestClick = async record => {
        this.setState({loadingFlg: true})
        let iteratorId = this.state.iteratorId;
        let unittestId = record[unittest_uuid];
        await copyFromProjectToIterator(
            iteratorId,
            unittestId
        );
        
        getIterationUnitTests(
            this.props.clientType, 
            this.state.iteratorId, 
            this.state.folder, 
            this.props.env, 
            this.props.dispatch
        );
        this.setState({loadingFlg: false})

        message.success(langTrans("unittest export revoke success"));
    }

    exportStepsClick = async record => {
        let stepIds = [];
        let unittestId = record[unittest_uuid];
        for (let step of record.children) {
            let stepId = step[unittest_step_uuid];
            if (this.state.selectedSteps.includes(unittestId + "$$" + stepId)) {
                stepIds.push(unittestId + "$$" + stepId);
            } else {
                break;
            }
        }
        this.setState({selectedSteps: stepIds});
        if (stepIds.length === 0) {
            message.error(langTrans("version unittest act5 empty"));
            return;
        }
        this.setState({
            addTemplateTile : "", 
            addTemplateDialog : true, loadingFlg : false
        })
    }

    exportUnitTestClick = async record => {
        this.setState({loadingFlg: true})
        let iteratorId = this.state.iteratorId;
        let unittestId = record[unittest_uuid];
        await copyFromIteratorToProject(iteratorId, unittestId);
        getIterationUnitTests(
            this.props.clientType, 
            iteratorId, 
            this.state.folder, 
            this.props.env, 
            this.props.dispatch
        );
        this.setState({loadingFlg: false})
        message.success(langTrans("unittest export success"));
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

    setSelectedRow = (record, isSelected) => {
        let uuid = record.key;
        if (uuid.indexOf("$$") === -1) {
            let unittestId = uuid;
            let unittestIds = cloneDeep(this.state.selectedUnittests);
            if (isSelected) {
                unittestIds.includes(unittestId) ? unittestIds : unittestIds.push(unittestId);
            } else {
                unittestIds.includes(unittestId) ? unittestIds.splice(unittestIds.indexOf(unittestId), 1) : unittestIds;
            }
            let selectedKeys = [...new Set(unittestIds), ...this.state.selectedSteps]
            this.setState({selectedUnittests: unittestIds, selectedKeys});
        } else {
            let stepId = uuid;
            let oldSelectedStepsUnitest = this.state.selectedStepsUnitest;
            let selectedStepsUnitest = uuid.split("$$")[0];
            let stepIds = [];
            if (oldSelectedStepsUnitest == selectedStepsUnitest) {
                stepIds = cloneDeep(this.state.selectedSteps);
            }
            let unittestIds = cloneDeep(this.state.selectedUnittests);
            if (isSelected) {
                unittestIds.includes(selectedStepsUnitest) ? unittestIds : unittestIds.push(selectedStepsUnitest);
                stepIds.includes(stepId) ? stepIds : stepIds.push(stepId);
            } else {
                stepIds.includes(stepId) ? stepIds.splice(stepIds.indexOf(stepId), 1) : stepIds;
            }
            let selectedKeys = [...new Set(stepIds), ...unittestIds];
            this.state.selectedSteps = stepIds;
            this.state.selectedUnittests = unittestIds;
            this.state.selectedStepsUnitest = selectedStepsUnitest;
            this.state.selectedKeys = selectedKeys;
            this.setState({ selectedKeys });
        }
    }

    moveUnitestIterator = async (newIterator) => { 
        if (newIterator === undefined) {
            this.setState({movedIterator: ""})
            return;
        }
        if (this.state.selectedUnittests.length === 0) return;
        await batchMoveUnittest(
            this.props.clientType, 
            this.state.selectedUnittests, 
            newIterator, 
            this.props.device
        )
        this.setState({movedIterator: newIterator})
        message.success(langTrans("prj unittest status2"));
    }

    setSelectedUnittests = newSelectedUnittests => {
        let filteredUnittestKeys = newSelectedUnittests.filter(item => item.indexOf("$$") === -1);
        let selectedUnittests = [...new Set(filteredUnittestKeys)];
        let selectedSteps = cloneDeep(this.state.selectedSteps);
        if (!isStringEmpty(this.state.selectedStepsUnitest) && selectedSteps.length > 0) {
            if (selectedSteps[0].split("$$")[0] != this.state.selectedStepsUnitest) {
                selectedSteps = [];
            }
        }
        
        let selectedKeys = [...selectedUnittests, ...selectedSteps];
        this.setState({
            selectedKeys,
            selectedUnittests,
            selectedSteps,
        });
    }

    handleAddTemplate = () => {
        if (isStringEmpty(this.state.addTemplateTile) || this.state.selectedSteps.length === 0) {
            return;
        }
        this.setState({loadingFlg: true});
        addUnittestTemplate(this.props.clientType, this.state.iteratorId, this.state.selectedSteps, this.state.addTemplateTile);
    }

    render() : ReactNode {
        return (
            <Layout>
                <Header style={{ padding: 0 }}>
                    {langTrans("version unittest title")} <Text type="secondary"><Link href={getWikiUnittest()}>{langTrans("version unittest link")}</Link></Text>
                </Header>
                <Content style={{ padding: '0 16px' }}>
                    <AddUnittestComponent refreshCb={() => getIterationUnitTests(
                        this.props.clientType,
                        this.state.iteratorId, 
                        this.state.folder, 
                        this.props.env, 
                        this.props.dispatch
                    )} />
                    <Modal 
                        title={langTrans("version unittest unittest template add title")}
                        open={this.state.addTemplateDialog}
                        onOk={this.handleAddTemplate}
                        confirmLoading={this.state.loadingFlg}
                        onCancel={()=>this.setState({addTemplateTile: "", addTemplateDialog : false, loadingFlg : false})}
                        width={230}
                    >
                        <Form layout="vertical">
                            <Form.Item>
                                <Input placeholder={langTrans("version unittest unittest template add form input1")} value={this.state.addTemplateTile} onChange={ event=>this.setState({addTemplateTile : event.target.value}) } />
                            </Form.Item>
                        </Form>
                    </Modal>
                    <Breadcrumb style={{ margin: '16px 0' }} items={[
                        { title: langTrans("version unittest bread1") }, 
                        { title: langTrans("version unittest bread2") }
                    ]} />
                    <PayMemberModel showPay={this.state.showPay} cb={showPay => this.setState({showPay})} />
                    <Flex justify="space-between" align="center" style={{marginBottom: 16}}>
                        <Form layout="inline">
                            <Form.Item label={langTrans("prj unittest operator1")}>
                                <Select
                                    allowClear
                                    value={ this.props.env }
                                    onChange={this.setEnvironmentChange}
                                    style={{ width: 120 }}
                                    options={this.props.envs}
                                />
                            </Form.Item>
                            <Form.Item label={langTrans("prj unittest operator2")}>
                                <Select allowClear
                                    value={ this.state.folder }
                                    onChange={this.setFolderChange}
                                    style={{ width: 120 }}
                                    options={this.state.iteratorId in this.props.folders && this.props.folders[this.state.iteratorId].map(item => {
                                        return { value: item, label: "/" + item }
                                    })}
                                />
                            </Form.Item>
                            <Form.Item label={langTrans("version unittest operator1")}>
                                <Select allowClear
                                    style={{minWidth: 130}}
                                    value={this.state.movedIterator}
                                    onChange={ this.moveUnitestIterator }
                                    options={this.props.iterators
                                        .filter(item => item[version_iterator_uuid] != this.state.iteratorId)
                                        .map(item => ({
                                            value: item[version_iterator_uuid],
                                            label: item[version_iterator_title]
                                        })) 
                                    }
                                />
                            </Form.Item>
                            <Form.Item>
                                <Button 
                                    type="primary"  
                                    disabled={!this.state.executeFlg || this.state.selectedUnittests.length === 0} 
                                    onClick={() => {
                                        if (!this.props.device.vipFlg && !this.props.device.isUnitTest) {
                                            this.setState({
                                                showPay: true,
                                            });
                                            return;
                                        }
                                        if (isStringEmpty(this.props.env)) {
                                            message.error(langTrans("unittest env check"));
                                            return;
                                        }

                                        for (let unittestUuid of this.state.selectedUnittests) {
                                            this.setState({
                                                executeFlg: false,
                                                unittestUuid,
                                                batchUuid: "",
                                            });
                                            let currentUnitTest = this.props.unittest[this.state.iteratorId].find(item => item[unittest_uuid] === unittestUuid);
                                            executeIteratorUnitTest(
                                                this.props.clientType, this.props.teamId,
                                                this.state.iteratorId, unittestUuid, currentUnitTest.children, this.props.env, 
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
                        env={ this.props.env }
                        cb={ () => {
                            this.setState({executeFlg: true});
                            getIterationUnitTests(
                                this.props.clientType, 
                                this.state.iteratorId, 
                                this.state.folder, 
                                this.props.env, 
                                this.props.dispatch
                            );
                        } }
                        />
                    <Table 
                        rowSelection={{
                            selectedRowKeys: this.state.selectedKeys, 
                            onChange: this.setSelectedUnittests,
                            onSelect: this.setSelectedRow
                        }}
                        columns={this.state.column} 
                        dataSource={this.props.unittest[this.state.iteratorId] ? this.props.unittest[this.state.iteratorId] : []} 
                        />
                </Content>
                <Footer style={{ textAlign: 'center' }}>
                ApiChain ©{new Date().getFullYear()} Created by Mustafa Fang
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
        iterators: state.version_iterator.list,
        env: state.env_var.env,
        envs: state.env.list,
        teamId: state.device.teamId,
        clientType: state.device.clientType,
        isAiSupport: state.device.isAiSupport
    }
}
      
export default connect(mapStateToProps)(UnittestListVersion);