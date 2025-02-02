## 数据的备份还原

ApiChain基于Electron开发，使用indexDB数据库，数据库文件存储位置 ：

- windows 为 `C:\Users\<用户名>\AppData\Roaming\ApiChain\IndexedDB`

- macos 为 `/Users/<用户名>/Library/Application Support/ApiChain\IndexedDB`

- linux 为 `/home/<用户名>/.config/ApiChain\IndexedDB`

### 数据备份

为防止数据丢失，需要定期手动进行数据备份，备份方式为：数据->备份数据库。

![image-20250201230236234](https://gitee.com/onlinetool/mypostman/raw/master/doc/images/image-20250201230236234.png)

### 数据还原

![image-20250201230356231](https://gitee.com/onlinetool/mypostman/raw/master/doc/images/image-20250201230356231.png)

当需要将数据回滚到某个备份文件时，需要进行数据还原，还原方式为：数据->还原数据库->选择数据库文件->打开。导入数据库后，需要刷新页面或者重新打开应用使用最新的数据。刷新页面的方式为：页面->刷新当前页面。

_____
## 项目的导出和导入

通过数据的备份还原可以做到将 **全量** 的数据从一台电脑拷贝到另一台电脑，但更多场景下，与其他人合作为某个业务开发时，我们需要的是将部分项目导出到另一个同事的电脑中，或者将另一个同事电脑中的部分项目拷贝到我们自己的电脑中，这样，就需要有一个项目的导入导出功能。

### 导出项目

![image-20250201230851258](https://gitee.com/onlinetool/mypostman/raw/master/doc/images/image-20250201230851258.png)

在设置 -> 项目 菜单下，我们可以多选需要导出的项目，点击 "导出选中项目到文档" 按钮，选择一个位置，就可以将我们选中的项目相关数据导出了一个 json 文件。

导出的项目包含以下内容：
1. 导出的项目
2. 属于这些项目的接口
3. 属于这些项目的环境变量

### 导入项目

另一名合作同事拿到这个json文件，在这个菜单下，点击 “从文档导入” 按钮，选择你刚刚导出项目的那个json文件，导入瞬间完成后页面会自动刷新，同事机能看到你导出给他的项目了。

### 从PostMan导入项目

![image-20250201231040060](https://gitee.com/onlinetool/mypostman/raw/master/doc/images/image-20250201231040060.png)

在选中项目的文档页面，右侧有一个“从PostMan导入”的按钮，点击可以打开对话框，选择postMan导出的collection.json文件就可以完成接口从PostMan导入到ApiChain的具体项目中了。