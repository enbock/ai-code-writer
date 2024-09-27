import FileActionEntity from '../../FileActionEntity';

export default class ChatResultEntity {
    public toolCalls: Array<FileActionEntity> = [];
    public content: string = '';
    public conversationComplete: boolean = false;
}
