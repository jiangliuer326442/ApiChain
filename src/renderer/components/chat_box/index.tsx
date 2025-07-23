import { fetchEventSource } from '@microsoft/fetch-event-source';
import { cloneDeep } from 'lodash';
import { Component, ReactNode } from 'react';
import { connect } from 'react-redux';
import { Card, List, Input, Button, Typography } from 'antd';
import { SendOutlined, } from '@ant-design/icons';

import { addNewlineBeforeTripleBackticks } from '@rutil/markdown';
import MarkdownView from '@comp/markdown/show';

import './index.css';

const { TextArea } = Input;
const { Paragraph } = Typography;

class AiChatBox extends Component {

    constructor(props) {
        super(props);
        let messages = [
          {
            "role":"user",
            "content":"使用c语言写一个hello world"
          },
          {
            "role":"assistant",
            "content":"好的，使用C语言编写一个经典的\"Hello, World!\"程序非常简单。\n\n### 代码\n\n```c\n#include <stdio.h> // 包含标准输入输出库\n\nint main() {         // 主函数，程序从这里开始执行\n    printf(\"Hello, World!\\n\"); // 使用printf函数打印字符串，\\n表示换行\n    return 0;        // 返回0表示程序成功执行\n}\n```\n\n### 代码解释\n\n1.  **`#include <stdio.h>`**\n    *   `#include` 是一个预处理指令，告诉C编译器在实际编译之前包含一个文件的内容。\n    *   `<stdio.h>` 是“Standard Input/Output”的缩写，它是一个头文件，包含了执行输入输出操作（如`printf`函数）所必需的函数声明。如果没有这个，编译器就不知道`printf`是什么。\n\n2.  **`int main() { ... }`**\n    *   `main` 是C程序的主函数。每个C程序都必须有一个 `main` 函数，它是程序执行的起点。\n    *   `int` 表示 `main` 函数将返回一个整数值。这个返回值通常用来指示程序的执行状态（例如，`0` 通常表示成功）。\n    *   `()` 表示 `main` 函数不接受任何参数（对于简单的程序通常是这样）。你也可以写成 `int main(void)` 或者 `int main(int argc, char *argv[])`。\n    *   `{ }` (花括号) 定义了 `main` 函数的代码块。所有的程序指令都写在它们之间。\n\n3.  **`printf(\"Hello, World!\\n\");`**\n    *   `printf` 是一个标准库函数，用于将格式化的输出打印到标准输出设备（通常是屏幕）。\n    *   `\"Hello, World!\\n\"` 是一个字符串字面量，是我们要打印到屏幕上的文本。\n    *   `\\n` 是一个转义序列，代表“换行符”。它会导致光标移动到下一行的开头，这样后续的输出就会在新的一行开始。\n    *   `;` (分号) 是C语言中语句的结束符。每条语句的末尾都需要一个分号。\n\n4.  **`return 0;`**\n    *   `return` 语句用于从函数中返回值。\n    *   `0` 是 `main` 函数的返回值，按照约定，`0` 表示程序成功执行并正常退出。任何非零值通常表示程序在执行过程中遇到了错误。\n\n### 如何编译和运行\n\n要编译和运行这个程序，你需要一个C编译器。GCC（GNU Compiler Collection）是一个非常常用且免费的编译器。\n\n1.  **保存代码:**\n    将上面的代码复制粘贴到一个文本编辑器中，并将其保存为 `hello.c` (文件名可以是任何你喜欢的，但扩展名必须是 `.c`)。\n\n2.  **打开终端或命令行:**\n    导航到你保存 `hello.c` 文件的目录。\n\n3.  **编译:**\n    使用GCC编译器编译你的代码。在终端中输入：\n    ```bash\n    gcc hello.c -o hello\n    ```\n    *   `gcc`: 调用GCC编译器。\n    *   `hello.c`: 你要编译的源文件。\n    *   `-o hello`: 这是一个选项，告诉编译器将输出的可执行文件命名为 `hello`。如果你省略这个选项，Windows系统上默认会生成 `a.exe`，Linux/macOS上默认会生成 `a.out`。\n\n4.  **运行:**\n    编译成功后，会生成一个名为 `hello` (或 `hello.exe` 在Windows上) 的可执行文件。在终端中运行它：\n    *   **Linux / macOS:**\n        ```bash\n        ./hello\n        ```\n    *   **Windows (在命令提示符或PowerShell中):**\n        ```bash\n        hello\n        ```\n\n### 预期输出\n\n```\nHello, World!\n```"
          },
          {
            "role":"user",
            "content":"使用Java写一个hello world"
          },
          {
            "role":"assistant",
            "content":"好的，使用Java编写一个最简单的\"Hello, World!\"程序非常直观。\n\n### Java \"Hello, World!\" 代码```java\n// 这是Java程序的基本骨架。\n// 所有的Java代码都必须在一个类 (class) 中。\npublic class HelloWorld {\n\n    // 这是Java程序的入口点。\n    // 当你运行一个Java程序时，JVM (Java虚拟机) 会从这个 'main' 方法开始执行。    public static void main(String[] args) {\n\n        // System.out.println() 是Java中用于在控制台打印输出的标准方法。\n        // \"Hello, World!\" 是我们想要打印的字符串。\n        System.out.println(\"Hello, World!\");\n    }\n}\n```### 代码解析\n\n1.  **`public class HelloWorld`**:\n    *   `public`: 这是一个访问修饰符，表示这个类可以从任何地方被访问。\n    *   `class`: 这是一个关键字，用于声明一个类。在Java中，所有的代码都组织在类中。\n    *   `HelloWorld`: 这是类的名称。**请注意，Java文件名必须与公共类的名称完全匹配**（包括大小写），所以这个文件应该保存为 `HelloWorld.java`。\n\n2.  **`public static void main(String[] args)`**:\n    *   这是Java程序的 **主方法** (main method)，它是程序的入口点。\n    *   `public`: 同样是访问修饰符，表示这个方法可以从任何地方被调用。\n    *   `static`: 这是一个关键字，表示 `main` 方法是一个静态方法。这意味着你不需要创建 `HelloWorld` 类的一个实例就可以调用它。JVM 在启动时直接通过类名调用它。\n    *   `void`: 这表示 `main` 方法不返回任何值。\n    *   `main`: 这是方法的名称。Java虚拟机专门查找这个名称作为程序的起始点。\n    *   `String[] args`: 这是一个参数列表，表示 `main` 方法可以接受一个字符串数组作为命令行参数。例如，如果你运行 `java HelloWorld 参数1 参数2`，那么 `args` 数组就会包含 \"参数1\" 和 \"参数2\"。\n\n3.  **`System.out.println(\"Hello, World!\");`**:\n    *   `System`: 这是Java标准库中的一个最终类，它包含了与系统相关的功能。\n    *   `out`: 这是 `System` 类中的一个静态成员变量，类型是 `PrintStream`，它代表了标准的输出流（通常是你的控制台）。\n    *   `println()`: 这是 `PrintStream` 类的一个方法，用于将括号中的内容打印到控制台，并在末尾添加一个新行（`ln` 是 \"line\" 的缩写）。\n\n### 如何编译和运行？\n\n要运行这个程序，你需要安装 Java Development Kit (JDK)。\n\n**步骤 1: 保存代码**\n将上面的代码复制到一个文本编辑器中（如记事本、VS Code、Sublime Text等），然后将其保存为 `HelloWorld.java`。确保文件名与公共类名完全一致。\n\n**步骤 2: 打开命令行或终端**\n导航到你保存 `HelloWorld.java` 文件的目录。\n\n**步骤 3: 编译 Java 文件**\n使用 `javac` (Java Compiler) 命令来编译你的 `.java` 文件：\n\n```bash\njavac HelloWorld.java\n```\n如果编译成功，你会在同一个目录下看到一个新的文件：`HelloWorld.class`。这是由Java编译器生成的字节码文件。\n\n**步骤 4: 运行 Java 程序**\n使用 `java` 命令来运行你的编译后的类（注意：这里不是文件名，是类名）：\n\n```bash\njava HelloWorld\n```\n\n**预期输出:**\n\n```\nHello, World!\n```\n\n恭喜！你已经成功编写并运行了第一个Java程序。"
          }
        ];
        this.state = {
            messages,
            input: "",
            loading: false,
            tmpResponse: {},
            messageLength: messages.length,
        }
    }

    handleSend = async () => {
        if (!this.state.input.trim()) return;
        let messageLength = this.state.messages.length;

        const userMessage = { role: 'user', content: this.state.input };
        this.state.messages.push(userMessage);
        messageLength++;
        this.setState(
          {
            messages: cloneDeep( this.state.messages),
            input: '',
            loading: true,
            messageLength,
          }
        );
    
        const controller = new AbortController();
        const formData = new URLSearchParams();
        formData.append('question', this.state.input);
        await fetchEventSource(this.props.clientHost + '/test/openai/question2', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: formData.toString(),
          onopen: async (response) => {
            if (response.ok) {
            } else {
            }
          },
          signal: controller.signal,
          onmessage: (ret) => {
            if (ret.event === "error") {
               console.error('Stream error:', ret.data);
              return;
            }
            if (ret.event === "done") {
              this.state.messageLength++
              this.setState(
                {
                  tmpResponse: {},
                  loading: false,
                  messageLength: this.state.messageLength,
                }
              );
              console.log("message", JSON.stringify(this.state.messages));
              return;
            }
            if (ret.event === 'message') {
              if (Object.keys(this.state.tmpResponse).length === 0) {
                this.state.tmpResponse = { role: 'assistant', content: ret.data };
              } else {
                this.state.tmpResponse.content += ret.data;
              }
              let messages = this.state.messages.slice(0, this.state.messageLength);
              messages.push(this.state.tmpResponse);
              this.state.messages = messages;
              
              this.setState(
                {
                  messages: cloneDeep( messages),
                }
              );
            }
          },
          onclose: () => {
          },
          onerror(err) {
            console.error('Stream error:', err);
          }
        });
    };

    render() : ReactNode {
        return (
            <Card title="AI 聊天" style={{ width: 700, margin: '20px auto' }}>
                <div className='chat-box'>
                  <List
                      dataSource={this.state.messages}
                      renderItem={(item) => (
                      <List.Item
                          style={{
                          justifyContent: item.role === 'user' ? 'flex-end' : 'flex-start',
                          }}
                      >
                        {item.role === 'user' ? 
                          <Paragraph copyable>{item.content}</Paragraph>
                        :
                          <MarkdownView 
                              content={ addNewlineBeforeTripleBackticks(item.content) } 
                              width={600}
                          />
                        }
                      </List.Item>
                      )}
                    />
                  </div>
                <div style={{ display: 'flex', gap: 8 }}>
                <TextArea
                    value={this.state.input}
                    onChange={(e) => this.setState({input: e.target.value})}
                    placeholder="输入您的消息..."
                    autoSize={{ minRows: 1, maxRows: 4 }}
                    onPressEnter={(e) => {
                    if (!e.shiftKey) {
                        e.preventDefault();
                        this.handleSend();
                    }
                    }}
                />
                <Button
                    type="primary"
                    icon={<SendOutlined />}
                    onClick={this.handleSend}
                    loading={this.state.loading}
                    disabled={!this.state.input.trim()}
                >
                    发送
                </Button>
                </div>
            </Card>
        )
    }
}

function mapStateToProps (state) {
    return {
      clientHost: state.device.clientHost,
    }
}

export default connect(mapStateToProps)(AiChatBox);