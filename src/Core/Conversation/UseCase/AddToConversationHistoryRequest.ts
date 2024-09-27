import {MessageRoles} from '../../ChatMessageEntity';

export default interface AddToConversationHistoryRequest {
    callId: string;
    fileName: string;
    content: string;
    role: MessageRoles;
}
