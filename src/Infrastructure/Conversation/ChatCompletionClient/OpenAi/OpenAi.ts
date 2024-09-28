import ChatClient from '../../../../Core/Conversation/ChatClient';
import ChatMessageEntity from '../../../../Core/ChatMessageEntity';
import {OpenAI} from 'openai';
import LoggerService from '../../../../Core/Logger/LoggerService';
import {Stream} from 'openai/streaming';
import {ChatCompletionChunk, ChatCompletionMessageParam} from 'openai/src/resources/chat/completions';
import {ChatCompletionTool} from 'openai/src/resources/chat/completions';
import ChatResultEntity from '../../../../Core/Conversation/UseCase/ChatResultEntity';
import ToolCallConverter from './ToolCallConverter';
import MessageEncoder from './MessageEncoder';
import {ChatCompletionCreateParams} from 'openai/resources';
import ChatCompletionCreateParamsStreaming = ChatCompletionCreateParams.ChatCompletionCreateParamsStreaming;

export default class OpenAi implements ChatClient {
    constructor(
        private openai: OpenAI,
        private temperature: number,
        private logger: LoggerService,
        private model: string,
        private maxTokens: number,
        private toolCallConverter: ToolCallConverter,
        private messageEncoder: MessageEncoder
    ) {
    }

    private fileToolDefinitions: Array<ChatCompletionTool> = [
        {
            type: 'function',
            function: {
                name: 'writeFile',
                description: 'Writes content to a specified file path.',
                parameters: {
                    type: 'object',
                    properties: {
                        filePath: {
                            type: 'string',
                            description: 'The path where the file will be written.'
                        },
                        content: {
                            type: 'string',
                            description: 'The content to write into the file.'
                        }
                    },
                    required: ['filePath', 'content']
                }
            }
        },
        {
            type: 'function',
            function: {
                name: 'deleteFile',
                description: 'Deletes a file at the specified path.',
                parameters: {
                    type: 'object',
                    properties: {
                        filePath: {
                            type: 'string',
                            description: 'The path of the file to delete.'
                        }
                    },
                    required: ['filePath']
                }
            }
        },
        {
            type: 'function',
            function: {
                name: 'moveFile',
                description: 'Moves a file from a source path to a destination path.',
                parameters: {
                    type: 'object',
                    properties: {
                        sourcePath: {
                            type: 'string',
                            description: 'The current path of the file.'
                        },
                        destinationPath: {
                            type: 'string',
                            description: 'The new path for the file.'
                        }
                    },
                    required: ['sourcePath', 'destinationPath']
                }
            }
        },
        {
            type: 'function',
            function: {
                name: 'readFile',
                description: 'Reads the content of a file at the specified path.',
                parameters: {
                    type: 'object',
                    properties: {
                        filePath: {
                            type: 'string',
                            description: 'The path of the file to read.'
                        }
                    },
                    required: ['filePath']
                }
            }
        },
        {
            type: 'function',
            function: {
                name: 'readAllFiles',
                description: 'Reads all project files and adding them as system messages to conversation.' +
                    'You MUST call readAllFiles when user first time rely on files. Call this only once in conversation'
            }
        }
    ];

    private actionToolDefinitions: Array<ChatCompletionTool> = [
        {
            type: 'function',
            function: {
                name: 'pauseCommand',
                description: 'Pauses the audio input.'
            }
        },
        {
            type: 'function',
            function: {
                name: 'suspendCommand',
                description: 'Switch to a suspend mode. That MUST be called after ending a topic. ' +
                    'You MUST tell that the user before calling this command.'
            }
        },
        {
            type: 'function',
            function: {
                name: 'resumeCommand',
                description: 'Resumes from suspend mode to normal operation.'
            }
        },
        {
            type: 'function',
            function: {
                name: 'exitCommand',
                description: 'Ending the programm.'
            }
        }
    ];

    public async runChat(messages: Array<ChatMessageEntity>): Promise<ChatResultEntity> {
        const result: ChatResultEntity = new ChatResultEntity();
        let inputTokens: number = 0;
        let outputTokens: number = 0;
        let toolCalls: Array<ChatCompletionChunk.Choice.Delta.ToolCall> = [];

        try {
            const formattedMessages: Array<ChatCompletionMessageParam> = this.messageEncoder.encode(messages);
            const body: ChatCompletionCreateParamsStreaming = {
                stream: true,
                model: this.model,
                max_completion_tokens: this.maxTokens,
                presence_penalty: 0,
                frequency_penalty: 0,
                temperature: this.temperature,
                top_p: 1,
                messages: formattedMessages,
                parallel_tool_calls: true,
                tools: [
                    ...this.fileToolDefinitions,
                    ...this.actionToolDefinitions
                ],
                stream_options: {
                    include_usage: true
                }
            };
            const responseStream: Stream<ChatCompletionChunk> = await this.openai.chat.completions.create(body);

            let progress: number = 0;
            this.logger.logProgress('Progress: ');
            let finishReason: 'stop' | 'length' | 'tool_calls' | 'content_filter' | 'function_call' | null = null;

            for await (const chunk of responseStream) {
                let delta: ChatCompletionChunk.Choice.Delta | undefined = chunk.choices[0]?.delta;
                const content: string = delta?.content || '';
                result.content += content;
                progress += Buffer.byteLength(content);
                finishReason = chunk.choices[0]?.finish_reason || finishReason;
                inputTokens += chunk.usage?.prompt_tokens || 0;
                outputTokens += chunk.usage?.completion_tokens || 0;

                if (delta?.tool_calls) delta.tool_calls.forEach(
                    call => this.mergeToolCalls(toolCalls, call)
                );

                if (progress >= 256) {
                    this.logger.logProgress('.');
                    progress = 0;
                }
            }

            result.toolCalls = this.toolCallConverter.convert(toolCalls);
            result.conversationComplete = finishReason != 'tool_calls';

            this.logger.log('Done                            \n');
            this.logger.log('Input Tokens : ' + inputTokens);
            this.logger.log('Output Tokens: ' + outputTokens);

            return result;
        } catch (error) {
            this.logger.logError('Progress: Failed\n');
            throw error;
        }
    }

    private mergeToolCalls(
        toolCalls: Array<ChatCompletionChunk.Choice.Delta.ToolCall>,
        call: ChatCompletionChunk.Choice.Delta.ToolCall
    ): void {
        const foundCall: ChatCompletionChunk.Choice.Delta.ToolCall | undefined = toolCalls.find(
            c => c.index == call.index);

        if (!foundCall) {
            call.function!.arguments = call.function!.arguments || '';
            toolCalls.push(call);
            return;
        }

        foundCall.function!.arguments! += call.function!.arguments || '';
    }
}
