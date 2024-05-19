export default interface ConversationLogger {
    logConversation(history: Array<object>): Promise<void>;
}
