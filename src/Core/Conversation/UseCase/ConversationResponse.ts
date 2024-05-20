import FileActionEntity from '../../Entities/FileActionEntity';

export default interface ConversationResponse {
    comments: string;
    actions: Array<FileActionEntity>;
}
