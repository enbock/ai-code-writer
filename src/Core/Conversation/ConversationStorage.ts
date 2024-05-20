import {ChatCompletionMessageParam} from 'openai/resources';

export default interface ConversationStorage {
    saveConversation(history: Array<ChatCompletionMessageParam>): Promise<void>;

    loadConversation(): Promise<Array<ChatCompletionMessageParam>>;

    saveFileContent(fileContent: Map<string, string>): Promise<void>;

    loadFileContent(): Promise<Map<string, string>>;
}
