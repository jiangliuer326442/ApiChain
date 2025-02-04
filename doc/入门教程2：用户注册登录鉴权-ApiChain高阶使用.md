本教程在上一篇讲述基本使用的前提下，以企业常见的登录注册鉴权流程为例，确保项目上线回归测试用户登录注册这块功能不出问题。

### 初始化

新增一个项目，具体内容见下图，不展开讲

![image-20250127175136954](https://gitee.com/onlinetool/mypostman/raw/master/doc/images/image-20250127175136954.png)

新增迭代，具体内容见下图，不展开讲

![image-20250127175235762](https://gitee.com/onlinetool/mypostman/raw/master/doc/images/image-20250127175235762.png)

设置环境变量的接口域名，内容为 `http://pay.fanghailiang.cn/test/`

![image-20250127175353449](https://gitee.com/onlinetool/mypostman/raw/master/doc/images/image-20250127175353449.png)

### 用户注册

![image-20250127175618251](https://gitee.com/onlinetool/mypostman/raw/master/doc/images/image-20250127175618251.png)

从迭代入口进入到发送网络请求页面，接口地址 **user/register** ，提交数据如下

- **userName**    {{$randomString}}
- **password**    {{$randomString}}
- **email**    {{$randomEmail}}
- **age**    {{$randomAge}}

上一个教程中，我们发送请求时引用了自己设置的环境变量，本次我们使用了 ApiChain 支持的内容函数。

![image-20250127180236774](https://gitee.com/onlinetool/mypostman/raw/master/doc/images/image-20250127180236774.png)

所有支持的函数列表，输入 `{{$` 时能够看到，

![image-20250127180611459](https://gitee.com/onlinetool/mypostman/raw/master/doc/images/image-20250127180611459.png)

![image-20250127180949544](https://gitee.com/onlinetool/mypostman/raw/master/doc/images/image-20250127180949544.png)

具体含义如下：

* randomString

  随机的永不重复的字符串

* randomInt

  随机的永不重复的整数

* randomLong

  随机的永不重复的长整数

* currentDate...

  以这个开头的字符串和当前时间有关

* currentTimestamp...

  以这个开头的字符串和当前时间戳有关，无非是秒级还是毫秒级

* randomAppVersion

  永不重复且自增的app版本号

* randomEmail

  永不重复的随机邮箱

* randomAge

  随机的年龄，120岁以内

通过这些内置函数实现我们输入的数据随机，这样只要接口没做变更，不需要做任何修改就可以无限使用。此刻的含义是，我们使用随机不重复的邮箱和用户名注册了账号。

![image-20250127181415825](https://gitee.com/onlinetool/mypostman/raw/master/doc/images/image-20250127181415825.png)

从这个返回报文中，我们看到注册后，返回的header（responseHeader）中包含了一个用于登录鉴权的jwt，返回的主体意思是注册成功，也给了注册的用户信息。我们先把它保存到接口文档。

![image-20250127181709568](https://gitee.com/onlinetool/mypostman/raw/master/doc/images/image-20250127181709568.png)

这些参数都是必填的，age 字段类型是数字，其他都是字符串，返回的header 中包含 jwt，我们用来登录的令牌。点击保存。

### 根据昵称获取用户头像

![image-20250201182024358](C:\Users\admin.DESKTOP-A4HMTGM\AppData\Roaming\Typora\typora-user-images\image-20250201182024358.png)

接口地址 `user/avatar/`，路径变量如下：

nickname：Mustafa

点击发送请求，可以看到uri变成 user/avatar/{{nickname}}，实际上，这只是一个规范，你可以根据{{nickname}}实际的位置重新调整。接口返回是一张图片，可以将这个返回图片的接口保存到迭代文档中。

![image-20250201182444480](C:\Users\admin.DESKTOP-A4HMTGM\AppData\Roaming\Typora\typora-user-images\image-20250201182444480.png)

### 获取登录用户信息

从迭代文档中找到刚刚新增的接口，点击发送按钮。

![image-20250127182229352](https://gitee.com/onlinetool/mypostman/raw/master/doc/images/image-20250127182229352.png)

点击发送请求按钮（此刻你会发现随机不重复的好处了，继续注册不要做任何修改），点击复制按钮，复制返回的jwt，粘贴到记事本中，后面流程会用到。

![image-20250127182345484](https://gitee.com/onlinetool/mypostman/raw/master/doc/images/image-20250127182345484.png)

接口地址 **user/getLoginUser** ，参数 header 的 key 是 **Authorization**，value 是 **bearer eyJhbGciOiJIUzI1NiJ9.eyJqdGkiOiI5Iiwic3ViIjoiQXBpQ2hhaW5fOGIzNzM1YWEtOTg2Mi00MDViLTllOTUtNWI2YzI5ZWI5MmNlIiwiaWF0IjoxNzM3OTczMzk3LCJleHAiOjE3Mzc5NzY5OTd9.A0bZ69TZE-412nFz1NqxffRh2y06mEHxTEIBcLndqyg** ，也就是 `bearer ` 加上你刚刚复制保存下来的那个jwt。

![image-20250127182927797](https://gitee.com/onlinetool/mypostman/raw/master/doc/images/image-20250127182927797.png)

点击发送请求按钮，可以看到能够根据这个认证令牌拿到用户信息，这个令牌有效期 30 分钟。点击保存按钮，迭代文档新增我们的第二个接口。

![image-20250127183524368](https://gitee.com/onlinetool/mypostman/raw/master/doc/images/image-20250127183524368.png)

### 通过 application/json  方式实现用户登录

这个demo的登录方式既支持 邮箱+密码登录，也支持 用户名+密码登录，可通过 application/json 方式提交数据。

邮箱+密码 登录方式提交的报文是

```json
{
	"type": "by_email",
	"email": "email",
	"password": "password"
}
```

用户名+密码的登录方式提交的报文是

```json
{
	"type": "by_uname",
	"userName": "userName",
	"password": "password"
}
```

请求地址 **user/login**，header中 content-type 选择为 `application/json`，在主体部分粘上请求的报文，就可以发送一个登录请求了。

![image-20250127185543753](https://gitee.com/onlinetool/mypostman/raw/master/doc/images/image-20250127185543753.png)

![image-20250127185730328](https://gitee.com/onlinetool/mypostman/raw/master/doc/images/image-20250127185730328.png)

没有查询到这个用户，不碍事，我们就这样先保存好这个接口到迭代文档。

![image-20250127215817963](https://gitee.com/onlinetool/mypostman/raw/master/doc/images/image-20250127215817963.png)

### 通过  jsonString  方式实现用户登录

在实际开发过程中，我们经常会遇到表单某个字段参数是一个json格式的报文，在我们编写单测时，需要能够自动构造出这样的json格式的报文，为此，我们的demo的登录也支持了 通过jsonString的方式提交登录数据。

接口地址 `user/login_by_jsonstring`， 参数 str，类型 jsonString，示例如下：

```json
{"type":"by_email","email":"email","password":"password"}
```

![image-20250127220614116](https://gitee.com/onlinetool/mypostman/raw/master/doc/images/image-20250127220614116.png)

把他保存到迭代文档，保存时参数类型选择 json字符串

![image-20250127220729236](https://gitee.com/onlinetool/mypostman/raw/master/doc/images/image-20250127220729236.png)

到此，用户注册登录鉴权涉及的所有接口都登记到迭代文档中了。

![image-20250127220916157](https://gitee.com/onlinetool/mypostman/raw/master/doc/images/image-20250127220916157.png)

![image-20250127221122145](https://gitee.com/onlinetool/mypostman/raw/master/doc/images/image-20250127221122145.png)

------

### 用户注册 自动化测试

首页创建测试用例，不必多说。

![image-20250127221407897](https://gitee.com/onlinetool/mypostman/raw/master/doc/images/image-20250127221407897.png)

添加步骤-用户注册，上面不需要改动

![image-20250127221515259](https://gitee.com/onlinetool/mypostman/raw/master/doc/images/image-20250127221515259.png)	

断言是返回成功code

![image-20250127221622756](https://gitee.com/onlinetool/mypostman/raw/master/doc/images/image-20250127221622756.png)

执行用例

![image-20250127221726124](https://gitee.com/onlinetool/mypostman/raw/master/doc/images/image-20250127221726124.png)

从这个记录中，我们可以看到调用接口实际传的参数，我们把 userName、password、email这三个数据先记下来，后面会用到，我们点击请求地址，还能打开请求发送的页面，预先已经填写好了我们单测提交的数据，用来帮助我们进行排障的复现。

![image-20250127222237602](https://gitee.com/onlinetool/mypostman/raw/master/doc/images/image-20250127222237602.png)

### 获取登录用户信息 自动化测试

点击添加步骤，到以下页面。

![image-20250127222403856](https://gitee.com/onlinetool/mypostman/raw/master/doc/images/image-20250127222403856.png)

这个 Authorization 的数据是有问题的，第一步的用户注册，我们使用随机不重复的数据注册了用户，在header中返回了 jwt的token，在这个第二步，应该拿注册那一步的那个jwt的token，前面拼接上 **bearer ** 这个字符串。

![image-20250127223730767](https://gitee.com/onlinetool/mypostman/raw/master/doc/images/image-20250127223730767.png)

数据源是 用户注册这一步的responseHeader，直接用他的jwt字段的值是不行的，我们需要用 “bearer ” 这个字符串拼接上它，为此使用了 eval 函数，这个函数的用法，在上一个教程说过。所以，填上的内容是 **jwt.*eval('"bearer " + $$')**

![image-20250127224017823](https://gitee.com/onlinetool/mypostman/raw/master/doc/images/image-20250127224017823.png)

断言没什么新意，下面开始我们的单测。

![image-20250127224113334](https://gitee.com/onlinetool/mypostman/raw/master/doc/images/image-20250127224113334.png)

单测成功，获取到用户信息了。

### application/json 用户登录 自动化测试

添加步骤

![image-20250127224404118](https://gitee.com/onlinetool/mypostman/raw/master/doc/images/image-20250127224404118.png)

这里的email和password需要取用户注册这一步提交的数据

![image-20250127224456927](https://gitee.com/onlinetool/mypostman/raw/master/doc/images/image-20250127224456927.png)

![image-20250127224609838](https://gitee.com/onlinetool/mypostman/raw/master/doc/images/image-20250127224609838.png)

![image-20250127224625417](https://gitee.com/onlinetool/mypostman/raw/master/doc/images/image-20250127224625417.png)

断言加上返回成功code

![image-20250127224712660](https://gitee.com/onlinetool/mypostman/raw/master/doc/images/image-20250127224712660.png)

执行单测，这次可以看到我们提交了正确的数据，也返回了拿到的用户信息。

![image-20250127224754646](https://gitee.com/onlinetool/mypostman/raw/master/doc/images/image-20250127224754646.png)

点击请求地址，可以跳转到网络请求发送的页面。

![image-20250127224952331](https://gitee.com/onlinetool/mypostman/raw/master/doc/images/image-20250127224952331.png)

可以看到，当传递了正确的参数后，可以拿到和登录一样的 jwt的header以及用户信息。点击保存，我们需要更新一下这个接口的文档，因为之前并没有查到用户。

![image-20250127225241226](https://gitee.com/onlinetool/mypostman/raw/master/doc/images/image-20250127225241226.png)

因为刚刚我们对用户登录这个步骤的api文档做了修改，之前写的单测这个步骤可能已经不对了，因此我们需要**重置这个步骤**了。重置步骤会基于最新的api文档重新填充信息，之前我们填写的数据已经丢失。

![image-20250127225411989](https://gitee.com/onlinetool/mypostman/raw/master/doc/images/image-20250127225411989.png)

![image-20250127225720314](https://gitee.com/onlinetool/mypostman/raw/master/doc/images/image-20250127225720314.png)

### 使用用户登录返回的jwt token获取用户信息

因为上一步的用户登录是登录成功的，所以为了进一步确认确实登录成功，可以拿上一步登录的jwt值用户做获取用户信息。

![image-20250127230211486](https://gitee.com/onlinetool/mypostman/raw/master/doc/images/image-20250127230211486.png)

取的是  用户登录这一步返回的header中的jwt做eval。用来获取登录后的用户信息。

![image-20250127230354242](https://gitee.com/onlinetool/mypostman/raw/master/doc/images/image-20250127230354242.png)

登录的jwt也登录成功了

### jsonString 用户登录 自动化测试

添加步骤，这里可以看到很神奇的事情，就是之前这个str填是个字符串，但数据类型被标记为了 jsonString，于是单测在填写时将它当做一个json对象来处理，在发送网络请求时，又将它转化为 json字符串 发送出去。

![image-20250127230517568](https://gitee.com/onlinetool/mypostman/raw/master/doc/images/image-20250127230517568.png)

将email和password换成注册时填写的数据。

![image-20250127230848396](https://gitee.com/onlinetool/mypostman/raw/master/doc/images/image-20250127230848396.png)

![image-20250127230925286](https://gitee.com/onlinetool/mypostman/raw/master/doc/images/image-20250127230925286.png)

![image-20250127231012849](https://gitee.com/onlinetool/mypostman/raw/master/doc/images/image-20250127231012849.png)

最后执行单测

![image-20250127231051380](https://gitee.com/onlinetool/mypostman/raw/master/doc/images/image-20250127231051380.png)

可以看到，自动拼接出了接口需要的字符串，也成功拿到了登录请求的结果。点击请求地址，到网络发送页面。

![image-20250127231248691](https://gitee.com/onlinetool/mypostman/raw/master/doc/images/image-20250127231248691.png)

可以清除看到，str是个字符串，我们的单测系统自己构建出来的，返回和其他登录一样，包含一个header中的jwt，返回主体是用户信息。点击保存，更新一下我们的接口文档。

![image-20250127231526528](https://gitee.com/onlinetool/mypostman/raw/master/doc/images/image-20250127231526528.png)

-------

这个教程就到这里，还有很多其他功能待你慢慢探索。包括 路径变量、文件上传、文件下载、单测后续流程等待一段时间执行或者手动执行等，所有这些都是针对笔者在日常开发过程中遇到的问题的一种解决方案。比如 通过 uri的路径变量发送网络请求来下载鸿蒙安装包、男女生音视频通话拨通一分钟后挂断、调用完编译接口需要等待另一套系统编译成功才能执行运行安装程序这个步骤 等。

![image-20250127231709518](https://gitee.com/onlinetool/mypostman/raw/master/doc/images/image-20250127231709518.png)

![image-20250127231804318](https://gitee.com/onlinetool/mypostman/raw/master/doc/images/image-20250127231804318.png)