# AI Code Writer

## Description

An AI code writer application using OpenAI APIs for audio transcription and chat completion.

## Important Notice

When running this application, the files and directories in the current working directory will be sent to OpenAI for processing. See more in the filters section to know which files are involved.

## Filters

The application uses the following filters for file collection and monitoring, which can be configured via environment variables:
- **Include Patterns**: `INCLUDE_PATTERNS` (default: `*.ts,*.json,*.yaml,*.md`)
- **Exclude Directories**: `EXCLUDE_DIRS` (default: `node_modules,build,.git`)
- **Exclude Files**: `EXCLUDE_FILES` (default: `package-lock.json,.*`)

## Usage

```sh
npx ai-code-writer
```

### User Guide

1. **Starting the Application**:
    - Ensure that the environment variable `OPENAI_API_KEY` is set.
    - Optionally, set the filter environment variables (`INCLUDE_PATTERNS`, `EXCLUDE_DIRS`, `EXCLUDE_FILES`).
    - Start the application with the command `npx ai-code-writer`.

2. **Interaction**:
    - After starting the application, a welcome message will be played: "The AI Code Writer is ready."
    - Speak your input into the microphone. The application will record your speech and convert it to text.

3. **Conversation**:
    - The transcribed input will be sent to the OpenAI API to get a response.
    - The AI's response will be read out loud and displayed on the console.
    - If the response contains file tasks (e.g., create, move, delete files), these will be executed automatically.

4. **File Monitoring**:
    - Changes to the monitored files will be detected and recorded in the conversation history.
    - These changes can influence the AI's responses.

5. **Ending the Application**:
    - The application runs in an infinite loop waiting for user input.
    - To end the application, use the usual methods to stop a Node.js process (e.g., `Ctrl+C` in the console).

## License

MIT - [LICENSE](./LICENSE)

## Author

Endre Bock <dev@itbock.de>

## Languages

- [Auf Deutsch lesen](./README_de.md)
- [Leer en español](./README_es.md)
- [阅读中文](./README_zh.md)
- [Lire en français](./README_fr.md)
