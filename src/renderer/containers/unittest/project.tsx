import { Component, ReactNode } from 'react';
import { connect } from 'react-redux';
import {
  Breadcrumb,
  Layout,
  Flex,
  Dropdown,
  Popconfirm,
  Table,
  Space,
  Button,
  Select,
  Form,
  Typography,
  message,
} from 'antd';
import type { MenuProps } from 'antd';
import { EditOutlined, DeleteOutlined, MoreOutlined } from '@ant-design/icons';

import { langTrans } from '@lang/i18n';
import { EMPTY_STRING } from '@conf/global_config';
import {
  TABLE_UNITTEST_FIELDS,
  TABLE_UNITTEST_STEPS_FIELDS,
  TABLE_VERSION_ITERATION_FIELDS,
  TABLE_UNITTEST_EXECUTOR_REPORT_FIELDS,
  UNAME,
} from '@conf/db';
import {
  UNITTEST_RESULT_SUCCESS,
  UNITTEST_RESULT_FAILURE,
} from '@conf/unittest';
import { 
  SHOW_EDIT_UNITTEST_MODEL, 
  GET_PRJ,
  GET_ENV,
  GET_PROJECT_TESTS,
} from '@conf/redux';
import { getWikiProject } from '@conf/url';
import { getdayjs, isStringEmpty } from '@rutil/index';
import { getEnvs } from '@act/env';
import {
  getProjectUnitTests,
  executeProjectUnitTest,
  batchMoveUnittest,
  continueProjectExecuteUnitTest,
  copyFromProjectToIterator,
} from '@act/unittest';
import PayMemberModel from '@comp/topup/member';
import AddUnittestComponent from '@comp/unittest/add_unittest';
import SingleUnitTestReport from '@comp/unittest/single_unittest_report';

const { Header, Content, Footer } = Layout;
const { Text, Link } = Typography;

const unittest_uuid = TABLE_UNITTEST_FIELDS.FIELD_UUID;
const unittest_iterator = TABLE_UNITTEST_FIELDS.FIELD_ITERATOR_UUID;
const unittest_title = TABLE_UNITTEST_FIELDS.FIELD_TITLE;
const unittest_folder = TABLE_UNITTEST_FIELDS.FIELD_FOLD_NAME;
const unittest_ctime = TABLE_UNITTEST_FIELDS.FIELD_CTIME;

const unittest_step_unittest_uuid =
  TABLE_UNITTEST_STEPS_FIELDS.FIELD_UNITTEST_UUID;
const unittest_step_uuid = TABLE_UNITTEST_STEPS_FIELDS.FIELD_UUID;

const unittest_report_result = TABLE_UNITTEST_EXECUTOR_REPORT_FIELDS.FIELD_RESULT;
const unittest_report_env = TABLE_UNITTEST_EXECUTOR_REPORT_FIELDS.FIELD_ENV;
const unittest_report_step = TABLE_UNITTEST_EXECUTOR_REPORT_FIELDS.FIELD_STEP;
const unittest_report_batch =
  TABLE_UNITTEST_EXECUTOR_REPORT_FIELDS.FIELD_BATCH_UUID;
const unittest_report_cost_time =
  TABLE_UNITTEST_EXECUTOR_REPORT_FIELDS.FIELD_COST_TIME;

let version_iterator_uuid = TABLE_VERSION_ITERATION_FIELDS.FIELD_UUID;
let version_iterator_title = TABLE_VERSION_ITERATION_FIELDS.FIELD_NAME;

class UnittestListVersion extends Component {
  constructor(props) {
    super(props);
    const project = props.match.params.id;
    const teamId = isStringEmpty(props.match.params.team) ? "" : props.match.params.team;
    this.state = {
      executeFlg: true,
      column: [
        {
          title: langTrans("prj unittest table field1"),
          dataIndex: unittest_title,
          render: (title) => {
            return title;
          },
        },
        {
          title: langTrans("prj unittest table field2"),
          dataIndex: unittest_report_result,
          render: (result, record) => {
            //整体
            if (record[unittest_folder] !== undefined) {
              if (result === undefined) {
                return <span style={{ color: 'yellow' }}>{langTrans("prj unittest status1")}</span>;
              } else if (result === UNITTEST_RESULT_SUCCESS) {
                return <span style={{ color: 'green' }}>{langTrans("prj unittest status2")}</span>;
              } else if (result === UNITTEST_RESULT_FAILURE) {
                return <span style={{ color: 'red' }}>{langTrans("prj unittest status3")}</span>;
              } else {
                return <span style={{ color: 'yellow' }}>{langTrans("prj unittest status4")}</span>;
              }
            } else {
              if (result === undefined) {
                return <span style={{ color: 'yellow' }}>{langTrans("prj unittest status1")}</span>;
              } else if (result) {
                return <span style={{ color: 'green' }}>{langTrans("prj unittest status2")}</span>;
              } else {
                return <span style={{ color: 'red' }}>{langTrans("prj unittest status3")}</span>;
              }
            }
          },
        },
        {
          title: langTrans("prj unittest table field3"),
          dataIndex: unittest_report_cost_time,
          render: (cost_time, record) => {
            const result = record[unittest_report_result];
            if (result === 'success') {
              return cost_time + '毫秒';
            } else if (result) {
              return '--';
            }
          },
        },
        {
          title: langTrans("prj unittest table field4"),
          dataIndex: UNAME,
        },
        {
          title: langTrans("prj unittest table field5"),
          dataIndex: unittest_ctime,
          render: (time) => {
            return getdayjs(time).format('YYYY-MM-DD');
          },
        },
        {
          title: langTrans("prj unittest table field6"),
          dataIndex: 'operater',
          render: (_, record) => {
            const iteratorId = record[unittest_iterator];
            //整体
            if (record[unittest_folder] !== undefined) {
              const unittestUuid = record[unittest_uuid];
              return (
                <Space>
                  <Button
                    type="link"
                    href={
                      `#/unittest_envvars/${EMPTY_STRING}/${record[unittest_uuid]}/${this.state.project}`
                    }
                  >
                    {langTrans("prj unittest act1")}
                  </Button>
                  {record.result !== undefined ? (
                    <Button
                      type="link"
                      href={
                        '#/unittest_executor_record/' +
                        record[unittest_report_env] +
                        '/__empty__/' +
                        unittestUuid
                      }
                    >
                      {langTrans("prj unittest act2")}
                    </Button>
                  ) : null}
                  <Dropdown menu={this.getMore(record)}>
                    <Button type="text" icon={<MoreOutlined />} />
                  </Dropdown>
                </Space>
              );
            } else {
              //整体单测的 uuid
              const valueUnittestStepUnittestUuid =
                record[unittest_step_unittest_uuid];
              //当前步骤的 uuid
              const valueUnittestStepUuid = record[unittest_step_uuid];
              //报告中的下一步
              const valueUnittestReportStep = record[unittest_report_step];
              return (
                <Space>
                  {valueUnittestStepUuid === valueUnittestReportStep ? (
                    <Button
                      type="link"
                      onClick={async () => {
                        this.setState({
                          executeFlg: false,
                          unittestUuid: '',
                          batchUuid: '',
                        });

                        const batchUuid = await continueProjectExecuteUnitTest(
                          this.props.clientType, this.state.teamId,
                          iteratorId,
                          valueUnittestStepUnittestUuid,
                          record[unittest_report_batch],
                          valueUnittestReportStep,
                          record[unittest_report_env],
                          (batchUuid: string, stepUuid: string) => {
                            this.setState({ unittestUuid: valueUnittestStepUnittestUuid, batchUuid, stepUuid });
                          },
                        );

                        this.setState({
                          unittestUuid: valueUnittestStepUnittestUuid,
                          batchUuid,
                        });
                      }}
                    >
                      {langTrans("prj unittest act3")}
                    </Button>
                  ) : null}
                </Space>
              );
            }
          },
        },
      ],
      folder: null,
      project,
      unittestUuid: '',
      batchUuid: '',
      stepUuid: '',
      showPay: false,
      selectedUnittests: [],
      teamId,
      movedIterator: "",
    };
    props.dispatch({
      type: GET_PRJ,
      prj: project,
    });
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    const nextProject = nextProps.match.params.id;
    const prevProject = prevState.project;
    if (nextProject !== prevProject) {
      nextProps.dispatch({
        type: GET_PRJ,
        prj: nextProject,
      });
      return {
        project: nextProject,
        unittestUuid: '',
        batchUuid: '',
        movedIterator: "",
      };
    }

    return null;
  }

  async componentDidMount(): void {
    if (this.props.envs.length === 0) {
      getEnvs(this.props.clientType, this.props.dispatch);
    }
    await getProjectUnitTests(
      this.props.clientType,
      this.state.teamId,
      this.state.project,
      this.state.folder,
      this.props.env,
      this.props.dispatch,
    );
  }

  async componentDidUpdate(prevProps) {
    if (this.props.match.params.id !== prevProps.match.params.id) {
      await getProjectUnitTests(
        this.props.clientType,
        this.state.teamId,
        this.state.project,
        this.state.folder,
        this.props.env,
        this.props.dispatch,
      );
    }
  }

  getMore = (record: any): MenuProps => {
    if (record[unittest_folder] !== undefined) {
      return {
        items: [
          {
            key: '1',
            label: (
              <Button
                type="text"
                icon={<EditOutlined />}
                onClick={() => this.editUnitTestClick(record)}
              >
                {langTrans("prj unittest act4")}
              </Button>
            ),
          },
          {
            key: '2',
            danger: true,
            label: (
              <Popconfirm
                title={langTrans("prj unittest del title")}
                description={langTrans("prj unittest del desc")}
                onConfirm={(e) => {
                  this.undoExportUnitTestClick(record, () => {
                    getProjectUnitTests(
                      this.props.clientType,
                      this.state.teamId,
                      this.state.project,
                      this.state.folder,
                      this.props.env,
                      this.props.dispatch,
                    );
                  });
                }}
                okText={langTrans("prj unittest del sure")}
                cancelText={langTrans("prj unittest del cancel")}
              >
                <Button danger type="link" icon={<DeleteOutlined />}>
                {langTrans("prj unittest act5")}
                </Button>
              </Popconfirm>
            ),
          },
        ],
      };
    } else {
      return { items: [] };
    }
  };

  setEnvironmentChange = (value: string) => {
    if (isStringEmpty(value)) {
        this.props.dispatch({
            type: GET_PROJECT_TESTS,
            project: this.state.project,
            unitTests: [],
            folders: null,
        });
    } else {
      getProjectUnitTests(this.props.clientType, this.state.teamId, this.state.project, this.state.folder, value, this.props.dispatch);
    }
    this.props.dispatch({
        type: GET_ENV,
        env: value
    });
  };

  setFolderChange = (value: string) => {
      let selectedFolder;
      if (value === undefined) {
          selectedFolder = null;
      } else {
          selectedFolder = value;
      }
      this.setState({folder: value});
      getProjectUnitTests(this.props.clientType, this.state.teamId, this.state.project, selectedFolder, this.props.env, this.props.dispatch);
  }

  undoExportUnitTestClick = (record, cb) => {
    const unittestId = record[unittest_uuid];
    copyFromProjectToIterator(unittestId, cb);
  };

  editUnitTestClick = (record) => {
    this.props.dispatch({
      type: SHOW_EDIT_UNITTEST_MODEL,
      iteratorId: record[unittest_iterator],
      unitTestUuid: record[unittest_uuid],
      title: record[unittest_title],
      folder: record[unittest_folder],
      open: true,
    });
  };

  setSelectedUnittests = (newSelectedUnittests) => {
    const filteredUnittestKeys = newSelectedUnittests.filter(
      (item) => item.indexOf('$$') === -1,
    );
    this.setState({ selectedUnittests: filteredUnittestKeys });
  };

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

  render(): ReactNode {
    return (
      <Layout>
        <Header style={{ padding: 0 }}>{langTrans("prj unittest title")} <Text type="secondary"><Link href={getWikiProject()}>{langTrans("prj unittest link")}</Link></Text></Header>
        <Content style={{ padding: '0 16px' }}>
          <AddUnittestComponent
            refreshCb={() =>
              getProjectUnitTests(
                this.props.clientType,
                this.state.teamId,
                this.state.project,
                this.state.folder,
                this.props.env,
                this.props.dispatch,
              )
            }
          />
          <Breadcrumb
            style={{ margin: '16px 0' }}
            items={[{ title: langTrans("prj unittest bread1") }, { title: langTrans("prj unittest bread2") }]}
          />
          <PayMemberModel
            showPay={this.state.showPay}
            cb={(showPay) => this.setState({ showPay })}
          />
          <Flex
            justify="space-between"
            align="center"
            style={{ marginBottom: 16 }}
          >
            <Form layout="inline">
              <Form.Item label={langTrans("prj unittest operator1")}>
                <Select
                  value={this.props.env}
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
                      options={this.state.project in this.props.folders && this.props.folders[this.state.project].map(item => {
                          return { value: item, label: item }
                      })}
                  />
              </Form.Item>
              <Form.Item label={ langTrans("version doc operator3") }>
                  <Select 
                      showSearch
                      allowClear
                      value={this.state.movedIterator}
                      style={{minWidth: 260}}
                      options={this.props.iterators.map(item => ({
                          value: item[version_iterator_uuid],
                          label: item[version_iterator_title]
                      })) }
                      onChange={ this.moveUnitestIterator }
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

                    for (const unittestUuid of this.state.selectedUnittests) {
                      this.setState({
                        executeFlg: false,
                        unittestUuid,
                        batchUuid: '',
                      });
                      const currentUnitTest = this.props.unittest[
                        this.state.project
                      ].find((item) => item[unittest_uuid] === unittestUuid);
                      executeProjectUnitTest(
                        this.props.clientType,
                        this.state.teamId,
                        unittestUuid,
                        currentUnitTest.children,
                        this.props.env,
                        (batchUuid: string, stepUuid: string) => {
                          this.setState({ unittestUuid, batchUuid, stepUuid });
                        },
                      );
                    }
                  }}
                >
                  {langTrans("prj unittest btn")}
                </Button>
              </Form.Item>
            </Form>
          </Flex>
          <SingleUnitTestReport
            projectId={this.state.project}
            unittestUuid={this.state.unittestUuid}
            batchUuid={this.state.batchUuid}
            teamId={this.state.teamId}
            stepUuid={this.state.stepUuid}
            env={this.props.env}
            cb={() => {
              this.setState({ executeFlg: true });
              getProjectUnitTests(
                this.props.clientType,
                this.state.teamId,
                this.state.project,
                this.state.folder,
                this.props.env,
                this.props.dispatch,
              );
            }}
          />
          <Table
            rowSelection={{
              selectedRowKeys: this.state.selectedUnittests,
              onChange: this.setSelectedUnittests,
            }}
            columns={this.state.column}
            dataSource={
              this.props.unittest[this.state.project]
                ? this.props.unittest[this.state.project]
                : []
            }
          />
        </Content>
        <Footer style={{ textAlign: 'center' }}>
          ApiChain ©{new Date().getFullYear()} Created by Mustafa Fang
        </Footer>
      </Layout>
    );
  }
}

function mapStateToProps(state) {
  return {
    device : state.device,
    unittest: state.unittest.list,
    folders: state.unittest.folders,
    iterators: state.version_iterator.list,
    env: state.env_var.env,
    envs: state.env.list,
    clientType: state.device.clientType,
  };
}

export default connect(mapStateToProps)(UnittestListVersion);
