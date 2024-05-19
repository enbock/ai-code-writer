import ConversationStorage from '../../../Core/Conversation/ConversationStorage';
import {ChatCompletionMessageParam} from 'openai/resources';

export default class InMemoryConversationStorage implements ConversationStorage {
    private conversationHistory: Array<ChatCompletionMessageParam> = [];
    private fileContent: Map<string, string> = new Map();

    public async saveConversation(history: Array<ChatCompletionMessageParam>): Promise<void> {
        this.conversationHistory = history;
    }

    public async loadConversation(): Promise<Array<ChatCompletionMessageParam>> {
        return this.conversationHistory;
    }

    public async saveFileContent(fileContent: Map<string, string>): Promise<void> {
        this.fileContent = fileContent;
    }

    public async loadFileContent(): Promise<Map<string, string>> {
        return this.fileContent;
    }
}