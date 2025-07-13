import { Component, ReactNode } from 'react';
import { connect } from 'react-redux';
import { Breadcrumb, Layout, Table, Button } from "antd";

import { getdayjs } from '@rutil/index';

import { 
    TABLE_UNITTEST_EXECUTOR_REPORT_FIELDS,
} from '@conf/db';

import SingleUnitTestReport from '@comp/unittest/single_unittest_report';

import {
    getExecutorReports
} from '@act/unittest';
import { langTrans } from '@lang/i18n';

const { Header, Content, Footer } = Layout;

let unittest_report_batch = TABLE_UNITTEST_EXECUTOR_REPORT_FIELDS.FIELD_BATCH_UUID;
let unittest_report_env = TABLE_UNITTEST_EXECUTOR_REPORT_FIELDS.FIELD_ENV;
let unittest_report_result = TABLE_UNITTEST_EXECUTOR_REPORT_FIELDS.FIELD_RESULT;
let unittest_report_cost_time = TABLE_UNITTEST_EXECUTOR_REPORT_FIELDS.FIELD_COST_TIME;
let unittest_report_failure_reason = TABLE_UNITTEST_EXECUTOR_REPORT_FIELDS.FIELD_REASON;
let unittest_report_ctime = TABLE_UNITTEST_EXECUTOR_REPORT_FIELDS.FIELD_CTIME;

class UnittestExecutorList extends Component {

    constructor(props) {
        super(props);
        let env = props.match.params.env;
        let iteratorId = props.match.params.iteratorId;
        if (iteratorId === "__empty__") {
            iteratorId = "";
        }
        let unitTestId = props.match.params.unitTestId;
        this.state = {
            column: [
                {
                    title: langTrans("unittest log tab1"),
                    dataIndex: unittest_report_env,
                },
                {
                    title: langTrans("unittest log tab2"),
                    dataIndex: unittest_report_result,
                    render: (result) => {
                        if (result === "success") {
                            return <span style={{color:"green"}}>{langTrans("prj unittest status2")}</span>;
                        } else if (result === "failure") {
                            return <span style={{color:"red"}}>{langTrans("prj unittest status3")}</span>;
                        } else {
                            return <span style={{color:"yellow"}}>{langTrans("prj unittest status4")}</span>;
                        }
                    }
                },
                {
                    title: langTrans("unittest log tab3"),
                    dataIndex: unittest_report_cost_time,
                    render: (cost_time, record) => {
                        let result = record[unittest_report_result];
                        if (result === "success") {
                            return cost_time + " " + langTrans("prj unittest costtime");
                        } else {
                            return "--";
                        }
                    }
                },
                {
                    title: langTrans("unittest log tab4"),
                    dataIndex: unittest_report_failure_reason,
                },
                {
                    title: langTrans("unittest log tab5"),
                    dataIndex: unittest_report_ctime,
                    render: (time) => { 
                        return getdayjs(time).format("YYYY-MM-DD HH:mm:ss") 
                    },
                },
                {
                    title: langTrans("unittest log tab6"),
                    dataIndex: 'operater',
                    render: (_, record) => {         
                        return <Button type='link' onClick={()=>{
                            let batchUuid = record[unittest_report_batch];
                            this.setState({ batchUuid });
                        }}>
                            {langTrans("unittest log act1")}
                        </Button>
                    }
                }
            ],
            datas: [],
            env,
            iteratorId,
            unitTestId,
            batchUuid: "",
        }
    }

    componentDidMount() {
        getExecutorReports(this.state.iteratorId, this.state.unitTestId, this.state.env).then(unittestReports => {
            let datas : Array<any> = [];
            for (let unittestReport of unittestReports) {
                unittestReport.key = unittestReport[unittest_report_batch];
                datas.push(unittestReport);
            }
            this.setState({datas});
        });
    }

    render() : ReactNode {
        return (
            <Layout>
                <Header style={{ padding: 0 }}>
                    {langTrans("unittest log title")}
                </Header>
                <Content style={{ padding: '0 16px' }}>
                    <Breadcrumb style={{ margin: '16px 0' }} items={[{ title: langTrans("unittest log bread1") }, { title: langTrans("unittest log bread2") }]} />
                    <SingleUnitTestReport 
                        iteratorId={ this.state.iteratorId }
                        unittestUuid={ this.state.unitTestId }
                        batchUuid={ this.state.batchUuid }
                        env={ this.state.env }
                        cb={ () => {
                        } }
                    />
                    <Table columns={this.state.column} dataSource={ this.state.datas } />
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
    }
  }
  
  export default connect(mapStateToProps)(UnittestExecutorList);