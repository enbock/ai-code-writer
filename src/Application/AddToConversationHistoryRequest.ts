import AddToConversationHistoryRequestInterface from '../Core/Conversation/UseCase/AddToConversationHistoryRequest';
import ActionType from '../Core/ActionType';

export default class AddToConversationHistoryRequest implements AddToConversationHistoryRequestInterface {
    public action: ActionType = ActionType.COMMENT;
    public fileName: string = '';
    public content: string = '';
}
