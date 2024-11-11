import { Component, ReactNode } from 'react';
import { connect } from 'react-redux';
import { Breadcrumb, Layout, Table, Button } from "antd";

import { getdayjs } from '../../util';

import { 
    TABLE_UNITTEST_EXECUTOR_REPORT_FIELDS,
} from '../../../config/db';

import SingleUnitTestReport from '../../components/unittest/single_unittest_report';

import {
    getExecutorReports
} from '../../actions/unittest';

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
        let unitTestId = props.match.params.unitTestId;
        this.state = {
            column: [
                {
                    title: '运行环境',
                    dataIndex: unittest_report_env,
                },
                {
                    title: '执行结果',
                    dataIndex: unittest_report_result,
                    render: (result) => {
                        if (result === "success") {
                            return <span style={{color:"green"}}>成功</span>;
                        } else if (result === "failure") {
                            return <span style={{color:"red"}}>失败</span>;
                        } else {
                            return <span style={{color:"yellow"}}>未知</span>;
                        }
                    }
                },
                {
                    title: '接口耗时',
                    dataIndex: unittest_report_cost_time,
                    render: (cost_time, record) => {
                        let result = record[unittest_report_result];
                        if (result === "success") {
                            return cost_time + "毫秒";
                        } else {
                            return "--";
                        }
                    }
                },
                {
                    title: '错误信息',
                    dataIndex: unittest_report_failure_reason,
                },
                {
                    title: '执行时间',
                    dataIndex: unittest_report_ctime,
                    render: (time) => { 
                        return getdayjs(time).format("YYYY-MM-DD HH:mm:ss") 
                    },
                },
                {
                    title: '操作',
                    dataIndex: 'operater',
                    render: (_, record) => {         
                        return <Button type='link' onClick={()=>{
                            let batchUuid = record[unittest_report_batch];
                            this.setState({ batchUuid });
                        }}>
                            查看明细
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
                    单测执行记录
                </Header>
                <Content style={{ margin: '0 16px' }}>
                    <Breadcrumb style={{ margin: '16px 0' }} items={[{ title: '单测' }, { title: '历史' }]} />
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