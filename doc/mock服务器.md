购买会员后，可以使用额外的会员功能，目前会员功能主要有两个：迭代文档 和 mock 服务器

## 迭代文档

非会员迭代文档仅可本地查看以及导出成markdown、html格式的文件分享。

![Snipaste_2024-11-22_10-34-02.png](https://gitee.com/onlinetool/mypostman/raw/master/doc/images/Snipaste_2024-11-22_10-34-02.png)

开通会员后，可以打开迭代文档开关，这个迭代的文档就可以通过 **局域网Url** 地址的方式在局域网内分享查看，前端或者测试看到的迭代文档就是你在这个迭代编写的最新的接口文档，他们基于此画页面或者测试你的接口正确与否。

![Snipaste_2024-11-22_10-38-35.png](https://gitee.com/onlinetool/mypostman/raw/master/doc/images/Snipaste_2024-11-22_10-38-35.png)

点击复制按钮可以得到一个局域网的Url地址，他们打开这个Url地址就可以看到你最新编写的迭代文档啦。

![Snipaste_2024-11-22_10-40-56.png](https://gitee.com/onlinetool/mypostman/raw/master/doc/images/Snipaste_2024-11-22_10-40-56.png)

## mock服务器

这个功能感觉对于前端非常有用，在并行开发期间，频繁把代码部署到服务器供前端调用显得非常麻烦，前端需要的仅仅是一个能返回他们所需要的正确的数据格式的接口，他们基于这个接口的返回报文构造界面。mock服务器通过给前端提供一个局域网的仅对特定迭代特定项目生效的Url地址前缀，其他内容，如 url地址后面部分，接口调用后的返回报文等，都与接口文档保持一致。

![Snipaste_2024-11-22_10-47-39.png](https://gitee.com/onlinetool/mypostman/raw/master/doc/images/Snipaste_2024-11-22_10-47-39.png)

如图所示，在这个迭代下，迭代涉及的每个项目的地址前缀都变成了一个符合文档编写者要求的前缀，调用后返回文档编写者期望的数据返回。