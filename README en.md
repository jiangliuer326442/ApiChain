# 🚀 ApiChain: The Ultimate Full-Link Microservice API Management Tool Centered on "Version Iterations"

Are you constantly tortured by the following pain points in your daily R&D and testing: fragmented documentation relying on manual merging, one-off test cases, shallow assertions that only check return codes, and regression testing that feels like a blind box?
 ApiChain hits these pain points head-on by providing a closed-loop **"Define-Test-Regression"** integrated experience. It's not just a tool for sending requests; it's a refined full-link management powerhouse that ensures zero-risk deployments!

## 💡 Core Highlights: The Competitive Edge

| Capability Dimension               | Traditional Tools                             | ApiChain Solution                                            |
| :--------------------------------- | :-------------------------------------------- | :----------------------------------------------------------- |
| **Iteration & Project Dual-Track** | Only project dimension, scattered APIs        | Aggregate debugging within iterations; smart merge to projects by API address upon iteration closure. Say goodbye to fragmented docs! |
| **Deep Database Assertions**       | Only support HTTP status/response code checks | Directly connect to the database to execute SQL, cross-compare query results with API parameters/responses, and auto-clean dirty data. |
| **LLM RAG Smart Retrieval**        | Rely on manually browsing historical docs     | Introduces AI Large Model RAG technology for semantic-level knowledge retrieval and precise Q&A on iteration documents. |

## 🎯 The Terminator of Four Major Pain Points

1. **Automated Iteration Doc Merging**: Maintain docs independently within iterations. Upon launch and closure, they are automatically merged into the project by microservice, completely solving the consistency issue.
2. **Freely Repeatable Test Cases**: Built-in rich functions like random strings and timestamps. No need to manually change data—run iteration cases as many times as you want!
3. **Dual API & Database Assertions**: Not only verifies response values but also directly connects to the database to verify actual data changes. Auto-cleans dirty data, nipping hidden dangers in the bud.
4. **Precise Regression Interception**: Export iteration cases to the project with one click and execute project-level regression tests. The impact scope of changes is crystal clear, providing a safety net for production.

## 🛠️ Quick Start: Master ApiChain in Four Steps

### Step 1: Build the Data Foundation (Prepare MySQL)

You need a MySQL 8.x database (the account requires privileges to create/alter tables and perform CRUD operations). Start it quickly via Docker:

```undefined
docker pull mysql:8.0
docker run --name mysql-container -p 33088:3306 -e MYSQL_ROOT_PASSWORD=112233 -d mysql:8.0
```

After starting, create the database and import test data:

1. Execute SQL: `create database apichain;`
2. Download and import the test data script: [Click here to download SQL file](https://raw.githubusercontent.com/jiangliuer326442/ApiChain/refs/heads/main/db/dump-apichain.sql)

> 💡 Tip: If you encounter a connection error `Public Key Retrieval is not allowed`, please change `allowPublicKeyRetrieval` to `true` in the driver properties.

### Step 2: Start the Core Engine (Runner)

Modify the database connection parameters in the following command and start the local Runner service with one click:

```bash
docker volume create apichain_cache_data;
docker pull jiangliuer326442/apichain-runner:1.2.4;
docker run -d \
-p 6588:6588 \
-e DB_HOST=192.168.1.5 \
-e DB_PORT=33088 \
-e DB_USER=root \
-e DB_PASS=112233 \
-e DB_NAME=apichain \
-e DEPLOY_COUNTRY=CN \
-e APICHAIN_SUPER_UID=44470bb9b4f8d601f812945fe275e139 \
-v apichain_cache_data:/opt/cache \
--name apichain-runner \
jiangliuer326442/apichain-runner:1.2.4
```

### Step 3: Connect Client to Runner

1. Open the ApiChain client, switch the language in the top right corner, and select **Online Version**.
2. Fill in the server address (e.g., `http://127.0.0.1:6588`), and click **Detect**.
3. Select **Join Team** -> **runner developer** -> **Join** (Started with Super Admin UID, no approval required). Restart the client, and you're good to go!

### Step 4: Hands-on Roaming

1. **Modify Project Database Connection**: Go to `Project Menu - Runner - Settings`, select Local Environment, fill in the Runner address and database info, and save.
2. **Run Project Unit Tests**: Go to `Project Menu - Runner - Unit Test`, execute cases (like the Onboarding Flow) to experience a complete lifecycle closed-loop with multiple assertions.
3. **Execute Iteration Unit Tests**: In the Iteration menu, experience automatic API doc merging, repeated execution with random data, and deep database verification.

------

## 🌟 Advanced Weaponry: The Ultimate Polish of Depth and Efficiency

### 🔄 Four-Level Environment Variable System

Precisely control data configuration across different scopes, from largest to smallest: **Global ➔ Project ➔ Iteration ➔ Unit Test**

- **Global/Project Variables**: Shared data across microservices or exclusive to a specific microservice.
- **Iteration Variables**: Temporary high-privilege configs during the version iteration; automatically become invalid after launch.
- **Unit Test Variables**: Dynamic references to前置步骤 (previous steps) data within the test case. *Features: Supports batch copying of variables; sensitive info is masked on display, encrypted at rest, and decrypted in memory, ensuring security.*

### 📦 Global Parameters & Smart Input

- **Global Parameters**: Supports unified configuration across Param, Header, Body, and Path Variables. Allows flexible overriding and dynamic variable injection `{{}}`. Configure once, apply globally.
- **Smart Input**: Templated path variables, enum selector prompts for standardized input; structured editing for JSON strings, supporting variable references and random functions inside JSON.

### 🕵️ Data Extraction & Full-Dimensional Output

- **Extraction Artifacts**: Built-in `*first()`, `*last()`, `*random()` (fixed random seed within the same case prevents cross-talk), `*length()`, and JS custom slicing `*eval()`. Cures even the most complex JSON arrays and long strings.
- **Full-Dimensional Output**: Not only deposits Response Body but also intelligently parses and archives Response Headers and Cookies. Refuse to miss any information.

### 🎲 Dynamic Data Injection

Say goodbye to hardcoded data with built-in rich random functions:

- **Basic & Numeric**: `$randomString` (can be concatenated for semantics), `$randomInt`, `$randomLong`, `$randomAge`
- **Time & Date**: `$currentDateTimeYmdHis`, `$currentTimestampMicrosecond`, etc.
- **Business Scenarios**: `$randomAppVersion` (incremental version numbers), `$randomEmail` (avoids uniqueness conflicts)

------

## 🤖 AI Empowerment: Reshaping the API Management Experience

1. **Aggregated Multi-Model Think Tank**: Connected to the Yunwu AI routing platform, allowing you to switch between different large models like DeepSeek, Grok, and Gemini at any time.
2. **Smart Context Awareness**: AI automatically references the project's configured language, framework, dependencies, and directory structure—no need to repeatedly provide context.
3. **Assisted Generation & Conversion**: AI assists in generating API meanings and field descriptions; JSON is instantly converted into model code perfectly adapted to your current project.
4. **Semantic RAG Retrieval**: Based on vector databases, it enables semantic API search and precise Q&A on the iteration knowledge base, empowering current development with historical experience.
5. **Security & Sharing**: AI tokens are shared across the team with transparent usage; API addresses are optimized for network acceleration in mainland China and overseas; token data is encrypted at rest and desensitized on display.