import { Component, ReactNode } from 'react';
import { connect } from 'react-redux';
import { 
    Breadcrumb, Layout,
    Popconfirm, Table, Space, Button, 
} from "antd";
import { 
    EditOutlined, 
    DeleteOutlined, 
} from '@ant-design/icons';

import { 
    TABLE_UNITTEST_TEMPLATE_FIELDS,
    TABLE_UNITTEST_TEMPLATE_STEPS_FIELDS,
    UNAME,
} from '@conf/db';
import {
    SHOW_EDIT_UNITTEST_MODEL,
} from '@conf/redux';
import { getdayjs } from '@rutil/index';
import AddUnittestComponent from '@comp/unittest/add_unittest';
import { getEnvs } from '@act/env';
import {
    delUnitTest,
    getUnitTests
} from '@act/unittest_template';
import { langTrans } from '@lang/i18n';

const { Header, Content, Footer } = Layout;

let unittest_uuid = TABLE_UNITTEST_TEMPLATE_FIELDS.FIELD_UUID;
let unittest_title = TABLE_UNITTEST_TEMPLATE_FIELDS.FIELD_TITLE;
let unittest_folder = TABLE_UNITTEST_TEMPLATE_FIELDS.FIELD_FOLD_NAME;
let unittest_ctime = TABLE_UNITTEST_TEMPLATE_FIELDS.FIELD_CTIME;

let unittest_step_unittest_uuid = TABLE_UNITTEST_TEMPLATE_STEPS_FIELDS.FIELD_UNITTEST_UUID;
let unittest_step_uuid = TABLE_UNITTEST_TEMPLATE_STEPS_FIELDS.FIELD_UUID;

class UnittestListVersion extends Component {

    constructor(props) {
        super(props);
        this.state = {
            executeFlg: true,
            column: [
                {
                  title: langTrans("unittest template field1"),
                  dataIndex: unittest_title,
                  render: (title) => {
                    return title;
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
                            return (
                                <Space>
                                    <Button type='link' icon={<EditOutlined />} onClick={()=>this.editUnitTestClick(record)}>
                                    {langTrans("prj unittest act4")}
                                    </Button>
                                    <Popconfirm
                                        title={langTrans("prj unittest del title")}
                                        description={langTrans("prj unittest del desc")}
                                        onConfirm={async e => {
                                            await delUnitTest(record);
                                            getUnitTests(
                                                this.props.clientType,
                                                this.props.dispatch
                                            );
                                        }}
                                        okText={langTrans("prj unittest del sure")}
                                        cancelText={langTrans("prj unittest del cancel")}
                                        >
                                        <Button danger type="link" icon={<DeleteOutlined />}>{langTrans("prj unittest act5")}</Button>
                                    </Popconfirm>
                                </Space>
                            );
                        } else {
                            //整体单测的 uuid
                            let valueUnittestStepUnittestUuid = record[unittest_step_unittest_uuid];
                            //当前步骤的 uuid
                            let valueUnittestStepUuid = record[unittest_step_uuid];
                            return (
                                <Space>
                                    <Button 
                                        type='link' 
                                        href={ `#/test_templates_step_edit/${valueUnittestStepUnittestUuid}/${valueUnittestStepUuid}` }
                                    >{langTrans("prj unittest act4")}</Button>
                                </Space>
                            );
                        }
                    }
                },
            ],
            unittestUuid: "", 
            batchUuid: "",
            stepUuid: "",
            folder: null,
            versionIterators: [],
            addTemplateTile: "",
            loadingFlg: false,
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
        getUnitTests(
            this.props.clientType,
            this.props.dispatch
        );
    }

    async componentDidUpdate(prevProps) {  
        if (this.props.match.params.id !== prevProps.match.params.id) { 
            getUnitTests(
                this.props.clientType,
                this.props.dispatch
            );
        }
    }

    editUnitTestClick = (record) => {
        this.props.dispatch({
            type: SHOW_EDIT_UNITTEST_MODEL,
            unitTestUuid: record[unittest_uuid],
            title: record[unittest_title],
            folder: record[unittest_folder],
            open: true
        });
    }

    render() : ReactNode {
        return (
            <Layout>
                <Header style={{ padding: 0 }}>
                    {langTrans("unittest template title")}
                </Header>
                <Content style={{ padding: '0 16px' }}>
                    <AddUnittestComponent refreshCb={() => getUnitTests(
                        this.props.clientType,
                        this.props.dispatch
                    )} />
                    <Breadcrumb style={{ margin: '16px 0' }} items={[
                        { title: langTrans("unittest template bread1") }, 
                        { title: langTrans("unittest template bread2") }
                    ]} />
                    <Table 
                        columns={this.state.column} 
                        dataSource={this.props.unittest ? this.props.unittest : []} 
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
        unittest: state.unittest.list["__template__"],
        folders: state.unittest.folders["__template__"],
        env: state.env_var.env,
        envs: state.env.list,
        teamId: state.device.teamId,
        clientType: state.device.clientType,
    }
}
      
export default connect(mapStateToProps)(UnittestListVersion);