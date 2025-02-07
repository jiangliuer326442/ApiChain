## 清空历史记录

apiChain不会硬删除你的数据，当发现备份出来的数据文件太大，担心过多的数据影响查询性能时，可以使用清理缓存。清理缓存会清空网络请求的执行记录还有单测的执行记录，还有ApiChain执行的日志文件，会大大减少数据文件的大小，提升系统的性能，同时对你的使用不会造成太大的影响。使用方式是：数据->清除缓存。

![image-20250201231524143](https://gitee.com/onlinetool/mypostman/raw/master/doc/images/image-20250201231524143.png)

## 调试模式

作为互联网行业开发人员，非常熟悉谷歌浏览器的开发者调试工具，通过该调试工具查看网络请求，调试js代码，查看indexDB数据库内容等。ApiChain基于electron工具，内置Chrome浏览器内核，可以打开开发者调试工具。打开方式为：帮助->开发者模式；

![image-20250201231607757](https://gitee.com/onlinetool/mypostman/raw/master/doc/images/image-20250201231607757.png)