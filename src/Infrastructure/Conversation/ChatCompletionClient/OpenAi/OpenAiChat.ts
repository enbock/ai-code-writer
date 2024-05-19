import ChatCompletionClient from '../../../../Core/Conversation/ChatCompletionClient';
import {OpenAI} from 'openai';
import {ChatCompletion, ChatCompletionMessageParam} from 'openai/resources';

export default class OpenAiChat implements ChatCompletionClient {
    constructor(
        private openai: OpenAI
    ) {
    }

    public async completePrompt(messages: Array<ChatCompletionMessageParam>): Promise<string> {
        console.log('Sending chat completion request to OpenAI...');
        const response: ChatCompletion = await this.openai.chat.completions.create({
            stream: false,
            model: 'gpt-4o',
            max_tokens: 4095,
            presence_penalty: 0,
            frequency_penalty: 0,
            temperature: 0.5,
            top_p: 1,
            messages: messages
        });
        console.log('Received chat completion response from OpenAI.');
        return response.choices[0]?.message?.content || '';
    }
}