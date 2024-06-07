import ActionType from '../../ActionType';

export default interface AddToConversationHistoryRequest {
    action: ActionType;
    fileName: string;
    content: string;
}
