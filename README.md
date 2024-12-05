![dm8zd-ygwvu.gif](https://raw.githubusercontent.com/jiangliuer326442/ApiChain/refs/heads/main/doc/images/dm8zd-ygwvu.gif)

ApiChain是一款基于版本迭代和项目视角的接口测试和文档生成软件，相比于postman这样的外来品，ApiChain 更“懂”你。APIChain拥有如下特色：

1. 按迭代产出接口文档，按项目汇总迭代相关接口，迭代文档可生成本机内网ip的链接地址实时共享，也可导出成html、markdown等格式；
2. 环境变量支持全局、项目、迭代三个层面；
3. 支持更多类型的随机入参；
4. 支持URL路径类型的入参的测试和文档生成；
5. 可将请求返回的header、cookie信息纳入接口文档；
6. 可将一系列接口的调用入参和返回串联起来调用接口，做成可重复运行的单测用例，甚至包括使用前面步骤返回的cookie、header里的信息；
7. 迭代单测用例可合并到项目，用于项目的回归测试；
8. 纯内网，无需连接互联网；
9. 可将迭代关联的一系列需求文档、ui设计文档的链接以及数据库变动、配置中心变动等信息汇总在这个迭代接口文档里；

🔥🔥🔥如果你也认可Ta更“懂”你，不妨 [点击这里给个star](https://gitee.com/onlinetool/mypostman) 支持一下呗 (*￣︶￣)💋💋💋

## 软件下载

基于Electron跨平台开发，可根据你的平台下载源码自行编译，也可直接使用我们这里编译好的

windows 平台：[ApiChain_Setup_1.0.7.exe](https://gitee.com/onlinetool/mypostman/releases/download/v1.0.7/ApiChain_Setup_1.0.7.zip)

linux 平台：[ApiChain-1.0.7.AppImage](http://cdn.fanghailiang.cn/ApiChain-1.0.7.zip)

mac平台请下载源码自行编译，编译方法参照 从源码编译 部分

**mac 如果遇到无法打开应用的情况，在终端执行命令`sudo spctl --master-disable` 后即可正常打开 **

## 简介

* 按照项目、文件夹管理我们的接口

  [在迭代内点击发送请求，可以使用我们给这个迭代设置的环境变量，这些环境变量可以对这个迭代内涉及的全部项目或者某个项目有效。](https://gitee.com/onlinetool/mypostman/wikis/%E7%8E%AF%E5%A2%83%E5%8F%98%E9%87%8F)

![image-20240706090322612](https://raw.githubusercontent.com/jiangliuer326442/ApiChain/refs/heads/main/doc/images/Snipaste_2024-11-18_17-15-21.png)

- 发送网络请求

  [发送网络请求时，可以使用我们给特定环境设置的环境变量，这些环境变量分为全局有效、特定项目有效、特定版本迭代有效、迭代内特定项目有效。](https://gitee.com/onlinetool/mypostman/wikis/%E5%8F%91%E9%80%81%E7%BD%91%E7%BB%9C%E8%AF%B7%E6%B1%82)

![image-20240706090456589](https://raw.githubusercontent.com/jiangliuer326442/ApiChain/refs/heads/main/doc/images/Snipaste_2024-11-18_17-33-57.png)

* 接口详情页

  可以查看我们接口的入参和返回示例、接口说明、字段含义说明等

![image-20240706090456589](https://raw.githubusercontent.com/jiangliuer326442/ApiChain/refs/heads/main/doc/images/Snipaste_2024-11-18_17-17-17.png)

![image-20240706090456590](https://raw.githubusercontent.com/jiangliuer326442/ApiChain/refs/heads/main/doc/images/Snipaste_2024-11-19_09-54-55.png)

* 接口文档页

  以迭代为单位，生成接口文档，可以标注一些这个迭代的注意事项，可导出分享，也可直接通过浏览器共享页面。

  [mock服务器：前端在本地开发阶段，可以不必调用测试环境接口，而是调用接口文档地址的接口，返回文档中配置的mock数据，以此来画界面。](https://gitee.com/onlinetool/mypostman/wikis/mock%E6%9C%8D%E5%8A%A1%E5%99%A8)

![image-20240706090943885](https://raw.githubusercontent.com/jiangliuer326442/ApiChain/refs/heads/main/doc/images/Snipaste_2024-11-18_17-23-36.png)

![image-20240706090943886](https://raw.githubusercontent.com/jiangliuer326442/ApiChain/refs/heads/main/doc/images/Snipaste_2024-11-19_09-57-35.png)

* 迭代单测页

  [把这个迭代涉及的一系列接口入参和返回串联起来调用，就构成了这个迭代接口的一个测试用例。这些一系列的步骤之间可以顺序自动执行，也可以执行到某一步暂停下来，等待你手动按下继续执行的按钮。](https://gitee.com/onlinetool/mypostman/wikis/%E7%BC%96%E5%86%99%E8%BF%AD%E4%BB%A3%E5%8D%95%E6%B5%8B%E7%94%A8%E4%BE%8B)

  若某个测试用例执行失败，可以点击请求地址跳转到发送请求的页面，可以重复发送单测的请求，用来复现并调试bug。

![image-20240706091153839](https://raw.githubusercontent.com/jiangliuer326442/ApiChain/refs/heads/main/doc/images/Snipaste_2024-11-18_18-04-42.png)

![image-20240706091217351](https://raw.githubusercontent.com/jiangliuer326442/ApiChain/refs/heads/main/doc/images/Snipaste_2024-11-18_18-06-42.png)

* 填写单测参数

  我们迭代编写单测入参和断言支持大量常用的情景输入，如引起前面步骤的数据，读取项目环境变量数据等，变量支持随机字符串（uuid）、随机整数、当前时间，甚至使用 **eval** 函数自定义您对数据的处理逻辑。这样设计出来的单测，只要接口未做变更，未来无需修改可反复执行。用于迭代的测试以及项目回归测试。

![image-20240706091305806](https://raw.githubusercontent.com/jiangliuer326442/ApiChain/refs/heads/main/doc/images/image-20240706091305806.png)

- 项目接口管理 & 单测列表页

  [迭代结束被关闭时候，这个迭代涉及的所有项目的接口会合并到对应的项目中，点击该项目可以查看这个项目所有的接口名称、含义、字段和返回值说明。你也可以把这个迭代认为值得回归测试的单测用例保留到相关的项目中，用于对项目的回归测试。](https://gitee.com/onlinetool/mypostman/wikis/%E4%BB%8E%E8%BF%AD%E4%BB%A3%E5%88%B0%E9%A1%B9%E7%9B%AE)

![image-20240706091305807](https://raw.githubusercontent.com/jiangliuer326442/ApiChain/refs/heads/main/doc/images/Snipaste_2024-11-19_10-03-05.png)

项目的每个单测用例，都可以有自己的环境变量，这些环境变量属于这个单测一系列步骤的共享数据。

![image-20240706091305808](https://raw.githubusercontent.com/jiangliuer326442/ApiChain/refs/heads/main/doc/images/Snipaste_2024-11-19_10-09-17.png)

## 相关术语

- 开发环境

  正常情况下，我们的开发环境包括本地local、dev、sit、uat 测试环境、pre 预发布环境、pro 线上环境 等。通常不同开发环境的数据是隔离的，开发环境是我们存放**环境变量**的容器。

- 项目

  通常一个具体的业务会通过内部不同微服务相互调用并对外提供唯一入口，这些微服务称为项目，当然单机项目只有一个微服务也是支持的。

- 迭代

  一个时间段内，业务上需要完成的功能目标称为一个迭代，比如实现一个语音房。涉及到给不同的项目，包括直播、im、礼物、游戏微服务等，开发接口。因此，迭代是一个周期内，不同项目的一个组合。

- 环境变量

  环境变量是 针对特定开发环境提供的 key-value 格式的数据集，可以方便我们修改数据，让这些有一定共性的数据变得更加可复用。

  环境变量分为：

    - 全局环境变量：在特定环境中的所有项目都可见，比如用于测试的特定UID。
    - 项目环境变量：只在特定项目可见的数据，比如接口的api地址（api_host）
    - 迭代环境变量：针对当前开发特定功能的版本迭代才可使用的数据，比如临时申请的验证特定功能的高权限账号，迭代测试完成就要销毁，不便污染全局数据集。
    - 单测环境变量：为了跑通特定环境的单测而使用的数据源，长期对这个单测流程有效。

- 单测
  就是不依赖于用户界面，通过连续的，链式的网络请求 来实现特定功能，并可验证该功能确实实现的一套接口组合以及对接口返回信息的是否成功的判断。
  比如 新建文件夹、创建文件、写入数据、删除文件、删除文件夹这个流程。通过获取文件列表判断新建的文件是否在该文件列表中来验证新增文件或者删除文件是否成功。
  为了让单测变得可复用，不要每次执行单测都要修改数据，单测就要支持 **随机字符串** 这个特性，用随机字符串作为单测的初始数据。同时需要**能够取前面任何一个步骤的输入数据**，与当前步骤执行结果的输出数据进行比较，确认当前步骤是否执行正确

## 开始旅程

### 准备接口调用 key

在以下教程中，我们使用聚合数据的（[天气预报](https://www.juhe.cn/docs/api/id/73)）相关接口演示如何使用  **ApiChain** 进行接口调用、文档生成、自动化测试。

首先你需要申请一下 key，如果嫌麻烦，可以使用我的 `2c173c8a08cb275c6925c775c038903b` ，但可能有限额。

### 环境、微服务、环境变量

在开始之前，先要设置好这些信息。我们企业中的环境一般分为开发、测试、预发布、线上等环境。通常我们只对某几个项目（微服务）拥有权限。不同的项目在不同环境中部署后，又会存在不同的访问地址，我们使用**环境变量**来管理这些在不同项目、不同运行环境中呈现不一样的字符串。

点击设置 -> 开发环境 -> 新增 来创建我们的开发环境

![image-20240706092455309](https://raw.githubusercontent.com/jiangliuer326442/ApiChain/refs/heads/main/doc/images/image-20240706092455309.png)

点击设置 -> 项目 -> 添加 来创建我们的项目

![image-20240706092615686](https://raw.githubusercontent.com/jiangliuer326442/ApiChain/refs/heads/main/doc/images/image-20240706092615686.png)

在项目菜单下可以看到我们刚刚新增的项目，在环境变量菜单下设置我们这个项目在这个环境中，接口访问的 host 信息，点击项目->天气预报->环境变量->选择环境（本地环境）->api_host->编辑，下面填写的地址为 `http://apis.juhe.cn/simpleWeather/`  (注意，要求必须是以 `http:// ` 或者 `https://` 开头且以 /结尾的 url 地址)

![image-20240706093448150](https://raw.githubusercontent.com/jiangliuer326442/ApiChain/refs/heads/main/doc/images/image-20240706093448150.png)

![image-20240706093601637](https://raw.githubusercontent.com/jiangliuer326442/ApiChain/refs/heads/main/doc/images/image-20240706093601637.png)

再新建一个环境变量，把我们准备阶段辛苦申请的 `appKey` 填进去。点击 项目->天气预报 -> 环境变量 -> 添加。参数名称填写 **appKey**，参数值填写你刚刚申请的 key，我的填写 **2c173c8a08cb275c6925c775c038903b**

![image-20240706093808274](https://raw.githubusercontent.com/jiangliuer326442/ApiChain/refs/heads/main/doc/images/image-20240706093808274.png)

以上这些，相当于我们初始化了一个项目。完成后效果如下

![image-20240706093917870](https://raw.githubusercontent.com/jiangliuer326442/ApiChain/refs/heads/main/doc/images/image-20240706093917870.png)

### 迭代、接口测试、编写文档

我们这个天气预报项目 研发第一个迭代开发了两个接口：**查询支持的城市列表** 和 **根据城市查询未来天气**，

先创建一个迭代，在这个迭代里生产我们的接口文档，编写测试用例，最后迭代完成，接口合并到项目中，上线！

点击 设置 ->  版本迭代 -> 新增

![image-20240706094026608](https://raw.githubusercontent.com/jiangliuer326442/ApiChain/refs/heads/main/doc/images/image-20240706094026608.png)

我们现在通常是一个月一个迭代，因此我的迭代名称就是 **天气预报 2406**，因为我这个迭代涉及的项目就一个天气预报项目，所以微服务只选了一个。通常情况下，你们一个迭代会涉及很多个项目，都把它们选出来吧，多选漏选也无所谓，可以在 设置 -> 版本迭代 找到你的版本迭代，进行修改的。迭代说明是一个 markdown 的文案，这会在你们迭代的文档顶部展现出来，你、前端、测试 所有想要看迭代接口文档的人都会看到～

![image-20240706094140072](https://raw.githubusercontent.com/jiangliuer326442/ApiChain/refs/heads/main/doc/images/image-20240706094140072.png)

当你的迭代上线后，可以关闭这个迭代，相当于归档，迭代变得不可修改，所有接口会按照关闭的先后顺序覆盖到你项目的接口列表中。

![image-20240706094219494](https://raw.githubusercontent.com/jiangliuer326442/ApiChain/refs/heads/main/doc/images/image-20240706094219494.png)

------------

测试一下我写的查询支持城市列表接口是否正确：请求 -> 发送请求，选择项目（天气预报）-> 选择环境（本地环境）->请求方式（GET）->地址（cityList），参数 `key` 值 **{{appKey}}** （“{{”开头，“}}”结尾的值会引用我们环境变量的数据，最终发送网络请求的数据是环境变量设置的值而不是这个字符串本身；这个界面就是参照 PostMan；在你输入“{{”时，会自动提示出这个项目下所有的环境变量，因此输入不会太困难;）。点击发送请求按钮可以得到下图的响应，代表查询天气预报接口是可用的。

![image-20240706094542276](https://raw.githubusercontent.com/jiangliuer326442/ApiChain/refs/heads/main/doc/images/image-20240706094542276.png)

点击**发送请求**按钮上面的 **保存** 按钮，把刚刚自测验证通过的接口保存到这个迭代文档中。

![image-20240706094644961](https://raw.githubusercontent.com/jiangliuer326442/ApiChain/refs/heads/main/doc/images/image-20240706094644961.png)

![image-20240706094713496](https://raw.githubusercontent.com/jiangliuer326442/ApiChain/refs/heads/main/doc/images/image-20240706094713496.png)

我们需要告诉其他人，这个接口是用来干什么的，传的那些字段是什么含义，返回的那些字段又是什么含义，这些在我们的迭代文档中都会有所体现。另外这个接口是属于哪个迭代的，如果这个迭代涉及的接口太多，我们还要通过文件夹在迭代这个池子中进行接口和接口的分类。

![image-20240706094942628](https://raw.githubusercontent.com/jiangliuer326442/ApiChain/refs/heads/main/doc/images/image-20240706094942628.png)

![image-20240706095136239](https://raw.githubusercontent.com/jiangliuer326442/ApiChain/refs/heads/main/doc/images/image-20240706095136239.png)

![image-20240706095201555](https://raw.githubusercontent.com/jiangliuer326442/ApiChain/refs/heads/main/doc/images/image-20240706095201555.png)

点击保存就在我们这个迭代中新建了第一个接口 ——查询支持的城市列表！

![image-20240706095239198](https://raw.githubusercontent.com/jiangliuer326442/ApiChain/refs/heads/main/doc/images/image-20240706095239198.png)

验证第二个接口，根据城市名称查询天气。请求->发送请求->选择项目->选择环境->请求方式（POST）->请求地址query。`key` 填写 `{{appKey}}` 读取 **appKey** 环境变量， `city` 填写 `上海`，代表查询上海这座城市的天气。发送请求得到以下响应：

![image-20240706095515141](https://raw.githubusercontent.com/jiangliuer326442/ApiChain/refs/heads/main/doc/images/image-20240706095515141.png)

看起来接口没有问题，我们点击保存按钮把这个接口存入迭代的接口文档中吧！选择好迭代、文件夹，填好接口名称、字段含义，over

![image-20240706095735338](https://raw.githubusercontent.com/jiangliuer326442/ApiChain/refs/heads/main/doc/images/image-20240706095735338.png)

![image-20240706095840613](https://raw.githubusercontent.com/jiangliuer326442/ApiChain/refs/heads/main/doc/images/image-20240706095840613.png)

下面看看我们的劳动成果，一份迭代的接口文档已经准备好了

在迭代导航下可以看到我们刚刚创建的迭代，点到文档菜单，可以看到这个迭代下面的接口列表，支持根据接口地址、接口说明、接口所属的项目（微服务），接口在迭代里的文件夹进行帅选；对接口列表的管理包括编辑、删除、设置排序值等。<u>在右下角漂浮着有一个迭代文档的按钮</u>

![image-20240706100226251](https://raw.githubusercontent.com/jiangliuer326442/ApiChain/refs/heads/main/doc/images/image-20240706100226251.png)

点击迭代文档按钮，查看我们的迭代文档

![image-20240706100302483](https://raw.githubusercontent.com/jiangliuer326442/ApiChain/refs/heads/main/doc/images/image-20240706100302483.png)

![image-20240706100324571](https://raw.githubusercontent.com/jiangliuer326442/ApiChain/refs/heads/main/doc/images/image-20240706100324571.png)

不对，这个接口文档就我一个人能看到有个 p 用啊。别急，页面右下角漂浮着一个导出按钮，点击。支持将迭代的接口文档导出成 markdown 和 html 两种格式。

![image-20240706100420041](https://raw.githubusercontent.com/jiangliuer326442/ApiChain/refs/heads/main/doc/images/image-20240706100420041.png)

### 编写单测用例、执行测试

上面，我们在编写接口文档时，已经大概测试了单个接口是可用的。实际上，这些接口不是单独存在的，他们需要根据特定的使用场景，按一定的规则将这些接口的入参、返回值串联起来，通过一步步的断言验证在这个特定场景下，接口返回信息是正确无误的。

以我们的天气预报项目为例，上面验证了 **上海** 这个城市查询天气是没有问题的，然而我们的实际场景是：从支持的城市列表中任意拿出一个城市，都要求必须能够查询出这个城市的天气，只有这样才能确保我们的接口是真的可用。

新建一个单测用例：从迭代菜单找到**天气预报 2407**->单测，点击添加，单测名称我写的是 **任意城市查询天气**，点击确定。

![image-20240707102424224](https://raw.githubusercontent.com/jiangliuer326442/ApiChain/refs/heads/main/doc/images/image-20240707102424224.png)

在这个单测用例中，包含两个步骤：

1. 查询城市列表
2. 从城市列表的返回中，任意选择一个城市名作为入参，查询该城市的天气

为了保证这些步骤顺利执行下去，每个步骤必须添加一个断言，断言失败终止执行测试用例，并告知亲在哪里断言出错了，入参是什么、返回是什么，方便你进行排查修复 bug。

![image-20240707102756485](https://raw.githubusercontent.com/jiangliuer326442/ApiChain/refs/heads/main/doc/images/image-20240707102756485.png)

从单测列表中找到你新加的单测，右边三个点中找到添加步骤入口

接口选择 **天气预报** 项目 的 **查询支持的城市列表** 接口，触发方式选择**自动执行**，其他使用默认值即可。`{{appKey}}`会从接口关联项目的环境变量中读取对应的环境变量值。

![image-20240707103942845](https://raw.githubusercontent.com/jiangliuer326442/ApiChain/refs/heads/main/doc/images/image-20240707103942845.png)

下面填写返回断言：这个接口的断言是要求 **接口返回正确的错误码**，也就是 error_code 必须是 0

![image-20240707103334352](https://raw.githubusercontent.com/jiangliuer326442/ApiChain/refs/heads/main/doc/images/image-20240707103334352.png)

![image-20240707103501796](https://raw.githubusercontent.com/jiangliuer326442/ApiChain/refs/heads/main/doc/images/image-20240707103501796.png)

![image-20240707103551274](https://raw.githubusercontent.com/jiangliuer326442/ApiChain/refs/heads/main/doc/images/image-20240707103551274.png)

![image-20240707103723536](https://raw.githubusercontent.com/jiangliuer326442/ApiChain/refs/heads/main/doc/images/image-20240707103723536.png)

最终生成下面的断言表达式，支持添加多个断言的，他们之间是且的关系。点击**添加步骤**按钮，添加我们第一个单元测试的第一个步骤。

![image-20240707103814352](https://raw.githubusercontent.com/jiangliuer326442/ApiChain/refs/heads/main/doc/images/image-20240707103814352.png)

我们可以试着运行一下测试用例，看一下效果，选择环境->本地环境，点击执行用例按钮。

![image-20240707104126273](https://raw.githubusercontent.com/jiangliuer326442/ApiChain/refs/heads/main/doc/images/image-20240707104126273.png)

![image-20240707104205155](https://raw.githubusercontent.com/jiangliuer326442/ApiChain/refs/heads/main/doc/images/image-20240707104205155.png)

从图中可以看到，我们的执行结果是成功的，也可以看到，我们每个步骤、接口调用的入参、返回值，断言两边的计算结果，方便我们在遇到失败时进行排障。

再接再厉，添加第二个接口，拿刚刚成功的获取城市列表接口返回的 **任意一个城市**作为入参，调用查询天气预报接口，断言接口返回的城市就是我们入参提供的来自于城市列表接口返回的任意城市。（有点绕，诶，看图）

![image-20240707104257873](https://raw.githubusercontent.com/jiangliuer326442/ApiChain/refs/heads/main/doc/images/image-20240707104257873.png)

![image-20240707104424462](https://raw.githubusercontent.com/jiangliuer326442/ApiChain/refs/heads/main/doc/images/image-20240707104424462.png)

下面是高能区，仔细看图

![image-20240707104528380](https://raw.githubusercontent.com/jiangliuer326442/ApiChain/refs/heads/main/doc/images/image-20240707104528380.png)

![image-20240707104955815](https://raw.githubusercontent.com/jiangliuer326442/ApiChain/refs/heads/main/doc/images/image-20240707104955815.png)

`result.*random().city` 是参数数据源的具体路径，result 下面是一个数据，我们选数组下面的任意的一个元素，拿到这个元素后，我们使用他的 **city** 字段作为入参。（放心，在输入“.”号时会自动触发语法提示，输入这些不会太难，你体验一下就知道了～）

点击确定，入参已经填好了

![image-20240707105035032](https://raw.githubusercontent.com/jiangliuer326442/ApiChain/refs/heads/main/doc/images/image-20240707105035032.png)

下面添加返回断言，我的断言名称是 **接口的返回城市名称字段需要与入参的城市名一致**

![image-20240707105215871](https://raw.githubusercontent.com/jiangliuer326442/ApiChain/refs/heads/main/doc/images/image-20240707105215871.png)

![image-20240707105315750](https://raw.githubusercontent.com/jiangliuer326442/ApiChain/refs/heads/main/doc/images/image-20240707105315750.png)

这个能看懂吧？我们拿当前步骤执行结果中的 `result.city` 路径的数据作为断言的左侧。

![image-20240707105421385](https://raw.githubusercontent.com/jiangliuer326442/ApiChain/refs/heads/main/doc/images/image-20240707105421385.png)

这个是拿我们当前步骤 body 入参的 `city` 路径的实际数值作为断言比较的对象，结果如下：

![image-20240707105631212](https://raw.githubusercontent.com/jiangliuer326442/ApiChain/refs/heads/main/doc/images/image-20240707105631212.png)

可以看到，我们已经添加好了两个步骤，下面在 **本地环境** 下执行我们的用例。

![image-20240707105728516](https://raw.githubusercontent.com/jiangliuer326442/ApiChain/refs/heads/main/doc/images/image-20240707105728516.png)

![image-20240707105808555](https://raw.githubusercontent.com/jiangliuer326442/ApiChain/refs/heads/main/doc/images/image-20240707105808555.png)

我们从城市列表接口的返回中随机取了一个叫 **廊坊** 的城市查询了天气预报，返回的城市名称正是**廊坊**，断言成功！

![image-20240707105907676](https://raw.githubusercontent.com/jiangliuer326442/ApiChain/refs/heads/main/doc/images/image-20240707105907676.png)

![image-20240707105917096](https://raw.githubusercontent.com/jiangliuer326442/ApiChain/refs/heads/main/doc/images/image-20240707105917096.png)

好了，我们的入门教程就到这里，其他功能，比如备份、还原数据库，从 PostMan 导入接口到项目等功能可查看项目的wiki文档。

## 从源码编译

版本依赖：

- nodejs：v20.12.2
- electron：26.2.4

1. 安装 & 配置 yarn

```cmd
npm install -g yarn
yarn config set ELECTRON_MIRROR https://registry.npmmirror.com/-/binary/electron/
yarn config set ELECTRON_BUILDER_BINARIES_MIRROR https://registry.npmmirror.com/-/binary/electron-builder-binaries/
yarn config set registry https://registry.npmmirror.com/
```

2. 下载依赖包

```cmd
yarn
```

3. 生成可执行文件

```cmd
yarn package
```

##

## 与作者交互

您对软件有任何批评建议，可以加我微信沟通，二维码如下：

<img src="https://raw.githubusercontent.com/jiangliuer326442/ApiChain/refs/heads/main/doc/images/image-20240619222612484.png" width="50%" />

软件目前所有功能均不收费，无需连接外部网络即可使用。如果觉得帮到了你，可以不吝打赏一个鸡腿哦，打赏二维码如下：

<img src="https://raw.githubusercontent.com/jiangliuer326442/ApiChain/refs/heads/main/doc/images/image-20240619222828912.png" width="50%" />