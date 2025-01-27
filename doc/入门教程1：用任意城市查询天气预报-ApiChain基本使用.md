### 准备接口调用 key

在以下教程中，我们使用聚合数据的（[天气预报](https://www.juhe.cn/docs/api/id/73)）相关接口演示如何使用  **ApiChain** 进行接口调用、文档生成、自动化测试。

首先你需要申请一下 key，如果嫌麻烦，可以使用我的 `2c173c8a08cb275c6925c775c038903b` ，但有限额，你大概率调不通～[沮丧]


### 环境、微服务、环境变量

在开始之前，先要设置好这些信息。我们企业中的环境一般分为开发、测试、预发布、线上等环境。通常我们只对某几个项目（微服务）拥有权限。不同的项目在不同环境中部署后，又会存在不同的访问地址，我们使用**环境变量**来管理这些在不同项目、不同运行环境中呈现不一样的字符串。

点击设置 -> 开发环境 -> 新增 来创建我们的开发环境

![image-20240706092455309](https://gitee.com/onlinetool/mypostman/raw/master/doc/images/image-20240706092455309.png)

点击设置 -> 项目 -> 添加 来创建我们的项目

![image-20240706092615686](https://gitee.com/onlinetool/mypostman/raw/master/doc/images/image-20240706092615686.png)

在项目菜单下可以看到我们刚刚新增的项目，在环境变量菜单下设置我们这个项目在这个环境中，接口访问的 host 信息，点击项目->天气预报->环境变量->选择环境（本地环境）->api_host->编辑，下面填写的地址为 `http://apis.juhe.cn/simpleWeather/`  (注意，要求必须是以 `http:// ` 或者 `https://` 开头且以 /结尾的 url 地址)

![image-20240706093448150](https://gitee.com/onlinetool/mypostman/raw/master/doc/images/image-20240706093448150.png)

![image-20240706093601637](https://gitee.com/onlinetool/mypostman/raw/master/doc/images/image-20240706093601637.png)

再新建一个环境变量，把我们准备阶段辛苦申请的 `appKey` 填进去。点击 项目->天气预报 -> 环境变量 -> 添加。参数名称填写 **appKey**，参数值填写你刚刚申请的 key，我的填写 **2c173c8a08cb275c6925c775c038903b**

![image-20240706093808274](https://gitee.com/onlinetool/mypostman/raw/master/doc/images/image-20240706093808274.png)

以上这些，相当于我们初始化了一个项目。完成后效果如下

![image-20240706093917870](https://gitee.com/onlinetool/mypostman/raw/master/doc/images/image-20240706093917870.png)

### 迭代、接口测试、编写文档

我们这个天气预报项目 研发第一个迭代开发了两个接口：**查询支持的城市列表** 和 **根据城市查询未来天气**，

先创建一个迭代，在这个迭代里生产我们的接口文档，编写测试用例，最后迭代完成，接口合并到项目中，上线！

点击 设置 ->  版本迭代 -> 新增

![image-20240706094026608](https://gitee.com/onlinetool/mypostman/raw/master/doc/images/image-20240706094026608.png)

我们现在通常是一个月一个迭代，因此我的迭代名称就是 **天气预报 2406**，因为我这个迭代涉及的项目就一个天气预报项目，所以微服务只选了一个。通常情况下，你们一个迭代会涉及很多个项目，都把它们选出来吧，多选漏选也无所谓，可以在 设置 -> 版本迭代 找到你的版本迭代，进行修改的。迭代说明是一个 markdown 的文案，这会在你们迭代的文档顶部展现出来，你、前端、测试 所有想要看迭代接口文档的人都会看到～

![image-20240706094140072](https://gitee.com/onlinetool/mypostman/raw/master/doc/images/image-20240706094140072.png)

当你的迭代上线后，可以关闭这个迭代，相当于归档，迭代变得不可修改，所有接口会按照关闭的先后顺序覆盖到你项目的接口列表中。

![image-20240706094219494](https://gitee.com/onlinetool/mypostman/raw/master/doc/images/image-20240706094219494.png)

------------

测试一下我写的查询支持城市列表接口是否正确：请求 -> 发送请求，选择项目（天气预报）-> 选择环境（本地环境）->请求方式（GET）->地址（cityList），参数 `key` 值 **{{appKey}}** （“{{”开头，“}}”结尾的值会引用我们环境变量的数据，最终发送网络请求的数据是环境变量设置的值而不是这个字符串本身；这个界面就是参照 PostMan；在你输入“{{”时，会自动提示出这个项目下所有的环境变量，因此输入不会太困难;）。点击发送请求按钮可以得到下图的响应，代表查询天气预报接口是可用的。

![image-20240706094542276](https://gitee.com/onlinetool/mypostman/raw/master/doc/images/image-20240706094542276.png)

点击**发送请求**按钮上面的 **保存** 按钮，把刚刚自测验证通过的接口保存到这个迭代文档中。

![image-20240706094644961](https://gitee.com/onlinetool/mypostman/raw/master/doc/images/image-20240706094644961.png)

![image-20240706094713496](https://gitee.com/onlinetool/mypostman/raw/master/doc/images/image-20240706094713496.png)

我们需要告诉其他人，这个接口是用来干什么的，传的那些字段是什么含义，返回的那些字段又是什么含义，这些在我们的迭代文档中都会有所体现。另外这个接口是属于哪个迭代的，如果这个迭代涉及的接口太多，我们还要通过文件夹在迭代这个池子中进行接口和接口的分类。

![image-20240706094942628](https://gitee.com/onlinetool/mypostman/raw/master/doc/images/image-20240706094942628.png)

![image-20240706095136239](https://gitee.com/onlinetool/mypostman/raw/master/doc/images/image-20240706095136239.png)

![image-20240706095201555](https://gitee.com/onlinetool/mypostman/raw/master/doc/images/image-20240706095201555.png)

点击保存就在我们这个迭代中新建了第一个接口 ——查询支持的城市列表！

![image-20240706095239198](https://gitee.com/onlinetool/mypostman/raw/master/doc/images/image-20240706095239198.png)

验证第二个接口，根据城市名称查询天气。请求->发送请求->选择项目->选择环境->请求方式（POST）->请求地址query。`key` 填写 `{{appKey}}` 读取 **appKey** 环境变量， `city` 填写 `上海`，代表查询上海这座城市的天气。发送请求得到以下响应：

![image-20240706095515141](https://gitee.com/onlinetool/mypostman/raw/master/doc/images/image-20240706095515141.png)

看起来接口没有问题，我们点击保存按钮把这个接口存入迭代的接口文档中吧！选择好迭代、文件夹，填好接口名称、字段含义，over

![image-20240706095735338](https://gitee.com/onlinetool/mypostman/raw/master/doc/images/image-20240706095735338.png)

![image-20240706095840613](https://gitee.com/onlinetool/mypostman/raw/master/doc/images/image-20240706095840613.png)

下面看看我们的劳动成果，一份迭代的接口文档已经准备好了

在迭代导航下可以看到我们刚刚创建的迭代，点到文档菜单，可以看到这个迭代下面的接口列表，支持根据接口地址、接口说明、接口所属的项目（微服务），接口在迭代里的文件夹进行帅选；对接口列表的管理包括编辑、删除、设置排序值等。<u>在右下角漂浮着有一个迭代文档的按钮</u>

![image-20240706100226251](https://gitee.com/onlinetool/mypostman/raw/master/doc/images/image-20240706100226251.png)

点击迭代文档按钮，查看我们的迭代文档

![image-20240706100302483](https://gitee.com/onlinetool/mypostman/raw/master/doc/images/image-20240706100302483.png)

![image-20240706100324571](https://gitee.com/onlinetool/mypostman/raw/master/doc/images/image-20240706100324571.png)

不对，这个接口文档就我一个人能看到有个 p 用啊。别急，页面右下角漂浮着一个导出按钮，点击。支持将迭代的接口文档导出成 markdown 和 html 两种格式。

![image-20240706100420041](https://gitee.com/onlinetool/mypostman/raw/master/doc/images/image-20240706100420041.png)

### 编写单测用例、执行测试

上面，我们在编写接口文档时，已经大概测试了单个接口是可用的。实际上，这些接口不是单独存在的，他们需要根据特定的使用场景，按一定的规则将这些接口的入参、返回值串联起来，通过一步步的断言验证在这个特定场景下，接口返回信息是正确无误的。

以我们的天气预报项目为例，上面验证了 **上海** 这个城市查询天气是没有问题的，然而我们的实际场景是：从支持的城市列表中任意拿出一个城市，都要求必须能够查询出这个城市的天气，只有这样才能确保我们的接口是真的可用。

新建一个单测用例：从迭代菜单找到**天气预报 2407**->单测，点击添加，单测名称我写的是 **任意城市查询天气**，点击确定。

![image-20240707102424224](https://gitee.com/onlinetool/mypostman/raw/master/doc/images/image-20240707102424224.png)

在这个单测用例中，包含两个步骤：

1. 查询城市列表
2. 从城市列表的返回中，任意选择一个城市名作为入参，查询该城市的天气

为了保证这些步骤顺利执行下去，每个步骤必须添加一个断言，断言失败终止执行测试用例，并告知亲在哪里断言出错了，入参是什么、返回是什么，方便你进行排查修复 bug。

![image-20240707102756485](https://gitee.com/onlinetool/mypostman/raw/master/doc/images/image-20240707102756485.png)

从单测列表中找到你新加的单测，右边三个点中找到添加步骤入口

接口选择 **天气预报** 项目 的 **查询支持的城市列表** 接口，触发方式选择**自动执行**，其他使用默认值即可。`{{appKey}}`会从接口关联项目的环境变量中读取对应的环境变量值。

![image-20240707103942845](https://gitee.com/onlinetool/mypostman/raw/master/doc/images/image-20240707103942845.png)

下面填写返回断言：这个接口的断言是要求 **接口返回正确的错误码**，也就是 error_code 必须是 0

![image-20240707103334352](https://gitee.com/onlinetool/mypostman/raw/master/doc/images/image-20240707103334352.png)

![image-20240707103501796](https://gitee.com/onlinetool/mypostman/raw/master/doc/images/image-20240707103501796.png)

![image-20240707103551274](https://gitee.com/onlinetool/mypostman/raw/master/doc/images/image-20240707103551274.png)

![image-20240707103723536](https://gitee.com/onlinetool/mypostman/raw/master/doc/images/image-20240707103723536.png)

最终生成下面的断言表达式，支持添加多个断言的，他们之间是且的关系。点击**添加步骤**按钮，添加我们第一个单元测试的第一个步骤。

![image-20240707103814352](https://gitee.com/onlinetool/mypostman/raw/master/doc/images/image-20240707103814352.png)

我们可以试着运行一下测试用例，看一下效果，选择环境->本地环境，点击执行用例按钮。

![image-20240707104126273](https://gitee.com/onlinetool/mypostman/raw/master/doc/images/image-20240707104126273.png)

![image-20240707104205155](https://gitee.com/onlinetool/mypostman/raw/master/doc/images/image-20240707104205155.png)

从图中可以看到，我们的执行结果是成功的，也可以看到，我们每个步骤、接口调用的入参、返回值，断言两边的计算结果，方便我们在遇到失败时进行排障。

再接再厉，添加第二个接口，拿刚刚成功的获取城市列表接口返回的 **任意一个城市**作为入参，调用查询天气预报接口，断言接口返回的城市就是我们入参提供的来自于城市列表接口返回的任意城市。（有点绕，诶，看图）

![image-20240707104257873](https://gitee.com/onlinetool/mypostman/raw/master/doc/images/image-20240707104257873.png)

![image-20240707104424462](https://gitee.com/onlinetool/mypostman/raw/master/doc/images/image-20240707104424462.png)

下面是高能区，仔细看图

![image-20240707104528380](https://gitee.com/onlinetool/mypostman/raw/master/doc/images/image-20240707104528380.png)

![image-20240707104955815](https://gitee.com/onlinetool/mypostman/raw/master/doc/images/image-20240707104955815.png)

`result.*random().city` 是参数数据源的具体路径，result 下面是一个数据，我们选数组下面的任意的一个元素，拿到这个元素后，我们使用他的 **city** 字段作为入参。（放心，在输入“.”号时会自动触发语法提示，输入这些不会太难，你体验一下就知道了～）

点击确定，入参已经填好了

![image-20240707105035032](https://gitee.com/onlinetool/mypostman/raw/master/doc/images/image-20240707105035032.png)

下面添加返回断言，我的断言名称是 **接口的返回城市名称字段需要与入参的城市名一致**

![image-20240707105215871](https://gitee.com/onlinetool/mypostman/raw/master/doc/images/image-20240707105215871.png)

![image-20240707105315750](https://gitee.com/onlinetool/mypostman/raw/master/doc/images/image-20240707105315750.png)

这个能看懂吧？我们拿当前步骤执行结果中的 `result.city` 路径的数据作为断言的左侧。

![image-20240707105421385](https://gitee.com/onlinetool/mypostman/raw/master/doc/images/image-20240707105421385.png)

这个是拿我们当前步骤 body 入参的 `city` 路径的实际数值作为断言比较的对象，结果如下：

![image-20240707105631212](https://gitee.com/onlinetool/mypostman/raw/master/doc/images/image-20240707105631212.png)

可以看到，我们已经添加好了两个步骤，下面在 **本地环境** 下执行我们的用例。

![image-20240707105728516](https://gitee.com/onlinetool/mypostman/raw/master/doc/images/image-20240707105728516.png)

![image-20240707105808555](https://gitee.com/onlinetool/mypostman/raw/master/doc/images/image-20240707105808555.png)

我们从城市列表接口的返回中随机取了一个叫 **廊坊** 的城市查询了天气预报，返回的城市名称正是**廊坊**，断言成功！

![image-20240707105907676](https://gitee.com/onlinetool/mypostman/raw/master/doc/images/image-20240707105907676.png)

![image-20240707105917096](https://gitee.com/onlinetool/mypostman/raw/master/doc/images/image-20240707105917096.png)

好了，我们的入门教程就到这里，其他功能，比如备份、还原数据库，从 PostMan 导入接口到项目等功能，自行探索。啰嗦一句，最好定时备份一下数据库！