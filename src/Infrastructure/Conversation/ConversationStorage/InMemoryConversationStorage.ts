import ConversationStorage from '../../../Core/Conversation/ConversationStorage';
import {ChatCompletionMessageParam} from 'openai/resources';

export default class InMemoryConversationStorage implements ConversationStorage {
    private conversationHistory: Array<ChatCompletionMessageParam> = [];

    public async saveConversation(history: Array<ChatCompletionMessageParam>): Promise<void> {
        this.conversationHistory = history;
    }

    public async loadConversation(): Promise<Array<ChatCompletionMessageParam>> {
        return this.conversationHistory;
    }
}
