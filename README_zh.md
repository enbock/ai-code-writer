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

- **OPENAI_API_ORG**：您的 OpenAI 组织 ID（如果适用）。
- **OPENAI_AUDIO_TEMPERATURE**：音频转换的温度设置（默认：`0.1`）。
- **OPENAI_CHAT_TEMPERATURE**：聊天完成的温度设置（默认：`0.75`）。
- **INCLUDE_PATTERNS**：要包含在处理中的文件模式（默认：`node_modules,build,dist,.git`）。
- **EXCLUDE_DIRS**：要从处理中排除的目录（默认：`*.ts,*.json,*.yml,*.yaml,*.md,*.js,.env.dist`）。
- **EXCLUDE_FILES**：要从处理中排除的文件（默认：`package-lock.json,.*`）。

## 使用方法

```sh
npx ai-code-writer
```

### 用户指南

1. **启动应用程序**：
    - 确保环境变量 `OPENAI_API_KEY` 已设置。
    - 可选地，设置过滤器环境变量，如“可选环境变量”部分所述。
    - 使用命令 `npx ai-code-writer` 启动应用程序。

2. **互动**：
    - 启动应用程序后，将播放欢迎信息：“AI代码编写器已准备好。”
    - 对着麦克风说出您的输入。该应用程序将录制您的语音并将其转换为文本。

3. **对话**：
    - 转录的输入将发送到OpenAI API以获取响应。
    - AI的响应将被朗读并显示在控制台上。
    - 如果响应包含文件任务（例如，创建、移动、删除文件），这些任务将自动执行。

4. **文件监控**：
    - 将检测到对监控文件的更改并记录在对话历史中。
    - 这些更改可以影响AI的响应。

5. **结束应用程序**：
    - 该应用程序在等待用户输入时运行一个无限循环。
    - 要结束应用程序，请使用通常的方法停止Node.js进程（例如，控制台中的 `Ctrl+C`）。

## 许可证

MIT - [LICENSE](./LICENSE)

## 作者

Endre Bock <dev@itbock.de>

## 语言

- [Read in English](./README.md)
- [Auf Deutsch lesen](./README_de.md)
- [Leer en español](./README_es.md)
- [Lire en français](./README_fr.md)
