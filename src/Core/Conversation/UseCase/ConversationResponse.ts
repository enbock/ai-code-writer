import FileActionEntity from '../../FileActionEntity';

export default interface ConversationResponse {
    comments: string;
    actions: Array<FileActionEntity>;
}
