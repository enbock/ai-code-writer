import ConversationResponseInterface from '../Core/Conversation/UseCase/ConversationResponse';

export default class ConversationResponse implements ConversationResponseInterface {
    public comments: string = '';
    public actions: Array<string> = [];
}
