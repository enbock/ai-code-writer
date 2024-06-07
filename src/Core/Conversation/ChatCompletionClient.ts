import ChatMessageEntity from '../ChatMessageEntity';

export default interface ChatCompletionClient {
    completePrompt(messages: Array<ChatMessageEntity>): Promise<string>;
}
