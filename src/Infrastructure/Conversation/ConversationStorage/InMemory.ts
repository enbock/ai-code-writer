import ConversationStorage from '../../../Core/Conversation/ConversationStorage';
import ChatMessageEntity from '../../../Core/ChatMessageEntity';

export default class InMemory implements ConversationStorage {
    private conversationHistory: Array<ChatMessageEntity> = [];
    private suspendTranscription: string = '';

    public async saveConversation(history: Array<ChatMessageEntity>): Promise<void> {
        this.conversationHistory = history;
    }

    public async loadConversation(): Promise<Array<ChatMessageEntity>> {
        return this.conversationHistory;
    }

    public getSuspendTranscription(): string {
        return this.suspendTranscription;
    }

    public setSuspendTranscription(text: string): void {
        this.suspendTranscription = text;
    }
}
