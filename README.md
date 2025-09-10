# ApiChain - 接口管理与测试工具

![咨询AI](https://gitee.com/onlinetool/apichain-chinese-documentation/raw/main/images/Apichain_2025-08-29_11-17-00.png)

ApiChain 是一款专为开发者设计的接口管理与测试工具，它从迭代和项目的视角帮助我们管理不同项目、不同迭代的 API 接口。通过按迭代生成接口文档，并结合 AI 技术，帮助开发者快速搜索和理解接口功能，发送网络请求。

---

## 🚀 特性亮点

- **团队协作与内网部署**：新增团队版功能，支持成员在内网部署 Runner，共享数据并通过内网浏览器访问迭代开发文档，通过 Runner 转发 API 调用。
- **AI 智能搜索**：配置项目编程语言和框架后，可使用大模型理解项目并搜索相关 API。
- **公共请求参数配置**：支持为项目配置全局请求参数（如 headers、body 等）。
- **API 参数枚举支持**：增强参数类型支持，包括枚举类型。
- **浏览器抓包快速创建 API**：通过浏览器抓包快速生成 API 请求配置。
- **JSON 字符串参数优化**：优化 JSON 字符串类型的请求参数处理。

---

## 📦 软件下载

| 平台    | 下载链接                                                     |
| ------- | ------------------------------------------------------------ |
| Windows | [ApiChain_v1.2.3_windows.zip](https://github.com/jiangliuer326442/ApiChain/releases) |
| Linux   | [ApiChain_v1.2.3_linux.zip](https://github.com/jiangliuer326442/ApiChain/releases) |
| macOS   | [ApiChain_v1.2.3_macos.zip](https://github.com/jiangliuer326442/ApiChain/releases) |

> **注意**：Mac 用户如果遇到无法打开应用的情况，可在终端执行命令 `sudo spctl --master-disable` 后即可正常打开。

---

## 📚 相关术语

- **开发环境**：包括本地（local）、开发（dev）、测试（sit）、预发布（pre）、生产（pro）等环境，用于隔离不同阶段的数据。
- **项目**：一个业务可能由多个微服务组成，每个微服务称为一个项目。
- **迭代**：一个时间段内完成的业务功能目标，可能涉及多个项目的接口开发。
- **环境变量**：针对特定开发环境的 key-value 数据集，分为全局、项目、迭代、单测环境变量。
- **单测**：通过链式网络请求验证特定业务流程的接口组合，并支持断言验证。

---

## 🧪 快速入门：查询城市天气

### 1. 加入团队

- 首次启动时选择“联网版”，填写测试服务器地址：`https://runner.apichain.app`。
- 创建团队（如“天气预报开发小组”），点击“创建”按钮即可。

### 2. 配置环境与项目

- **开发环境**：点击“设置 -> 开发环境 -> 新增”，配置 API 请求的环境（如本地环境）。
- **项目**：点击“设置 -> 项目 -> 添加”，填写项目名称、编程语言（如 Java）、开发框架（如 Spring Boot）。
- **环境变量**：在“环境变量”菜单中设置 API 请求的 host 地址（如 `https://pay.apichain.app/test/weather-report/`）。

### 3. 创建迭代

- 点击“设置 -> 版本迭代 -> 新增”，填写迭代名称（如“天气预报 2406”），选择涉及的微服务。
- 迭代说明支持 Markdown 格式，便于团队成员查看。

### 4. 接口测试

#### 公共请求参数

- 在“项目 -> 全局参数 -> 头部 -> 批量编辑”中配置公共请求头：

  ```
  Content-Type: application/x-www-form-urlencoded
  lang: zh
  ```

#### 查询城市列表

- 发送请求：选择项目（天气预报）-> 环境（本地环境）-> 请求方式（POST）-> 地址（`city-list`）。
- 保存接口到迭代文档，填写接口说明、参数含义、返回字段说明。

#### 查询城市天气

- 从迭代中发送请求，使用迭代私有环境变量（优先级高于项目环境变量）。
- 请求地址：`query-city-weather`，参数 `cityId` 填写 `1`（代表 Ankara）。
- 保存接口时，配置 cityId 为选择器，支持用户从城市列表中选择。

---

## 📄 编写文档

- 在迭代文档中查看接口列表，支持按地址、说明、项目、文件夹筛选。
- 点击“导出”按钮，可将文档导出为 HTML 或 Markdown 文件。
- 通过“会员 -> 迭代文档”复制文档链接，实现在线分享。

---

## 🧪 编写单测用例并执行

- **单测目标**：确保从城市列表中任意选择一个城市，都能查询到该城市的天气。
- **步骤**：
  1. 查询城市列表。
  2. 从返回结果中随机选择一个城市，调用查询天气接口。
- **断言**：每个步骤需添加断言，验证接口返回是否符合预期。
- **执行测试**：选择环境（本地环境），勾选测试用例，点击“执行用例”按钮。

---

## 🔄 迭代单测与项目回归测试

- **导出单测到项目**：在迭代单测页面点击“导出到项目”，将单测复制到项目维度。
- **关闭迭代**：迭代完成后，关闭迭代并自动将接口合并到项目中。
- **项目回归测试**：在项目中执行单测用例，支持多选执行，确保新版本不会破坏旧功能。

---

## 🔐 用户注册与登录鉴权示例

### 1. 初始化

- 新增项目（如“用户管理”），配置接口地址前缀（如 `https://pay.apichain.app/test/user/`）。
- 创建迭代，填写迭代说明。

### 2. 用户注册

- 接口地址：`register`，提交数据如下：

  ```json
  {
    "userName": "{{$randomString}}",
    "password": "{{$randomString}}",
    "email": "{{$randomEmail}}",
    "age": "{{$randomAge}}"
  }
  ```

- 使用内置函数生成随机数据，确保注册不重复。

### 3. 获取用户头像

- 接口地址：`avatar/`，路径变量：

  ```
  nickname: Mustafa
  ```

### 4. 获取登录用户信息

- 使用注册接口返回的 JWT（bearer token）调用 `get-login-user` 接口，验证登录状态。

### 5. 登录方式

- **application/json 方式**：

  ```json
  {
    "type": "by_email",
    "email": "username@email.com",
    "password": "password"
  }
  ```

- **jsonString 方式**：

  ```json
  {
    "type": "by_email",
    "email": "username@email.com",
    "password": "password"
  }
  ```

---

## 📦 版本发布记录

### v1.2.3

- 新增团队版功能，支持内网部署 Runner。
- AI 加持，支持通过大模型搜索项目相关 API。
- 支持项目公共请求参数配置。
- 支持 API 参数枚举类型。
- 支持从浏览器抓包快速创建 API。
- JSON 字符串类型请求参数优化。

### v1.0.9

- 启动速度优化。
- 使用 SSH Key 作为默认用户。
- 修复部分 bug。
- 界面滚动条优化。

---

## 🛠️ 从源码编译

### 依赖

- Node.js：v20.12.2
- Electron：v26.2.4

### 编译步骤

1. 安装并配置 Yarn：

   ```bash
   npm install -g yarn
   yarn config set ELECTRON_MIRROR https://registry.npmmirror.com/-/binary/electron/
   yarn config set registry https://registry.npmmirror.com/
   ```

2. 安装依赖：

   ```bash
   yarn
   ```

3. 生成可执行文件：

   ```bash
   yarn package
   ```

---

## 📬 与作者交互

如果您对软件有任何建议或问题，欢迎加微信沟通：

![微信二维码](https://gitee.com/onlinetool/apichain-chinese-documentation/raw/main/images/image-20240619222612484.png)

如果觉得本工具对您有帮助，欢迎打赏一个鸡腿支持开发：

![打赏二维码](https://gitee.com/onlinetool/apichain-chinese-documentation/raw/main/images/image-20240619222828912.png)

---

## 🌟 支持我们

如果你喜欢这个项目，请点击 [给个 Star](https://gitee.com/onlinetool/mypostman) 支持我们！你的支持是我们持续改进的动力 💖