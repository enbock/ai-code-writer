import ConversationLogger from '../../../Core/Conversation/ConversationLogger';

export default class NoopConversationLogger implements ConversationLogger {
    public async logConversation(history: Array<object>): Promise<void> {
        // No operation performed
    }
}
