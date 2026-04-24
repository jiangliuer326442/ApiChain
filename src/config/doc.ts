import { getLang } from '../lang/i18n';


export function getVersionIterationDoc() {
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
    if (getLang() == "zh-CN") {
        markdownContent = markdownContentZhCn;
    } else if (getLang() == "zh-TW") {
        markdownContent = markdownContentZhTw;
    } else {
        markdownContent = markdownContentEn;
    }
    return markdownContent;
}


export function getEnvVarDoc() {
    const markdownContentZhCn = `
# ApiChain 环境变量设计解析

> **什么是环境变量？** 顾名思义，环境变量是在特定环境（如开发、测试、生产环境）下提供的一组 **Key-Value** 类型的字符串。
>
> **核心优势**：将频繁的配置变更控制在公共数据层，而非实际执行网络请求或单测用例层。发送请求或执行单测时，只需持有环境变量 Key 的引用，实际运行时会根据引用动态查找真实值。

------

## 💡 四级环境变量体系

相比常规的环境变量管理，ApiChain 提供了更精密的层级划分，精准控制不同范围的数据配置：

### 1. 🌐 全局环境变量

- **定位**：跨微服务共享的全局公共数据
- **场景**：针对特定业务场景使用的数据，要求所有微服务保持一致。例如：特定业务的 UID、统一的客户端版本号等。

### 2. 📁 项目环境变量

- **定位**：单个微服务专属的共享数据
- **场景**：仅对某个微服务生效的自定义配置，但作为该项目的公共数据共享。例如：该微服务专属的接口鉴权 Key。

### 3. 🔄 迭代环境变量

- **定位**：版本迭代期间的临时高权限配置
- **场景**：研发在版本开发期间临时申请的高权限配置（可能是项目级或全局级）。这类变量仅在当前迭代的接口请求及测试用例中生效，**版本上线后即失效废弃**。

### 4. 🧪 单测环境变量

- **定位**：单测用例内部的动态引用数据
- **场景**：在由多步骤组成的测试用例中，后续步骤频繁引用的前置步骤的入参或返回数据。
- **机制**：变量的值是对前置步骤数据的引用。当迭代单测转变为项目共享单测时，原有的迭代环境变量会被自动拷贝为单测环境变量，确保用例独立运行。

### 📊 作用域范围

综上，这四种环境变量的影响范围由大到小依次为： **\`全局\` ➔ \`项目\` ➔ \`迭代\` ➔ \`单测\`**

------

## 🛠️ 贴心进阶功能

为了进一步提升使用体验与安全性，ApiChain 还提供了以下实用功能：

- **📋 环境变量拷贝** 针对不同环境中重复使用的变量，支持勾选所需变量，**批量拷贝**到新环境中，免去重复配置的繁琐。
- **🔒 数据加密** 针对敏感信息（如高权限密钥），实现**展现与存储双重加密**：
  - 界面展现：脱敏处理，无法直接查看内容；
  - 数据库存储：加密落盘，无法被破解窃取；
  - 实际使用：仅在内存中完成解密，确保真实值的安全。
`;
    const markdownContentZhTw = `
# ApiChain 環境變數設計解析

> **什麼是環境變數？** 顧名思義，環境變數是在特定環境（如開發、測試、生產環境）下提供的一組 **Key-Value** 型別的字串。
>
> **核心優勢**：將頻繁的配置變更控制在公共資料層，而非實際執行網路請求或單測用例層。發送請求或執行單測時，只需持有環境變數 Key 的引用，實際運行時會根據引用動態查找真實值。

------

## 💡 四級環境變數體系

相比常規的環境變數管理，ApiChain 提供了更精密的層級劃分，精準控制不同範圍的資料配置：

### 1. 🌐 全域環境變數

- **定位**：跨微服務共享的全域公共資料
- **場景**：針對特定業務場景使用的資料，要求所有微服務保持一致。例如：特定業務的 UID、統一的客戶端版本號等。

### 2. 📁 專案環境變數

- **定位**：單個微服務專屬的共享資料
- **場景**：僅對某個微服務生效的自定義配置，但作為該專案的公共資料共享。例如：該微服務專屬的介面鑑權 Key。

### 3. 🔄 迭代環境變數

- **定位**：版本迭代期間的臨時高權限配置
- **場景**：研發在版本開發期間臨時申請的高權限配置（可能是專案級或全域級）。這類變數僅在當前迭代的介面請求及測試用例中生效，**版本上線後即失效廢棄**。

### 4. 🧪 單測環境變數

- **定位**：單測用例內部的動態引用資料
- **場景**：在由多步驟組成的測試用例中，後續步驟頻繁引用的前置步驟的入參或返回資料。
- **機制**：變數的值是對前置步驟資料的引用。當迭代單測轉變為專案共享單測時，原有的迭代環境變數會被自動拷貝為單測環境變數，確保用例獨立執行。

### 📊 作用域範圍

綜上，這四種環境變數的影響範圍由大到小依次為： **\`全域\` ➔ \`專案\` ➔ \`迭代\` ➔ \`單測\`**

------

## 🛠️ 貼心進階功能

為了進一步提升使用體驗與安全性，ApiChain 還提供了以下實用功能：

- **📋 環境變數拷貝** 針對不同環境中重複使用的變數，支援勾選所需變數，**批量拷貝**到新環境中，免去重複配置的繁瑣。
- **🔒 資料加密** 針對敏感資訊（如高權限金鑰），實現**展現與儲存雙重加密**：
  - 介面展現：脫敏處理，無法直接查看內容；
  - 資料庫儲存：加密落盤，無法被破解竊取；
  - 實際使用：僅在記憶體中完成解密，確保真實值的安全。
`;
    const markdownContentEn = `
# ApiChain Environment Variable Design Analysis

> **What are environment variables?** As the name suggests, environment variables are a set of **Key-Value** strings provided under specific environments (such as development, testing, and production environments).
>
> **Core Advantage**: Confine frequent configuration changes to the public data layer, rather than the layer that actually executes network requests or unit test cases. When sending a request or executing a unit test, you only need to hold a reference to the environment variable Key. The actual runtime will dynamically look up the real value based on the reference.

------

## 💡 Four-Tier Environment Variable System

Compared to conventional environment variable management, ApiChain provides a more refined hierarchical division to precisely control data configurations across different scopes:

### 1. 🌐 Global Environment Variables

- **Positioning**: Global public data shared across microservices
- **Scenario**: Data used for specific business scenarios, requiring all microservices to remain consistent. For example: business-specific UIDs, unified client version numbers, etc.

### 2. 📁 Project Environment Variables

- **Positioning**: Shared data exclusive to a single microservice
- **Scenario**: Custom configurations that only take effect for a certain microservice, but are shared as public data for that project. For example: the API authentication Key exclusive to that microservice.

### 3. 🔄 Iteration Environment Variables

- **Positioning**: Temporary high-privilege configurations during version iterations
- **Scenario**: High-privilege configurations temporarily applied for by R&D during version development (can be project-level or global-level). These variables only take effect in the API requests and test cases of the current iteration, and **become invalid and obsolete once the version goes live**.

### 4. 🧪 Unit Test Environment Variables

- **Positioning**: Dynamically referenced data within unit test cases
- **Scenario**: In a test case composed of multiple steps, the input parameters or returned data of preceding steps that are frequently referenced by subsequent steps.
- **Mechanism**: The value of the variable is a reference to the data from a preceding step. When an iteration unit test transforms into a project-shared unit test, the original iteration environment variables are automatically copied as unit test environment variables, ensuring the test case runs independently.

### 📊 Scope Range

In summary, the impact scope of these four types of environment variables from largest to smallest is: **\`Global\` ➔ \`Project\` ➔ \`Iteration\` ➔ \`Unit Test\`**
------
## 🛠️ Thoughtful Advanced Features
To further enhance the user experience and security, ApiChain also provides the following practical features:
- **📋 Environment Variable Copy** For variables reused in different environments, it supports selecting the required variables and **batch copying** them to a new environment, eliminating the tediousness of repeated configurations.
- **🔒 Data Encryption** For sensitive information (such as high-privilege keys), it achieves **dual encryption for display and storage**:
  - Interface display: Desensitization processing, content cannot be viewed directly;
  - Database storage: Encrypted on disk, cannot be cracked or stolen;
  - Actual usage: Decryption is completed only in memory, ensuring the security of the real value.
`;    
    let markdownContent;
    if (getLang() == "zh-CN") {
        markdownContent = markdownContentZhCn;
    } else if (getLang() == "zh-TW") {
        markdownContent = markdownContentZhTw;
    } else {
        markdownContent = markdownContentEn;
    }
    return markdownContent;
}

export function getAiUseDoc() {
    const markdownContentZhCn = `
# AI 在接口管理工具中的革新应用与使用指南

在现代敏捷开发与版本迭代中，接口文档管理往往伴随着上下文割裂、编写繁琐与检索低效等痛点。本文档将为您清晰地梳理 AI 在这款接口管理工具中的核心作用，以及在实际使用中的配置指南与问题解决方案。

---

## 一、 AI 的核心作用：重塑接口管理体验

### 1. 🤖 聚合多模型：随时召唤不同领域的“专家”
- **作用**：不同于单一的 AI 平台（如 DeepSeek、Grok、Gemini），该工具接入的是**云雾 AI 聚合中转平台**。
- **优势**：您可以根据不同场景的需求，随时切换不同大厂的大模型，相当于拥有了一个专家智库，精准解决编码与文档编写中的各类问题。

### 2. 🎯 智能上下文感知：告别重复的“前置说明”
- **传统痛点**：每次向 AI 提问时，都需要手动输入当前项目的编程语言、框架版本、依赖包及目录结构等上下文信息，费时费力。
- **AI 解决方案**：工具内每个项目均可配置专属信息（语言/版本、框架/版本、依赖包/版本、代码目录结构等）。AI 在回答时会**自动参考这些背景信息**，提供极具针对性的解答，彻底免除不断补充上下文的烦恼。

### 3. ✍️ 辅助文档生成：让接口说明不再头疼
- **传统痛点**：编写接口文档时，需要耗费大量精力向前端和测试人员解释接口业务含义及每个字段的具体用途。
- **AI 解决方案**：基于您选择的大模型，AI 能够**辅助生成接口含义及字段说明**。您只需审阅生成的内容，仅在不满意时进行微调即可，大幅提升文档编写效率。

### 4. 🧩 一键模型生成：JSON 秒变目标代码
- **作用**：当您需要根据 JSON 数据生成项目所需的模型代码时，AI 可以**一键生成**。
- **优势**：得益于项目信息的自动关联，AI 清楚您当前项目使用的开发语言，无需额外指定，直接输出完美适配您项目的模型代码。

### 5. 🔍 语义级检索与 RAG 问答：精准定位知识
- **传统痛点**：传统的关键词搜索往往无法理解真实意图，难以在海量接口中找到目标；版本迭代文档的知识也难以被有效利用。
- **AI 解决方案**：
  - **接口语义搜索**：结合**向量数据库与 RAG 技术**，AI 能基于您的语义理解搜索请求，精准找到最符合需求的接口。
  - **迭代知识库问答**：可针对版本迭代文档的知识库进行检索并回答您的提问，让历史经验随时赋能当前开发。

---

## 二、 使用教程与配置指南

为了保障 AI 功能的高效与安全运行，请按照以下指南进行配置与使用：

### 1. 网络配置与提供商选择
- **推荐选择**：\`云雾 API\`（AI 聚合中转平台，响应快捷）。
- **网络加速方案**：该平台已针对中国大陆网络进行加速优化。
  - 🟢 **Runner 部署在中国大陆**：API 地址请选择 **“中国大陆”**。
  - 🔵 **Runner 部署在海外**：API 地址请选择 **“其他地区”**。

### 2. 令牌（Token）管理
- **额度查看**：购买的令牌根据金额对应不同的 Token 量，您可以在控制台随时查看**总量**与**剩余 Token 量**，用量透明。
- **团队协作**：购买的令牌**支持整个团队成员共享使用**，无需为每位成员单独购买，降低团队成本。

### 3. 数据安全与隐私保障
- **安全痛点**：API 令牌一旦泄露可能导致额度被盗用或数据暴露。
- **安全解决方案**：
  - **加密存储**：令牌数据在数据库中采用加密存储。
  - **脱敏展示**：界面上展示的令牌信息进行脱敏处理，防止内部窥探。
  - **内存解密**：仅在发起 AI 请求的瞬间，才在内存中进行解密传输，全方位保障令牌与团队数据安全。
    `;
    const markdownContentZhTw = `
# AI 在接口管理工具中的革新應用與使用指南
在現代敏捷開發與版本迭代中，接口文檔管理往往伴隨著上下文割裂、編寫繁瑣與檢索低效等痛點。本文檔將為您清晰地梳理 AI 在這款接口管理工具中的核心作用，以及在實際使用中的配置指南與問題解決方案。
---
## 一、 AI 的核心作用：重塑接口管理體驗
### 1. 🤖 聚合多模型：隨時召喚不同領域的「專家」
- **作用**：不同於單一的 AI 平台（如 DeepSeek、Grok、Gemini），該工具接入的是**雲霧 AI 聚合中轉平台**。
- **優勢**：您可以根據不同場景的需求，隨時切換不同大廠的大模型，相當於擁有了一個專家智庫，精準解決編碼與文檔編寫中的各類問題。
### 2. 🎯 智能上下文感知：告別重複的「前置說明」
- **傳統痛點**：每次向 AI 提問時，都需要手動輸入當前項目的編程語言、框架版本、依賴包及目錄結構等上下文信息，費時費力。
- **AI 解決方案**：工具內每個項目均可配置專屬信息（語言/版本、框架/版本、依賴包/版本、代碼目錄結構等）。AI 在回答時會**自動參考這些背景信息**，提供極具針對性的解答，徹底免除不斷補充上下文的煩惱。
### 3. ✍️ 輔助文檔生成：讓接口說明不再頭疼
- **傳統痛點**：編寫接口文檔時，需要耗費大量精力向前端和測試人員解釋接口業務含義及每個字段的具體用途。
- **AI 解決方案**：基於您選擇的大模型，AI 能夠**輔助生成接口含義及字段說明**。您只需審閱生成的內容，僅在不滿意時進行微調即可，大幅提升文檔編寫效率。
### 4. 🧩 一鍵模型生成：JSON 秒變目標代碼
- **作用**：當您需要根據 JSON 數據生成項目所需的模型代碼時，AI 可以**一鍵生成**。
- **優勢**：得益於項目信息的自動關聯，AI 清楚您當前項目使用的開發語言，無需額外指定，直接輸出完美適配您項目的模型代碼。
### 5. 🔍 語義級檢索與 RAG 問答：精準定位知識
- **傳統痛點**：傳統的關鍵詞搜索往往無法理解真實意圖，難以在海量接口中找到目標；版本迭代文檔的知識也難以被有效利用。
- **AI 解決方案**：
  - **接口語義搜索**：結合**向量數據庫與 RAG 技術**，AI 能基於您的語義理解搜索請求，精準找到最符合需求的接口。
  - **迭代知識庫問答**：可針對版本迭代文檔的知識庫進行檢索並回答您的提問，讓歷史經驗隨時賦能當前開發。
---
## 二、 使用教程與配置指南
為了保障 AI 功能的高效與安全運行，請按照以下指南進行配置與使用：
### 1. 網絡配置與提供商選擇
- **推薦選擇**：\`雲霧 API\`（AI 聚合中轉平台，響應快捷）。
- **網絡加速方案**：該平台已針對中國大陸網絡進行加速優化。
  - 🟢 **Runner 部署在中國大陸**：API 地址請選擇 **「中國大陸」**。
  - 🔵 **Runner 部署在海外**：API 地址請選擇 **「其他地區」**。
### 2. 令牌管理
- **額度查看**：購買的令牌根據金額對應不同的 Token 量，您可以在控制台隨時查看**總量**與**剩餘 Token 量**，用量透明。
- **團隊協作**：購買的令牌**支持整個團隊成員共享使用**，無需為每位成員單獨購買，降低團隊成本。
### 3. 數據安全與隱私保障
- **安全痛點**：API 令牌一旦洩露可能導致額度被盜用或數據暴露。
- **安全解決方案**：
  - **加密存儲**：令牌數據在數據庫中採用加密存儲。
  - **脫敏展示**：界面上展示的令牌信息進行脫敏處理，防止內部窺探。
  - **內存解密**：僅在發起 AI 請求的瞬間，才在內存中進行解密傳輸，全方位保障令牌與團隊數據安全。
`;
	const markdownContentEn = `
# Innovative Applications and User Guide of AI in API Management Tools
In modern agile development and version iterations, API documentation management is often accompanied by pain points such as fragmented context, tedious writing, and inefficient retrieval. This document will clearly outline the core role of AI in this API management tool, along with configuration guides and problem-solving solutions for practical use.
---
## I. The Core Role of AI: Reshaping the API Management Experience
### 1. 🤖 Aggregated Multi-Models: Summon "Experts" from Different Fields at Any Time
- **Role**: Unlike a single AI platform (such as DeepSeek, Grok, Gemini), this tool integrates the **Yunwu AI Aggregation Transit Platform**.
- **Advantage**: You can switch between large models from different tech giants at any time according to the needs of different scenarios. It's like having an expert think tank to precisely solve various problems in coding and documentation writing.
### 2. 🎯 Intelligent Context Awareness: Say Goodbye to Repetitive "Preliminary Explanations"
- **Traditional Pain Point**: Every time you ask an AI a question, you must manually input contextual information such as the project's programming language, framework version, dependencies, and directory structure, which is time-consuming and laborious.
- **AI Solution**: Each project within the tool can be configured with exclusive information (language/version, framework/version, dependencies/version, code directory structure, etc.). When answering, the AI will **automatically refer to this background information**, providing highly targeted answers and completely eliminating the hassle of constantly adding context.
### 3. ✍️ Assisted Documentation Generation: Making API Descriptions Headache-Free
- **Traditional Pain Point**: When writing API documentation, a lot of effort is spent explaining the business meaning of the API and the specific purpose of each field to frontend and testing personnel.
- **AI Solution**: Based on your selected large model, AI can **assist in generating API meanings and field descriptions**. You only need to review the generated content and make minor adjustments if unsatisfied, significantly improving documentation writing efficiency.
### 4. 🧩 One-Click Model Generation: JSON to Target Code in Seconds
- **Role**: When you need to generate model code required by your project based on JSON data, AI can **generate it with one click**.
- **Advantage**: Thanks to the automatic association of project information, the AI knows the programming language used in your current project. There is no need to specify it additionally; it directly outputs model code that perfectly adapts to your project.
### 5. 🔍 Semantic Retrieval and RAG Q&A: Precisely Locating Knowledge
- **Traditional Pain Point**: Traditional keyword searches often fail to understand true intentions, making it difficult to find the target among massive APIs; knowledge from version iteration documents is also hard to utilize effectively.
- **AI Solution**:
  - **API Semantic Search**: Combined with **vector databases and RAG technology**, AI can accurately find the API that best meets your needs based on your semantically understood search requests.
  - **Iterative Knowledge Base Q&A**: It can retrieve and answer your questions against the knowledge base of version iteration documents, allowing historical experience to empower current development at any time.
---
## II. Usage Tutorial and Configuration Guide
To ensure the efficient and secure operation of AI features, please follow the guide below for configuration and usage:
### 1. Network Configuration and Provider Selection
- **Recommended Choice**: \`Yunwu API\` (AI aggregation transit platform with fast response).
- **Network Acceleration Solution**: This platform has been acceleration-optimized for mainland China networks.
  - 🟢 **Runner deployed in mainland China**: Please select **"Mainland China"** for the API address.
  - 🔵 **Runner deployed overseas**: Please select **"Other Regions"** for the API address.
### 2. Token Management
- **Quota Check**: The purchased tokens correspond to different Token amounts based on the price. You can view the **total** and **remaining Token amounts** in the console at any time, ensuring transparent usage.
- **Team Collaboration**: The purchased tokens **support shared use by the entire team**, eliminating the need to purchase separately for each member and reducing team costs.
### 3. Data Security and Privacy Protection
- **Security Pain Point**: Once an API token is leaked, it may lead to quota theft or data exposure.
- **Security Solution**:
  - **Encrypted Storage**: Token data is stored encrypted in the database.
  - **Desensitized Display**: The token information displayed on the interface is desensitized to prevent internal snooping.
  - **In-Memory Decryption**: Decryption and transmission in memory only occur at the moment an AI request is initiated, comprehensively protecting the security of tokens and team data.
`;
    let markdownContent;
    if (getLang() == "zh-CN") {
        markdownContent = markdownContentZhCn;
    } else if (getLang() == "zh-TW") {
        markdownContent = markdownContentZhTw;
    } else {
        markdownContent = markdownContentEn;
    }
    return markdownContent;
}