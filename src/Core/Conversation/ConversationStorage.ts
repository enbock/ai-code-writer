import {ChatCompletionMessageParam} from 'openai/resources';

export default interface ConversationStorage {
    saveConversation(history: Array<ChatCompletionMessageParam>): Promise<void>;

    loadConversation(): Promise<Array<ChatCompletionMessageParam>>;
}
