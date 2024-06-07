import ConversationStorage from '../../../Core/Conversation/ConversationStorage';
import ChatMessageEntity from '../../../Core/ChatMessageEntity';

export default class InMemoryConversationStorage implements ConversationStorage {
    private conversationHistory: Array<ChatMessageEntity> = [];

    public async saveConversation(history: Array<ChatMessageEntity>): Promise<void> {
        this.conversationHistory = history;
    }

    public async loadConversation(): Promise<Array<ChatMessageEntity>> {
        return this.conversationHistory;
    }
}
