import ConversationResponseInterface from '../Core/Conversation/UseCase/ConversationResponse';
import ChatResultEntity from '../Core/Conversation/UseCase/ChatResultEntity';

export default class ConversationResponse implements ConversationResponseInterface {
    public conversationComplete: boolean = false;
    public result: ChatResultEntity = new ChatResultEntity();
}
