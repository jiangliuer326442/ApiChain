写单测用例，就像画一幅有向不循环的图，图中的每个节点是这个单测用例的每一个步骤，连线代表着数据的流向，这幅图通常有一个或者多个起点，但通常只有一个终点。起点的数据来源于 环境变量、内置函数或者固定数据，经过特定环境、特定项目的接口“加工”后，输出新的数据。这幅有向不循环的图其他节点的数据来源，相对于起点节点，可以引用前面执行过的那些步骤使用过或者输出来的数据，也就是引用前面步骤的 路径变量、参数、头部、主体、返回的json、返回的header、返回的cookie 的数据。

例如：上传制品包会返回制品id，可以根据制品id拿到制品的30分钟有效期的下载token，根据制品token可以下载制品，单测用例正是将这套流程涉及的一系列接口调用固定下来，称为可重复执行某个业务目标的利器。

![image-20250201163949086](https://gitee.com/onlinetool/mypostman/raw/master/doc/images/image-20250201163949086.png)

## 单测数据源

![image-20250201170753864](https://gitee.com/onlinetool/mypostman/raw/master/doc/images/image-20250201170753864.png)

单测可以使用的数据源，除了和发送网络请求一样，使用全局、项目、迭代、单测的环境变量和与发送网络请求一致的内置函数，这些在上一章内容【发送网络请求】已经介绍过，还包括引用前面步骤执行过程中产生的数据，包括提交的uri path variable、uri query、body、header以及前面步骤执行过网络请求产生的（响应的）content、header、cookie

![image-20250201170900608](https://gitee.com/onlinetool/mypostman/raw/master/doc/images/image-20250201170900608.png)

header、uri param、body、param 对应之前执行步骤发送网络请求中的如下图所示的数据，可以对这些数据的实际使用的值进行引用。

responseContent、responseHeader、responseCookie则对应前面步骤如下图所示的内容的引用，因为接口文档和示例已经包含了这部分内容，他们被作为该接口使用规范被其他步骤的接口使用。

![image-20250201171241347](https://gitee.com/onlinetool/mypostman/raw/master/doc/images/image-20250201171241347.png)

![image-20250201171034416](https://gitee.com/onlinetool/mypostman/raw/master/doc/images/image-20250201171034416.png)

## 单测特有的内置函数

如果单测仅仅依靠使用环境变量、内置函数以及引用前面步骤使用和产出的数据作为当前步骤的参数或者整个单测流程是否成功的校验依据，这样依然解决不了我们实际使用过程中遇到的问题。事实上，我们需要能够对前面的数据做处理，产生出新的满足我们当前步骤传参规范的新数据。目前提供了以下四个仅用于单测的内置函数：

针对数组类型，提供了以下三个仅供单测使用的函数：

### *first()

针对前面的数据源的数据包含json数组的情况，我们需要取数组的第一个数据（通常是一个对象），在这个对象的基础上，继续我们的json path，直到最终取到目标数据为止，一下是一个demo：

**{{__current_step__.__response__.data.*first().target}}** 这个取当前步骤的response这个json的data数组的第一个json对象的target 字段的值。

### *last()

与*first()类似，不过是取数组最后一个元素作为数据源的目标对象。

### *random()

为了使用单测独特的 随机性 特征，让单测具备通用性，有时候需要取前面步骤 json path 下的一个数组的任意一个对象，取对象中的数据，比如我们查询天气预报这个示例，从城市列表接口任意取一个城市查询当前天气就是这样。**result.*random().city** 。需要特别说明的是，针对一个单测的若干个步骤来说，在特定的步骤下，这个random并不随机，而是使用在这个步骤开始时确定下来的随机数种子。这是因为，当你数据的一部分使用前面步骤的某个随机数据时，你数据的另一部分，必须继续使用这个前面随机数据的剩下的值。比如，一个用户列表接口，你随机取一个用户，然后拿这个用户的邮箱、用户名注册到另一个系统中。

### *eval()

以上三个函数都是针对数组生效的，下面那个函数是针对字符串生效的，也更强大、更难用。 比如前面步骤返回了类似 *https://rf-uat-dmz.xxx.xxxurl.cn/rx/hmInstall?artid=dsfdsfd&token=sdfsfd* 这样的数据，我们后面步骤需要从这个步骤中的这个返回中提取出token这个有特殊意义的的数据，可以使用下面的数据***{{__pointed_step__54b05acd-6a86-4bce-93e1-ca884b610486.__response__.data.locationUrl.*eval("$$.split('?')[1].split("&")[1].split('=')[1]")**。

eval隐式的左侧数据源是待处理的字符串，内部的处理过程以字符串的形式自己写js代码，使用 $$ 待指左侧的原始数据源。相信作为程序员的你很快就会学会使用这个万能的字符串处理函数 eval 函数的。

## jsonString 类型

![image-20250201174910193](https://gitee.com/onlinetool/mypostman/raw/master/doc/images/image-20250201174910193.png)

发送网络请求时，有一种特殊的字符串，内容是一个json，但我们不能把他当做普通字符串看待，执行单测时候，往往需要使用前面步骤的数据作为这个json对象的一部分输入，而当执行当前步骤时，又要把这个json对象转成json字符串发送出去。具体操作方法如下：

1. 在文档中将该参数类型标记为 json字符串

![image-20250201180053724](https://gitee.com/onlinetool/mypostman/raw/master/doc/images/image-20250201180053724.png)

2. 在单测中，可以看到这个字符串的str变成了可展开设置每个节点数据的json对象。

![image-20250201180220363](https://gitee.com/onlinetool/mypostman/raw/master/doc/images/image-20250201180220363.png)

3. 像jsonObject一样设置单个元素的值，引用前面步骤的数据、环境变量或者固定值

   ![image-20250201180527525](https://gitee.com/onlinetool/mypostman/raw/master/doc/images/image-20250201180527525.png)

4. 选择测试用例，执行单测

![image-20250201181435885](https://gitee.com/onlinetool/mypostman/raw/master/doc/images/image-20250201181435885.png)

可以看到，使用的str是通过构建出的json对象转化来的。