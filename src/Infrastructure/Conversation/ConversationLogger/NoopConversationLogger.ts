import ConversationLogger from '../../../Core/Conversation/ConversationLogger';

export default class NoopConversationLogger implements ConversationLogger {
    public async logConversation(history: object): Promise<void> {
        // No operation performed
    }
}
