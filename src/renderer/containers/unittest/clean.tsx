import { 
    Breadcrumb, 
    Button,
    Divider,
    Form,
    Input,
    Layout,
    message,
    Select,
    Space,
    Switch,
    Table,
} from 'antd';
import { PlusOutlined, MinusOutlined } from '@ant-design/icons';
import { cloneDeep } from 'lodash';
import { Component, ReactNode } from 'react';
import { connect } from 'react-redux';
import { isStringEmpty } from '@rutil/index';
import { 
    TABLE_FIELD_NAME,
    TABLE_FIELD_VALUE
} from '@rutil/json';
import { 
    TABLE_UNITTEST_FIELDS, 
    TABLE_UNITTEST_CLEAN_FIELDS,
} from '@conf/db';
import { langTrans, langFormat } from '@lang/i18n';
import StepExpressionBuilderBox from "@comp/unittest_step/step_expression_builder_box";
import { 
    saveUnitTestCleanNode,
    addUnitTestCleanNode,
    getUnittestCleanNodes,
    enableUnittestCleanNodes,
 } from '@act/unittest_step';

const { Header, Content, Footer } = Layout;
const { TextArea } = Input

let unittest_uuid = TABLE_UNITTEST_FIELDS.FIELD_UUID;
let unittest_title = TABLE_UNITTEST_FIELDS.FIELD_TITLE;
let unittest_clean_flg = TABLE_UNITTEST_FIELDS.FIELD_CLEANFLG;

let field_clean_prj = TABLE_UNITTEST_CLEAN_FIELDS.FIELD_PROJECTS;
let field_clean_sql = TABLE_UNITTEST_CLEAN_FIELDS.FIELD_SQL;
let field_clean_sql_params = TABLE_UNITTEST_CLEAN_FIELDS.FIELD_SQL_PARAMS;
let field_clean_title = TABLE_UNITTEST_CLEAN_FIELDS.FIELD_TITLE;


class UnittestStepContainer extends Component {
    constructor(props) {
        super(props);

        let iteratorId = props.match.params.iteratorId ? props.match.params.iteratorId : "";
        let unitTestUuid = props.match.params.unitTestUuid;
        let unitTestCleanUuid = props.match.params.unitTestCleanUuid;

        let cleanLength = 1;
        let cleanTitle = [null];
        let cleanPrj = [null];
        let cleanSql = [""];
        let cleanSqlParams = [[]];

        let cUnitTest = {};
        if (this.props.unittest[iteratorId]) {
            cUnitTest = this.getCurrentUnitTest1(props.unittest, iteratorId, unitTestUuid);
        }

        this.state = {
            iteratorId,
            unitTestUuid,
            unitTestCleanUuid,
            cleanLength,
            unitTest: cUnitTest,
            cleanTitle,
            cleanPrj,
            cleanSql,
            cleanSqlParams,
            cleanSqlParamsTable: this.buildCleanSqlParamsTable(cleanSqlParams),
            sqlParamColumns: [
                {
                    title: langTrans("network table1"),
                    dataIndex: TABLE_FIELD_NAME,
                },
                {
                    title: langTrans("network table4"),
                    dataIndex: TABLE_FIELD_VALUE,
                    render: (data, row) => {
                        let [i, j] = row.key.split("_");
                        return (
                            <StepExpressionBuilderBox
                                enableFlag={true}
                                value={data}
                                cb={value => {
                                    let cleanSqlParams = this.state.cleanSqlParams[i];
                                    cleanSqlParams[j] = value;
                                    let clearnSqlParamsRow = this.state.cleanSqlParamsTable[i];
                                    clearnSqlParamsRow[j][TABLE_FIELD_VALUE] = value
                                    this.setState({
                                        cleanSqlParams: cloneDeep(this.state.cleanSqlParams),
                                        cleanSqlParamsTable: cloneDeep(this.state.cleanSqlParamsTable)
                                    });
                                }}
                                width={ 288 }
                                sourceId={ "7" }
                                iteratorId={ this.state.iteratorId}
                                unitTestUuid={ this.state.unitTestUuid}
                            />
                        );
                    }
                },
            ],
        }
    }

    async componentDidMount() {
        if (!isStringEmpty(this.state.unitTestCleanUuid)) {
            let cleanNodes = await getUnittestCleanNodes(this.state.unitTestCleanUuid, this.state.iteratorId, this.state.unitTestUuid);
            let cleanLength = cleanNodes.length;
            let cleanTitle = [];
            let cleanPrj = [];
            let cleanSql = [];
            let cleanSqlParams = [];
            for (let cleanNode of cleanNodes) {
                cleanTitle.push(cleanNode[field_clean_title]);
                cleanPrj.push(cleanNode[field_clean_prj]);
                cleanSql.push(cleanNode[field_clean_sql]);
                cleanSqlParams.push(cleanNode[field_clean_sql_params]);
            }
            this.setState({
                cleanLength,
                cleanTitle,
                cleanPrj,
                cleanSql,
                cleanSqlParams,
                cleanSqlParamsTable: this.buildCleanSqlParamsTable(cleanSqlParams),
            });
        }
    }

    addClean = () => {

        let cleanTitle = cloneDeep(this.state.cleanTitle);
        let cleanPrj = cloneDeep(this.state.cleanPrj);
        let cleanSql = cloneDeep(this.state.cleanSql);
        let cleanSqlParams = cloneDeep(this.state.cleanSqlParams);
        let cleanLength = this.state.cleanLength;
        cleanTitle.push(null);
        cleanPrj.push(null);
        cleanSql.push("");
        cleanSqlParams.push([]);
        cleanLength += 1;
        this.setState({
            cleanTitle,
            cleanPrj,
            cleanSql,
            cleanSqlParams,
            cleanLength,
        });
    }

    minusIndex = (deleteIndex : number) => {
        // 深度克隆状态（保持你原有的写法）
        let assertTitle = cloneDeep(this.state.assertTitle);
        let assertPrev = cloneDeep(this.state.assertPrev);
        let assertAfter = cloneDeep(this.state.assertAfter);
        let assertLength = this.state.assertLength;
        let assertType = cloneDeep(this.state.assertType);
        let assertSql = cloneDeep(this.state.assertSql);
        let assertSqlParams = cloneDeep(this.state.assertSqlParams);

        // 安全判断：索引有效 且 数组长度>1
        if (assertLength > 1 && deleteIndex >= 0 && deleteIndex < assertLength) {
            // ✅ 移除指定索引元素，生成新数组（核心替换代码）
            assertTitle = assertTitle.filter((_, i) => i !== deleteIndex);
            assertPrev = assertPrev.filter((_, i) => i !== deleteIndex);
            assertAfter = assertAfter.filter((_, i) => i !== deleteIndex);
            assertType = assertType.filter((_, i) => i !== deleteIndex);
            assertSql = assertSql.filter((_, i) => i !== deleteIndex);
            assertSqlParams = assertSqlParams.filter((_, i) => i !== deleteIndex);

            // 长度 -1
            assertLength -= 1;

            const newState = {
                assertTitle,
                assertLength,
                assertType,
                assertSql,
                assertSqlParams,
                assertSqlParamsTable: this.buildCleanSqlParamsTable(assertSqlParams),
                assertPrev,
                assertAfter
            };

            // 更新状态
            this.setState(newState);
        }
    }

    subClean = () => {
        let cleanTitle = cloneDeep(this.state.cleanTitle);
        let cleanPrj = cloneDeep(this.state.cleanPrj);
        let cleanLength = this.state.cleanLength;
        let cleanSql = cloneDeep(this.state.cleanSql);
        let cleanSqlParams = cloneDeep(this.state.cleanSqlParams);
        if (cleanLength > 1) {
            cleanTitle.pop();
            cleanPrj.pop();
            cleanSql.pop();
            cleanSqlParams.pop();
            cleanLength -= 1;
            this.setState({
                cleanTitle,
                cleanPrj,
                cleanLength,
                cleanSql,
                cleanSqlParams,
            });
        }
    }

    handleSqlBlur = (index: number) => {
        const cleanSqlParamArr = cloneDeep(this.state.cleanSqlParams);
        let cleanSql = this.state.cleanSql[index];
        let cleanSqlParams = cleanSqlParamArr[index];
        if (isStringEmpty(cleanSql)) {
            cleanSqlParams = [];
            cleanSqlParamArr[index] = cleanSqlParams;
        } else {
            cleanSqlParams = Array((cleanSql.match(/\?/g) || []).length).fill('');
            cleanSqlParamArr[index] = cleanSqlParams;
        }
        const cleanSqlParamsTable = this.buildCleanSqlParamsTable(cleanSqlParamArr);
        this.setState({
            cleanSqlParamsTable,
            assertSqlParams: cleanSqlParamArr
        });
    }

    buildCleanSqlParamsTable = (assertSqlParamArr) => {
        let list = [];
        for (let i = 0; i < assertSqlParamArr.length; i++) {
            let assertSqlParams = assertSqlParamArr[i];
            let item = [];
            if (assertSqlParams.length > 0) {
                for (let j = 0; j < assertSqlParams.length; j++) {
                    let item2 : any = {};
                    item2.key = i + "_" + j;
                    item2[TABLE_FIELD_NAME] = langFormat("unittest step db param", {
                        "index": (j + 1)
                    });
                    item2[TABLE_FIELD_VALUE] = assertSqlParams[j];
                    item.push(item2);
                }
            }
            list.push(item);
        }
        return cloneDeep(list);
    }

    onFinish = async (values) => {
        let cleanLength = this.state.cleanLength;
        for (let i = 0; i < cleanLength; i++) {
            if (isStringEmpty(this.state.cleanTitle[i])) {
                message.error(langTrans("step add check5"));
                return;
            }
        }
        if (isStringEmpty(this.state.unitTestCleanUuid)) {
            await addUnitTestCleanNode(
                this.state.iteratorId, this.state.unitTestUuid,
                this.state.cleanTitle, this.state.cleanPrj, this.state.cleanSql, this.state.cleanSqlParams
            );
        } else {
            await saveUnitTestCleanNode(
                this.state.unitTestCleanUuid,
                this.state.iteratorId, this.state.unitTestUuid,
                this.state.cleanTitle, this.state.cleanPrj, this.state.cleanSql, this.state.cleanSqlParams
            );
        }
        this.props.history.goBack();
    }

    getCurrentUnitTest1 = (unitTest, iteratorId, unitTestUuid) => {
        let cUnitTest = null;
        for (let _unitTest of unitTest[iteratorId]) {
            if (_unitTest[unittest_uuid] === unitTestUuid) {
                cUnitTest = _unitTest;
                break;
            }
        }
        return cUnitTest;
    }

    render() : ReactNode {
        return (
            <Layout>
                <Header style={{ padding: 0 }}>
                    {langTrans("unittest clean title")}
                </Header>
                <Content style={{ padding: '0 16px' }}>
                    <Breadcrumb style={{ margin: '16px 0' }} items={[
                        { title: langTrans("unittest clean title") },
                        { title: <a href={ '#/version_iterator_tests/' + this.state.iteratorId }>{ this.state.unitTest[unittest_title] }</a > }, 
                        { title: isStringEmpty(this.state.unitTestCleanUuid) ? langTrans("unittest clean bread add") : langTrans("unittest clean bread edit") }
                    ]} />
                    <div
                        style={{
                            padding: 24,
                            minHeight: 360,
                        }}
                    >
                        <Form
                            style={{ maxWidth: 700 }}
                            labelCol={{ span: 4 }} 
                            wrapperCol={{ span: 20 }}
                            onFinish={this.onFinish}
                            autoComplete="off"
                        >
                            <Form.Item label={langTrans("unittest clean node switch")}>
                                <Switch checked={this.state.unitTest[unittest_clean_flg] == 1} onChange={async checked => {
                                    await enableUnittestCleanNodes(checked, this.state.iteratorId, this.state.unitTestUuid);
                                    let unitTest = cloneDeep(this.state.unitTest);
                                    unitTest[unittest_clean_flg] = checked ? 1 : 0;
                                    this.setState({unitTest});
                                }} />
                            </Form.Item>
                            {this.state.cleanLength > 0 &&
                            <>
                                <Divider>
                                    <Space size={"middle"}>
                                        <Button shape="circle" onClick={this.addClean} icon={<PlusOutlined />} />
                                        {langTrans("unittest clean node title")}
                                        <Button shape="circle" onClick={this.subClean} icon={<MinusOutlined />} />
                                    </Space>
                                </Divider>
                                {Array.from({ length: this.state.cleanLength }, (_, i) => (
                                <Form.Item key={i}
                                    label={langTrans("unittest clean node title") + (i+1)}
                                    style={{marginTop: 24}}
                                >
                                    <Space direction='vertical' size={"middle"}>
                                        <Input 
                                            placeholder={langTrans("unittest clean node tip1")}
                                            addonBefore={
                                                <Select
                                                    showSearch={ true }
                                                    value={this.state.cleanPrj[i]}
                                                    style={{ width: 174 }}
                                                    options={ this.props.projects.map(_prj => ({label: _prj.label, value: _prj.value + "$$" + _prj.label})) }
                                                    onChange={newPrj => {
                                                        let cleanPrj = cloneDeep(this.state.cleanPrj);
                                                        cleanPrj[i] = newPrj.split("$$")[0];
                                                        this.setState({cleanPrj});
                                                    }}
                                                />
                                            }
                                            addonAfter={ this.state.cleanLength > 1 ? <Button onClick={() => this.minusIndex(i)} type='text' icon={<MinusOutlined />} /> : null }
                                            style={{width: 500}}
                                            value={this.state.cleanTitle[i]} onChange={event => {
                                                let cleanTitle = cloneDeep(this.state.cleanTitle);
                                                cleanTitle[i] = event.target.value;
                                                this.setState({cleanTitle});
                                            }} 
                                        />
                                        <TextArea 
                                            placeholder={ langTrans("unittest clean node sql") }
                                            value={this.state.cleanSql[i]}
                                            onChange={event => {
                                                let cleanSql = cloneDeep(this.state.cleanSql);
                                                cleanSql[i] = event.target.value;
                                                this.setState({cleanSql});
                                            }}
                                            onBlur={event => this.handleSqlBlur(i)}
                                            style={{width: 500}}
                                        /> 
                                        <Table
                                            style={{width : "100%"}}
                                            columns={this.state.sqlParamColumns}
                                            dataSource={this.state.cleanSqlParamsTable[i]}
                                            pagination={ false }
                                        />
                                    </Space>
                                </Form.Item>
                                ))}
                            </>
                            }
                            <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
                                <Button type="primary" htmlType="submit">
                                    {isStringEmpty(this.state.unitTestCleanUuid) ? langTrans("unittest clean bread add") : langTrans("unittest clean bread edit")}
                                </Button>
                            </Form.Item>
                        </Form>
                    </div>
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
        unittest: state.unittest.list,
        projects: state.prj.list,
    }
}

export default connect(mapStateToProps)(UnittestStepContainer);