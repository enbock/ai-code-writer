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
- **EXCLUDE_FILES**：