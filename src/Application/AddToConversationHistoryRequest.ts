import AddToConversationHistoryRequestInterface from '../Core/Conversation/UseCase/AddToConversationHistoryRequest';
import {MessageRoles} from '../Core/ChatMessageEntity';

export default class AddToConversationHistoryRequest implements AddToConversationHistoryRequestInterface {
    public callId: string = '';
    public fileName: string = '';
    public content: string = '';
    public role: MessageRoles = 'user';
}
