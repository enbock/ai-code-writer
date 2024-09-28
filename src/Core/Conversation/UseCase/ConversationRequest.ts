import {MessageRoles} from '../../ChatMessageEntity';

export default interface ConversationRequest {
    transcription: string;
    role: MessageRoles;
}
