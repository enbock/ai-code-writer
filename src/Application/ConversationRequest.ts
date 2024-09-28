import ConversationRequestInterface from '../Core/Conversation/UseCase/ConversationRequest';
import {MessageRoles} from '../Core/ChatMessageEntity';

export default class ConversationRequest implements ConversationRequestInterface {
    public transcription: string = '';
    public role: MessageRoles = 'user';
}
