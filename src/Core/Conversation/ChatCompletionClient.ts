import {ChatCompletionMessageParam} from 'openai/resources';

export default interface ChatCompletionClient {
    completePrompt(messages: Array<ChatCompletionMessageParam>): Promise<string>;
}
