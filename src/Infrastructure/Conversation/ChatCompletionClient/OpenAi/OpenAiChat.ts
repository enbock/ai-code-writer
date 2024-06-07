import ChatCompletionClient from '../../../../Core/Conversation/ChatCompletionClient';
import ChatMessageEntity from '../../../../Core/ChatMessageEntity';
import {OpenAI} from 'openai';
import LoggerService from '../../../../Core/Logger/LoggerService';
import {Stream} from 'openai/streaming';
import {ChatCompletionChunk, ChatCompletionMessageParam} from 'openai/src/resources/chat/completions';
import ActionType from '../../../../Core/ActionType';

export default class OpenAiChat implements ChatCompletionClient {
    constructor(
        private openai: OpenAI,
        private temperature: number,
        private logger: LoggerService,
        private model: string
    ) {
    }

    public async completePrompt(messages: Array<ChatMessageEntity>): Promise<string> {
        let responseContent: string = '';
        let inputTokens: number = 0;
        let outputTokens: number = 0;

        try {
            const formattedMessages: Array<ChatCompletionMessageParam> = this.aggregateMessages(messages);
            const responseStream: Stream<ChatCompletionChunk> = await this.openai.chat.completions.create({
                stream: true,
                model: this.model,
                max_tokens: 4095,
                presence_penalty: 0,
                frequency_penalty: 0,
                temperature: this.temperature,
                top_p: 1,
                messages: formattedMessages
            });

            inputTokens = formattedMessages.reduce(
                (count: number, message: ChatCompletionMessageParam) => count + (message.content ? this.getTokenCount(
                    typeof message.content === 'string' ? message.content : message.content.join(' ')
                ) : 0), 0
            );
            this.logger.log('Input Tokens: ' + inputTokens);

            let progress: number = 0;
            this.logger.logProgress('Progress: ');

            for await (const chunk of responseStream) {
                const content: string = chunk.choices[0]?.delta?.content || '';
                responseContent += content;
                progress += Buffer.byteLength(content);
                outputTokens += this.getTokenCount(content);

                if (progress >= 1024) {
                    this.logger.logProgress('.');
                    progress = 0;
                }
            }

            this.logger.log('Done                            \n');
            this.logger.log(`Output Tokens: ${outputTokens}`);
            return responseContent;
        } catch (error) {
            this.logger.logError('Progress: Failed\n');
            throw error;
        }
    }

    private aggregateMessages(messages: Array<ChatMessageEntity>): Array<ChatCompletionMessageParam> {
        const aggregatedMessages: Array<ChatCompletionMessageParam> = [];
        let currentContent: string = '';
        let currentRole: string = '';

        messages.forEach((message: ChatMessageEntity, index: number): void => {
            const content: string =
                (message.role != 'system' ? message.action + ' ' : '') +
                (message.filePath ? `${message.filePath}\n${
                    message.content
                        .replace(ActionType.COMMENT + ' ', '^°µ|' + ActionType.COMMENT + ' ')
                        .replace(ActionType.FILE_WRITE + ' ', '^°µ|' + ActionType.FILE_WRITE + ' ')
                        .replace(ActionType.FILE_DELETE + ' ', '^°µ|' + ActionType.FILE_DELETE + ' ')
                }` : '\n' + message.content)
            ;

            if (currentRole === message.role) {
                currentContent += '\n' + content;
            } else {
                if (currentContent) {
                    aggregatedMessages.push(<ChatCompletionMessageParam>{role: currentRole, content: currentContent});
                }
                currentRole = message.role;
                currentContent = content;
            }

            if (index === messages.length - 1 && currentContent) {
                aggregatedMessages.push(<ChatCompletionMessageParam>{role: currentRole, content: currentContent});
            }
        });

        return aggregatedMessages;
    }

    private getTokenCount(text: string): number {
        return text.split(/\s+/).length;
    }
}
