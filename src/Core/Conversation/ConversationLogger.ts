export default interface ConversationLogger {
    logConversation(history: object): Promise<void>;
}
