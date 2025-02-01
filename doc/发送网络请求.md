## 发送网络请求的入口

### 直接发送网络请求

从导航的请求->发送请求，选择项目和环境，可以对选中的项目在特定开发环境下的任意接口发送网络请求，请求的域名是 **项目环境变量** 下配置的 **api_host** 这个key的内容。

### 从迭代文档列表发送网路请求

通过 迭代->文档->发送请求 的路径进入到请求发送页面，与 直接发送网络请求 相比，预先内置了 **版本迭代** 这个容器，于是选择项目只能在这个迭代涉及的项目中选择，保存接口到迭代文档中时不需要选择保存到哪个迭代，同时网络请求的参数可以使用属于这个版本迭代的环境变量了。

![image-20250201130326877](https://gitee.com/onlinetool/mypostman/raw/master/doc/images/image-20250201130326877.png)

### 从 历史发送记录 发送 网络请求

发送过的网络请求，下次想要参数稍作修改，再次发送请求，可以通过 请求->请求记录，按项目、环境、时间范围等条件搜索出历史发送过的网络请求，点击查看详情按钮，进入到发送网络请求页面。此时效果同 直接发送网络请求 一致，不过接口Url和参数都已填充好，可以稍作修改即可发送网络请求。

如果该请求的历史记录包含了版本迭代信息，也就是来源于 从迭代文档列表发送网络请求，则可以使用的环境变量包含迭代环境变量。

![image-20250201125724182](https://gitee.com/onlinetool/mypostman/raw/master/doc/images/image-20250201125724182.png)

### 从单测执行记录发送网络请求

![image-20250201125822997](https://gitee.com/onlinetool/mypostman/raw/master/doc/images/image-20250201125822997.png)

![image-20250201125846098](https://gitee.com/onlinetool/mypostman/raw/master/doc/images/image-20250201125846098.png)

在迭代->选择一个迭代->单测->选择一个单测->执行记录->任选一条执行记录->查看详情 可以看到这次单测所有步骤的接口网络请求和返回的数据。

![image-20250201125918479](https://gitee.com/onlinetool/mypostman/raw/master/doc/images/image-20250201125918479.png)

点击 任意一个步骤的请求地址，可以进入到请求发送页面，能够复现当时单测的请求数据，通过发送网络请求进行接口调试，所有数据都是当时单测使用的数据。原理是执行单测的网络请求数据存入到了历史发送记录中了，效果同上面 从历史发送记录发送网络请求 一致。

![image-20250201125939804](https://gitee.com/onlinetool/mypostman/raw/master/doc/images/image-20250201125939804.png)

### 从迭代文档详情发送网络请求

在迭代文档的详情页面点击发送请求，可以使用迭代文档的示例数据作为请求的发送数据，同时与从历史记录发送请求相比，可以使用属于这个迭代的环境变量。

![image-20250201130306548](https://gitee.com/onlinetool/mypostman/raw/master/doc/images/image-20250201130306548.png)

## 构造请求的数据块

一个完整的请求由四块数据构成，分别是 路径变量、参数、头部、主体。

### 路径变量

路径变量是ApiChain的一个特色可以方便的构建动态的URI，在地址栏中规定出URI的具体格式，使用{{}}括起来的字符串定义路径参数中的变量，在下面table中定义变量的具体值。这些值可以是固定的数据，对环境变量的引用或者是使用 **内置函数** 生成的数据，这是和PostMan在发送网络请求方面最大的不同。

![image-20250201160747006](https://gitee.com/onlinetool/mypostman/raw/master/doc/images/image-20250201160747006.png)

### 参数

这个填充到请求的query_string中，和PostMan一样

### 头部

这个填充到请求的header中，和PostMan一样

### 主体

这个填充到请求的body中，和PostMan一样

## 请求和响应中的 Content-Type 处理 

### 发送网络请求的 content-type

#### urlencoded

这个是正常post请求的发送方式

#### form-data

选中这个可以在body填充数据时支持文件上传

![image-20250201161314046](https://gitee.com/onlinetool/mypostman/raw/master/doc/images/image-20250201161314046.png)

#### application/json

复杂的body数据上传可以使用原生json提交，此时接口文档的编写会解析该json，生成一个table，你可以填写每一层数据的含义。

![image-20250201161451669](https://gitee.com/onlinetool/mypostman/raw/master/doc/images/image-20250201161451669.png)

### 接收到网络请求响应的 content-type

#### text/html

表明响应的内容是一个html文本，直接展示html文件的源码

#### application/json

表明响应的内容是个json内容，展示为格式化后的json

#### image/jpeg

如果收到以image开头的header，表明响应的内容是个图片内容，页面上展示一个html的image元素

#### application/x-gzip

包括 application/gzip 、application/zip 、 application/x-tar 、 application/octet-stream 等，收到这些表明响应的内容是一个需要下载的文件。

## 内置函数

  如果没有内置函数，你写的网络请求或者单测用例都是死的，无法重复利用。不同的内置函数根据不同的规则生成随机不重复的数据，用于网络请求的数据填充。环境变量和内置函数可以应用于发送网络请求和编写单测用例。

  在table中填写值时，输入 **{{** 可以调用出所有可以使用的预制的数据，包括环境变量和内置函数，输入 **{{$** 可以调出所有内置函数生成你想要的数据，全量支持的内置函数如下：
  ![image-20250201161630613](https://gitee.com/onlinetool/mypostman/raw/master/doc/images/image-20250201161630613.png)

![image-20250201161655304](https://gitee.com/onlinetool/mypostman/raw/master/doc/images/image-20250201161655304.png)

### **$randomString**

通过uuid生成全局唯一的字符串，是最常用的内置函数。比如用户注册接口的昵称。

### $randomInt

生成随机int类型数据，比如账户金币

### $randomLong

生成随机long类型数据，比如订单号

### $currentDateTimeYmdHis

生成 YYYY-MM-DD HH:ii:ss 格式的日期时间数据，每次生成都是基于当前时间，如 2024-11-21 16:11:11

### $currentDateYmd

生成 YYYY-MM-DD 格式的日期数据，每次生成都是基于当前时间，如 2024-11-21

### $currentDateTimeIntYmdHis

带有int的内置函数代表返回值是个数值而不是字符串，该内置函数用于生成 YYYYMMDDHHiiss 格式的日期时间数据，每次生成都是基于当前时间，如 20241121161111

### $currentDateIntYmd

带有int的内置函数代表返回值是个数值而不是字符串，该内置函数用于生成 YYYYMMDD 格式的日期数据，每次生成都是基于当前时间，如 20241121

### $currentTimestampSecond

返回秒级的当前时间戳

### $currentTimestampMicrosecond

返回毫秒级的当前时间戳，对上面秒级的时间戳×1000

**$randomAppVersion**

返回随机不重复且不断增加的的app版本号，格式如 123.123.112233

**$randomEmail**

返回随机不重复的邮箱，如 adfdsfsdgdfg@email.com

**$randomAge**

返回120以内的随机整数