# AI Code Writer

## 描述

一个使用OpenAI API进行音频转录和聊天完成的AI代码编写应用程序。

## 重要通知

运行此应用程序时，当前工作目录中的文件和目录将发送到OpenAI进行处理。请参阅过滤器部分了解涉及哪些文件的更多信息。

## 过滤器

该应用程序使用以下过滤器进行文件收集和监控，这些过滤器可以通过环境变量进行配置：

- **包含模式**：`INCLUDE_PATTERNS`（默认：`*.ts,*.json,*.yml,*.yaml,*.md,*.js,.env.dist`）
- **排除目录**：`EXCLUDE_DIRS`（默认：`node_modules,build,dist,.git`）
- **排除文件**：`EXCLUDE_FILES`（默认：`package-lock.json,.*`）

## 可选环境变量

除了必需的 `OPENAI_API_KEY` 变量，应用程序还支持几个可选的环境变量：

- **OPENAI_API_ORG**：您的OpenAI组织ID（如果适用）。
- **OPENAI_AUDIO_TEMPERATURE**：音频转换的温度设置（默认：`0.1`）。
- **OPENAI_CHAT_TEMPERATURE**：聊天完成的温度设置（默认：`0.75`）。
- **INCLUDE_PATTERNS**：要处理的文件模式（默认：`*.ts,*.json,*.yml,*.yaml,*.md,*.js,.env.dist`）。
- **EXCLUDE_DIRS**：要排除的目录（默认：`node_modules,build,dist,.git`）。
- **EXCLUDE_FILES**：要排除的文件（默认：`package-lock.json,.?*`）。
- **DEBUG_TO_FILE**：如果设置为`true`，则将对话记录到文件中（默认：`false`）。
- **OPENAI_CHAT_MODEL**：要用于聊天完成的模型（默认：`gpt-4o`）。

## 先决条件

- **SOX (Sound eXchange)**：此应用程序需要SOX进行音频录制。通过您的包管理器安装SOX：
    - **macOS**：`brew install sox`
    - **Windows**：从[官方网站](http://sox.sourceforge.net/)下载安装程序
    - **Linux**：使用您的发行版的包管理器，例如，`apt-get install sox`

## 用法

```sh
npx ai-code-writer
```

### 用户指南

1. **启动应用程序**：
    - 确保已设置环境变量`OPENAI_API_KEY`。
    - 可选地，按照“可选环境变量”部分中的描述设置过滤器环境变量。
    - 使用命令`npx ai-code-writer`启动应用程序。

2. **交互**：
    - 启动应用程序后，将播放欢迎消息：“AI代码编写器已准备好。”
    - 对着麦克风说出您的输入。应用程序将记录您的语音并转换为文本。

3. **对话**：
    - 转录的输入将发送到OpenAI API以获取响应。
    - AI的响应将大声朗读并显示在控制台上。
    - 如果响应包含文件任务（例如，创建、移动、删除文件），这些任务将自动执行。

4. **文件监控**：
    - 将检测到对监控文件的更改并记录在对话历史中。
    - 这些更改可能会影响AI的响应。

5. **结束应用程序**：
    - 应用程序在无限循环中运行，等待用户输入。
    - 要结束应用程序，请使用停止Node.js进程的常用方法（例如，控制台中的`Ctrl+C`）。

## 许可证

MIT - [LICENSE](./LICENSE)

## 作者

Endre Bock <dev@itbock.de>

## 语言

- [Read in English](./README.md)
- [Auf Deutsch lesen](./README_de.md)
- [Leer en español](./README_es.md)
- [Lire en français](./README_fr.md)
