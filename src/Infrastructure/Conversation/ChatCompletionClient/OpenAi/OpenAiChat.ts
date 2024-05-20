import ChatCompletionClient from '../../../../Core/Conversation/ChatCompletionClient';
import {OpenAI} from 'openai';
import {ChatCompletionMessageParam} from 'openai/resources';
import LoggerService from '../../../../Core/Logger/LoggerService';
import {Stream} from 'openai/streaming';
import {ChatCompletionChunk} from 'openai/src/resources/chat/completions';

export default class OpenAiChat implements ChatCompletionClient {
    constructor(
        private openai: OpenAI,
        private temperature: number,
        private logger: LoggerService
    ) {
    }

    public async completePrompt(messages: Array<ChatCompletionMessageParam>): Promise<string> {
        let responseContent: string = '';
        let inputTokens: number = 0;
        let outputTokens: number = 0;

        try {
            const responseStream: Stream<ChatCompletionChunk> = await this.openai.chat.completions.create({
                stream: true,
                model: 'gpt-4o',
                max_tokens: 4095,
                presence_penalty: 0,
                frequency_penalty: 0,
                temperature: this.temperature,
                top_p: 1,
                messages: messages
            });

            inputTokens = messages.reduce(
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

            this.logger.log(' Done\n');
            this.logger.log(`Output Tokens: ${outputTokens}`);
            return responseContent;
        } catch (error) {
            this.logger.logError('Progress: Failed\n');
            throw error;
        }
    }

    private getTokenCount(text: string): number {
        return text.split(/\s+/).length;
    }
}
