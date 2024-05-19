import ConversationRequestInterface from '../Core/Conversation/UseCase/ConversationRequest';

export default class ConversationRequest implements ConversationRequestInterface {
    public transcription: string = '';
}
