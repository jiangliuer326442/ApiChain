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
import {
  TABLE_UNITTEST_FIELDS,
  TABLE_UNITTEST_STEPS_FIELDS,
  TABLE_UNITTEST_EXECUTOR_REPORT_FIELDS,
  UNAME,
} from '@conf/db';
import {
  UNITTEST_RESULT_SUCCESS,
  UNITTEST_RESULT_FAILURE,
} from '@conf/unittest';
import { SHOW_EDIT_UNITTEST_MODEL } from '@conf/redux';
import { UNITTEST_ENV } from '@conf/storage';
import { getWikiProject } from '@conf/url';
import { getdayjs, isStringEmpty } from '@rutil/index';
import { getEnvs } from '@act/env';
import {
  getProjectUnitTests,
  executeProjectUnitTest,
  continueProjectExecuteUnitTest,
  copyFromProjectToIterator,
} from '@act/unittest';
import PayModel from '@comp/topup';
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

class UnittestListVersion extends Component {
  constructor(props) {
    super(props);
    const project = props.match.params.id;
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
                      '#/unittest_envvars/' +
                      record[unittest_uuid] +
                      '/' +
                      this.state.project
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
                          iteratorId,
                          valueUnittestStepUnittestUuid,
                          record[unittest_report_batch],
                          valueUnittestReportStep,
                          record[unittest_report_env],
                          this.props.dispatch,
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
      env: localStorage.getItem(UNITTEST_ENV)
        ? localStorage.getItem(UNITTEST_ENV)
        : null,
      showPay: false,
      selectedUnittests: [],
    };
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    const nextProject = nextProps.match.params.id;
    const prevProject = prevState.project;
    if (nextProject !== prevProject) {
      return {
        project: nextProject,
        unittestUuid: '',
        batchUuid: '',
      };
    }

    return null;
  }

  async componentDidMount(): void {
    if (this.props.envs.length === 0) {
      getEnvs(this.props.clientType, this.props.dispatch);
    }
    await getProjectUnitTests(
      this.state.project,
      this.state.folder,
      this.state.env,
      this.props.dispatch,
    );
  }

  async componentDidUpdate(prevProps) {
    if (this.props.match.params.id !== prevProps.match.params.id) {
      await getProjectUnitTests(
        this.state.project,
        this.state.folder,
        this.state.env,
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
                      this.state.project,
                      this.state.folder,
                      this.state.env,
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
    this.setState({ env: value });
    getProjectUnitTests(this.state.project, this.state.folder, value, this.props.dispatch);
  };

  setFolderChange = (value: string) => {
      let selectedFolder;
      if (value === undefined) {
          selectedFolder = null;
      } else {
          selectedFolder = value;
      }
      this.setState({folder: value});
      getProjectUnitTests(this.state.project, selectedFolder, this.state.env, this.props.dispatch);
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

  render(): ReactNode {
    return (
      <Layout>
        <Header style={{ padding: 0 }}>{langTrans("prj unittest title")} <Text type="secondary"><Link href={getWikiProject()}>{langTrans("prj unittest link")}</Link></Text></Header>
        <Content style={{ padding: '0 16px' }}>
          <AddUnittestComponent
            refreshCb={() =>
              getProjectUnitTests(
                this.state.project,
                this.state.folder,
                this.state.env,
                this.props.dispatch,
              )
            }
          />
          <Breadcrumb
            style={{ margin: '16px 0' }}
            items={[{ title: langTrans("prj unittest bread1") }, { title: langTrans("prj unittest bread2") }]}
          />
          <PayModel
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
                  value={this.state.env}
                  onChange={this.setEnvironmentChange}
                  style={{ width: 120 }}
                  options={this.props.envs.map((item) => {
                    return { value: item.label, label: item.remark };
                  })}
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
              <Form.Item>
                <Button
                  type="primary"
                  disabled={!this.state.executeFlg}
                  onClick={() => {
                    if (!this.props.vipFlg) {
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

                    for (const unittestUuid of this.state.selectedUnittests) {
                      this.setState({
                        executeFlg: false,
                        unittestUuid,
                        batchUuid: '',
                      });
                      const currentUnitTest = this.props.unittest[
                        this.state.project
                      ].find((item) => item[unittest_uuid] === unittestUuid);
                      const iteratorId = currentUnitTest[unittest_iterator];
                      executeProjectUnitTest(
                        this.props.clientType,
                        iteratorId,
                        unittestUuid,
                        currentUnitTest.children,
                        this.state.env,
                        this.props.dispatch,
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
            iteratorId=""
            unittestUuid={this.state.unittestUuid}
            batchUuid={this.state.batchUuid}
            stepUuid={this.state.stepUuid}
            env={this.state.env}
            cb={() => {
              this.setState({ executeFlg: true });
              getProjectUnitTests(
                this.state.project,
                this.state.folder,
                this.state.env,
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
          ApiChain ©{new Date().getFullYear()} Created by 方海亮
        </Footer>
      </Layout>
    );
  }
}

function mapStateToProps(state) {
  return {
    vipFlg: state.device.vipFlg,
    unittest: state.unittest.list,
    folders: state.unittest.folders,
    envs: state.env.list,
    clientType: state.device.clientType,
  };
}

export default connect(mapStateToProps)(UnittestListVersion);
