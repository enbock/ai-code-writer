import ChatMessageEntity from '../ChatMessageEntity';

export default interface ConversationStorage {
    saveConversation(history: Array<ChatMessageEntity>): Promise<void>;

    loadConversation(): Promise<Array<ChatMessageEntity>>;

    getSuspendTranscription(): string;

    setSuspendTranscription(text: string): void;
}
