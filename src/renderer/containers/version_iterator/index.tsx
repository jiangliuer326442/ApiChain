import { Component, ReactNode } from 'react';
import { connect } from 'react-redux';
import { 
  EyeOutlined, 
  EditOutlined, 
  DeleteOutlined,
  FileMarkdownOutlined
} from '@ant-design/icons';
import { 
  Breadcrumb, Layout, Space,
  Flex, Button, Table, Popconfirm,
} from "antd";
import { cloneDeep } from 'lodash';

import VersionIteratorSwitch from '@comp/version_iterator/switch';
import MarkdownView from '@comp/markdown/show';
import { ChannelsLoadAppStr } from '@conf/channel';
import { VERSION_ITERATOR_ADD_ROUTE } from "@conf/routers";
import { TABLE_VERSION_ITERATION_FIELDS } from '@conf/db';
import { 
  getVersionIteratorsByPage, 
  delVersionIterator 
} from "@act/version_iterator";
import { langTrans, getLang } from '@lang/i18n';

const { Header, Content, Footer } = Layout;

let version_iterator_uuid = TABLE_VERSION_ITERATION_FIELDS.FIELD_UUID;
let version_iterator_title = TABLE_VERSION_ITERATION_FIELDS.FIELD_NAME;
let version_iterator_prjects = TABLE_VERSION_ITERATION_FIELDS.FIELD_PROJECTS;
let version_iterator_openflg = TABLE_VERSION_ITERATION_FIELDS.FIELD_OPENFLG;

class VersionIterator extends Component {

    constructor(props) {
      super(props);
      this.state = {
        listColumn: [
          {
              title: langTrans("iterator table1"),
              dataIndex: version_iterator_title,
          },
          {
            title: langTrans("iterator table2"),
            dataIndex: version_iterator_prjects,
            width: 200,
            render: (projects) => {
              return projects.
                filter(_prj => this.props.projects.find(row => row.value === _prj)).
                map(_prj => this.props.projects.find(row => row.value === _prj).label).
                join(" , ");
            },
          },
          {
            title: langTrans("iterator table3"),
            dataIndex: version_iterator_openflg,
            width: 90,
            render: (status, row) => {
              return <VersionIteratorSwitch defaultChecked={status} uuid={row[version_iterator_uuid]} cb={async ()=>{
                window.electron.ipcRenderer.sendMessage(ChannelsLoadAppStr);
              }} />
            },
          },
          {
            title: langTrans("iterator table4"),
            key: 'operater',
            width: 100,
            render: (_, record) => {
              return (
                <Space size="middle">
                  <Button type="link" icon={record[version_iterator_openflg] === 0 ? <EyeOutlined /> : <EditOutlined />} href={"#/version_iterator/" + record[version_iterator_uuid]} />
                  { record[version_iterator_openflg] === 1 ? 
                  <Popconfirm
                  title={langTrans("iterator del title")}
                  description={langTrans("iterator del desc")}
                  onConfirm={async e => {
                    await delVersionIterator(this.props.clientType, this.props.teamId, record);
                    let pagination = cloneDeep(this.state.pagination);
                    let listDatas = await getVersionIteratorsByPage(this.props.clientType, pagination)
                    this.setState({listDatas, pagination});
                  }}
                  okText={langTrans("iterator del sure")}
                  cancelText={langTrans("iterator del cancel")}
                >
                  <Button danger type="link" icon={<DeleteOutlined />} />
                </Popconfirm>
                  : 
                  <Button danger type="link" icon={<FileMarkdownOutlined />} href={"#/version_iterator_requests/" + record[version_iterator_uuid] } />
                }
                </Space>
              )
            },
          }
        ],
        listDatas: [],
        pagination: {
          current: 1,
          pageSize: 10,
        },
        lang: getLang()
      }
    }

    async componentDidMount() {
      let pagination = cloneDeep(this.state.pagination);
      let listDatas = await getVersionIteratorsByPage(this.props.clientType, pagination)
      this.setState({listDatas, pagination});
    }

    render() : ReactNode {
        const markdownContentZhCn = `
# ApiChain：以「版本迭代」为核心的微服务接口管理利器

在微服务架构下，接口分散于各个微服务中，而研发却以“版本迭代”为单位交付功能。这种**微服务拆分与迭代聚合的错位**，导致传统的接口管理工具在应对版本迭代时显得力不从心。

## 💡 行业痛点：传统工具无法跨越的鸿沟

在日常研发与交付流程中，团队往往面临以下五大痛点：

1. **文档一致性难控**：如何维护“迭代内接口文档”与“项目全局接口文档”的一致性？
2. **回归风险难测**：修复Bug时，如何确保不影响本迭代其他功能乃至整个项目的平稳运行？
3. **信息共享低效**：如何向测试与前端高效共享本次迭代的接口变更？
4. **资产归档散乱**：如何统一记录并归档迭代涉及的设计文档、表结构变更、配置及注意事项？
5. **历史检索困难**：上线已久，如何快速从历史迭代文档中检索关键知识点？

------

## 🚀 ApiChain 核心解法：专为版本迭代而生

针对上述痛点，ApiChain 提出了以“迭代”为维度的全新管理范式：

### 一、 迭代级聚合与合并，破解一致性难题

- **迭代视角看接口**：创建包含若干微服务的版本迭代，在迭代下直接调试并生成接口文档。测试人员可一目了然看到本次上线涉及的微服务及接口的新增/调整情况。
- **智能合并回滚**：迭代上线并关闭后，所有接口将**按接口地址自动合并**至对应项目中，彻底解决迭代与项目文档的一致性维护痛点。

### 二、 深度链路测试与断言，保障上线零风险

- **全链路单测串联**：支持将若干接口依次调用串联，后续步骤可引用前序步骤的参数或返回值，并配有独立的单测环境变量进行数据共享，实现**反复执行、反复验证**。
- **数据库级深度断言**：突破传统仅校验返回码的局限，支持配置数据库连接，执行 SQL 查询，并将查询结果与前序步骤的入参/返回值进行比对，深度断言每一步的数据正确性。
- **脏数据一键清理**：每个单测用例执行完毕后，产生的脏数据可统一自动清理，保障测试环境纯净。
- **测试资产沉淀**：迭代内反复验证的单测用例，可直接**导出至项目**，作为项目长期的接口回归测试资产。

### 三、 一站式文档归档与共享，打破信息孤岛

- **Markdown 迭代文档**：每个迭代配备专属 Markdown 文档区，集中记录涉及的各类设计文档、数据库表变更、定时任务及上线备注。
- **网页链接实时共享**：迭代文档连同迭代接口共同生成网页链接，实现信息实时共享，前端与测试无需反复催要文档。

------

## 🌟 独家特色功能：降维打击竞品的核心壁垒

相较于市面上仅停留在“接口增删改查”的传统工具，ApiChain 在以下维度实现了突破：

| 特色能力                | 竞品常态                      | ApiChain 方案                                               | 解决的核心痛点                         |
| :---------------------- | :---------------------------- | :---------------------------------------------------------- | :------------------------------------- |
| **迭代与项目双轨制**    | 只有项目维度，接口散乱        | 迭代内聚合调试，关闭后按接口地址智能合并项目                | 迭代文档与项目文档脱节、一致性难维护   |
| **数据库深度断言**      | 仅支持校验 HTTP 状态码/返回码 | 连接数据库执行 SQL，查询结果与接口参数/返回值交叉比对       | Bug修复引发的数据层面的隐性回归风险    |
| **大模型 RAG 智能检索** | 依赖人工翻阅历史文档          | 引入 AI 大模型 RAG 技术，针对迭代文档进行知识检索与精准问答 | 历史迭代知识沉淀难、关键点检索效率极低 |
`;
        const markdownContentZhTw = `
# ApiChain：以「版本迭代」為核心的微服務介面管理利器

在微服務架構下，介面分散於各個微服務中，而研發卻以「版本迭代」為單位交付功能。這種**微服務拆分與迭代聚合的錯位**，導致傳統的介面管理工具在應對版本迭代時顯得力不從心。

## 💡 行業痛點：傳統工具無法跨越的鴻溝

在日常研發與交付流程中，團隊往往面臨以下五大痛點：

1. **文件一致性難控**：如何維護「迭代內介面文件」與「專案全局介面文件」的一致性？
2. **回歸風險難測**：修復 Bug 時，如何確保不影響本迭代其他功能乃至整個專案的平穩運行？
3. **資訊共享低效**：如何向測試與前端高效共享本次迭代的介面變更？
4. **資產歸檔散亂**：如何統一記錄並歸檔迭代涉及的設計文件、表結構變更、配置及注意事項？
5. **歷史檢索困難**：上線已久，如何快速從歷史迭代文件中檢索關鍵知識點？

------

## 🚀 ApiChain 核心解法：專為版本迭代而生

針對上述痛點，ApiChain 提出了以「迭代」為維度的全新管理範式：

### 一、 迭代級聚合與合併，破解一致性難題

- **迭代視角看介面**：建立包含若干微服務的版本迭代，在迭代下直接除錯並生成介面文件。測試人員可一目了然看到本次上線涉及的微服務及介面的新增/調整情況。
- **智慧合併回歸**：迭代上線並關閉後，所有介面將**按介面位址自動合併**至對應專案中，徹底解決迭代與專案文件的一致性維護痛點。

### 二、 深度鏈路測試與斷言，保障上線零風險

- **全鏈路單測串聯**：支援將若干介面依次呼叫串聯，後續步驟可引用前序步驟的參數或回傳值，並配有獨立的單測環境變數進行資料共享，實現**反覆執行、反覆驗證**。
- **資料庫級深度斷言**：突破傳統僅校驗回傳碼的局限，支援配置資料庫連線，執行 SQL 查詢，並將查詢結果與前序步驟的入參/回傳值進行比對，深度斷言每一步的資料正確性。
- **髒資料一鍵清理**：每個單測案例執行完畢後，產生的髒資料可統一自動清理，保障測試環境純淨。
- **測試資產沉澱**：迭代內反覆驗證的單測案例，可直接**匯出至專案**，作為專案長期的介面回歸測試資產。

### 三、 一站式文件歸檔與共享，打破資訊孤島

- **Markdown 迭代文件**：每個迭代配備專屬 Markdown 文件區，集中記錄涉及的各類設計文件、資料庫表變更、定時任務及上線備註。
- **網頁連結實時共享**：迭代文件連同迭代介面共同生成網頁連結，實現資訊實時共享，前端與測試無需反覆催要文件。

------

## 🌟 獨家特色功能：降維打擊競品的核心壁壘

相較於市面上僅停留在「介面增刪改查」的傳統工具，ApiChain 在以下維度實現了突破：

| 特色能力                | 競品常態                      | ApiChain 方案                                               | 解決的核心痛點                         |
| :---------------------- | :---------------------------- | :---------------------------------------------------------- | :------------------------------------- |
| **迭代與專案雙軌制**    | 只有專案維度，介面散亂        | 迭代內聚合除錯，關閉後按介面位址智慧合併專案                | 迭代文件與專案文件脫節、一致性難維護   |
| **資料庫深度斷言**      | 僅支援校驗 HTTP 狀態碼/回傳碼 | 連接資料庫執行 SQL，查詢結果與介面參數/回傳值交叉比對       | Bug修復引發的資料層面的隱性回歸風險    |
| **大模型 RAG 智慧檢索** | 依賴人工翻閱歷史文件          | 引入 AI 大模型 RAG 技術，針對迭代文件進行知識檢索與精準問答 | 歷史迭代知識沉澱難、關鍵點檢索效率極低 |
`;
        const markdownContentEn = `
# ApiChain: The Ultimate Microservice API Management Tool Centered on "Version Iterations"

In a microservice architecture, APIs are scattered across various microservices, yet development teams deliver features based on "version iterations." This **misalignment between microservice fragmentation and iteration aggregation** makes traditional API management tools inadequate for handling version iterations.

## 💡 Industry Pain Points: The Insurmountable Gap of Traditional Tools

In the daily development and delivery process, teams often face the following five major pain points:

1. **Uncontrollable Document Consistency**: How to maintain consistency between "iteration API documentation" and "global project API documentation"?
2. **Unpredictable Regression Risks**: When fixing bugs, how to ensure that other features in the current iteration or the entire project remain unaffected?
3. **Inefficient Information Sharing**: How to efficiently share iteration API changes with QA and frontend teams?
4. **Scattered Asset Archiving**: How to uniformly record and archive design documents, database schema changes, configurations, and deployment precautions involved in an iteration?
5. **Difficult History Retrieval**: Long after deployment, how to quickly retrieve key knowledge points from historical iteration documents?

------

## 🚀 ApiChain's Core Solution: Built Exclusively for Version Iterations

To address these pain points, ApiChain introduces a brand-new management paradigm centered around "iterations":

### 1. Iteration-Level Aggregation and Merging: Solving the Consistency Challenge

- **View APIs from an Iteration Perspective**: Create a version iteration that includes multiple microservices, and directly debug and generate API documentation within the iteration. QA can see at a glance the microservices and new/adjusted APIs involved in the release.
- **Smart Merging**: Once the iteration goes live and is closed, all APIs are automatically merged into the corresponding projects **by API endpoint**, thoroughly resolving the pain point of maintaining consistency between iteration and project documentation.

### 2. Deep Pipeline Testing and Assertion: Ensuring Zero-Risk Deployment

- **Full-Pipeline Unit Test Chaining**: Supports sequentially calling multiple APIs, where subsequent steps can reference the parameters or return values of previous steps. It also features independent unit test environment variables for data sharing, enabling **repeated execution and verification**.
- **Database-Level Deep Assertion**: Breaks through the limitation of only verifying HTTP status/response codes. Supports configuring database connections, executing SQL queries, and comparing the query results with the inputs/outputs of previous steps to deeply assert the data correctness of each step.
- **One-Click Dirty Data Cleanup**: After each unit test case is executed, the generated dirty data can be automatically and uniformly cleaned up, ensuring a pristine testing environment.
- **Test Asset Accumulation**: The repeatedly verified unit test cases within an iteration can be directly **exported to the project**, serving as long-term API regression test assets.

### 3. One-Stop Document Archiving and Sharing: Breaking Information Silos

- **Markdown Iteration Documents**: Each iteration is equipped with a dedicated Markdown document area to centrally record various design documents, database schema changes, cron jobs, and deployment notes involved.
- **Real-Time Sharing via Web Links**: The iteration document, along with the iteration APIs, generates a web link for real-time information sharing, eliminating the need for frontend and QA teams to repeatedly ask for documentation.

------

## 🌟 Exclusive Features: Core Competencies that Outperform Competitors

Compared to traditional tools that only focus on basic API CRUD operations, ApiChain has achieved breakthroughs in the following dimensions:

| Feature                            | Competitor Norm                                    | ApiChain Solution                                            | Core Pain Point Resolved                                     |
| :--------------------------------- | :------------------------------------------------- | :----------------------------------------------------------- | :----------------------------------------------------------- |
| **Iteration & Project Dual-Track** | Project-dimension only, scattered APIs             | Aggregated debugging within iterations; smart merging to projects by API endpoint upon closure | Disconnection between iteration and project docs; hard-to-maintain consistency |
| **Database Deep Assertion**        | Only supports HTTP status/response code validation | Connects to DBs to execute SQL, cross-referencing query results with API parameters/responses | Hidden regression risks at the data level caused by bug fixes |
| **LLM RAG Smart Retrieval**        | Relies on manual review of historical documents    | Introduces AI LLM RAG technology for knowledge retrieval and precise Q&A based on iteration documents | Difficult accumulation of historical iteration knowledge; extremely low retrieval efficiency |
`;
        let markdownContent;
        if (this.state.lang == "zh-CN") {
          markdownContent = markdownContentZhCn;
        } else if (this.state.lang == "zh-TW") {
          markdownContent = markdownContentZhTw;
        } else {
          markdownContent = markdownContentEn;
        }
        return (
          <Layout>
            <Header style={{ padding: 0 }}>
              {langTrans("iterator title")}
            </Header>
            <Content style={{ padding: '0 16px' }}>
                <Flex justify="space-between" align="center">
                    <Breadcrumb style={{ margin: '16px 0' }} items={[{ title: langTrans("iterator bread1") }, { title: langTrans("iterator bread2") }]} />
                    <Button  style={{ margin: '16px 0' }} type="primary" href={"#" + VERSION_ITERATOR_ADD_ROUTE}>{langTrans("iterator add")}</Button>
                </Flex>
              {this.state.listDatas.length > 0 ? 
                <Table 
                  dataSource={this.state.listDatas} 
                  rowKey={(record) => record.uuid}
                  columns={this.state.listColumn} 
                  pagination={this.state.pagination}
                  onChange={ async (pagination, filters, sorter) => {
                    let listDatas = await getVersionIteratorsByPage(this.props.clientType, pagination)
                    this.setState({listDatas, pagination});
                  }} />
              : 
                <MarkdownView 
                  content={ markdownContent } 
                />
              }
            </Content>
            <Footer style={{ textAlign: 'center' }}>
            ApiChain ©{new Date().getFullYear()} Created by Mustafa Fang
            </Footer>
          </Layout>
        );
      }
}

function mapStateToProps (state) {
    return {
      projects: state.prj.list,
      teamId: state.device.teamId,
      clientType: state.device.clientType,
    }
}

export default connect(mapStateToProps)(VersionIterator);