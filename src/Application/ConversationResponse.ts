import ConversationResponseInterface from '../Core/Conversation/UseCase/ConversationResponse';
import FileActionEntity from '../Core/FileActionEntity';

export default class ConversationResponse implements ConversationResponseInterface {
    public comments: string = '';
    public actions: Array<FileActionEntity> = [];
}
