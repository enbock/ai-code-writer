import AddToConversationHistoryRequestInterface from '../Core/Conversation/UseCase/AddToConversationHistoryRequest';

export default class AddToConversationHistoryRequest implements AddToConversationHistoryRequestInterface {
    public transcription: string = '';
    public fileName: string = '';
}
