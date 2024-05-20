import ChatCompletionClient from '../../../../Core/Conversation/ChatCompletionClient';
import {OpenAI} from 'openai';
import {ChatCompletion, ChatCompletionMessageParam} from 'openai/resources';
import LoggerService from '../../../../Core/Logger/LoggerService';

export default class OpenAiChat implements ChatCompletionClient {
    constructor(
        private openai: OpenAI,
        private temperature: number,
        private logger: LoggerService
    ) {
    }

    public async completePrompt(messages: Array<ChatCompletionMessageParam>): Promise<string> {
        const response: Promise<ChatCompletion> = this.openai.chat.completions.create({
            stream: false,
            model: 'gpt-4o',
            max_tokens: 4095,
            presence_penalty: 0,
            frequency_penalty: 0,
            temperature: this.temperature,
            top_p: 1,
            messages: messages
        });

        const dataSize: number = JSON.stringify(messages).length;

        return this.showProgress(response, dataSize);
    }

    private async showProgress(responsePromise: Promise<ChatCompletion>, dataSize: number): Promise<string> {
        let progress: number = 0;
        const interval: number = this.calculateInterval(dataSize);

        const progressInterval = setInterval(() => {
            this.logger.logProgress(`Progress: ${'.'.repeat(progress % 10 + 1)}\r`);
            progress++;
        }, interval);

        try {
            const response: ChatCompletion = await responsePromise;
            clearInterval(progressInterval);
            this.logger.log('Progress: Done\n');
            return response.choices[0]?.message?.content || '';
        } catch (error) {
            clearInterval(progressInterval);
            this.logger.logError('Progress: Failed\n');
            throw error;
        }
    }

    private calculateInterval(dataSize: number): number {
        const baseInterval: number = 500;
        const sizeFactor: number = Math.log2(dataSize / 1024);
        return baseInterval * (1 + sizeFactor / 10);
    }
}
