import ChatResultEntity from './ChatResultEntity';

export default interface ConversationResponse {
    conversationComplete: boolean;
    result: ChatResultEntity;
}
