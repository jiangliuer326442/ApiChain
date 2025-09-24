# ApiChain - API Management and Testing Tool

![咨询AI](https://raw.githubusercontent.com/jiangliuer326442/apichain_documents/refs/heads/main/images/ApiChain_25029242327.webp)

ApiChain is an API management and testing tool designed specifically for developers. It helps manage APIs across different projects and iterations from both an iteration and project perspective. By generating API documentation based on iterations and integrating AI technology, it enables developers to quickly search and understand API functionalities and send network requests. (For more on using the AI assistant, see the [AI Assistant Tutorial](https://github.com/jiangliuer326442/ApiChain/wiki/3.AI-Assistant)。

---

## 🚀 Key Features

- **Team Collaboration and Intranet Deployment**：The new team version supports deploying a Runner on an intranet, allowing team members to share data and access iteration development documents via an intranet browser, with API calls forwarded through the Runner.
- **AI-Powered Search**：After configuring the project’s programming language and framework, leverage large language models to understand the project and search for relevant APIs.
- **Global Request Parameter Configuration**：Configure global request parameters (e.g., headers, body) for projects.
- **API Parameter Enum Support**：Enhanced support for parameter types, including enums.
- **Browser Packet Capture for Quick API Creation**：Generate API request configurations quickly via browser packet capture.
- **JSON String Parameter Optimization**：Improved handling of JSON string-type request parameters.

---

## 📦 Software Download

| Platform | Download Link                                                |
| -------- | ------------------------------------------------------------ |
| Windows  | [ApiChain_v1.2.3_windows.zip](https://github.com/jiangliuer326442/ApiChain/releases) |
| Linux    | [ApiChain_v1.2.3_linux.zip](https://github.com/jiangliuer326442/ApiChain/releases) |
| macOS    | [ApiChain_v1.2.3_macos.zip](https://github.com/jiangliuer326442/ApiChain/releases) |

> **Note**：Mac users encountering issues opening the app can run the command `sudo spctl --master-disable` in the terminal to resolve it.

---

## 📚 Key Terms

- **Environment**：Includes local, dev, sit (testing), pre (pre-release), and pro (production) environments to isolate data at different stages.
- **Project**：A business may consist of multiple microservices, each considered a project.
- **Iteration**：A set of business functionalities completed within a specific time period, potentially involving API development across multiple projects.
- **Environment Variables**：Key-value datasets specific to development environments, categorized as global, project, iteration, or unit test variables.(For detailed usage, see[Environment Variables Tutorial](https://github.com/jiangliuer326442/ApiChain/wiki/6.-Environment-variables))
- **Unit Test**：Validates specific business processes through chained network requests, supporting assertion verification.

---

## 🧪 Quick Start: Query City Weather

For a detailed illustrated tutorial,[click here](https://github.com/jiangliuer326442/ApiChain/wiki/4.Example-1_Query-weather-forecast-for-any-city).

### 1. Join a Team

- On first launch, select “Online Version” and enter the test server address:`https://runner.apichain.app`。
- Create a team (e.g., “Weather Forecast Development Team”) by clicking the “Create” button.

For more on team version usage and setting up your own intranet server,[see here](https://github.com/jiangliuer326442/ApiChain/wiki/2.Team-Edition)

### 2. Configure Environment and Project

- **Environment**：Go to “Settings -> Environment -> Add” to configure the environment for API requests (e.g., local environment).
- **Project**：Go to “Settings -> Project -> Add,” enter the project name, programming language (e.g., Java), and framework (e.g., Spring Boot).
- **Environment Variables**：Set the API request host address (e.g., `https://pay.apichain.app/test/weather-report/`) in the “Environment Variables” menu.

### 3. Create an Iteration

- Go to “Settings -> Iteration -> Add,” enter the iteration name (e.g., “Weather Forecast 2406”), and select the involved microservices.
- Iteration descriptions support Markdown for easy team viewing.

### 4. API Testing

For a detailed illustrated tutorial on sending network requests,[click here](https://github.com/jiangliuer326442/ApiChain/wiki/7.Sending-network-requests)

#### Global Request Parameters

- Configure global request headers in “Project -> Global Parameters -> Headers -> Batch Edit”:

  ```
  Content-Type: application/x-www-form-urlencoded
  lang: zh
  ```

#### Query City List

- Send Request: Select project (Weather Forecast) -> Environment (Local) -> Request Method (POST) -> Address（`city-list`）。
- Save the API to the iteration document, including API description, parameter meanings, and response field explanations.

#### Query City Weather

- Send a request from the iteration, using iteration-specific environment variables (which take precedence over project variables).
- Request Address:`query-city-weather`，Parameter `cityId` set to `1`(representing Ankara).
- When saving the API, configure `cityId` as a selector, allowing users to choose from the city list.

---

## 📄 Writing Documentation

- View the API list in the iteration document, with filtering by address, description, project, or folder.
- Click “Export” to export the document as HTML or Markdown files.
- Copy the document link via “Membership -> Iteration Document” for online sharing.

---

## 🧪 Writing and Executing Unit Test Cases

For an illustrated tutorial on writing unit test cases,[see here](https://github.com/jiangliuer326442/ApiChain/wiki/8.-Writing-iterative-unit-test-cases)

- **Unit Test Goal**：Ensure that selecting any city from the city list returns the city’s weather.
- **Steps**：
  1. Query the city list.
  2. Randomly select a city from the results and call the weather query API.
- **Assertions**：Add assertions for each step to verify if the API response meets expectations.
- **Execute Test**：Select the environment (e.g., local), check the test case, and click “Execute Case.”

---

## 🔄 Iteration Unit Tests and Project Regression Testing

For more on the relationship between iterations and projects,[see this link](https://github.com/jiangliuer326442/ApiChain/wiki/9.-From-Iteration-to-Project)

- **Export Unit Tests to Project**：On the iteration unit test page, click “Export to Project” to copy tests to the project level.
- **Close Iteration**：After completing an iteration, close it to automatically merge APIs into the project.
- **Project Regression Testing**：Execute unit test cases in the project, supporting multi-selection to ensure new versions don’t break existing functionality.

---

## 🔐 User Registration and Login Authentication Example

For a detailed illustrated tutorial,[click here](https://github.com/jiangliuer326442/ApiChain/wiki/5.-Example-2_User-registration,-login-and-authentication)

### 1. Initialize

- Add a new project (e.g., “User Management”) and configure the API address prefix (e.g.,`https://pay.apichain.app/test/user/`）。
- Create an iteration and provide an iteration description.

### 2. User Registration

- API Address：`register`，submit data as follows:

  ```json
  {
    "userName": "{{$randomString}}",
    "password": "{{$randomString}}",
    "email": "{{$randomEmail}}",
    "age": "{{$randomAge}}"
  }
  ```

- Use built-in functions to generate random data to avoid duplicate registrations.

### 3. Get User Avatar

- API Address：`avatar/`，path variable：

  ```
  nickname: Mustafa
  ```

### 4. Get Logged-In User Information

- Use the JWT (bearer token) returned from the registration API to call the `get-login-user` API to verify login status.

### 5. Login Methods

- **application/json Method**：

  ```json
  {
    "type": "by_email",
    "email": "username@email.com",
    "password": "password"
  }
  ```

- **jsonString Method**：

  ```json
  {
    "type": "by_email",
    "email": "username@email.com",
    "password": "password"
  }
  ```

---

## 📦 Version Release Notes

### v1.2.3

- Added team version functionality, supporting intranet Runner deployment.
- AI integration for searching project-related APIs using large language models.
- Support for project-level global request parameter configuration.
- Support for API parameter enum types.
- Support for quick API creation via browser packet capture.
- Optimized handling of JSON string-type request parameters.

### v1.0.9

- Optimized startup speed.
- Set SSH Key as the default user.
- Fixed various bugs.
- Improved interface scrollbar.

---

## 🛠️ Build from Source

### Dependencies

- Node.js：v20.12.2
- Electron：v26.2.4

### Build Steps

1. Install and configure Yarn:

   ```bash
   npm install -g yarn
   yarn config set ELECTRON_MIRROR https://registry.npmmirror.com/-/binary/electron/
   yarn config set registry https://registry.npmmirror.com/
   ```

2. Install dependencies：

   ```bash
   yarn
   ```

3. Generate executable file：

   ```bash
   yarn package
   ```

---

## 📬 Interact with the Author

If you have suggestions or issues with the software, feel free to contact us via **WeChat**：

![微信二维码](https://raw.githubusercontent.com/jiangliuer326442/apichain_documents/refs/heads/main/images/image-20240619222612484.png)

If you find this tool helpful, consider supporting development with a small donation：

![打赏二维码](https://raw.githubusercontent.com/jiangliuer326442/apichain_documents/refs/heads/main/images/image-20240619222828912.png)

---

## 🌟 Support Us

If you like this project, please [give it a Star](https://github.com/jiangliuer326442/ApiChain) to support us! Your support is our motivation to keep improving 💖
